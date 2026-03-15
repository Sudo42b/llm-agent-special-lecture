"""
agent_advanced.py — 종합 AI Agent (Edge Computing 특강 졸업 코드)
기반: agent.py + agent_memory.py + agent_planner.py + claw0 S2 Tool + 에러 핸들링

요구사항: pip install openai rich
선택사항: Ollama 설치 후 USE_OLLAMA=true

포함 기능:
  - Memory: JSONL 대화 기록 + 장기 기억 저장소
  - Planning: /plan 명령으로 목표 분해 & 순차 실행
  - 추가 Tool: write_file, run_command
  - 에러 핸들링: Tool 실행 시 try/except + 재시도
  - Structured Output: JSON 강제 파싱 유틸리티

이 파일은 agent.py(50줄)에서 시작해 단계별로 확장한 "완성형"입니다.
agent.py → agent_memory.py → agent_planner.py → agent_advanced.py
"""

import os, json, datetime, math, time, subprocess
from pathlib import Path
from openai import OpenAI
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.prompt import Prompt
from rich.rule import Rule
from rich import box

# ─── Config ──────────────────────────────────────────────────────────────────
USE_OLLAMA   = os.getenv("USE_OLLAMA", "false").lower() == "true"
OLLAMA_BASE  = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

if USE_OLLAMA:
    MODEL = OLLAMA_MODEL
    def _make_client():
        return OpenAI(base_url=OLLAMA_BASE, api_key="ollama")
else:
    MODEL = OPENAI_MODEL
    def _make_client():
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            raise EnvironmentError("OPENAI_API_KEY 환경변수를 설정하거나 USE_OLLAMA=true 로 실행하세요.")
        return OpenAI(api_key=key)

client = None
console = Console()

HISTORY_FILE = Path("chat_history.jsonl")
MEMORY_FILE  = Path("agent_memory.json")

# ─── JSON 파싱 유틸리티 ──────────────────────────────────────────────────────

def extract_json_from_text(text: str) -> dict | None:
    """LLM 응답에서 JSON을 추출."""
    if not text:
        return None
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        pass
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except (json.JSONDecodeError, TypeError):
            pass
    for line in text.split("\n"):
        line = line.strip()
        if line.startswith("{"):
            try:
                return json.loads(line)
            except (json.JSONDecodeError, TypeError):
                pass
    return None

# ─── Memory 클래스 ────────────────────────────────────────────────────────────

class Memory:
    """Agent의 장기 기억 저장소."""
    def __init__(self, filepath: Path = MEMORY_FILE):
        self.filepath = filepath
        self.items: list[str] = []
        self.load_from_file()

    def add(self, item: str):
        if item and item not in self.items:
            self.items.append(item)
            self.save_to_file()

    def search(self, query: str) -> list[str]:
        q = query.lower()
        return [item for item in self.items if q in item.lower()]

    def get_recent(self, n: int = 5) -> list[str]:
        return self.items[-n:] if self.items else []

    def get_all(self) -> list[str]:
        return self.items.copy()

    def save_to_file(self):
        with open(self.filepath, "w", encoding="utf-8") as f:
            json.dump(self.items, f, ensure_ascii=False, indent=2)

    def load_from_file(self):
        if self.filepath.exists():
            with open(self.filepath, "r", encoding="utf-8") as f:
                self.items = json.load(f)

    def __len__(self):
        return len(self.items)

# ─── JSONL 대화 이력 ─────────────────────────────────────────────────────────

