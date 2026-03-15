"""
agent.py — Mini AI Agent (Edge Computing 특강 실습)
요구사항: pip install openai rich
선택사항: Ollama 설치 후 USE_OLLAMA=True
"""

import os, json, datetime, math
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
    MODEL  = OLLAMA_MODEL
    def _make_client():
        return OpenAI(base_url=OLLAMA_BASE, api_key="ollama")
else:
    MODEL  = OPENAI_MODEL
    def _make_client():
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            raise EnvironmentError("OPENAI_API_KEY 환경변수를 설정하거나 USE_OLLAMA=true 로 실행하세요.")
        return OpenAI(api_key=key)

client = None  # lazy init in main()

console = Console()

# ─── Tools (Skill 개념: 각 함수 = 하나의 Skill) ───────────────────────────────

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
        "edge ai":   "Edge AI 트렌드(2025): NPU 내장 기기 급증, llama.cpp·MLC-LLM 온디바이스 추론 보편화. 스마트폰 평균 30 TOPS NPU 내장.",
        "mcp":       "MCP(Model Context Protocol): Anthropic이 2024.11 발표한 오픈 AI-Tool 연결 표준. Claude Desktop, Cursor 등 주요 AI 클라이언트에서 채택.",
        "llm":       "LLM(2025) 동향: GPT-4o, Claude 3.7 Sonnet, Gemini 2.0 Flash가 시장 주도. 추론(Reasoning) 모델 경쟁 심화.",
        "react":     "ReAct 패턴(Yao et al. 2022): Reasoning + Acting 결합 프롬프팅 기법. Chain-of-Thought + Tool Use를 통합한 Agent 루프.",
        "gguf":      "GGUF(GPT-Generated Unified Format): llama.cpp 프로젝트의 모델 직렬화 포맷. 4-bit 양자화로 7B 모델을 4GB RAM에서 실행 가능.",
        "agent":     "AI Agent(2025): 단순 챗봇→자율 실행 시스템으로 진화. Claude Code, Cursor, Devin 등 코딩 Agent 상용화. MCP 기반 Tool 생태계 확장 중.",
        "ollama":    "Ollama: macOS·Linux·Windows에서 LLM 로컬 실행 도구. llama.cpp 기반. 'ollama run llama3.2' 한 줄로 7B 모델 실행.",
    }
    query_lower = query.lower()
    for key, val in db.items():
        if key in query_lower:
            return val
    return f"'{query}' 검색 결과: 관련 정보가 시뮬레이션 DB에 없습니다. (실제 구현 시 SerpAPI·Tavily·Brave Search API 연동)"

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
    "calculate":   calculate,
    "get_datetime": get_datetime,
    "search_web":  search_web,
    "read_file":   read_file,
}

TOOLS = [
    {"type": "function", "function": {
        "name": "calculate",
        "description": "수식 계산이 필요할 때. 삼각함수·로그 등 math 함수도 지원. 예: 'sqrt(144)', '15 * 24'",
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
        "description": "최신 정보나 모르는 내용을 검색할 때 (Edge AI, MCP, LLM 뉴스 등)",
        "parameters": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "검색어 (한국어·영어 모두 가능)"}},
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
- 모르는 정보나 최신 정보가 필요하면 → search_web
- 파일을 읽어야 하면 → read_file

도구 사용 후에는 결과를 자연스럽게 답변에 녹여주세요.
한국어로 답변하세요."""

# ─── Agent Loop (ReAct 패턴) ──────────────────────────────────────────────────

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

        # ── 최종 답변 (Tool 호출 없음) ────────────────────────────────────────
        if not msg.tool_calls:
            messages.append({"role": "assistant", "content": msg.content})
            return msg.content

        # ── Tool 실행 (Action + Observe) ─────────────────────────────────────
        messages.append(msg)  # assistant turn with tool_calls
        for tc in msg.tool_calls:
            fn_name = tc.function.name
            fn_args = json.loads(tc.function.arguments)

            # Thought 표시
            console.print(
                f"  [dim]💭 Thought → Tool:[/dim] [cyan]{fn_name}[/cyan]"
                f" [dim]{json.dumps(fn_args, ensure_ascii=False)}[/dim]"
            )

            # Action: 실제 함수 실행
            fn = TOOL_FUNCTIONS.get(fn_name)
            observation = fn(**fn_args) if fn else f"[오류] 알 수 없는 툴: {fn_name}"

            # Observe 표시
            preview = observation[:100] + "..." if len(observation) > 100 else observation
            console.print(f"  [dim]🔍 Observe → {preview}[/dim]")

            # Tool 결과를 메시지에 추가
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": observation,
            })

    return "⚠️ 최대 처리 단계를 초과했습니다."

# ─── TUI ─────────────────────────────────────────────────────────────────────

WELCOME_TEXT = """
[bold cyan]  Agent AI from Scratch[/bold cyan]  [dim]— Edge Computing 특론 실습 데모[/dim]

  [bold]사용 가능한 Tools (Skills)[/bold]
  [green]calculate[/green]    수식 계산  [dim]예) "sqrt(144) 계산해줘"[/dim]
  [green]get_datetime[/green] 날짜·시간  [dim]예) "지금 몇 시야?"[/dim]
  [green]search_web[/green]   정보 검색  [dim]예) "MCP가 뭐야?"[/dim]
  [green]read_file[/green]    파일 읽기  [dim]예) "agent.py 파일 읽어줘"[/dim]

  [dim]'exit' 또는 Ctrl+C 로 종료  |  Model: [/dim][yellow]{model}[/yellow]
""".format(model=MODEL)

def show_tool_table():
    t = Table(box=box.SIMPLE, show_header=True, header_style="bold cyan")
    t.add_column("Tool", style="green", width=14)
    t.add_column("역할", width=20)
    t.add_column("예시 질문", style="dim", width=30)
    t.add_row("calculate",    "수식·수학 계산",   "15 * 24는? sqrt(2) 값은?")
    t.add_row("get_datetime", "현재 날짜·시간",   "오늘 날짜가 뭐야?")
    t.add_row("search_web",   "최신 정보 검색",   "MCP가 뭐야? Edge AI 트렌드는?")
    t.add_row("read_file",    "파일 내용 읽기",   "agent.py 읽어줘")
    return t

def main():
    global client
    try:
        client = _make_client()
    except EnvironmentError as e:
        console.print(f"[bold red]설정 오류:[/bold red] {e}")
        return
    console.print(Panel(WELCOME_TEXT, border_style="cyan", padding=(0, 1)))
    console.print()

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
            console.print(show_tool_table())
            continue
        if cmd in ("clear", "cls", "초기화"):
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            turn = 0
            console.print("[dim]대화 초기화 완료[/dim]")
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
