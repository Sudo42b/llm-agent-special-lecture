"""
agent_planner.py — 계획 수립 AI Agent (Edge Computing 특강 심화 실습)
기반: agent.py + agents-from-scratch L8 Planning + L3 Structured Output

요구사항: pip install openai rich
선택사항: Ollama 설치 후 USE_OLLAMA=true

새 기능:
  - /plan 목표 — LLM이 목표를 단계별 계획으로 분해
  - 각 단계를 Tool을 사용해 순차 실행
  - Structured Output: JSON 강제 출력 + 파싱 + 재시도 패턴
"""

import os, json, datetime, math, re
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

# ─── JSON 파싱 유틸리티 (agents-from-scratch shared/utils.py 기반) ────────────
# 핵심 개념: LLM은 항상 깨끗한 JSON을 출력하지 않는다.
# → 마크다운 코드블록 제거, 중괄호 추출, 재시도가 필요하다.

def extract_json_from_text(text: str) -> dict | None:
    """LLM 응답에서 JSON을 추출. 마크다운·설명문 자동 제거."""
    if not text:
        return None
    text = text.strip()

    # 마크다운 코드블록 제거
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    # 직접 파싱 시도
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        pass

    # 중괄호 사이 추출
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except (json.JSONDecodeError, TypeError):
            pass

    # 줄 단위 시도
    for line in text.split("\n"):
        line = line.strip()
        if line.startswith("{"):
            try:
                return json.loads(line)
            except (json.JSONDecodeError, TypeError):
                pass

    return None


# ─── Planning (agents-from-scratch L8 패턴) ──────────────────────────────────
# 핵심 개념: "계획은 생각이 아니라 데이터 구조다"
# → 계획 = JSON 배열. 검사·수정·실행 가능.

def create_plan(goal: str) -> dict | None:
    """목표를 단계별 계획으로 분해. JSON 구조화 출력 + 3회 재시도."""
    plan_prompt = f"""주어진 목표를 달성하기 위한 단계별 계획을 세우세요.

CRITICAL INSTRUCTIONS:
1. 반드시 유효한 JSON만 출력하세요
2. 설명, 마크다운, 다른 텍스트 없이 JSON만
3. 반드시 {{ 로 시작하고 }} 로 끝내세요

JSON 형식:
{{"goal": "목표 요약", "steps": ["1단계 설명", "2단계 설명", "3단계 설명"]}}

사용 가능한 도구: calculate(수식계산), get_datetime(날짜시간), search_web(정보검색), read_file(파일읽기)
각 단계는 위 도구로 실행 가능해야 합니다. 3~5단계로 만드세요.

목표: {goal}

Response (JSON only):"""

    messages = [
        {"role": "system", "content": "당신은 계획 수립 전문가입니다. 반드시 JSON만 출력하세요."},
        {"role": "user", "content": plan_prompt},
    ]

    for attempt in range(3):
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.0,  # 결정론적 출력 (JSON 정확도↑)
        )
        text = response.choices[0].message.content or ""
        plan = extract_json_from_text(text)
        if plan and "steps" in plan and isinstance(plan["steps"], list):
            return plan
        console.print(f"  [dim]⚠ 계획 생성 재시도 ({attempt + 1}/3)...[/dim]")

    return None


def execute_plan(plan: dict, messages: list) -> str:
    """계획의 각 단계를 Agent Loop으로 순차 실행."""
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


# ─── Tools ────────────────────────────────────────────────────────────────────

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
        "npu":       "NPU(Neural Processing Unit): AI 전용 하드웨어. 삼성 Exynos, 인텔 Meteor Lake, 퀄컴 Snapdragon X 내장.",
        "quantization": "양자화: FP32→INT4 변환. 모델 크기 75% 감소, 품질 3~5% 하락. Q4_K_M이 최적 균형.",
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


# ─── Tool Registry ────────────────────────────────────────────────────────────

TOOL_FUNCTIONS = {
    "calculate":    calculate,
    "get_datetime": get_datetime,
    "search_web":   search_web,
    "read_file":    read_file,
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
]

SYSTEM_PROMPT = """당신은 Edge Computing 특강의 데모 AI Agent입니다.
사용자의 질문에 친절하고 명확하게 답변하세요.
필요한 경우 반드시 도구(Tool)를 사용하세요:
- 계산이 필요하면 → calculate
- 시간/날짜가 필요하면 → get_datetime
- 모르는 정보가 필요하면 → search_web
- 파일을 읽어야 하면 → read_file
한국어로 답변하세요."""

# ─── Agent Loop ───────────────────────────────────────────────────────────────

def run_agent(user_input: str, messages: list, max_steps: int = 6) -> str:
    global client
    messages.append({"role": "user", "content": user_input})

    for step in range(max_steps):
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )
        msg = response.choices[0].message

        if not msg.tool_calls:
            messages.append({"role": "assistant", "content": msg.content})
            return msg.content or ""

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
[bold cyan]  Agent AI — Planner Edition[/bold cyan]  [dim]— 계획 수립 Agent[/dim]

  [bold]사용 가능한 Tools[/bold]
  [green]calculate[/green]    수식 계산     [dim]예) "sqrt(144) 계산해줘"[/dim]
  [green]get_datetime[/green] 날짜·시간     [dim]예) "지금 몇 시야?"[/dim]
  [green]search_web[/green]   정보 검색     [dim]예) "MCP가 뭐야?"[/dim]
  [green]read_file[/green]    파일 읽기     [dim]예) "agent.py 읽어줘"[/dim]

  [bold]Planning 명령어[/bold]
  [yellow]/plan 목표[/yellow]   목표를 단계별로 분해 후 실행
                  [dim]예) "/plan Edge AI에 대해 조사하고 요약해줘"[/dim]
                  [dim]예) "/plan sqrt(2)*100 계산하고 오늘 날짜도 알려줘"[/dim]

  [dim]'exit' 또는 Ctrl+C 로 종료  |  Model: [/dim][yellow]{model}[/yellow]
""".format(model=MODEL)


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
        if cmd in ("tools", "tool", "도움"):
            t = Table(box=box.SIMPLE, show_header=True, header_style="bold cyan")
            t.add_column("Tool", style="green", width=14)
            t.add_column("역할", width=20)
            t.add_column("예시 질문", style="dim", width=30)
            t.add_row("calculate",    "수식·수학 계산",   "15 * 24는?")
            t.add_row("get_datetime", "현재 날짜·시간",   "오늘 날짜가 뭐야?")
            t.add_row("search_web",   "최신 정보 검색",   "Edge AI 트렌드는?")
            t.add_row("read_file",    "파일 내용 읽기",   "agent.py 읽어줘")
            console.print(t)
            continue
        if cmd in ("clear", "cls", "초기화"):
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            turn = 0
            console.print("[dim]대화 초기화 완료[/dim]")
            continue
        if not user_input.strip():
            continue

        # /plan 명령어 처리
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
                border_style="blue",
                padding=(0, 1),
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
            border_style="blue",
            padding=(0, 1),
        ))

if __name__ == "__main__":
    main()