def append_history(role: str, content: str):
    record = {
        "role": role, "content": content,
        "ts": time.time(),
        "dt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    with open(HISTORY_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

def load_history() -> list[dict]:
    if not HISTORY_FILE.exists():
        return []
    records = []
    for line in HISTORY_FILE.read_text(encoding="utf-8").strip().split("\n"):
        if line.strip():
            records.append(json.loads(line))
    return records

def search_history(query: str) -> list[dict]:
    q = query.lower()
    return [r for r in load_history() if q in r.get("content", "").lower()]

# ─── Planning ─────────────────────────────────────────────────────────────────

def create_plan(goal: str) -> dict | None:
    """목표를 단계별 계획으로 분해."""
    plan_prompt = f"""주어진 목표를 달성하기 위한 단계별 계획을 세우세요.

CRITICAL INSTRUCTIONS:
1. 반드시 유효한 JSON만 출력하세요
2. 설명, 마크다운, 다른 텍스트 없이 JSON만
3. 반드시 {{ 로 시작하고 }} 로 끝내세요

JSON 형식:
{{"goal": "목표 요약", "steps": ["1단계 설명", "2단계 설명", "3단계 설명"]}}

사용 가능한 도구: calculate, get_datetime, search_web, read_file, write_file, run_command, memory_search
3~5단계로 만드세요.

목표: {goal}

Response (JSON only):"""

    messages = [
        {"role": "system", "content": "당신은 계획 수립 전문가입니다. 반드시 JSON만 출력하세요."},
        {"role": "user", "content": plan_prompt},
    ]
    for attempt in range(3):
        response = client.chat.completions.create(
            model=MODEL, messages=messages, temperature=0.0,
        )
        text = response.choices[0].message.content or ""
        plan = extract_json_from_text(text)
        if plan and "steps" in plan and isinstance(plan["steps"], list):
            return plan
        console.print(f"  [dim]⚠ 계획 생성 재시도 ({attempt + 1}/3)...[/dim]")
    return None

def execute_plan(plan: dict, messages: list) -> str:
    steps = plan.get("steps", [])
    results = []
    console.print(Panel(
        "\n".join(f"  [cyan]{i+1}.[/cyan] {step}" for i, step in enumerate(steps)),
        title=f"[bold yellow]📋 계획 ({len(steps)}단계)[/bold yellow]",
        border_style="yellow",
    ))
    for i, step in enumerate(steps):
        console.print(Rule(f"[dim]Step {i+1}/{len(steps)}: {step}[/dim]", style="yellow"))
        step_result = run_agent(f"다음 작업을 수행하세요: {step}", messages)
        results.append(f"[Step {i+1}] {step}\n→ {step_result}")
    return "\n\n".join(results)

# ─── Tools (6개: 기존 4 + write_file + run_command) ──────────────────────────

memory = Memory()

def calculate(expression: str) -> str:
    """수학 수식을 안전하게 계산합니다."""
    allowed = {k: getattr(math, k) for k in dir(math) if not k.startswith("_")}
    allowed.update({"abs": abs, "round": round, "int": int, "float": float})
    try:
        result = eval(expression, {"__builtins__": {}}, allowed)
        return f"{expression} = {result}"
    except Exception as e:
        return f"계산 오류: {e}"

def get_datetime(timezone: str = "KST") -> str:
    """현재 날짜와 시간을 반환합니다."""
    now = datetime.datetime.now()
    return (
        f"현재 시각 ({timezone}): {now.strftime('%Y년 %m월 %d일 %A %H:%M:%S')}\n"
        f"Unix timestamp: {int(now.timestamp())}"
    )

def search_web(query: str) -> str:
    """최신 정보를 웹에서 검색합니다. (데모: 시뮬레이션)"""
    db = {
        "edge ai":   "Edge AI 트렌드(2025): NPU 내장 기기 급증, llama.cpp·MLC-LLM 온디바이스 추론 보편화.",
        "mcp":       "MCP(Model Context Protocol): Anthropic이 2024.11 발표한 오픈 AI-Tool 연결 표준.",
        "llm":       "LLM(2025) 동향: GPT-4o, Claude 3.7 Sonnet, Gemini 2.0 Flash가 시장 주도.",
        "react":     "ReAct 패턴(Yao et al. 2022): Reasoning + Acting 결합 프롬프팅 기법.",
        "gguf":      "GGUF(GPT-Generated Unified Format): llama.cpp의 모델 직렬화 포맷.",
        "agent":     "AI Agent(2025): Claude Code, Cursor, Devin 등 코딩 Agent 상용화.",
        "ollama":    "Ollama: macOS·Linux·Windows에서 LLM 로컬 실행 도구. llama.cpp 기반.",
        "npu":       "NPU(Neural Processing Unit): AI 전용 하드웨어. 저전력 고속 추론 목표.",
        "quantization": "양자화: FP32→INT4 변환. Q4_K_M이 품질·크기 최적 균형.",
    }
    query_lower = query.lower()
    for key, val in db.items():
        if key in query_lower:
            return val
    return f"'{query}' 검색 결과: 관련 정보가 시뮬레이션 DB에 없습니다."

def read_file(filepath: str, max_chars: int = 800) -> str:
    """로컬 파일 내용을 읽습니다."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read(max_chars)
        truncated = len(content) == max_chars
        suffix = f"\n... (이하 생략, 최대 {max_chars}자)" if truncated else ""
        return f"[파일: {filepath}]\n{content}{suffix}"
    except FileNotFoundError:
        return f"파일 없음: {filepath}"
    except Exception as e:
        return f"파일 읽기 오류: {e}"

def write_file(filepath: str, content: str) -> str:
    """파일에 내용을 씁니다. (claw0 S2 패턴)"""
    try:
        p = Path(filepath)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        return f"✓ 파일 저장 완료: {filepath} ({len(content)}자)"
    except Exception as e:
        return f"파일 쓰기 오류: {e}"

def run_command(command: str, timeout: int = 10) -> str:
    """쉘 명령어를 실행합니다. (claw0 S2 bash tool 패턴, 안전 제한 적용)"""
    # 안전 제한: 위험 명령 차단
    blocked = ["rm -rf", "del /", "format ", "mkfs", "> /dev/"]
    for b in blocked:
        if b in command.lower():
            return f"⚠ 보안 제한: '{b}' 포함 명령은 차단됩니다."
    try:
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True,
            timeout=timeout, cwd=str(Path.cwd()),
        )
        output = result.stdout[:2000] if result.stdout else ""
        error = result.stderr[:500] if result.stderr else ""
        parts = []
        if output:
            parts.append(f"[출력]\n{output}")
        if error:
            parts.append(f"[에러]\n{error}")
        if not parts:
            parts.append(f"[완료] 반환코드: {result.returncode}")
        return "\n".join(parts)
    except subprocess.TimeoutExpired:
        return f"⚠ 명령 시간 초과 ({timeout}초)"
    except Exception as e:
        return f"명령 실행 오류: {e}"

def memory_search(query: str) -> str:
    """Agent의 장기 기억에서 관련 정보를 검색합니다."""
    results = memory.search(query)
    if not results:
        return f"기억에서 '{query}'와 관련된 정보를 찾지 못했습니다."
    return "기억에서 찾은 정보:\n" + "\n".join(f"  - {r}" for r in results)

# ─── Tool Registry ────────────────────────────────────────────────────────────

TOOL_FUNCTIONS = {
    "calculate":     calculate,
    "get_datetime":  get_datetime,
    "search_web":    search_web,
    "read_file":     read_file,
    "write_file":    write_file,
    "run_command":   run_command,
    "memory_search": memory_search,
}

TOOLS = [
    {"type": "function", "function": {
        "name": "calculate",
        "description": "수식 계산이 필요할 때. math 함수 지원.",
        "parameters": {
            "type": "object",
            "properties": {"expression": {"type": "string", "description": "파이썬 수식 문자열"}},
            "required": ["expression"],
        },
    }},
    {"type": "function", "function": {
        "name": "get_datetime",
        "description": "현재 날짜, 시간, 요일이 필요할 때",
        "parameters": {
            "type": "object",
            "properties": {"timezone": {"type": "string", "description": "시간대 코드 (기본: KST)"}},
            "required": [],
        },
    }},
    {"type": "function", "function": {
        "name": "search_web",
        "description": "최신 정보나 모르는 내용을 검색할 때",
        "parameters": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "검색어"}},
            "required": ["query"],
        },
    }},
    {"type": "function", "function": {
        "name": "read_file",
        "description": "로컬 파일 내용을 읽어야 할 때",
        "parameters": {
            "type": "object",
            "properties": {
                "filepath":  {"type": "string", "description": "읽을 파일 경로"},
                "max_chars": {"type": "integer", "description": "최대 읽을 글자 수 (기본 800)"},
            },
            "required": ["filepath"],
        },
    }},
    {"type": "function", "function": {
        "name": "write_file",
        "description": "파일에 내용을 저장해야 할 때",
        "parameters": {
            "type": "object",
            "properties": {
                "filepath": {"type": "string", "description": "저장할 파일 경로"},
                "content":  {"type": "string", "description": "파일 내용"},
            },
            "required": ["filepath", "content"],
        },
    }},
    {"type": "function", "function": {
        "name": "run_command",
        "description": "쉘 명령어를 실행해야 할 때 (ls, pwd, echo, python 등)",
        "parameters": {
            "type": "object",
            "properties": {
                "command": {"type": "string", "description": "실행할 쉘 명령어"},
                "timeout": {"type": "integer", "description": "타임아웃 초 (기본 10)"},
            },
            "required": ["command"],
        },
    }},
    {"type": "function", "function": {
        "name": "memory_search",
        "description": "과거 대화나 저장된 기억에서 정보를 찾을 때",
        "parameters": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "검색할 키워드"}},
            "required": ["query"],
        },
    }},
]

SYSTEM_PROMPT = """당신은 Edge Computing 특강의 종합 AI Agent입니다.
사용자의 질문에 친절하고 명확하게 답변하세요.
필요한 경우 반드시 도구(Tool)를 사용하세요:
- 계산 → calculate
- 시간/날짜 → get_datetime
- 정보 검색 → search_web
- 파일 읽기 → read_file
- 파일 쓰기 → write_file
- 명령 실행 → run_command
- 기억 검색 → memory_search
한국어로 답변하세요."""

# ─── Agent Loop (에러 핸들링 강화) ────────────────────────────────────────────

def run_agent(user_input: str, messages: list, max_steps: int = 8) -> str:
    """ReAct 루프. claw0 패턴: Tool 실행 시 try/except 래핑."""
    global client
    messages.append({"role": "user", "content": user_input})
    append_history("user", user_input)

    # 자동 기억 주입
    recent = memory.get_recent(3)
    if recent:
        mem_ctx = "참고 - 저장된 기억:\n" + "\n".join(f"  - {m}" for m in recent)
        messages.append({"role": "system", "content": mem_ctx})

    for step in range(max_steps):
        response = client.chat.completions.create(
            model=MODEL, messages=messages,
            tools=TOOLS, tool_choice="auto",
        )
        msg = response.choices[0].message

        if not msg.tool_calls:
            answer = msg.content or ""
            messages.append({"role": "assistant", "content": answer})
            append_history("assistant", answer)
            return answer

        messages.append(msg)
        for tc in msg.tool_calls:
            fn_name = tc.function.name
            try:
                fn_args = json.loads(tc.function.arguments)
            except json.JSONDecodeError:
                fn_args = {}

            console.print(
                f"  [dim]💭 Thought → Tool:[/dim] [cyan]{fn_name}[/cyan]"
                f" [dim]{json.dumps(fn_args, ensure_ascii=False)}[/dim]"
            )

            # claw0 S2 패턴: process_tool_call with try/except
            fn = TOOL_FUNCTIONS.get(fn_name)
            if fn is None:
                observation = f"[오류] 알 수 없는 툴: {fn_name}"
            else:
                try:
                    observation = fn(**fn_args)
                except Exception as e:
                    observation = f"[오류] {fn_name} 실행 실패: {type(e).__name__}: {e}"

            preview = observation[:100] + "..." if len(observation) > 100 else observation
            console.print(f"  [dim]🔍 Observe → {preview}[/dim]")

            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": observation,
            })

    return "⚠️ 최대 처리 단계를 초과했습니다."

# ─── TUI ──────────────────────────────────────────────────────────────────────

WELCOME_TEXT = """
[bold cyan]  Agent AI — Advanced Edition[/bold cyan]  [dim]— Memory + Planning + 6 Tools[/dim]

  [bold]Tools (7개)[/bold]
  [green]calculate[/green]      수식 계산       [green]get_datetime[/green]   날짜·시간
  [green]search_web[/green]     정보 검색       [green]read_file[/green]      파일 읽기
  [green]write_file[/green]     파일 쓰기       [green]run_command[/green]    명령 실행
  [green]memory_search[/green]  기억 검색

  [bold]명령어[/bold]
  [yellow]/plan 목표[/yellow]     계획 수립 & 실행    [yellow]/history[/yellow]     대화 이력
  [yellow]/search 키워드[/yellow]  기억 검색            [yellow]/save 메모[/yellow]    기억 저장
  [yellow]/memory[/yellow]        전체 기억            [yellow]tools[/yellow]        도구 목록

  [dim]'exit' 종료 | Model: [/dim][yellow]{model}[/yellow]
""".format(model=MODEL)


def show_history():
    records = load_history()
    if not records:
        console.print("[dim]대화 이력이 없습니다.[/dim]")
        return
    t = Table(box=box.SIMPLE, show_header=True, header_style="bold cyan")
    t.add_column("시간", style="dim", width=19)
    t.add_column("역할", width=10)
    t.add_column("내용", width=60)
    for r in records[-20:]:
        role_style = "green" if r["role"] == "user" else "blue"
        content = r["content"][:80] + "..." if len(r["content"]) > 80 else r["content"]
        t.add_row(r.get("dt", ""), f"[{role_style}]{r['role']}[/{role_style}]", content)
    console.print(t)
    console.print(f"[dim]총 {len(records)}개 기록 (최근 20개 표시)[/dim]")


def main():
    global client
    try:
        client = _make_client()
    except EnvironmentError as e:
        console.print(f"[bold red]설정 오류:[/bold red] {e}")
        return
    console.print(Panel(WELCOME_TEXT, border_style="cyan", padding=(0, 1)))

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    turn = 0

    while True:
        try:
            user_input = Prompt.ask(f"\n[bold green]You[/bold green]")
        except (KeyboardInterrupt, EOFError):
            console.print("\n[dim]종료합니다. 수고하셨습니다! 👋[/dim]")
            break

        cmd = user_input.strip().lower()
        if cmd in ("exit", "quit", "종료", "q"):
            console.print("[dim]강의 수고하셨습니다! 👋[/dim]")
            break
        if cmd == "/history":
            show_history()
            continue
        if cmd.startswith("/search "):
            query = user_input.strip()[8:]
            results = memory.search(query)
            hist_results = search_history(query)
            if results:
                console.print(f"[bold]기억에서 찾음 ({len(results)}건):[/bold]")
                for r in results:
                    console.print(f"  [cyan]•[/cyan] {r}")
            if hist_results:
                console.print(f"[bold]대화 이력에서 찾음 ({len(hist_results)}건):[/bold]")
                for r in hist_results[-5:]:
                    console.print(f"  [dim]{r.get('dt','')}[/dim] [{r['role']}] {r['content'][:60]}")
            if not results and not hist_results:
                console.print(f"[dim]'{query}'와 관련된 기억이 없습니다.[/dim]")
            continue
        if cmd.startswith("/save "):
            memo = user_input.strip()[6:]
            memory.add(memo)
            console.print(f"[green]✓ 기억 저장:[/green] {memo}")
            continue
        if cmd == "/memory":
            items = memory.get_all()
            if not items:
                console.print("[dim]저장된 기억이 없습니다.[/dim]")
            else:
                console.print(f"[bold]저장된 기억 ({len(items)}개):[/bold]")
                for i, item in enumerate(items, 1):
                    console.print(f"  [cyan]{i}.[/cyan] {item}")
            continue
        if cmd in ("tools", "tool", "도움"):
            t = Table(box=box.SIMPLE, show_header=True, header_style="bold cyan")
            t.add_column("Tool", style="green", width=16)
            t.add_column("역할", width=18)
            t.add_column("예시", style="dim", width=30)
            t.add_row("calculate",     "수식 계산",       "sqrt(2) * 100 계산해줘")
            t.add_row("get_datetime",  "날짜·시간",       "지금 몇 시야?")
            t.add_row("search_web",    "정보 검색",       "Edge AI가 뭐야?")
            t.add_row("read_file",     "파일 읽기",       "agent.py 읽어줘")
            t.add_row("write_file",    "파일 쓰기",       "결과를 output.txt에 저장해")
            t.add_row("run_command",   "명령 실행",       "ls 명령 실행해줘")
            t.add_row("memory_search", "기억 검색",       "전에 말한 거 뭐였지?")
            console.print(t)
            continue
        if cmd in ("clear", "cls", "초기화"):
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            turn = 0
            console.print("[dim]대화 초기화 완료 (기억은 유지됨)[/dim]")
            continue
        if not user_input.strip():
            continue

        # /plan 명령어
        if user_input.strip().startswith("/plan "):
            goal = user_input.strip()[6:]
            turn += 1
            console.print(Rule(f"[dim]Plan Turn {turn}[/dim]", style="yellow"))
            with console.status("[bold yellow]📋 계획 수립 중...[/bold yellow]", spinner="dots"):
                plan = create_plan(goal)
            if plan is None:
                console.print("[red]⚠ 계획 생성 실패. 다시 시도해주세요.[/red]")
                continue
            with console.status("[bold yellow]🚀 계획 실행 중...[/bold yellow]", spinner="dots"):
                result = execute_plan(plan, messages)
            console.print(Panel(
                Text(result),
                title=f"[bold blue]Plan Result[/bold blue] [dim](Turn {turn})[/dim]",
                border_style="blue", padding=(0, 1),
            ))
            continue

        # 일반 대화
        turn += 1
        console.print(Rule(f"[dim]Turn {turn}[/dim]", style="dim"))
        with console.status("[bold yellow]🤔 Agent 처리 중...[/bold yellow]", spinner="dots"):
            try:
                answer = run_agent(user_input, messages)
            except Exception as e:
                answer = f"[오류] {type(e).__name__}: {e}"
        console.print(Panel(
            Text(answer),
            title=f"[bold blue]Agent[/bold blue] [dim](Turn {turn})[/dim]",
            border_style="blue", padding=(0, 1),
        ))

if __name__ == "__main__":
    main()
