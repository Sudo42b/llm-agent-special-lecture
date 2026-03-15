# Day 1 심화 실습 가이드

> Edge Computing 특론 — AI 특강 Day 1 보충 자료
> 기반: [agents-from-scratch](https://github.com/anthropics/agents-from-scratch), [claw0](https://github.com/anthropics/claw0)

---

## 실습 A: Tool 추가하기 — `translate` 함수

### 개념
agent.py의 Tool 시스템은 **3가지만 추가**하면 새 Tool이 동작합니다:
1. **함수 정의** — 실제 로직
2. **JSON 스펙** — LLM에게 "이런 Tool이 있다"고 알림
3. **레지스트리 등록** — `TOOL_FUNCTIONS` 딕셔너리에 추가

### 코드

#### Step 1: 함수 정의 (agent.py의 Tool 함수들 아래에 추가)

```python
def translate(text: str, target_lang: str = "en") -> str:
    """텍스트를 번역합니다. (데모: 간단 시뮬레이션)"""
    # 실제 구현시: googletrans, DeepL API, papago API 연동
    translations = {
        "en": {"안녕하세요": "Hello", "감사합니다": "Thank you",
               "에지 컴퓨팅": "Edge Computing"},
        "ja": {"안녕하세요": "こんにちは", "감사합니다": "ありがとうございます",
               "에지 컴퓨팅": "エッジコンピューティング"},
    }
    lang_db = translations.get(target_lang, {})
    for kr, translated in lang_db.items():
        if kr in text:
            return f"[{target_lang}] {text} → {translated}"
    return f"[{target_lang}] '{text}' 번역 시뮬레이션: (실제 API 연동 필요)"
```

#### Step 2: JSON 스펙 추가 (TOOLS 배열에 추가)

```python
{"type": "function", "function": {
    "name": "translate",
    "description": "텍스트를 다른 언어로 번역할 때. 영어, 일본어 등",
    "parameters": {
        "type": "object",
        "properties": {
            "text":        {"type": "string", "description": "번역할 텍스트"},
            "target_lang": {"type": "string", "description": "목표 언어 코드 (en, ja 등)"},
        },
        "required": ["text"],
    },
}},
```

#### Step 3: 레지스트리 등록

```python
TOOL_FUNCTIONS = {
    "calculate":   calculate,
    "get_datetime": get_datetime,
    "search_web":  search_web,
    "read_file":   read_file,
    "translate":   translate,   # ← 추가!
}
```

### 테스트
```
You: "안녕하세요"를 영어로 번역해줘
→ 💭 Tool: translate {"text": "안녕하세요", "target_lang": "en"}
→ 🔍 [en] 안녕하세요 → Hello
```

### 핵심 포인트
- **description이 정확해야** LLM이 올바른 Tool을 선택합니다
- Tool 추가에 Agent 코드(`run_agent`) 수정은 **필요 없음** — 이것이 Tool Use 패턴의 장점

---

## 실습 B: Structured Output — JSON 강제 출력

### 개념 (agents-from-scratch Lesson 3)

LLM에게 "JSON만 출력해"라고 하면 잘 안 됩니다. 왜?
- LLM은 확률적으로 다음 토큰을 생성 → "물론이죠! 다음은 JSON입니다:" 같은 설명을 붙임
- 마크다운 코드블록 ````json ... ` ``으로 감쌈
- 가끔 JSON 문법 오류 (따옴표 빠짐, 쉼표 누락)

**해결책: 3가지 테크닉 조합**
1. 강한 지시문 (CRITICAL INSTRUCTIONS)
2. `temperature=0.0` (결정론적 출력)
3. 파싱 실패 시 **3회 재시도**

### 코드

```python
import json

def extract_json_from_text(text: str) -> dict | None:
    """LLM 응답에서 JSON 추출. 마크다운·설명문 자동 제거."""
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

    # 직접 파싱
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

    return None


def structured_generate(prompt: str, schema_hint: str) -> dict | None:
    """LLM에게 JSON 구조화 출력을 강제."""
    full_prompt = f"""{prompt}

CRITICAL INSTRUCTIONS:
1. 반드시 유효한 JSON만 출력하세요
2. 설명, 마크다운, 다른 텍스트 없이 JSON만
3. {{ 로 시작하고 }} 로 끝내세요

JSON 형식: {schema_hint}
Response (JSON only):"""

    messages = [
        {"role": "system", "content": "반드시 JSON만 출력하세요. 다른 텍스트 금지."},
        {"role": "user", "content": full_prompt},
    ]

    for attempt in range(3):  # 3회 재시도
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.0,  # 핵심: 결정론적 출력
        )
        text = response.choices[0].message.content or ""
        result = extract_json_from_text(text)
        if result is not None:
            return result
        print(f"  ⚠ JSON 파싱 실패, 재시도 ({attempt + 1}/3)")

    return None  # 3회 모두 실패

