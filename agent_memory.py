"""
agent_memory.py — 대화 기억을 가진 AI Agent (Edge Computing 특강 심화 실습)
기반: agent.py + agents-from-scratch L7 Memory + claw0 S3 JSONL Sessions

요구사항: pip install openai rich
선택사항: Ollama 설치 후 USE_OLLAMA=true

새 기능:
  - 대화 이력 JSONL 자동 저장/불러오기
  - /history — 과거 대화 보기
  - /search 키워드 — 기억에서 검색
  - /save 메모 — 수동으로 기억 저장
  - memory_search Tool — LLM이 직접 기억을 검색
"""

import os, json, datetime, math, time
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
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3.5:0.8b")
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

# ─── Memory 클래스 ────────────────────────────────────────────────────────────
# 핵심 개념: "기억은 의식이 아니라 저장소다" (agents-from-scratch 철학)
# Memory = 명시적 데이터 저장. 검색 가능. 파일로 영속화.

HISTORY_FILE = Path("chat_history.jsonl")
MEMORY_FILE  = Path("agent_memory.json")

class Memory:
    """Agent의 장기 기억 저장소."""

    def __init__(self, filepath: Path = MEMORY_FILE):
        self.filepath = filepath
        self.items: list[str] = []
        self.load_from_file()

    def add(self, item: str):
        """기억 추가 (중복 방지)."""
        if item and item not in self.items:
            self.items.append(item)
            self.save_to_file()

    def search(self, query: str) -> list[str]:
        """키워드로 기억 검색."""
        q = query.lower()
        return [item for item in self.items if q in item.lower()]

    def get_recent(self, n: int = 5) -> list[str]:
        """최근 n개 기억 반환."""
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

    def __repr__(self):
        return f"Memory({len(self.items)} items)"


# ─── JSONL 대화 이력 (claw0 S3 패턴: append-only, crash-safe) ────────────────

def append_history(role: str, content: str):
    """대화 한 턴을 JSONL 파일에 추가."""
    record = {
        "role": role,
        "content": content,
        "ts": time.time(),
        "dt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    with open(HISTORY_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

def load_history() -> list[dict]:
    """JSONL에서 전체 대화 이력 로드."""
    if not HISTORY_FILE.exists():
        return []
    records = []
    for line in HISTORY_FILE.read_text(encoding="utf-8").strip().split("\n"):
        if line.strip():
            records.append(json.loads(line))
    return records

def search_history(query: str) -> list[dict]:
    """대화 이력에서 키워드 검색."""
    q = query.lower()
    return [r for r in load_history() if q in r.get("content", "").lower()]


# ─── Tools ────────────────────────────────────────────────────────────────────

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
        "gguf":      "GGUF(GPT-Generated Unified Format): llama.cpp의 모델 직렬화 포맷. 4-bit 양자화 지원.",
        "agent":     "AI Agent(2025): Claude Code, Cursor, Devin 등 코딩 Agent 상용화.",
        "ollama":    "Ollama: macOS·Linux·Windows에서 LLM 로컬 실행 도구. llama.cpp 기반.",
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
    "memory_search": memory_search,
}

TOOLS = [
    {"type": "function", "function": {
        "name": "calculate",
        "description": "수식 계산이 필요할 때. 삼각함수·로그 등 math 함수도 지원.",
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
        "name": "memory_search",
        "description": "과거 대화나 저장된 기억에서 정보를 찾을 때. 사용자가 '전에 말한 거', '기억나?', '아까' 등을 언급하면 사용.",
        "parameters": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "검색할 키워드"}},
            "required": ["query"],
        },
    }},
]

SYSTEM_PROMPT = """당신은 Edge Computing 특강의 데모 AI Agent입니다.
사용자의 질문에 친절하고 명확하게 답변하세요.
필요한 경우 반드시 도구(Tool)를 사용하세요:
- 계산이 필요하면 → calculate
- 시간/날짜가 필요하면 → get_datetime
- 모르는 정보가 필요하면 → search_web
- 파일을 읽어야 하면 → read_file
- 과거 대화/기억을 찾아야 하면 → memory_search

중요: 사용자가 이전 대화 내용을 물으면 memory_search를 먼저 사용하세요.
대화 중 중요한 정보(사용자 이름, 선호도, 결정사항)가 나오면 기억해야 한다고 언급해주세요.
한국어로 답변하세요."""

# ─── Agent Loop ───────────────────────────────────────────────────────────────

def run_agent(user_input: str, messages: list, max_steps: int = 6) -> str:
    global client
    messages.append({"role": "user", "content": user_input})
    append_history("user", user_input)

    # 최근 기억을 컨텍스트에 자동 주입
    recent = memory.get_recent(3)
    if recent:
        mem_context = "참고 - 저장된 기억:\n" + "\n".join(f"  - {m}" for m in recent)
        messages.append({"role": "system", "content": mem_context})

    for step in range(max_steps):
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
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
            fn_args = json.loads(tc.function.arguments)

            console.print(
                f"  [dim]💭 Thought → Tool:[/dim] [cyan]{fn_name}[/cyan]"
                f" [dim]{json.dumps(fn_args, ensure_ascii=False)}[/dim]"
            )

            fn = TOOL_FUNCTIONS.get(fn_name)
            observation = fn(**fn_args) if fn else f"[오류] 알 수 없는 툴: {fn_name}"

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
[bold cyan]  Agent AI — Memory Edition[/bold cyan]  [dim]— 대화 기억을 가진 Agent[/dim]

  [bold]사용 가능한 Tools[/bold]
  [green]calculate[/green]      수식 계산     [dim]예) "sqrt(144) 계산해줘"[/dim]
  [green]get_datetime[/green]   날짜·시간     [dim]예) "지금 몇 시야?"[/dim]
  [green]search_web[/green]     정보 검색     [dim]예) "MCP가 뭐야?"[/dim]
  [green]read_file[/green]      파일 읽기     [dim]예) "agent.py 읽어줘"[/dim]
  [green]memory_search[/green]  기억 검색     [dim]예) "전에 말한 거 찾아줘"[/dim]

  [bold]Memory 명령어[/bold]
  [yellow]/history[/yellow]       대화 이력 보기
  [yellow]/search 키워드[/yellow]  기억에서 검색
  [yellow]/save 메모[/yellow]     수동으로 기억 저장
  [yellow]/memory[/yellow]        저장된 기억 전체 보기

  [dim]'exit' 또는 Ctrl+C 로 종료  |  Model: [/dim][yellow]{model}[/yellow]
""".format(model=MODEL)


def show_history():
    """대화 이력 테이블 표시."""
    records = load_history()
    if not records:
        console.print("[dim]대화 이력이 없습니다.[/dim]")
        return
    t = Table(box=box.SIMPLE, show_header=True, header_style="bold cyan")
    t.add_column("시간", style="dim", width=19)
    t.add_column("역할", width=10)
    t.add_column("내용", width=60)
    for r in records[-20:]:  # 최근 20개
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
            t.add_column("역할", width=20)
            t.add_column("예시 질문", style="dim", width=30)
            t.add_row("calculate",     "수식·수학 계산",   "sqrt(2) 값은?")
            t.add_row("get_datetime",  "현재 날짜·시간",   "오늘 날짜가 뭐야?")
            t.add_row("search_web",    "최신 정보 검색",   "Edge AI 트렌드는?")
            t.add_row("read_file",     "파일 내용 읽기",   "agent.py 읽어줘")
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
            border_style="blue",
            padding=(0, 1),
        ))

if __name__ == "__main__":
    main()
