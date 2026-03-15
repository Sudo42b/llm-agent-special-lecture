const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

const {
  FaRobot, FaBrain, FaTools, FaCode, FaPlay, FaLightbulb,
  FaArrowRight, FaCheckCircle, FaCog, FaSearch, FaTerminal,
  FaDesktop, FaGlobe, FaPlug, FaLayerGroup, FaMicrochip,
  FaMemory, FaNetworkWired, FaServer, FaCloud, FaDownload,
  FaChartBar, FaExchangeAlt, FaShieldAlt, FaTachometerAlt
} = require("react-icons/fa");

async function iconPng(Icon, color = "#FFFFFF") {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Icon, { color, size: "256" })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

const C = {
  bg: "0F172A", card: "1E293B",
  sky: "38BDF8", indigo: "818CF8", emerald: "34D399",
  amber: "FBBF24", rose: "F87171", violet: "A78BFA",
  white: "F8FAFC", muted: "94A3B8", divider: "334155",
};
const makeShadow = () => ({ type: "outer", blur: 10, offset: 3, angle: 135, color: "000000", opacity: 0.3 });

function bgFill(s) { s.background = { color: C.bg }; }
function topBar(s, title, tag) {
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.82, fill: { color: C.card }, line: { color: C.card } });
  s.addShape("rect", { x: 0, y: 0, w: 0.07, h: 0.82, fill: { color: C.amber }, line: { color: C.amber } });
  s.addText(title, { x: 0.22, y: 0, w: 7.5, h: 0.82, margin: 0, fontSize: 21, bold: true, color: C.white, valign: "middle" });
  if (tag) s.addText(tag, { x: 7.8, y: 0, w: 2.1, h: 0.82, margin: 0, fontSize: 9.5, color: C.muted, valign: "middle", align: "right" });
}
function card(s, x, y, w, h, color = C.card, border = C.divider) {
  s.addShape("rect", { x, y, w, h, fill: { color }, line: { color: border, width: 1 }, shadow: makeShadow() });
}
function accentCard(s, x, y, w, h, ac) {
  card(s, x, y, w, h);
  s.addShape("rect", { x, y, w: 0.06, h, fill: { color: ac }, line: { color: ac } });
}
function codeBlock(s, x, y, w, h, code, ac = C.sky, title = "") {
  card(s, x, y, w, h, "111827", ac);
  s.addShape("rect", { x, y, w, h: 0.06, fill: { color: ac }, line: { color: ac } });
  if (title) s.addText(title, { x: x + 0.12, y: y + 0.1, w: w - 0.2, h: 0.28, margin: 0, fontSize: 10, bold: true, color: ac });
  s.addText(code, { x: x + 0.12, y: y + (title ? 0.42 : 0.18), w: w - 0.2, h: h - (title ? 0.55 : 0.28), margin: 0, fontSize: 9.5, color: C.white, fontFace: "Consolas", fit: "shrink" });
}
function chip(s, x, y, text, color) {
  s.addShape("rect", { x, y, w: 1.4, h: 0.27, fill: { color }, line: { color } });
  s.addText(text, { x, y, w: 1.4, h: 0.27, margin: 0, fontSize: 9, bold: true, color: C.bg, align: "center", valign: "middle" });
}

