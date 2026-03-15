# Day 2 심화 실습 가이드

> Edge Computing 특론 — AI 특강 Day 2 보충 자료
> 기반: [agents-from-scratch](https://github.com/anthropics/agents-from-scratch), [claw0](https://github.com/anthropics/claw0)

---

## 실습 A: 대화 기억 구현 — agent_memory.py 단계별 구축

### 개념

agents-from-scratch의 핵심 철학:
> **"Memory is explicit storage, not consciousness"**
> 기억은 의식이 아니라 저장소다. 검색 가능하고, 파일로 영속화된다.

현재 agent.py의 한계:
- 프로그램 종료 시 모든 대화 내용 소멸
- "아까 말한 거" 같은 질문에 대응 불가
- 사용자 선호도/이름 등 기억 불가

### Step 1: Memory 클래스 구현

```python
import json
from pathlib import Path

MEMORY_FILE = Path("agent_memory.json")

class Memory:
    """Agent의 장기 기억 저장소."""

    def __init__(self):
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
        """최근 n개 기억."""
        return self.items[-n:] if self.items else []

    def save_to_file(self):
        with open(MEMORY_FILE, "w", encoding="utf-8") as f:
            json.dump(self.items, f, ensure_ascii=False, indent=2)

    def load_from_file(self):
        if MEMORY_FILE.exists():
            with open(MEMORY_FILE, "r", encoding="utf-8") as f:
                self.items = json.load(f)
```

### Step 2: JSONL 대화 이력 (claw0 S3 패턴)

**왜 JSONL?** (claw0의 설계 철학)
- JSON Lines = 한 줄에 하나의 JSON 객체
- Append-only → 쓰기 중 크래시해도 이전 데이터 안전
- 한 줄씩 읽기 → 메모리 효율적

```python
import time

HISTORY_FILE = Path("chat_history.jsonl")

def append_history(role: str, content: str):
    """대화 한 턴을 JSONL에 추가."""
    record = {
        "role": role,
        "content": content,
        "ts": time.time(),
        "dt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    with open(HISTORY_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

def load_history() -> list[dict]:
    """전체 대화 이력 로드."""
    if not HISTORY_FILE.exists():
        return []
    records = []
    for line in HISTORY_FILE.read_text(encoding="utf-8").strip().split("\n"):
        if line.strip():
            records.append(json.loads(line))
    return records
```

**JSONL 파일 예시 (chat_history.jsonl):**
```json
{"role": "user", "content": "오늘 날짜 알려줘", "ts": 1710500000, "dt": "2025-03-15 14:00:00"}
{"role": "assistant", "content": "현재 시각 (KST): 2025년 03월 15일...", "ts": 1710500001, "dt": "2025-03-15 14:00:01"}
{"role": "user", "content": "sqrt(144) 계산해줘", "ts": 1710500060, "dt": "2025-03-15 14:01:00"}
```

### Step 3: memory_search Tool 등록

```python
memory = Memory()

def memory_search(query: str) -> str:
    """Agent의 장기 기억에서 관련 정보를 검색."""
    results = memory.search(query)
    if not results:
        return f"기억에서 '{query}'와 관련된 정보를 찾지 못했습니다."
    return "기억에서 찾은 정보:\n" + "\n".join(f"  - {r}" for r in results)

# TOOL_FUNCTIONS에 추가
TOOL_FUNCTIONS["memory_search"] = memory_search

# TOOLS 배열에 JSON 스펙 추가
TOOLS.append({"type": "function", "function": {
    "name": "memory_search",
    "description": "과거 대화나 저장된 기억에서 정보를 찾을 때. '전에 말한 거', '기억나?' 등",
    "parameters": {
        "type": "object",
        "properties": {"query": {"type": "string", "description": "검색 키워드"}},
        "required": ["query"],
    },
}})
```

### Step 4: run_agent()에 기억 주입

```python
def run_agent(user_input, messages, max_steps=6):
    messages.append({"role": "user", "content": user_input})
    append_history("user", user_input)  # ← JSONL 저장

    # 최근 기억을 자동 주입 (auto-recall)
    recent = memory.get_recent(3)
    if recent:
        mem_ctx = "참고 - 저장된 기억:\n" + "\n".join(f"  - {m}" for m in recent)
        messages.append({"role": "system", "content": mem_ctx})

    # ... (기존 ReAct 루프 동일) ...

    # 최종 답변 저장
    append_history("assistant", answer)  # ← JSONL 저장
    return answer
```

### 테스트
```
You: /save 내 이름은 김철수입니다
✓ 기억 저장: 내 이름은 김철수입니다

You: 내 이름이 뭐였지?
💭 Tool: memory_search {"query": "이름"}
🔍 기억에서 찾은 정보: - 내 이름은 김철수입니다
→ "김철수님, 기억하고 있습니다!"
```

### 완성된 파일: `agent_memory.py` (함께 제공됨)

---

## 실습 B: 계획 수립 Agent — agent_planner.py

### 개념 (agents-from-scratch Lesson 8)

> **"Plans are data structures, not thoughts"**
> 계획은 생각이 아니라 데이터 구조다. 검사·수정·실행이 가능하다.

Planning = 목표를 단계별 JSON으로 분해 → 각 단계를 Tool로 실행

### 핵심 코드

```python
def create_plan(goal: str) -> dict | None:
    """목표 → JSON 계획 분해. 3회 재시도."""
    prompt = f"""목표를 단계별로 분해하세요.

CRITICAL INSTRUCTIONS:
1. 유효한 JSON만 출력
2. 설명 없이 JSON만
3. {{ 로 시작, }} 로 끝

형식: {{"goal": "목표", "steps": ["1단계", "2단계", "3단계"]}}

목표: {goal}
Response (JSON only):"""

    for attempt in range(3):
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "JSON만 출력하세요."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.0,
        )
        plan = extract_json_from_text(response.choices[0].message.content)
        if plan and "steps" in plan:
            return plan
    return None
```

### Ollama에서 JSON 출력 팁

로컬 LLM(특히 3B 모델)은 JSON 출력이 불안정합니다. 팁:

| 팁 | 설명 |
|---|------|
| `temperature=0.0` | 결정론적 출력, JSON 정확도 ↑ |
| 짧은 스키마 | 복잡한 nested JSON 피하기 |
| `extract_json_from_text()` | 마크다운/설명문 자동 제거 |
| 3회 재시도 | 첫 시도 실패해도 2~3번째에 성공하는 경우 多 |
| `qwen2.5:3b` 추천 | JSON 출력 안정성이 llama3.2보다 높음 |

### 테스트
```
You: /plan Edge AI에 대해 조사하고 요약해줘

📋 계획 (3단계)
  1. Edge AI 관련 정보 검색
  2. 검색 결과 정리 및 핵심 포인트 추출
  3. 요약문 작성

Step 1/3: Edge AI 관련 정보 검색
  💭 Tool: search_web {"query": "edge ai"}
  🔍 Edge AI 트렌드(2025): NPU 내장 기기 급증...

Step 2/3: 검색 결과 정리
  → 핵심 포인트: NPU, llama.cpp, 온디바이스 추론...

Step 3/3: 요약문 작성
  → Edge AI는 클라우드 의존 없이 기기에서 직접 AI를 실행하는 기술입니다...
```

### 완성된 파일: `agent_planner.py` (함께 제공됨)

---

## 실습 C: Cloud vs Local 성능 비교

### 측정 코드

```python
import time
from openai import OpenAI

def benchmark(client, model, prompt, n=3):
    """n회 실행하여 평균 응답 시간 측정."""
    times = []
    for i in range(n):
        start = time.time()
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
        )
        elapsed = time.time() - start
        times.append(elapsed)
        tokens = len(response.choices[0].message.content.split())
        print(f"  Run {i+1}: {elapsed:.2f}s ({tokens} tokens)")

    avg = sum(times) / len(times)
    print(f"  평균: {avg:.2f}s")
    return avg

# Cloud (OpenAI)
cloud_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
print("=== Cloud (gpt-4o-mini) ===")
cloud_avg = benchmark(cloud_client, "gpt-4o-mini", "Edge AI란 무엇인가요? 3문장으로.")

# Local (Ollama)
local_client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
print("\n=== Local (llama3.2) ===")
local_avg = benchmark(local_client, "llama3.2", "Edge AI란 무엇인가요? 3문장으로.")

print(f"\n비교: Cloud {cloud_avg:.2f}s vs Local {local_avg:.2f}s")
print(f"  차이: {abs(cloud_avg - local_avg):.2f}s")
```

### CSV 기록

```python
import csv
from datetime import datetime

def save_benchmark(results: list[dict], filename="benchmark_results.csv"):
    """벤치마크 결과를 CSV로 저장."""
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "timestamp", "model", "prompt", "response_time",
            "tokens", "tok_per_sec", "hardware"
        ])
        writer.writeheader()
        writer.writerows(results)

# 사용
results = [
    {"timestamp": datetime.now().isoformat(), "model": "gpt-4o-mini",
     "prompt": "Edge AI란?", "response_time": 0.8, "tokens": 45,
     "tok_per_sec": 56.25, "hardware": "Cloud"},
    {"timestamp": datetime.now().isoformat(), "model": "llama3.2:3b",
     "prompt": "Edge AI란?", "response_time": 3.2, "tokens": 38,
     "tok_per_sec": 11.875, "hardware": "Intel i7 CPU"},
]
save_benchmark(results)
```

### 기대 결과 (참고)

| 모델 | 환경 | 응답 시간 | tok/s |
|------|------|----------|-------|
| gpt-4o-mini | Cloud | 0.5~1.5s | 50~100 |
| llama3.2:3b | M1 Mac | 2~4s | 20~30 |
| llama3.2:3b | RTX 3090 | 1~2s | 80~120 |
| llama3.2:3b | CPU i7 | 5~15s | 5~10 |
| qwen2.5:3b | M1 Mac | 2~4s | 20~30 |

---

## 실습 D: Production Agent 패턴 소개 (claw0 아키텍처)

### 개요

claw0는 Production Agent를 **10단계**로 구축합니다.
우리 agent.py는 이 중 **1~2단계**에 해당합니다.

```
우리의 위치          Production으로 가는 길
─────────────────────────────────────────────────
✅ S01. Agent Loop     ← agent.py의 run_agent()
✅ S02. Tool Use       ← agent.py의 TOOLS + TOOL_FUNCTIONS
─────────────────────────────────────────────────
   S03. Sessions       ← JSONL 대화 영속화 (agent_memory.py)
   S04. Channels       ← CLI 외에 Telegram, Slack, Web 연결
   S05. Gateway        ← 여러 Agent를 라우팅 (API Gateway)
   S06. Intelligence   ← 8층 시스템 프롬프트 + TF-IDF 메모리
   S07. Heartbeat      ← 백그라운드 자동 실행 (cron)
   S08. Delivery       ← 메시지 배달 보장 (Write-Ahead Log)
   S09. Resilience     ← API 키 로테이션 + 3층 재시도
   S10. Concurrency    ← 사용자 입력 vs 백그라운드 동시성
```

### 핵심 Production 패턴 (코드 없이 개념만)

#### 1. Session Persistence (S03)
```
문제: 프로그램 종료 시 대화 소멸
해결: JSONL append-only 파일
      - 쓰기: 한 줄 추가 (crash-safe)
      - 읽기: 재시작 시 전체 재생(replay)
      - 컨텍스트 초과 시: LLM으로 요약 압축
```

#### 2. Resilience (S09)
```
문제: API 장애, 키 만료, Rate Limit
해결: 3층 재시도 양파 (Retry Onion)
      Layer 1: API 키 로테이션 (여러 키 순환)
      Layer 2: 컨텍스트 오버플로 복구 (요약 압축)
      Layer 3: 모델 폴백 (실패 시 저렴한 모델로)
```

#### 3. Concurrency (S10)
```
문제: 사용자 입력 처리 중 백그라운드 작업이 필요
해결: Lane 기반 동시성
      - main lane: 사용자 입력 (항상 우선)
      - heartbeat lane: 백그라운드 체크
      - cron lane: 예약 작업
      사용자가 입력하면 → 백그라운드 즉시 양보
```

### 핵심 포인트
- agent.py 50줄에서 시작해도 Production까지 **점진적 확장** 가능
- 각 단계는 이전 단계 코드를 **수정하지 않고** 레이어를 추가
- 이것이 claw0가 가르치는 **"Progressive Disclosure"** 패턴

---

## 실습 E: Eval 만들기 — 내 Agent 테스트

### 개념 (agents-from-scratch Lesson 11)

> **"Evals prevent degradation"**
> 프롬프트 한 줄 바꿨는데 다른 기능이 깨졌다? → Eval이 잡아준다.

Eval = 입력·기대출력 쌍(Golden Dataset) + 자동 검증

### 코드

```python
import json

# Golden Dataset: 내 Agent가 반드시 통과해야 하는 테스트 케이스
GOLDEN_TESTS = [
    {
        "name": "calculate_basic",
        "input": "15 * 24 계산해줘",
        "expected_tool": "calculate",
        "expected_in_result": "360",
    },
    {
        "name": "datetime_query",
        "input": "오늘 날짜가 뭐야?",
        "expected_tool": "get_datetime",
        "expected_in_result": "년",
    },
    {
        "name": "search_edge_ai",
        "input": "Edge AI가 뭐야?",
        "expected_tool": "search_web",
        "expected_in_result": "NPU",
    },
    {
        "name": "no_tool_greeting",
        "input": "안녕하세요!",
        "expected_tool": None,  # Tool 호출 없이 답변해야 함
        "expected_in_result": "안녕",
    },
]


def run_eval(test_cases: list[dict]) -> dict:
    """Agent에 테스트 케이스를 실행하고 결과 판정."""
    results = {"passed": 0, "failed": 0, "errors": 0, "details": []}

    for tc in test_cases:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        try:
            # Agent 실행 (run_agent 호출)
            answer = run_agent(tc["input"], messages)

            # 검증 1: 기대 키워드가 결과에 포함되는가?
            keyword_ok = tc["expected_in_result"].lower() in answer.lower()

            passed = keyword_ok
            results["passed" if passed else "failed"] += 1
            results["details"].append({
                "name": tc["name"],
                "passed": passed,
                "answer_preview": answer[:100],
            })

        except Exception as e:
            results["errors"] += 1
            results["details"].append({
                "name": tc["name"],
                "passed": False,
                "error": str(e),
            })

    return results


# 실행
if __name__ == "__main__":
    results = run_eval(GOLDEN_TESTS)
    total = results["passed"] + results["failed"] + results["errors"]
    print(f"\n=== Eval Results ===")
    print(f"  Passed: {results['passed']}/{total}")
    print(f"  Failed: {results['failed']}/{total}")
    print(f"  Errors: {results['errors']}/{total}")
    for d in results["details"]:
        status = "✅" if d["passed"] else "❌"
        print(f"  {status} {d['name']}: {d.get('answer_preview', d.get('error', ''))[:60]}")
```

### 활용 팁

| 시점 | 할 일 |
|------|------|
| Tool 추가 후 | 기존 테스트 전부 다시 실행 → 깨진 거 없는지 확인 |
| 프롬프트 수정 후 | 동일 — 프롬프트 한 줄 바꿔도 다른 기능에 영향 |
| 모델 변경 후 | Cloud→Local 전환 시 품질 차이 정량 비교 |
| 배포 전 | 모든 Eval 통과 = 배포 가능 기준 |

### 핵심 포인트
- Golden Dataset은 **정답지** — 한번 만들면 계속 재사용
- Hard assertion (JSON 파싱 성공?) + Soft assertion (키워드 포함?) 조합
- **Cloud 모델 → Local 모델 전환 시** 가장 유용: 어떤 케이스에서 품질이 떨어지는지 정량화

---

## 학습 진도 맵

```
Day 1                              Day 2
──────────────────────────────     ──────────────────────────────
agent.py (기본)                    Edge LLM / GGUF / Ollama
  + Tool 추가 (실습 A)              + Memory 구현 (실습 A)
  + Structured Output (실습 B)      + Planning 구현 (실습 B)
  + Agent Loop 비교 (실습 C)        + 성능 비교 (실습 C)
  + Decision Making (실습 D)        + Production 패턴 (실습 D)
                                    + Eval 만들기 (실습 E)
                                      │
                                      ▼
                                   agent_advanced.py (졸업 코드)
                                   7 Tools + Memory + Planning
```

### 제공 파일 목록
| 파일 | 설명 | 난이도 |
|------|------|--------|
| `agent.py` | 기본 Agent (50줄) | ★☆☆ |
| `agent_memory.py` | + 대화 기억 | ★★☆ |
| `agent_planner.py` | + 계획 수립 | ★★☆ |
| `agent_advanced.py` | 종합 Agent | ★★★ |
| `실습_심화_Day1.md` | Day 1 가이드 | - |
| `실습_심화_Day2.md` | Day 2 가이드 (이 파일) | - |