# 사용 예시
result = structured_generate(
    "Edge AI의 장단점을 분석해주세요",
    '{"pros": ["장점1", "장점2"], "cons": ["단점1", "단점2"]}'
)
print(json.dumps(result, ensure_ascii=False, indent=2))
```

### 기대 출력
```json
{
  "pros": ["프라이버시 보호", "저지연", "오프라인 동작"],
  "cons": ["제한된 모델 크기", "하드웨어 의존성"]
}
```

### 핵심 포인트
- **"Validation + Retries = Reliability"** (agents-from-scratch 철학)
- 이 패턴은 Planning, Decision Making 등 모든 구조화 출력의 기반
- Ollama 로컬 모델에서는 JSON 출력이 더 불안정 → 재시도가 더욱 중요

---

## 실습 C: Agent Loop 깊게 이해하기 — claw0 vs agent.py

### 개념 (claw0 Section 1-2)

우리 agent.py와 claw0(Claude 공식 튜토리얼)의 Agent Loop을 **라인 단위 비교**합니다.

### 비교 표

| 관점 | agent.py (우리 코드) | claw0 S1-S2 |
|------|---------------------|-------------|
| API | OpenAI SDK | Anthropic SDK |
| 분기 조건 | `msg.tool_calls` 유무 | `stop_reason == "tool_use"` |
| Tool 등록 | `TOOLS` JSON 배열 | `TOOLS` JSON 배열 (동일!) |
| Tool 실행 | `TOOL_FUNCTIONS[name](**args)` | `TOOL_HANDLERS[name](**input)` |
| 결과 반환 | `{"role": "tool", "content": obs}` | `{"type": "tool_result", "content": result}` |
| 루프 종료 | `not msg.tool_calls` | `stop_reason == "end_turn"` |

### 핵심 코드 비교

**agent.py (OpenAI 방식):**
```python
# Tool 실행 후 결과 반환
messages.append({
    "role": "tool",
    "tool_call_id": tc.id,
    "content": observation,
})
```

**claw0 (Anthropic 방식):**
```python
# Tool 실행 후 결과 반환
tool_results.append({
    "type": "tool_result",
    "tool_use_id": block.id,
    "content": result,
})
messages.append({"role": "user", "content": tool_results})
```

### 핵심 포인트
- **패턴은 동일**: 둘 다 `while True` + Tool 분기 + 결과 주입
- **차이는 API 포맷뿐**: OpenAI는 `role: "tool"`, Anthropic은 `role: "user"` 안에 `tool_result`
- 어떤 API를 쓰든 **구조적 이해가 있으면 10분 만에 전환 가능**

---

## 실습 D: Decision Making — 유한 선택지에서 고르기

### 개념 (agents-from-scratch Lesson 4)

Agent의 "결정"은 자유 텍스트 생성이 아닙니다.
**미리 정해진 선택지 중 하나를 고르는 것** → 안전하고 예측 가능.

### 코드

```python
def decide(question: str, options: list[str]) -> str | None:
    """LLM이 주어진 선택지 중 하나를 결정."""
    options_str = "\n".join(f"- {opt}" for opt in options)

    prompt = f"""다음 질문에 대해 선택지 중 하나만 골라주세요.

질문: {question}

선택지:
{options_str}

CRITICAL INSTRUCTIONS:
1. 반드시 선택지에 있는 값 중 하나만 출력
2. 다른 설명이나 텍스트 없이 선택지 값만
3. 대소문자, 띄어쓰기 정확히 일치해야 함

답변:"""

    messages = [
        {"role": "system", "content": "선택지 중 하나만 정확히 출력하세요."},
        {"role": "user", "content": prompt},
    ]

    for attempt in range(3):
        response = client.chat.completions.create(
            model=MODEL, messages=messages, temperature=0.0,
        )
        answer = response.choices[0].message.content.strip()
        # 선택지에 있는 값인지 검증
        if answer in options:
            return answer
        # 부분 매칭 시도
        for opt in options:
            if opt.lower() in answer.lower():
                return opt

    return None  # 3회 모두 실패


# 사용 예시 — Agent 라우팅
action = decide(
    "사용자가 'sqrt(144) 계산해줘'라고 했습니다. 어떤 Tool을 사용해야 하나요?",
    ["calculate", "get_datetime", "search_web", "read_file", "none"]
)
print(f"선택된 Tool: {action}")
# → "calculate"
```

### 활용 시나리오
```python
# 1. 감정 분석
mood = decide(
    "사용자 메시지: '이거 정말 짜증나네'",
    ["긍정", "부정", "중립"]
)

# 2. 우선순위 분류
priority = decide(
    "작업: '서버가 다운되었습니다'",
    ["긴급", "높음", "보통", "낮음"]
)

# 3. 다음 행동 결정
next_step = decide(
    "사용자가 파일을 수정해달라고 했는데 파일을 아직 안 읽었습니다.",
    ["read_file", "write_file", "ask_user"]
)
```

### 핵심 포인트
- **Selection ≠ Generation**: 생성이 아니라 선택 → 훨씬 안전
- **Validation 필수**: LLM 응답이 선택지에 있는지 반드시 검증
- 이 패턴이 agents-from-scratch에서 말하는 **"First moment of agency"**
- Tool Use의 `tool_choice="auto"`도 내부적으로 이 Decision Making을 수행

---

## 참고: 학습 로드맵

```
agent.py (50줄)          ← Day 1 기본 실습
  │
  ├─ + Tool 추가         ← 실습 A
  ├─ + Structured Output ← 실습 B
  ├─ + Decision Making   ← 실습 D
  │
  ▼
agent_memory.py          ← Day 2 심화 실습
  │
  ▼
agent_planner.py         ← Day 2 심화 실습
  │
  ▼
agent_advanced.py        ← 졸업 코드 (Memory + Planning + 7 Tools)
```

### 더 공부하고 싶다면
- **agents-from-scratch**: 12 Lessons으로 Agent를 처음부터 구축 (llama-cpp-python 기반)
- **claw0**: 10 Sections으로 Production Agent Gateway 구축 (Anthropic SDK 기반)
- 두 저장소 모두 강의 후 공유 예정