// ─────────────────────────────────────────────────────────────────────────────
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Edge AI Agent — Day 2";

  const iRobot  = await iconPng(FaRobot,   "#FBBF24");
  const iBrain  = await iconPng(FaBrain,   "#818CF8");
  const iChip   = await iconPng(FaMicrochip, "#F87171");
  const iMemory = await iconPng(FaMemory,  "#38BDF8");
  const iLayer  = await iconPng(FaLayerGroup, "#34D399");
  const iTerm   = await iconPng(FaTerminal,"#34D399");
  const iCloud  = await iconPng(FaCloud,   "#38BDF8");
  const iServer = await iconPng(FaServer,  "#818CF8");
  const iDown   = await iconPng(FaDownload,"#34D399");
  const iChart  = await iconPng(FaChartBar,"#FBBF24");
  const iExch   = await iconPng(FaExchangeAlt, "#A78BFA");
  const iShield = await iconPng(FaShieldAlt,  "#34D399");
  const iSpeed  = await iconPng(FaTachometerAlt, "#F87171");
  const iRight  = await iconPng(FaArrowRight, "#94A3B8");
  const iLight  = await iconPng(FaLightbulb, "#FBBF24");
  const iNet    = await iconPng(FaNetworkWired, "#A78BFA");
  const iTools  = await iconPng(FaTools,   "#34D399");
  const iPlay   = await iconPng(FaPlay,    "#38BDF8");

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 1 — Title
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    s.addShape("rect", { x: 0, y: 0, w: 4.0, h: 5.625, fill: { color: "0C1A10" }, line: { color: "0C1A10" } });
    s.addShape("rect", { x: 4.0, y: 0, w: 0.04, h: 5.625, fill: { color: C.amber }, line: { color: C.amber } });
    s.addImage({ data: iRobot, x: 1.1, y: 0.5, w: 1.8, h: 1.8 });
    s.addText("Edge AI", { x: 0.3, y: 2.5, w: 3.4, h: 0.8, margin: 0, fontSize: 40, bold: true, color: C.white });
    s.addText("Agent", { x: 0.3, y: 3.25, w: 3.4, h: 0.65, margin: 0, fontSize: 35, color: C.amber });
    s.addShape("rect", { x: 0.3, y: 4.02, w: 2.5, h: 0.03, fill: { color: C.amber }, line: { color: C.amber } });
    s.addText("Edge Computing 특론 — AI 특강 Day 2", { x: 0.3, y: 4.12, w: 3.4, h: 0.3, margin: 0, fontSize: 10.5, color: C.muted });
    s.addText("이선우  •  Principal Engineer, SuperGate", { x: 0.3, y: 4.45, w: 3.4, h: 0.28, margin: 0, fontSize: 9.5, color: C.muted });

    const pts = [
      { icon: iChip,   label: "왜 Edge에서 LLM인가?" },
      { icon: iLayer,  label: "GGUF & llama.cpp 구조" },
      { icon: iDown,   label: "Ollama로 로컬 Agent 실행" },
      { icon: iChart,  label: "성능 측정 & NPU 전망" },
    ];
    pts.forEach((p, i) => {
      const cy = 0.65 + i * 1.18;
      card(s, 4.35, cy, 5.3, 1.0);
      s.addImage({ data: p.icon, x: 4.65, y: cy + 0.2, w: 0.6, h: 0.6 });
      s.addText(p.label, { x: 5.42, y: cy + 0.25, w: 4.0, h: 0.5, margin: 0, fontSize: 16, bold: true, color: C.white, valign: "middle" });
    });
    s.addText("Day 1 복습 → Day 2 심화 → 실제 Edge 배포까지", {
      x: 4.35, y: 5.25, w: 5.3, h: 0.28, margin: 0, fontSize: 9, color: C.muted, align: "right"
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 2 — Agenda
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Day 2 타임라인 — 2시간", "Agenda");
    const agenda = [
      { t: "0:00–0:10", title: "Day 1 복습 & 연결",       c: C.muted },
      { t: "0:10–0:30", title: "왜 Edge LLM인가?",         c: C.sky },
      { t: "0:30–0:50", title: "GGUF & llama.cpp 구조",   c: C.indigo },
      { t: "0:50–1:05", title: "Ollama 실습 세팅",          c: C.emerald },
      { t: "1:05–1:10", title: "Break ☕",                 c: C.amber },
      { t: "1:10–1:40", title: "로컬 Agent 실습",           c: C.rose },
      { t: "1:40–1:55", title: "성능 측정 & NPU 전망",      c: C.violet },
      { t: "1:55–2:00", title: "마무리 & Q&A",             c: C.muted },
    ];
    agenda.forEach((a, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = 0.35 + col * 2.35, y = 1.05 + row * 2.05;
      accentCard(s, x, y, 2.2, 1.82, a.c);
      chip(s, x + 0.12, y + 0.1, a.t, a.c);
      s.addText(a.title, { x: x + 0.12, y: y + 0.48, w: 1.98, h: 1.0, margin: 0, fontSize: 13.5, bold: true, color: C.white });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 3 — Day 1 복습 & 연결
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Day 1 핵심 복습 — 3문장", "복습");

    const reviews = [
      { n: "01", t: "LLM = 토큰 예측 함수",      d: "기억·행동·최신정보가 없다. 그래서 Agent가 필요하다.", c: C.indigo },
      { n: "02", t: "Agent = LLM + Tool + Loop",  d: "ReAct: Thought→Action→Observe 반복. 우리가 50줄로 구현했다.", c: C.sky },
      { n: "03", t: "Gen 4 = CLI·TUI 시대",       d: "Claude Code, Cursor, nanobot — 터미널에서 동작하는 Agent가 표준.", c: C.emerald },
    ];
    reviews.forEach((r, i) => {
      const y = 1.05 + i * 1.1;
      accentCard(s, 0.35, y, 9.3, 0.95, r.c);
      s.addShape("rect", { x: 0.48, y: y + 0.25, w: 0.55, h: 0.5, fill: { color: r.c }, line: { color: r.c } });
      s.addText(r.n, { x: 0.48, y: y + 0.25, w: 0.55, h: 0.5, margin: 0, fontSize: 18, bold: true, color: C.bg, align: "center", valign: "middle" });
      s.addText(r.t, { x: 1.2, y: y + 0.08, w: 3.2, h: 0.4, margin: 0, fontSize: 15, bold: true, color: r.c });
      s.addText(r.d, { x: 1.2, y: y + 0.5, w: 8.0, h: 0.38, margin: 0, fontSize: 12, color: C.white });
    });

    s.addShape("rect", { x: 0.35, y: 4.45, w: 9.3, h: 0.75, fill: { color: C.card }, line: { color: C.amber, width: 1.5 }, shadow: makeShadow() });
    s.addImage({ data: iRight, x: 0.5, y: 4.62, w: 0.38, h: 0.38 });
    s.addText("Day 2 질문: \"Cloud API 없이, 내 기기에서 직접 돌릴 수 있을까?\"", {
      x: 1.05, y: 4.55, w: 8.5, h: 0.52, margin: 0, fontSize: 15, bold: true, color: C.amber, valign: "middle"
    });
    s.addText("→ 답: 가능하다. Ollama + llama.cpp 가 해결한다.", {
      x: 1.05, y: 5.08, w: 8.5, h: 0.3, margin: 0, fontSize: 12, color: C.white
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 4 — 왜 Edge LLM인가?
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "왜 Edge에서 LLM을 돌려야 하는가?", "Edge 필요성");

    const reasons = [
      { icon: iShield, t: "개인정보 보호",   d: "소스코드·의료기록·금융데이터를\n클라우드에 보내면 안 된다.\nGTX NPU 같은 온프레미스 필수.", c: C.emerald },
      { icon: iSpeed,  t: "지연 시간",       d: "클라우드 왕복 100~500ms.\n자율주행·로봇·게임은\n10ms 이하가 필요하다.", c: C.rose },
      { icon: iCloud,  t: "네트워크 의존성", d: "인터넷 끊기면 동작 불가.\n오프라인 환경(공장·선박·군용)\n에서는 Edge가 유일한 선택.", c: C.amber },
      { icon: iChart,  t: "비용",            d: "GPT-4o 1M 토큰 = $5.\n온디바이스 LLM = 전기료만.\n대규모 서비스에서 10~100배 차이.", c: C.indigo },
    ];
    reasons.forEach((r, i) => {
      const x = (i % 2) * 4.78 + 0.35;
      const y = i < 2 ? 1.0 : 3.1;
      accentCard(s, x, y, 4.62, 1.85, r.c);
      s.addImage({ data: r.icon, x: x + 0.15, y: y + 0.55, w: 0.6, h: 0.6 });
      s.addText(r.t, { x: x + 0.9, y: y + 0.1, w: 3.55, h: 0.45, margin: 0, fontSize: 17, bold: true, color: r.c });
      s.addText(r.d, { x: x + 0.9, y: y + 0.58, w: 3.55, h: 1.05, margin: 0, fontSize: 10.5, color: C.white });
    });
    s.addText("Edge LLM = 프라이버시 + 속도 + 독립성 + 비용 절감", {
      x: 0.35, y: 5.1, w: 9.3, h: 0.3, margin: 0, fontSize: 13, bold: true, color: C.amber, align: "center"
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 5 — Cloud vs Edge 비교
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Cloud LLM vs Edge LLM — 언제 무엇을 쓰나?", "비교");

    // Header
    s.addShape("rect", { x: 2.8, y: 0.9, w: 3.4, h: 0.42, fill: { color: C.sky }, line: { color: C.sky } });
    s.addText("Cloud LLM", { x: 2.8, y: 0.9, w: 3.4, h: 0.42, margin: 0, fontSize: 14, bold: true, color: C.bg, align: "center", valign: "middle" });
    s.addShape("rect", { x: 6.38, y: 0.9, w: 3.4, h: 0.42, fill: { color: C.emerald }, line: { color: C.emerald } });
    s.addText("Edge LLM", { x: 6.38, y: 0.9, w: 3.4, h: 0.42, margin: 0, fontSize: 14, bold: true, color: C.bg, align: "center", valign: "middle" });

    const rows = [
      { label: "모델 크기",   cloud: "GPT-4o, Claude 3.7 (수천B)", edge: "1B~13B (GGUF 양자화)" },
      { label: "응답 지연",   cloud: "100~500ms (네트워크 포함)", edge: "0.5~5s (HW 의존)" },
      { label: "비용",        cloud: "토큰당 과금, 대량 시 고가", edge: "전기료만 (초기 HW 투자)" },
      { label: "프라이버시",  cloud: "데이터 외부 전송 불가피", edge: "완전 로컬, 데이터 유출 없음" },
      { label: "최신성",      cloud: "최신 모델 즉시 사용",      edge: "수동 모델 업데이트 필요" },
      { label: "추천 용도",   cloud: "복잡한 추론, 창의적 작업", edge: "반복 Task, 민감 데이터, 오프라인" },
    ];
    rows.forEach((r, i) => {
      const y = 1.45 + i * 0.62;
      const bg = i % 2 === 0 ? C.card : "172032";
      s.addShape("rect", { x: 0.35, y, w: 9.43, h: 0.58, fill: { color: bg }, line: { color: C.divider } });
      s.addText(r.label, { x: 0.45, y, w: 2.25, h: 0.58, margin: 0, fontSize: 11.5, bold: true, color: C.muted, valign: "middle" });
      s.addText(r.cloud, { x: 2.78, y, w: 3.45, h: 0.58, margin: 0, fontSize: 10.5, color: C.white, valign: "middle" });
      s.addText(r.edge,  { x: 6.35, y, w: 3.45, h: 0.58, margin: 0, fontSize: 10.5, color: C.white, valign: "middle" });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 6 — GGUF & 양자화
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "GGUF: Edge LLM의 표준 포맷", "GGUF");

    s.addText("GGUF = GPT-Generated Unified Format | llama.cpp 프로젝트의 모델 직렬화 표준 (2023~)", {
      x: 0.35, y: 0.9, w: 9.3, h: 0.35, margin: 0, fontSize: 11.5, color: C.muted, italic: true
    });

    // Left: GGUF structure
    accentCard(s, 0.35, 1.35, 4.55, 3.95, C.indigo);
    s.addText("GGUF 파일 구조", { x: 0.55, y: 1.45, w: 4.0, h: 0.38, margin: 0, fontSize: 14, bold: true, color: C.indigo });
    const parts = [
      { label: "Header",      desc: "매직 넘버, 버전, 텐서 개수",   c: C.sky },
      { label: "Metadata",    desc: "모델명, 아키텍처, 파라미터 수",  c: C.indigo },
      { label: "Tensor Info", desc: "각 레이어 이름·shape·dtype",    c: C.violet },
      { label: "Tensor Data", desc: "실제 가중치 (양자화 적용됨)",    c: C.emerald },
    ];
    parts.forEach((p, i) => {
      const y = 1.95 + i * 0.75;
      s.addShape("rect", { x: 0.55, y, w: 4.2, h: 0.65, fill: { color: "0A0F1E" }, line: { color: p.c, width: 1 } });
      s.addShape("rect", { x: 0.55, y, w: 1.05, h: 0.65, fill: { color: p.c }, line: { color: p.c } });
      s.addText(p.label, { x: 0.55, y, w: 1.05, h: 0.65, margin: 0, fontSize: 9.5, bold: true, color: C.bg, align: "center", valign: "middle" });
      s.addText(p.desc, { x: 1.72, y, w: 2.95, h: 0.65, margin: 0, fontSize: 10.5, color: C.white, valign: "middle" });
    });

    // Right: Quantization table
    accentCard(s, 5.1, 1.35, 4.55, 3.95, C.emerald);
    s.addText("양자화 레벨 비교", { x: 5.28, y: 1.45, w: 4.0, h: 0.38, margin: 0, fontSize: 14, bold: true, color: C.emerald });
    const quants = [
      { q: "F32 (원본)", size: "26 GB", ram: "32 GB+", quality: "100%", c: C.muted },
      { q: "Q8_0",      size: "7.7 GB", ram: "10 GB", quality: "99%",  c: C.sky },
      { q: "Q4_K_M ★", size: "4.1 GB", ram: "6 GB",  quality: "97%",  c: C.amber },
      { q: "Q3_K_S",    size: "3.0 GB", ram: "5 GB",  quality: "93%",  c: C.rose },
      { q: "Q2_K",      size: "2.6 GB", ram: "4 GB",  quality: "85%",  c: C.rose },
    ];
    s.addText("  포맷            파일 크기    RAM    품질", {
      x: 5.18, y: 1.9, w: 4.35, h: 0.28, margin: 0, fontSize: 8.5, color: C.muted, fontFace: "Consolas"
    });
    quants.forEach((q, i) => {
      const y = 2.22 + i * 0.62;
      const bg = q.q.includes("★") ? "1A2810" : "0A0F1E";
      const border = q.q.includes("★") ? C.amber : C.divider;
      s.addShape("rect", { x: 5.18, y, w: 4.35, h: 0.56, fill: { color: bg }, line: { color: border, width: q.q.includes("★") ? 1.5 : 1 } });
      s.addText(q.q, { x: 5.28, y, w: 1.65, h: 0.56, margin: 0, fontSize: 10, bold: q.q.includes("★"), color: q.c, valign: "middle" });
      s.addText(q.size, { x: 6.98, y, w: 0.85, h: 0.56, margin: 0, fontSize: 10, color: C.white, valign: "middle", align: "center" });
      s.addText(q.ram,  { x: 7.85, y, w: 0.78, h: 0.56, margin: 0, fontSize: 10, color: C.white, valign: "middle", align: "center" });
      s.addText(q.quality, { x: 8.65, y, w: 0.78, h: 0.56, margin: 0, fontSize: 10, color: q.c, valign: "middle", align: "center", bold: true });
    });
    s.addText("★ Q4_K_M = 실습 기본값 (품질·속도·용량 균형 최적)", {
      x: 5.18, y: 5.15, w: 4.35, h: 0.22, margin: 0, fontSize: 9, color: C.amber, italic: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 7 — llama.cpp 아키텍처
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "llama.cpp: 경량 추론 엔진의 구조", "llama.cpp");

    s.addText("Georgi Gerganov가 만든 C/C++ 순수 구현 LLM 추론 엔진 — GPU 없이도 동작 (2023~)", {
      x: 0.35, y: 0.9, w: 9.3, h: 0.35, margin: 0, fontSize: 11.5, color: C.muted, italic: true
    });

    // Stack diagram
    const layers = [
      { label: "Your App / agent.py",          sub: "OpenAI 호환 HTTP API 호출",    c: C.sky,     h: 0.65 },
      { label: "llama-server",                  sub: "OpenAI 호환 REST API 서버",     c: C.indigo,  h: 0.65 },
      { label: "llama.cpp Core",                sub: "토큰화 · KV Cache · Sampling", c: C.violet,  h: 0.65 },
      { label: "GGML Compute Backend",          sub: "CPU (AVX2) / CUDA / Metal / Vulkan", c: C.emerald, h: 0.65 },
      { label: "GGUF Model File (.gguf)",       sub: "양자화된 가중치 데이터",        c: C.amber,   h: 0.65 },
    ];
    layers.forEach((l, i) => {
      const y = 1.38 + i * 0.78;
      s.addShape("rect", { x: 0.35, y, w: 6.2, h: l.h, fill: { color: C.card }, line: { color: l.c, width: 1.5 }, shadow: makeShadow() });
      s.addShape("rect", { x: 0.35, y, w: 0.06, h: l.h, fill: { color: l.c }, line: { color: l.c } });
      s.addText(l.label, { x: 0.55, y: y + 0.04, w: 5.8, h: 0.35, margin: 0, fontSize: 13.5, bold: true, color: l.c });
      s.addText(l.sub,   { x: 0.55, y: y + 0.38, w: 5.8, h: 0.28, margin: 0, fontSize: 10, color: C.muted });
    });

    // Right: key features
    accentCard(s, 6.75, 1.38, 2.95, 3.9, C.sky);
    s.addText("핵심 특징", { x: 6.93, y: 1.48, w: 2.6, h: 0.35, margin: 0, fontSize: 13, bold: true, color: C.sky });
    const feats = [
      "순수 C++ — 외부 의존 없음",
      "CPU only 동작 가능",
      "CUDA / Metal / Vulkan 가속",
      "Flash Attention 지원",
      "4-bit 양자화 기본 내장",
      "OpenAI 호환 서버 내장",
      "Ollama의 추론 엔진 = llama.cpp",
    ];
    feats.forEach((f, i) => {
      s.addShape("oval", { x: 6.93, y: 1.98 + i * 0.44, w: 0.18, h: 0.18, fill: { color: C.sky }, line: { color: C.sky } });
      s.addText(f, { x: 7.22, y: 1.95 + i * 0.44, w: 2.35, h: 0.38, margin: 0, fontSize: 9.5, color: C.white });
    });

    s.addText("Ollama = llama.cpp 위에 모델 관리 + UI를 얹은 것", {
      x: 0.35, y: 5.18, w: 9.3, h: 0.28, margin: 0, fontSize: 11.5, color: C.amber, align: "center", bold: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 8 — Ollama 실습 세팅
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Ollama 설치 & 로컬 모델 실행 — 지금 따라하세요", "실습 세팅");

    const steps = [
      { n: "01", label: "Ollama 설치",        cmd: "# macOS / Linux\ncurl -fsSL https://ollama.com/install.sh | sh\n\n# Windows: https://ollama.com/download/OllamaSetup.exe", c: C.sky },
      { n: "02", label: "모델 다운로드",      cmd: "ollama pull llama3.2          # 2GB, 추천 (3B)\nollama pull qwen2.5:3b          # 1.9GB, 한국어 강함\nollama pull llama3.2:1b         # 0.8GB, 최소 사양용", c: C.emerald },
      { n: "03", label: "동작 확인",          cmd: "ollama run llama3.2\n>>> 안녕하세요! ReAct 패턴이 뭔가요?\n[Ctrl+D 로 종료]", c: C.indigo },
      { n: "04", label: "agent.py 연결",      cmd: "USE_OLLAMA=true python agent.py\n# 또는\nOLLAMA_MODEL=qwen2.5:3b USE_OLLAMA=true python agent.py", c: C.amber },
      { n: "05", label: "동작 확인",          cmd: "You: 오늘 날짜와 sqrt(144) 계산해줘\n→ Agent가 get_datetime + calculate 동시 호출", c: C.emerald },
    ];
    steps.forEach((st, i) => {
      const y = 1.0 + i * 0.88;
      accentCard(s, 0.35, y, 9.3, 0.76, st.c);
      s.addShape("rect", { x: 0.48, y: y + 0.18, w: 0.52, h: 0.44, fill: { color: st.c }, line: { color: st.c } });
      s.addText(st.n, { x: 0.48, y: y + 0.18, w: 0.52, h: 0.44, margin: 0, fontSize: 14, bold: true, color: C.bg, align: "center", valign: "middle" });
      s.addText(st.label, { x: 1.15, y: y + 0.05, w: 2.0, h: 0.35, margin: 0, fontSize: 13, bold: true, color: st.c });
      s.addText(st.cmd, { x: 1.15, y: y + 0.4, w: 8.3, h: 0.35, margin: 0, fontSize: 9, color: C.amber, fontFace: "Consolas", fit: "shrink" });
    });

    s.addShape("rect", { x: 0.35, y: 5.4, w: 9.3, h: 0.18, fill: { color: C.card }, line: { color: C.rose } });
    s.addText("⚠  GPU 없어도 CPU로 동작 — 단 속도는 느림. M1/M2 Mac이나 RTX가 있으면 훨씬 빠름", {
      x: 0.5, y: 5.41, w: 9.0, h: 0.16, margin: 0, fontSize: 9.5, color: C.rose
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 9 — 모델 선택 가이드
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "어떤 모델을 골라야 하나? — 2025 기준", "모델 선택");

    const models = [
      { name: "qwen3.5:0.8b",   size: "2.0 GB", ram: "4 GB",  lang: "영어 ★★★ / 한국어 ★★☆", speed: "빠름", use: "범용 실습 기본값", c: C.sky,     rec: true },
      { name: "qwen2.5:3b",    size: "1.9 GB", ram: "4 GB",  lang: "한국어 ★★★★ / 영어 ★★★", speed: "빠름", use: "한국어 강의 최적", c: C.emerald, rec: true },
      { name: "llama3.2:1b",   size: "0.8 GB", ram: "2 GB",  lang: "영어 ★★☆ / 한국어 ★☆☆", speed: "매우 빠름", use: "저사양 PC 대비용", c: C.muted,   rec: false },
      { name: "phi3.5:mini",   size: "2.2 GB", ram: "4 GB",  lang: "영어 ★★★ / 한국어 ★★☆", speed: "빠름", use: "코딩 Task 강점",  c: C.indigo,  rec: false },
      { name: "mistral:7b",    size: "4.1 GB", ram: "8 GB",  lang: "영어 ★★★★ / 한국어 ★★☆", speed: "보통", use: "고품질 필요 시",  c: C.violet,  rec: false },
      { name: "llama3.1:8b",   size: "4.7 GB", ram: "8 GB",  lang: "영어 ★★★★ / 한국어 ★★★", speed: "보통", use: "Day 2 심화 실습", c: C.amber,   rec: false },
    ];

    // Table header
    const cols = [
      { label: "모델",       x: 0.4,  w: 2.1 },
      { label: "파일 크기",  x: 2.55, w: 1.0 },
      { label: "RAM",        x: 3.6,  w: 0.8 },
      { label: "언어 품질",  x: 4.45, w: 2.8 },
      { label: "속도",       x: 7.3,  w: 0.85 },
      { label: "추천 용도",  x: 8.2,  w: 1.6 },
    ];
    s.addShape("rect", { x: 0.35, y: 0.9, w: 9.35, h: 0.4, fill: { color: C.card }, line: { color: C.divider } });
    cols.forEach(c => s.addText(c.label, { x: c.x, y: 0.9, w: c.w, h: 0.4, margin: 0, fontSize: 10, bold: true, color: C.muted, valign: "middle" }));

    models.forEach((m, i) => {
      const y = 1.35 + i * 0.69;
      const bg = m.rec ? (i === 0 ? "0A1A2A" : "0A2A1A") : "111827";
      const border = m.rec ? m.c : C.divider;
      s.addShape("rect", { x: 0.35, y, w: 9.35, h: 0.62, fill: { color: bg }, line: { color: border, width: m.rec ? 1.5 : 1 } });
      if (m.rec) {
        s.addShape("rect", { x: 0.35, y, w: 0.06, h: 0.62, fill: { color: m.c }, line: { color: m.c } });
      }
      s.addText(m.name, { x: 0.45, y, w: 2.0, h: 0.62, margin: 0, fontSize: 11, bold: m.rec, color: m.c, valign: "middle", fontFace: "Consolas" });
      s.addText(m.size,  { x: 2.55, y, w: 1.0, h: 0.62, margin: 0, fontSize: 10, color: C.white, valign: "middle", align: "center" });
      s.addText(m.ram,   { x: 3.6,  y, w: 0.8, h: 0.62, margin: 0, fontSize: 10, color: C.white, valign: "middle", align: "center" });
      s.addText(m.lang,  { x: 4.45, y, w: 2.8, h: 0.62, margin: 0, fontSize: 9.5, color: C.white, valign: "middle" });
      s.addText(m.speed, { x: 7.3,  y, w: 0.85, h: 0.62, margin: 0, fontSize: 10, color: C.white, valign: "middle", align: "center" });
      s.addText(m.use,   { x: 8.2,  y, w: 1.6, h: 0.62, margin: 0, fontSize: 9, color: m.rec ? m.c : C.muted, valign: "middle" });
    });

    s.addText("강의 권장: ollama pull qwen2.5:3b  (한국어 강의 최적, 4GB RAM이면 충분)", {
      x: 0.35, y: 5.55, w: 9.3, h: 0.25, margin: 0, fontSize: 11, color: C.amber, align: "center", bold: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 10 — 로컬 Agent 실습 코드
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "로컬 Agent 실습: agent.py + Ollama 연결", "로컬 실습");

    codeBlock(s, 0.35, 0.92, 4.65, 4.6,
`# ── agent.py Ollama 연결 부분 ────────────
import os
from openai import OpenAI  # Ollama도 OpenAI 호환!

USE_OLLAMA = os.getenv("USE_OLLAMA","false") == "true"

if USE_OLLAMA:
    client = OpenAI(
        base_url="http://localhost:11434/v1",
        api_key="ollama"   # 아무 값이나 OK
    )
    MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
else:
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY")
    )
    MODEL = "gpt-4o-mini"

# ── run_agent는 동일 (변경 없음!) ──────────
response = client.chat.completions.create(
    model=MODEL,
    messages=messages,
    tools=TOOLS,
    tool_choice="auto"
)
# 코드 변경 = 딱 이 2줄뿐!
# MODEL 변수와 client 초기화만 다르다`, C.emerald, "Ollama 연결 (수정 부분)");

    codeBlock(s, 5.18, 0.92, 4.47, 2.15,
`# ── 실행 방법 ────────────────────────────
# 기본 (OpenAI)
python agent.py

# Ollama 로컬 (llama3.2)
USE_OLLAMA=true python agent.py

# Ollama 로컬 (한국어 최적)
OLLAMA_MODEL=qwen2.5:3b \\
  USE_OLLAMA=true python agent.py`, C.sky, "실행");

    codeBlock(s, 5.18, 3.2, 4.47, 2.32,
`# ── 테스트 질문 모음 ─────────────────────
You: 오늘 날짜 알려줘
→ get_datetime 호출 확인

You: sqrt(2) * 100 계산해줘
→ calculate 호출 확인

You: edge ai가 뭔지 검색해줘
→ search_web 호출 확인

You: agent.py 파일 읽어줘
→ read_file 호출 확인`, C.amber, "테스트 시나리오");
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 11 — 성능 측정
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "로컬 LLM 성능 측정 — 직접 벤치마킹", "성능 측정");

    s.addText("추론 속도 단위: tokens/second (tok/s) — 숫자가 클수록 빠름", {
      x: 0.35, y: 0.9, w: 9.3, h: 0.32, margin: 0, fontSize: 11.5, color: C.muted, italic: true
    });

    // Benchmark command
    codeBlock(s, 0.35, 1.3, 5.6, 1.45,
`# Ollama 내장 벤치마크
ollama run llama3.2 --verbose "hello" 2>&1 | grep tok

# llama.cpp 직접 측정
./llama-bench -m model.gguf -t 8 -ngl 0`, C.sky, "측정 명령어");

    // Python timing
    codeBlock(s, 6.1, 1.3, 3.65, 1.45,
`import time
start = time.time()
resp = client.chat.completions.create(...)
elapsed = time.time() - start
print(f"응답 시간: {elapsed:.2f}s")`, C.emerald, "Python 타이밍");

    // Reference table
    accentCard(s, 0.35, 2.92, 9.3, 2.55, C.amber);
    s.addText("하드웨어별 참고 성능 (qwen3.5:0.8b Q4_K_M 기준)", {
      x: 0.55, y: 3.0, w: 8.5, h: 0.32, margin: 0, fontSize: 12, bold: true, color: C.amber
    });
    const hwrows = [
      { hw: "M1 MacBook Air (8GB)",    tok: "~25 tok/s",  note: "쾌적한 실습 가능", good: true },
      { hw: "RTX 3090 (24GB VRAM)",   tok: "~120 tok/s", note: "아주 빠름 (강사 PC)", good: true },
      { hw: "Intel i7 CPU only",       tok: "~8 tok/s",   note: "느리지만 동작은 함", good: false },
      { hw: "Raspberry Pi 5 (8GB)",    tok: "~3 tok/s",   note: "데모용, 실용은 어렵", good: false },
    ];
    const hw_cols = [{ l: "하드웨어", x: 0.55, w: 3.2 }, { l: "속도", x: 3.8, w: 1.4 }, { l: "비고", x: 5.25, w: 4.25 }];
    hw_cols.forEach(c => s.addText(c.l, { x: c.x, y: 3.35, w: c.w, h: 0.3, margin: 0, fontSize: 10, bold: true, color: C.muted }));
    hwrows.forEach((r, i) => {
      const y = 3.72 + i * 0.43;
      s.addText(r.hw,   { x: 0.55, y, w: 3.2,  h: 0.4, margin: 0, fontSize: 10.5, color: C.white });
      s.addText(r.tok,  { x: 3.8,  y, w: 1.4,  h: 0.4, margin: 0, fontSize: 10.5, color: r.good ? C.emerald : C.rose, bold: true });
      s.addText(r.note, { x: 5.25, y, w: 4.25, h: 0.4, margin: 0, fontSize: 10, color: C.muted });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 12 — NPU 가속 & GTX NPU 전망
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "NPU 가속: Edge AI의 다음 단계", "NPU 전망");

    s.addText("CPU(느림) → GPU(빠름, 전력 多) → NPU(빠름, 전력 少) — Edge의 최종 목적지", {
      x: 0.35, y: 0.9, w: 9.3, h: 0.35, margin: 0, fontSize: 11.5, color: C.muted, italic: true
    });

    // CPU vs GPU vs NPU
    const procs = [
      { label: "CPU", sub: "범용 연산", pro: "소프트웨어 유연성", con: "행렬 연산 비효율", tok: "~8 tok/s", c: C.muted },
      { label: "GPU", sub: "병렬 행렬 연산", pro: "LLM 추론 최적", con: "전력 소비 큼 (200W+)", tok: "~120 tok/s", c: C.sky },
      { label: "NPU", sub: "AI 전용 하드웨어", pro: "저전력 + 고속", con: "소프트웨어 생태계 초기", tok: "목표 ~50+ tok/s", c: C.emerald },
    ];
    procs.forEach((p, i) => {
      const x = 0.35 + i * 3.18;
      accentCard(s, x, 1.38, 3.05, 2.38, p.c);
      s.addText(p.label, { x: x + 0.15, y: 1.48, w: 2.8, h: 0.55, margin: 0, fontSize: 24, bold: true, color: p.c });
      s.addText(p.sub,   { x: x + 0.15, y: 2.05, w: 2.8, h: 0.3,  margin: 0, fontSize: 10, color: C.muted });
      s.addText("✅ " + p.pro, { x: x + 0.15, y: 2.42, w: 2.8, h: 0.3, margin: 0, fontSize: 10, color: C.emerald });
      s.addText("⚠️ " + p.con, { x: x + 0.15, y: 2.75, w: 2.8, h: 0.3, margin: 0, fontSize: 10, color: C.rose });
      s.addText(p.tok,   { x: x + 0.15, y: 3.12, w: 2.8, h: 0.3, margin: 0, fontSize: 11, bold: true, color: p.c });
    });

    // GTX NPU box
    s.addShape("rect", { x: 0.35, y: 3.88, w: 9.3, h: 1.35, fill: { color: C.card }, line: { color: C.amber, width: 2 }, shadow: makeShadow() });
    s.addShape("rect", { x: 0.35, y: 3.88, w: 0.07, h: 1.35, fill: { color: C.amber }, line: { color: C.amber } });
    s.addImage({ data: iChip, x: 0.55, y: 3.98, w: 0.65, h: 0.65 });
    s.addText("GTX NPU (SuperGate — 강사 현재 개발 중)", { x: 1.35, y: 3.92, w: 6.0, h: 0.4, margin: 0, fontSize: 14, bold: true, color: C.amber });
    s.addText("4 NEST × 16 SPU  |  16GB DRAM  |  PCIe 4.0  |  RISC-V Custom ISA  |  GGML Backend 개발 중", {
      x: 1.35, y: 4.32, w: 8.1, h: 0.28, margin: 0, fontSize: 10.5, color: C.white
    });
    s.addText("→ 이 NPU에서 llama.cpp / GGUF 모델을 돌리는 것이 이 연구의 목표", {
      x: 1.35, y: 4.65, w: 8.1, h: 0.28, margin: 0, fontSize: 10.5, color: C.muted, italic: true
    });
    s.addText("목표: 저전력(<15W)으로 3B 모델 30+ tok/s 달성", { x: 1.35, y: 4.95, w: 8.1, h: 0.25, margin: 0, fontSize: 10.5, color: C.amber, bold: true });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 12a — 대화 기억 구현 (agent_memory.py)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "대화 기억 구현: agent_memory.py", "Memory 실습");

    s.addText("\"Memory is explicit storage, not consciousness\" — 기억은 의식이 아니라 저장소다 (agents-from-scratch)", {
      x: 0.35, y: 0.9, w: 9.3, h: 0.35, margin: 0, fontSize: 11.5, color: C.muted, italic: true
    });

    // Left: Memory class
    codeBlock(s, 0.35, 1.35, 4.55, 2.55,
`class Memory:
    def __init__(self):
        self.items = []
        self.load_from_file()  # 복원
    def add(self, item: str):
        if item not in self.items:
            self.items.append(item)
            self.save_to_file()  # 영속화
    def search(self, query: str):
        return [i for i in self.items
                if query.lower() in i.lower()]
    def get_recent(self, n=5):
        return self.items[-n:]`, C.indigo, "Memory 클래스");

    // Right: JSONL + auto-recall
    codeBlock(s, 5.1, 1.35, 4.55, 1.2,
`# JSONL (한 줄 = 한 턴, append-only)
{"role":"user","content":"내 이름은 철수","ts":1710500000}
{"role":"assistant","content":"네, 철수님!","ts":1710500001}
# → 크래시해도 이전 데이터 안전 (claw0 패턴)`, C.emerald, "JSONL 대화 이력");

    codeBlock(s, 5.1, 2.7, 4.55, 1.2,
`# run_agent()에서 자동 기억 주입
recent = memory.get_recent(3)
if recent:
    messages.append({"role":"system",
      "content":f"참고 기억: {recent}"})`, C.amber, "Auto-Recall (자동 기억 주입)");

    // Bottom: demo flow
    accentCard(s, 0.35, 4.1, 9.3, 1.3, C.sky);
    s.addText("데모 흐름", { x: 0.55, y: 4.18, w: 2.0, h: 0.3, margin: 0, fontSize: 13, bold: true, color: C.sky });
    const demoLines = [
      { t: "You: /save 내 이름은 철수입니다",           c: C.emerald },
      { t: "  ✓ 기억 저장: 내 이름은 철수입니다",        c: C.emerald },
      { t: "You: 내 이름이 뭐였지?",                    c: C.white },
      { t: "  💭 Tool: memory_search {\"query\": \"이름\"}", c: C.sky },
      { t: "  → \"김철수님, 기억하고 있습니다!\"",        c: C.amber },
    ];
    demoLines.forEach((l, i) => {
      s.addText(l.t, { x: 0.55, y: 4.5 + i * 0.18, w: 8.9, h: 0.18, margin: 0, fontSize: 9, color: l.c, fontFace: "Consolas" });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 12b — Planning on Edge (agent_planner.py)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Planning: 로컬 LLM으로 계획을 세울 수 있을까?", "Planning 실습");

    s.addText("\"Plans are data structures, not thoughts\" — 계획은 생각이 아니라 데이터 구조다 (agents-from-scratch)", {
      x: 0.35, y: 0.9, w: 9.3, h: 0.35, margin: 0, fontSize: 11.5, color: C.muted, italic: true
    });

    // Left: Planning code
    codeBlock(s, 0.35, 1.35, 4.55, 2.8,
`def create_plan(goal: str) -> dict:
    prompt = f"""목표를 단계별 분해하세요.
CRITICAL INSTRUCTIONS:
1. 유효한 JSON만 출력. 설명 금지
형식: {{"steps": ["단계1", "단계2"]}}
목표: {goal}"""
    for attempt in range(3):  # 3회 재시도
        resp = client.chat.completions.create(
            model=MODEL, messages=[...],
            temperature=0.0)  # JSON 정확도 ↑
        plan = extract_json_from_text(resp)
        if plan and "steps" in plan:
            return plan
    return None`, C.indigo, "create_plan() — 계획 생성");

    // Right: Edge tips + demo
    accentCard(s, 5.1, 1.35, 4.55, 1.4, C.amber);
    s.addText("Edge LLM에서 JSON 출력 팁", { x: 5.28, y: 1.45, w: 4.0, h: 0.3, margin: 0, fontSize: 13, bold: true, color: C.amber });
    const tips = [
      { t: "temperature=0.0", d: "결정론적 출력, JSON 정확도 ↑" },
      { t: "짧은 스키마", d: "복잡한 nested JSON 피하기" },
      { t: "3회 재시도", d: "첫 시도 실패해도 2~3번째 성공" },
      { t: "qwen2.5:3b 추천", d: "JSON 안정성이 llama3.2보다 높음" },
    ];
    tips.forEach((t, i) => {
      s.addText("• " + t.t, { x: 5.28, y: 1.82 + i * 0.22, w: 1.8, h: 0.2, margin: 0, fontSize: 9.5, bold: true, color: C.emerald });
      s.addText(t.d, { x: 7.1, y: 1.82 + i * 0.22, w: 2.4, h: 0.2, margin: 0, fontSize: 9.5, color: C.white });
    });

    codeBlock(s, 5.1, 2.9, 4.55, 1.25,
`You: /plan Edge AI 조사하고 요약해줘
📋 계획: 1.검색 → 2.정리 → 3.요약
→ 각 단계 Tool 자동 호출 실행
→ execute_plan()이 순차 처리`, C.sky, "데모 흐름");

    // Bottom: progression
    s.addShape("rect", { x: 0.35, y: 4.3, w: 9.3, h: 0.04, fill: { color: C.divider }, line: { color: C.divider } });
    s.addText("실습 파일 단계별 진행", { x: 0.35, y: 4.45, w: 9.3, h: 0.28, margin: 0, fontSize: 12, bold: true, color: C.white });

    const progression = [
      { name: "agent.py", desc: "4 Tools + ReAct (50줄)", c: C.emerald },
      { name: "agent_memory.py", desc: "+ Memory + JSONL", c: C.sky },
      { name: "agent_planner.py", desc: "+ Planning + JSON 파싱", c: C.indigo },
      { name: "agent_advanced.py", desc: "종합: 7 Tools + 전부", c: C.amber },
    ];
    progression.forEach((p, i) => {
      const x = 0.35 + i * 2.38;
      s.addShape("rect", { x, y: 4.78, w: 2.2, h: 0.65, fill: { color: C.card }, line: { color: p.c, width: 1.5 }, shadow: makeShadow() });
      s.addShape("rect", { x, y: 4.78, w: 0.05, h: 0.65, fill: { color: p.c }, line: { color: p.c } });
      s.addText(p.name, { x: x + 0.1, y: 4.82, w: 2.0, h: 0.28, margin: 0, fontSize: 10, bold: true, color: p.c, fontFace: "Consolas" });
      s.addText(p.desc, { x: x + 0.1, y: 5.1, w: 2.0, h: 0.28, margin: 0, fontSize: 9, color: C.white });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 12c — Production Agent 아키텍처 (claw0 overview)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Production Agent: 50줄에서 어디까지 갈 수 있는가?", "Production");

    s.addText("claw0 프로젝트 — 10단계로 Production Agent Gateway를 처음부터 구축하는 튜토리얼", {
      x: 0.35, y: 0.9, w: 9.3, h: 0.35, margin: 0, fontSize: 11.5, color: C.muted, italic: true
    });

    const sections = [
      { n: "S01", t: "Agent Loop",    d: "while True + LLM 호출 + 분기", c: C.emerald, ours: "= agent.py" },
      { n: "S02", t: "Tool Use",      d: "JSON 스키마 + 핸들러 맵",      c: C.emerald, ours: "= agent.py" },
      { n: "S03", t: "Sessions",      d: "JSONL 영속화 + 컨텍스트 복구", c: C.sky,     ours: "≈ agent_memory" },
      { n: "S04", t: "Channels",      d: "CLI + Telegram + Feishu 통합", c: C.indigo,  ours: "" },
      { n: "S05", t: "Gateway",       d: "멀티 Agent 라우팅 테이블",     c: C.indigo,  ours: "" },
      { n: "S06", t: "Intelligence",  d: "8층 프롬프트 + TF-IDF 메모리", c: C.violet,  ours: "" },
      { n: "S07", t: "Heartbeat",     d: "백그라운드 자동 실행 + Cron",   c: C.rose,    ours: "" },
      { n: "S08", t: "Delivery",      d: "메시지 배달 보장 (WAL)",       c: C.rose,    ours: "" },
      { n: "S09", t: "Resilience",    d: "API 키 로테이션 + 3층 재시도", c: C.amber,   ours: "" },
      { n: "S10", t: "Concurrency",   d: "Lane 기반 동시성 제어",       c: C.amber,   ours: "" },
    ];

    sections.forEach((sec, i) => {
      const col = i < 5 ? 0 : 1;
      const row = i % 5;
      const x = 0.35 + col * 4.82;
      const y = 1.35 + row * 0.78;
      const isOurs = sec.ours !== "";

      s.addShape("rect", {
        x, y, w: 4.65, h: 0.68,
        fill: { color: isOurs ? "0A1A2A" : C.card },
        line: { color: isOurs ? sec.c : C.divider, width: isOurs ? 1.5 : 1 },
      });
      s.addShape("rect", { x, y, w: 0.05, h: 0.68, fill: { color: sec.c }, line: { color: sec.c } });
      s.addText(sec.n, { x: x + 0.12, y: y + 0.04, w: 0.55, h: 0.28, margin: 0, fontSize: 10, bold: true, color: sec.c });
      s.addText(sec.t, { x: x + 0.7, y: y + 0.04, w: 1.6, h: 0.28, margin: 0, fontSize: 11, bold: true, color: C.white });
      s.addText(sec.d, { x: x + 0.12, y: y + 0.35, w: 3.2, h: 0.25, margin: 0, fontSize: 9, color: C.muted });
      if (sec.ours) {
        s.addText(sec.ours, { x: x + 3.35, y: y + 0.04, w: 1.25, h: 0.6, margin: 0, fontSize: 9, color: sec.c, bold: true, valign: "middle" });
      }
    });

    s.addShape("rect", { x: 0.35, y: 5.28, w: 9.3, h: 0.3, fill: { color: C.card }, line: { color: C.amber, width: 1.5 } });
    s.addText("지금 여러분의 agent.py는 S01-S02 단계. 나머지가 Production의 현실. claw0 저장소 공유 예정.", {
      x: 0.5, y: 5.3, w: 9.0, h: 0.26, margin: 0, fontSize: 10.5, color: C.amber, align: "center"
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 13 — 실습 미션 Day 2
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Day 2 실습 미션", "실습");

    const missions = [
      { lv: "기본",   desc: "Ollama + qwen3.5:0.8b 설치 → agent.py USE_OLLAMA=true 동작 확인", c: C.emerald },
      { lv: "심화 1", desc: "qwen2.5:3b vs qwen3.5:0.8b 한국어 응답 품질 비교 (같은 질문 5개)", c: C.sky },
      { lv: "심화 2", desc: "응답 시간 측정: time() 으로 Cloud vs 로컬 latency 비교 표 만들기", c: C.indigo },
      { lv: "심화 3", desc: "Memory 구현: 대화 내용을 chat_history.json에 저장·불러오기", c: C.violet },
      { lv: "도전",   desc: "nanobot + Ollama 연결 후 loop.py와 우리 run_agent() 코드 라인 단위 비교", c: C.amber },
    ];
    missions.forEach((m, i) => {
      const y = 1.0 + i * 0.9;
      accentCard(s, 0.35, y, 9.3, 0.78, m.c);
      s.addShape("rect", { x: 0.48, y: y + 0.18, w: 0.9, h: 0.38, fill: { color: m.c }, line: { color: m.c } });
      s.addText(m.lv, { x: 0.48, y: y + 0.18, w: 0.9, h: 0.38, margin: 0, fontSize: 10, bold: true, color: C.bg, align: "center", valign: "middle" });
      s.addText(m.desc, { x: 1.55, y: y + 0.2, w: 7.95, h: 0.45, margin: 0, fontSize: 12, color: C.white, valign: "middle" });
    });
    s.addShape("rect", { x: 0.35, y: 5.38, w: 9.3, h: 0.18, fill: { color: C.card }, line: { color: C.amber } });
    s.addImage({ data: iLight, x: 0.5, y: 5.38, w: 0.2, h: 0.2 });
    s.addText("Cloud vs Local 차이를 직접 체감하는 게 Day 2의 핵심 takeaway", {
      x: 0.8, y: 5.39, w: 8.7, h: 0.17, margin: 0, fontSize: 9.5, color: C.amber
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 14 — 오늘 요약
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Day 2 요약 — 5문장", "Summary");

    const sums = [
      { n: "01", t: "Edge LLM = 4가지 이유",      d: "프라이버시·지연·독립성·비용 — 클라우드만이 답이 아니다.", c: C.sky },
      { n: "02", t: "GGUF = 경량화 표준 포맷",     d: "Q4_K_M 양자화로 7B 모델을 4GB RAM에서 돌린다.", c: C.indigo },
      { n: "03", t: "llama.cpp = 추론 엔진",       d: "CPU only도 동작. Ollama는 이 위에 편의성을 얹은 것.", c: C.emerald },
      { n: "04", t: "코드 변경 = 2줄",             d: "base_url + api_key만 바꾸면 Cloud→Local 전환 완료.", c: C.amber },
      { n: "05", t: "NPU = Edge AI의 미래",        d: "GTX NPU 같은 전용 하드웨어가 저전력 고속 추론을 실현한다.", c: C.rose },
    ];
    sums.forEach((sm, i) => {
      const y = 0.98 + i * 0.9;
      accentCard(s, 0.35, y, 9.3, 0.78, sm.c);
      s.addShape("rect", { x: 0.48, y: y + 0.18, w: 0.55, h: 0.45, fill: { color: sm.c }, line: { color: sm.c } });
      s.addText(sm.n, { x: 0.48, y: y + 0.18, w: 0.55, h: 0.45, margin: 0, fontSize: 16, bold: true, color: C.bg, align: "center", valign: "middle" });
      s.addText(sm.t, { x: 1.2, y: y + 0.04, w: 3.2, h: 0.38, margin: 0, fontSize: 13.5, bold: true, color: sm.c });
      s.addText(sm.d, { x: 1.2, y: y + 0.44, w: 8.0, h: 0.32, margin: 0, fontSize: 11, color: C.white });
    });
    s.addShape("rect", { x: 0.35, y: 5.38, w: 9.3, h: 0.22, fill: { color: "0D2010" }, line: { color: C.emerald, width: 1 } });
    s.addText("🚀  숙제: 집에서 Ollama + 다른 모델 하나 더 실험해보기 (phi3.5, gemma3 등)", {
      x: 0.5, y: 5.4, w: 9.0, h: 0.2, margin: 0, fontSize: 11.5, color: C.emerald, align: "center", bold: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 15 — Q&A
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: "050E05" }, line: { color: "050E05" } });
    s.addImage({ data: iRobot, x: 4.25, y: 0.45, w: 1.5, h: 1.5 });
    s.addText("Q & A", { x: 1, y: 2.1, w: 8, h: 1.05, margin: 0, fontSize: 58, bold: true, color: C.white, align: "center" });
    s.addText("질문은 언제든지 환영합니다", { x: 1, y: 3.22, w: 8, h: 0.5, margin: 0, fontSize: 16, color: C.amber, align: "center" });
    s.addShape("rect", { x: 2.0, y: 3.9, w: 6.0, h: 0.5, fill: { color: C.card }, line: { color: C.divider } });
    s.addText("실습 코드 · 슬라이드 강의 후 공유  |  Ollama 트러블슈팅은 discord 채널에서", {
      x: 2.0, y: 3.9, w: 6.0, h: 0.5, margin: 0, fontSize: 10, color: C.muted, align: "center", valign: "middle"
    });
    s.addText("이선우  |  Principal Engineer, SuperGate  |  GTX NPU Core Team", {
      x: 1, y: 4.62, w: 8, h: 0.3, margin: 0, fontSize: 11, color: C.muted, align: "center"
    });
  }

  await pres.writeFile({ fileName: "agent_ai_lecture_day2_v2.pptx" });
  console.log("Day 2 Done ✓");
}

build().catch(console.error);
