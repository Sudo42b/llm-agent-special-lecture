const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

const {
  FaRobot, FaBrain, FaTools, FaCode, FaPlay, FaLightbulb,
  FaArrowRight, FaCheckCircle, FaCog, FaSearch, FaTerminal,
  FaDesktop, FaGlobe, FaPlug, FaPuzzlePiece, FaLayerGroup,
  FaMicrochip, FaHistory, FaBook, FaNetworkWired
} = require("react-icons/fa");

// ─── Icon helper ──────────────────────────────────────────────────────────────
async function iconPng(Icon, color = "#FFFFFF") {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Icon, { color, size: "256" })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: "0F172A", card: "1E293B", card2: "162032",
  sky: "38BDF8", indigo: "818CF8", emerald: "34D399",
  amber: "FBBF24", rose: "F87171", violet: "A78BFA",
  white: "F8FAFC", muted: "94A3B8", divider: "334155",
};
const makeShadow = () => ({ type: "outer", blur: 10, offset: 3, angle: 135, color: "000000", opacity: 0.3 });

// ─── Layout helpers ───────────────────────────────────────────────────────────
function bgFill(slide) { slide.background = { color: C.bg }; }

function topBar(slide, title, tag) {
  slide.addShape("rect", { x: 0, y: 0, w: 10, h: 0.82, fill: { color: C.card }, line: { color: C.card } });
  slide.addShape("rect", { x: 0, y: 0, w: 0.07, h: 0.82, fill: { color: C.sky }, line: { color: C.sky } });
  slide.addText(title, { x: 0.22, y: 0, w: 7.5, h: 0.82, margin: 0, fontSize: 21, bold: true, color: C.white, valign: "middle" });
  if (tag) slide.addText(tag, { x: 7.8, y: 0, w: 2.1, h: 0.82, margin: 0, fontSize: 9.5, color: C.muted, valign: "middle", align: "right" });
}

function card(slide, x, y, w, h, color = C.card, border = C.divider) {
  slide.addShape("rect", { x, y, w, h, fill: { color }, line: { color: border, width: 1 }, shadow: makeShadow() });
}

function accentCard(slide, x, y, w, h, ac) {
  card(slide, x, y, w, h);
  slide.addShape("rect", { x, y, w: 0.06, h, fill: { color: ac }, line: { color: ac } });
}

function chip(slide, x, y, text, color) {
  slide.addShape("rect", { x, y, w: 1.4, h: 0.27, fill: { color }, line: { color } });
  slide.addText(text, { x, y, w: 1.4, h: 0.27, margin: 0, fontSize: 9, bold: true, color: C.bg, align: "center", valign: "middle" });
}

// ─── Code block helper ────────────────────────────────────────────────────────
function codeBlock(slide, x, y, w, h, code, accentColor = C.sky, title = "") {
  card(slide, x, y, w, h, "111827", accentColor);
  slide.addShape("rect", { x, y, w, h: 0.06, fill: { color: accentColor }, line: { color: accentColor } });
  if (title) slide.addText(title, { x: x + 0.12, y: y + 0.1, w: w - 0.2, h: 0.28, margin: 0, fontSize: 10, bold: true, color: accentColor });
  slide.addText(code, { x: x + 0.12, y: y + (title ? 0.42 : 0.18), w: w - 0.2, h: h - (title ? 0.55 : 0.28), margin: 0, fontSize: 9.5, color: C.white, fontFace: "Consolas", fit: "shrink" });
}

// ══════════════════════════════════════════════════════════════════════════════
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Agent AI from Scratch";

  // Pre-render icons
  const iRobot   = await iconPng(FaRobot,   "#38BDF8");
  const iBrain   = await iconPng(FaBrain,   "#818CF8");
  const iTools   = await iconPng(FaTools,   "#34D399");
  const iCode    = await iconPng(FaCode,    "#FBBF24");
  const iPlay    = await iconPng(FaPlay,    "#38BDF8");
  const iLight   = await iconPng(FaLightbulb, "#FBBF24");
  const iCheck   = await iconPng(FaCheckCircle, "#34D399");
  const iCog     = await iconPng(FaCog,     "#F87171");
  const iSearch  = await iconPng(FaSearch,  "#818CF8");
  const iTerm    = await iconPng(FaTerminal,"#34D399");
  const iDesktop = await iconPng(FaDesktop, "#38BDF8");
  const iGlobe   = await iconPng(FaGlobe,   "#818CF8");
  const iPlug    = await iconPng(FaPlug,    "#A78BFA");
  const iPuzzle  = await iconPng(FaPuzzlePiece, "#FBBF24");
  const iLayer   = await iconPng(FaLayerGroup, "#38BDF8");
  const iChip    = await iconPng(FaMicrochip, "#F87171");
  const iHistory = await iconPng(FaHistory, "#94A3B8");
  const iNet     = await iconPng(FaNetworkWired, "#A78BFA");
  const iRight   = await iconPng(FaArrowRight, "#94A3B8");

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 1 — Title
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    s.addShape("rect", { x: 0, y: 0, w: 4.0, h: 5.625, fill: { color: "0A2540" }, line: { color: "0A2540" } });
    s.addShape("rect", { x: 4.0, y: 0, w: 0.04, h: 5.625, fill: { color: C.sky }, line: { color: C.sky } });
    s.addImage({ data: iRobot, x: 1.1, y: 0.5, w: 1.8, h: 1.8 });
    s.addText("Agent AI", { x: 0.3, y: 2.5, w: 3.4, h: 0.85, margin: 0, fontSize: 40, bold: true, color: C.white });
    s.addText("from Scratch", { x: 0.3, y: 3.28, w: 3.4, h: 0.65, margin: 0, fontSize: 30, color: C.sky });
    s.addShape("rect", { x: 0.3, y: 4.05, w: 2.5, h: 0.03, fill: { color: C.sky }, line: { color: C.sky } });
    s.addText("Edge Computing 특론 — AI 특강 Day 1", { x: 0.3, y: 4.15, w: 3.4, h: 0.32, margin: 0, fontSize: 10.5, color: C.muted });
    s.addText("이선우  •  Principal Engineer, SuperGate", { x: 0.3, y: 4.5, w: 3.4, h: 0.3, margin: 0, fontSize: 9.5, color: C.muted });

    const pts = [
      { icon: iHistory, label: "AI Agent 세대별 진화" },
      { icon: iPlug,    label: "MCP · Skill 개념" },
      { icon: iTerm,    label: "TUI 기반 실습 Agent" },
    ];
    pts.forEach((p, i) => {
      const cy = 0.85 + i * 1.52;
      card(s, 4.35, cy, 5.3, 1.28);
      s.addImage({ data: p.icon, x: 4.65, y: cy + 0.32, w: 0.62, h: 0.62 });
      s.addText(p.label, { x: 5.45, y: cy + 0.35, w: 4.0, h: 0.55, margin: 0, fontSize: 17, bold: true, color: C.white, valign: "middle" });
    });
    s.addText("실습 코드: agent.py (Python 50줄)", { x: 4.35, y: 5.22, w: 5.3, h: 0.28, margin: 0, fontSize: 9.5, color: C.muted, align: "right" });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 2 — Agenda
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "오늘 2시간 — 타임라인", "Agenda");
    const agenda = [
      { t: "0:00–0:20", title: "LLM 기초 & 한계",      c: C.indigo },
      { t: "0:20–0:40", title: "세대별 AI Agent 진화",  c: C.sky },
      { t: "0:40–1:00", title: "Tool Use · MCP · Skill", c: C.violet },
      { t: "1:00–1:05", title: "Break ☕",              c: C.amber },
      { t: "1:05–1:15", title: "ReAct 패턴",            c: C.emerald },
      { t: "1:15–1:50", title: "실습: agent.py 구현",   c: C.rose },
      { t: "1:50–2:00", title: "Day 2 Preview & Q&A",   c: C.muted },
    ];
    agenda.forEach((a, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = 0.35 + col * 2.35, y = 1.0 + row * 2.1;
      const w = 2.2, h = 1.8;
      accentCard(s, x, y, w, h, a.c);
      chip(s, x + 0.15, y + 0.1, a.t, a.c);
      s.addText(a.title, { x: x + 0.15, y: y + 0.5, w: w - 0.2, h: 0.9, margin: 0, fontSize: 13.5, bold: true, color: C.white });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 3 — LLM 기초 + 한계
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "LLM의 본질: 하나의 함수 — 그리고 3가지 한계", "LLM 기초");

    // Left: LLM as function
    accentCard(s, 0.35, 0.98, 4.5, 1.4, C.indigo);
    s.addImage({ data: iBrain, x: 0.55, y: 1.2, w: 0.7, h: 0.7 });
    s.addText("f (text_in) → text_out", {
      x: 1.45, y: 1.12, w: 3.2, h: 0.45, margin: 0, fontSize: 16, bold: true, color: C.indigo, fontFace: "Consolas"
    });
    s.addText("다음 토큰 확률 분포에서 샘플링\n수십억 파라미터, 고정 가중치", {
      x: 1.45, y: 1.6, w: 3.2, h: 0.6, margin: 0, fontSize: 10.5, color: C.muted
    });

    // Token flow
    ["나는", "밥을", "먹었", "다 ▶"].forEach((t, i) => {
      const x = 0.35 + i * 1.13;
      const last = i === 3;
      s.addShape("rect", { x, y: 2.6, w: 1.0, h: 0.48, fill: { color: last ? C.sky : C.card }, line: { color: last ? C.sky : C.divider } });
      s.addText(t, { x, y: 2.6, w: 1.0, h: 0.48, margin: 0, fontSize: 13, bold: last, color: last ? C.bg : C.white, align: "center", valign: "middle" });
      if (!last) s.addImage({ data: iRight, x: x + 1.02, y: 2.73, w: 0.08, h: 0.22 });
    });

    // Right: 3 limits
    const limits = [
      { icon: iCog,    t: "기억이 없다",     d: "대화 종료 시 모든 컨텍스트 소멸", c: C.rose },
      { icon: iTools,  t: "행동을 못한다",   d: "파일·API·검색 — 텍스트만 출력", c: C.amber },
      { icon: iSearch, t: "최신 정보가 없다", d: "훈련 컷오프 이후 세상은 블랙박스", c: C.indigo },
    ];
    limits.forEach((l, i) => {
      const y = 0.98 + i * 1.4;
      accentCard(s, 5.1, y, 4.55, 1.2, l.c);
      s.addImage({ data: l.icon, x: 5.28, y: y + 0.28, w: 0.55, h: 0.55 });
      s.addText(l.t, { x: 6.0, y: y + 0.1, w: 3.5, h: 0.4, margin: 0, fontSize: 15, bold: true, color: C.white });
      s.addText(l.d, { x: 6.0, y: y + 0.5, w: 3.5, h: 0.55, margin: 0, fontSize: 10.5, color: C.muted });
    });

    s.addText("→ 이 세 가지를 해결한 것이 Agent", { x: 0.35, y: 5.1, w: 9.3, h: 0.32, margin: 0, fontSize: 14, bold: true, color: C.sky, align: "center" });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 4 — Agent 정의
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Agent = LLM이 세상을 바꾸는 시스템", "Agent 정의");

    s.addText('"LLM이 스스로 계획(Plan)하고, 도구(Tool)를 써서 목표를 달성하는 자율 시스템"', {
      x: 0.4, y: 0.95, w: 9.2, h: 0.52, margin: 0, fontSize: 13.5, italic: true, color: C.sky, align: "center"
    });

    // Central LLM
    s.addShape("rect", { x: 3.85, y: 1.65, w: 2.3, h: 1.1, fill: { color: "1D4ED8" }, line: { color: C.sky, width: 2 }, shadow: makeShadow() });
    s.addImage({ data: iBrain, x: 4.9, y: 1.72, w: 0.52, h: 0.52 });
    s.addText("LLM", { x: 3.85, y: 2.27, w: 2.3, h: 0.42, margin: 0, fontSize: 20, bold: true, color: C.white, align: "center" });

    const comps = [
      { label: "Memory",   sub: "대화 기록, Vector DB",    icon: iCog,    x: 0.3,  y: 1.75, c: C.rose },
      { label: "Tools",    sub: "검색, 계산, 파일, API",   icon: iTools,  x: 7.35, y: 1.75, c: C.emerald },
      { label: "Planning", sub: "목표 분해, 우선순위",      icon: iLight,  x: 0.3,  y: 3.4,  c: C.amber },
      { label: "Action",   sub: "실제 세계 인터페이스",     icon: iPlay,   x: 7.35, y: 3.4,  c: C.indigo },
    ];
    comps.forEach(c => {
      accentCard(s, c.x, c.y, 2.55, 1.0, c.c);
      s.addImage({ data: c.icon, x: c.x + 0.12, y: c.y + 0.22, w: 0.45, h: 0.45 });
      s.addText(c.label, { x: c.x + 0.72, y: c.y + 0.08, w: 1.75, h: 0.42, margin: 0, fontSize: 15, bold: true, color: C.white });
      s.addText(c.sub, { x: c.x + 0.72, y: c.y + 0.5, w: 1.75, h: 0.38, margin: 0, fontSize: 9, color: C.muted });
    });

    // Dashed connectors
    [[2.85, 2.2, 3.85, 2.2], [6.15, 2.2, 7.35, 2.2], [2.85, 3.9, 3.85, 2.75], [6.15, 2.75, 7.35, 3.9]].forEach(([x1,y1,x2,y2]) => {
      s.addShape("line", { x: x1, y: y1, w: x2-x1, h: y2-y1, line: { color: C.divider, width: 1.5, dashType: "dash" } });
    });

    s.addText("오늘 실습: Memory 제외, Tool 4개, ReAct 루프 구현", {
      x: 0.4, y: 5.1, w: 9.2, h: 0.32, margin: 0, fontSize: 11, color: C.muted, align: "center", italic: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 5 — 세대별 진화 타임라인
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "AI Agent 세대별 진화 — 30년의 역사", "세대별 진화");

    // Timeline bar
    s.addShape("rect", { x: 0.5, y: 2.25, w: 9.0, h: 0.06, fill: { color: C.divider }, line: { color: C.divider } });

    const gens = [
      { year: "1990s–2005", gen: "Gen 0", label: "Rule-based\nExpert System", c: C.muted,   x: 0.5 },
      { year: "2005–2015",  gen: "Gen 1", label: "GUI Desktop\nChatbot",       c: C.indigo,  x: 2.75 },
      { year: "2015–2022",  gen: "Gen 2", label: "Web Chat\nAssistant",        c: C.sky,     x: 5.0 },
      { year: "2022–2024",  gen: "Gen 3", label: "API Agent\n(RAG, Tool)",     c: C.emerald, x: 7.25 },
    ];
    gens.forEach((g, i) => {
      // Dot
      s.addShape("oval", { x: g.x + 0.85, y: 2.08, w: 0.35, h: 0.35, fill: { color: g.c }, line: { color: g.c } });
      // Year
      s.addText(g.year, { x: g.x, y: 1.55, w: 2.2, h: 0.38, margin: 0, fontSize: 9.5, color: C.muted, align: "center" });
      // Card
      accentCard(s, g.x, i % 2 === 0 ? 2.7 : 2.7, 2.15, 1.85, g.c);
      chip(s, g.x + 0.1, i % 2 === 0 ? 2.78 : 2.78, g.gen, g.c);
      s.addText(g.label, { x: g.x + 0.1, y: 3.15, w: 1.9, h: 0.9, margin: 0, fontSize: 13, bold: true, color: C.white });
    });

    // Gen 4 — current
    s.addShape("rect", { x: 0.5, y: 4.72, w: 9.0, h: 0.72, fill: { color: C.card }, line: { color: C.sky, width: 2 }, shadow: makeShadow() });
    s.addShape("rect", { x: 0.5, y: 4.72, w: 0.07, h: 0.72, fill: { color: C.sky }, line: { color: C.sky } });
    s.addText("Gen 4  (2024–현재)", { x: 0.72, y: 4.77, w: 2.0, h: 0.3, margin: 0, fontSize: 12, bold: true, color: C.sky });
    s.addText("CLI · TUI 기반 Agentic Coding  —  Claude Code, Cursor, Devin, OpenHands", {
      x: 0.72, y: 5.05, w: 8.5, h: 0.3, margin: 0, fontSize: 12, color: C.white
    });
    s.addText("▶ 오늘 우리가 만드는 것", { x: 7.8, y: 4.8, w: 1.6, h: 0.28, margin: 0, fontSize: 9, color: C.amber, bold: true });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 6 — Gen 1–2: GUI / Web Chat
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Gen 1–2: 대화창 안에 갇힌 AI", "세대별 진화");

    // Gen 1
    accentCard(s, 0.35, 0.98, 4.55, 4.4, C.indigo);
    s.addImage({ data: iDesktop, x: 0.65, y: 1.15, w: 0.65, h: 0.65 });
    s.addText("Gen 1 — GUI Desktop Chatbot", { x: 1.45, y: 1.12, w: 3.2, h: 0.38, margin: 0, fontSize: 14, bold: true, color: C.indigo });
    s.addText("2005–2015", { x: 1.45, y: 1.5, w: 3.2, h: 0.28, margin: 0, fontSize: 9.5, color: C.muted });

    const g1 = [
      "MSN Messenger Bot, 다음 챗봇",
      "설치형 소프트웨어 (exe)",
      "If–Else 규칙 기반 응답",
      "API 연동 없음, 완전 오프라인",
      "Eliza, ALICE 등 AIML 기반",
    ];
    g1.forEach((t, i) => {
      s.addShape("oval", { x: 0.55, y: 2.08 + i * 0.55, w: 0.22, h: 0.22, fill: { color: C.indigo }, line: { color: C.indigo } });
      s.addText(t, { x: 0.9, y: 2.04 + i * 0.55, w: 3.8, h: 0.35, margin: 0, fontSize: 11, color: C.white });
    });
    s.addText("한계: 규칙 밖 질문에 \"이해 못했어요\" 반복", {
      x: 0.55, y: 4.88, w: 4.2, h: 0.35, margin: 0, fontSize: 10, color: C.rose, italic: true
    });

    // Gen 2
    accentCard(s, 5.1, 0.98, 4.55, 4.4, C.sky);
    s.addImage({ data: iGlobe, x: 5.4, y: 1.15, w: 0.65, h: 0.65 });
    s.addText("Gen 2 — Web Chat Assistant", { x: 6.2, y: 1.12, w: 3.2, h: 0.38, margin: 0, fontSize: 14, bold: true, color: C.sky });
    s.addText("2015–2022", { x: 6.2, y: 1.5, w: 3.2, h: 0.28, margin: 0, fontSize: 9.5, color: C.muted });

    const g2 = [
      "ChatGPT (2022.11), Claude, Bard",
      "브라우저 기반, 설치 불필요",
      "LLM이 자유로운 자연어 이해",
      "단방향: 질문 → 답변 only",
      "외부 Tool 없음, 기억 없음",
    ];
    g2.forEach((t, i) => {
      s.addShape("oval", { x: 5.3, y: 2.08 + i * 0.55, w: 0.22, h: 0.22, fill: { color: C.sky }, line: { color: C.sky } });
      s.addText(t, { x: 5.65, y: 2.04 + i * 0.55, w: 3.8, h: 0.35, margin: 0, fontSize: 11, color: C.white });
    });
    s.addText("한계: 최신 정보 없음, 계산 오류, 행동 불가", {
      x: 5.3, y: 4.88, w: 4.2, h: 0.35, margin: 0, fontSize: 10, color: C.amber, italic: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 7 — Gen 3–4: API Agent / CLI·TUI
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Gen 3–4: 실행하는 AI — CLI·TUI 시대", "세대별 진화");

    // Gen 3
    accentCard(s, 0.35, 0.98, 4.55, 2.0, C.emerald);
    s.addImage({ data: iPlug, x: 0.55, y: 1.1, w: 0.55, h: 0.55 });
    s.addText("Gen 3 — API Agent", { x: 1.25, y: 1.08, w: 3.4, h: 0.38, margin: 0, fontSize: 14, bold: true, color: C.emerald });
    s.addText("2022–2024  |  LangChain, AutoGPT, ReAct 논문", { x: 1.25, y: 1.48, w: 3.4, h: 0.28, margin: 0, fontSize: 9, color: C.muted });
    s.addText("Tool Use + RAG 등장\nFunction Calling API 출시\nPython 코드로 Agent 조립\n여전히 브라우저/앱 UI 중심", {
      x: 0.55, y: 1.9, w: 4.2, h: 0.9, margin: 0, fontSize: 11, color: C.white
    });

    // Gen 4 — big highlight
    s.addShape("rect", { x: 0.35, y: 3.1, w: 9.3, h: 2.3, fill: { color: C.card }, line: { color: C.sky, width: 2 }, shadow: makeShadow() });
    s.addShape("rect", { x: 0.35, y: 3.1, w: 0.07, h: 2.3, fill: { color: C.sky }, line: { color: C.sky } });

    s.addImage({ data: iTerm, x: 0.58, y: 3.2, w: 0.6, h: 0.6 });
    s.addText("Gen 4 — CLI · TUI 기반 Agentic Coding  (2024–현재)", {
      x: 1.35, y: 3.15, w: 8.0, h: 0.42, margin: 0, fontSize: 16, bold: true, color: C.sky
    });

    const g4tools = [
      { name: "Claude Code",  desc: "터미널에서 직접 코드 작성·수정·실행", c: C.sky },
      { name: "Cursor",       desc: "IDE 내장 AI, 파일 전체를 컨텍스트로", c: C.indigo },
      { name: "Devin / SWE-Agent", desc: "자율 소프트웨어 엔지니어 Agent", c: C.emerald },
      { name: "OpenHands",    desc: "브라우저·터미널 자율 조작 오픈소스", c: C.amber },
    ];
    g4tools.forEach((t, i) => {
      const x = 0.55 + (i % 2) * 4.6;
      const y = 3.7 + Math.floor(i / 2) * 0.65;
      s.addShape("rect", { x, y, w: 1.5, h: 0.28, fill: { color: t.c }, line: { color: t.c } });
      s.addText(t.name, { x, y, w: 1.5, h: 0.28, margin: 0, fontSize: 9, bold: true, color: C.bg, align: "center", valign: "middle" });
      s.addText(t.desc, { x: x + 1.6, y, w: 2.85, h: 0.28, margin: 0, fontSize: 10, color: C.white, valign: "middle" });
    });

    s.addText("핵심 전환: 대화창 → 터미널. UI는 최소화, 능력은 최대화.", {
      x: 0.55, y: 5.1, w: 9.0, h: 0.3, margin: 0, fontSize: 12, color: C.amber, bold: true, align: "center"
    });

    // Gen 3 right panel
    accentCard(s, 5.1, 0.98, 4.55, 2.0, C.violet);
    s.addText("왜 CLI·TUI인가?", { x: 5.28, y: 1.05, w: 4.0, h: 0.38, margin: 0, fontSize: 13, bold: true, color: C.violet });
    const why = [
      "파이프라인 자동화 — 스크립트와 자연 결합",
      "파일 시스템 직접 접근 — 코드 읽기·쓰기",
      "무한 Tool 확장 — MCP로 플러그인",
      "GUI 없이도 서버·클라우드·임베디드 실행",
    ];
    why.forEach((t, i) => {
      s.addShape("oval", { x: 5.28, y: 1.58 + i * 0.48, w: 0.2, h: 0.2, fill: { color: C.violet }, line: { color: C.violet } });
      s.addText(t, { x: 5.6, y: 1.54 + i * 0.48, w: 3.9, h: 0.35, margin: 0, fontSize: 10.5, color: C.white });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 8 — Tool Use 구조
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Tool Use: LLM이 함수를 호출하는 메커니즘", "Tool Use");

    s.addText("LLM은 텍스트로 \"이 함수를 실행해줘\" 라고 요청 → 우리 코드가 실제로 실행", {
      x: 0.4, y: 0.9, w: 9.2, h: 0.35, margin: 0, fontSize: 12, color: C.muted, italic: true
    });

    // 5-step flow
    const steps = [
      { n: "1", label: "User\nQuery",      c: C.indigo },
      { n: "2", label: "LLM\n툴 선택",    c: C.sky },
      { n: "3", label: "코드\n실행",        c: C.emerald },
      { n: "4", label: "결과\n전달",        c: C.amber },
      { n: "5", label: "최종\n답변",        c: C.rose },
    ];
    steps.forEach((st, i) => {
      const x = 0.3 + i * 1.93;
      s.addShape("rect", { x, y: 1.38, w: 1.6, h: 1.28, fill: { color: C.card }, line: { color: st.c, width: 2 }, shadow: makeShadow() });
      s.addShape("rect", { x: x + 0.53, y: 1.28, w: 0.55, h: 0.28, fill: { color: st.c }, line: { color: st.c } });
      s.addText(st.n, { x: x + 0.53, y: 1.28, w: 0.55, h: 0.28, margin: 0, fontSize: 11, bold: true, color: C.bg, align: "center", valign: "middle" });
      s.addText(st.label, { x, y: 1.62, w: 1.6, h: 0.82, margin: 0, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle" });
      if (i < 4) s.addImage({ data: iRight, x: x + 1.62, y: 1.92, w: 0.28, h: 0.28 });
    });

    // Code panels
    codeBlock(s, 0.35, 2.85, 4.55, 2.5, `{
  "tool": "search_web",
  "args": {
    "query": "Edge AI 트렌드 2025"
  }
}`, C.sky, "② LLM 출력 (JSON)");

    codeBlock(s, 5.1, 2.85, 4.55, 2.5, `# ③ 우리 코드가 처리
fn = TOOL_FUNCTIONS[tool_name]
observation = fn(**args)

# ④ 결과를 LLM에 다시 전달
messages.append({
  "role": "tool",
  "content": observation
})`, C.emerald, "③④ Python 처리");
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 9 — MCP란?
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "MCP: Model Context Protocol", "MCP");

    s.addText("Anthropic이 2024.11 오픈소스로 공개 — AI Tool의 USB-C 표준", {
      x: 0.4, y: 0.92, w: 9.2, h: 0.38, margin: 0, fontSize: 13, color: C.muted, italic: true
    });

    // Left: MCP concept
    accentCard(s, 0.35, 1.42, 4.55, 3.9, C.violet);
    s.addImage({ data: iPlug, x: 0.55, y: 1.58, w: 0.7, h: 0.7 });
    s.addText("MCP란?", { x: 1.42, y: 1.58, w: 3.2, h: 0.42, margin: 0, fontSize: 17, bold: true, color: C.violet });

    const mcpDesc = [
      { icon: "🔌", text: "AI ↔ 외부 서비스 연결 표준 프로토콜" },
      { icon: "📦", text: "Tool을 플러그인처럼 독립 배포 가능" },
      { icon: "🌐", text: "JSON-RPC 기반, 언어·플랫폼 무관" },
      { icon: "🔄", text: "Server(Tool 제공) / Client(AI 앱) 구조" },
      { icon: "🛡️", text: "권한 제어, 샌드박스 실행 지원" },
    ];
    mcpDesc.forEach((d, i) => {
      s.addText(`${d.icon}  ${d.text}`, { x: 0.55, y: 2.18 + i * 0.58, w: 4.2, h: 0.5, margin: 0, fontSize: 11.5, color: C.white });
    });

    // Right: MCP ecosystem
    accentCard(s, 5.1, 1.42, 4.55, 3.9, C.sky);
    s.addText("지원 클라이언트 (2025)", { x: 5.28, y: 1.52, w: 4.0, h: 0.38, margin: 0, fontSize: 13, bold: true, color: C.sky });

    const clients = [
      { name: "Claude Desktop / Code", desc: "Anthropic 공식" },
      { name: "Cursor",                desc: "AI 코드 에디터" },
      { name: "VS Code + Copilot",     desc: "Microsoft" },
      { name: "OpenHands",             desc: "오픈소스 Agent" },
      { name: "Cline, Roo Code",       desc: "커뮤니티 클라이언트" },
    ];
    clients.forEach((c, i) => {
      s.addShape("rect", { x: 5.28, y: 2.02 + i * 0.58, w: 4.22, h: 0.5, fill: { color: "111827" }, line: { color: C.divider } });
      s.addText(c.name, { x: 5.4, y: 2.06 + i * 0.58, w: 2.5, h: 0.38, margin: 0, fontSize: 11, bold: true, color: C.white });
      s.addText(c.desc, { x: 7.9, y: 2.06 + i * 0.58, w: 1.5, h: 0.38, margin: 0, fontSize: 9.5, color: C.muted, align: "right" });
    });

    s.addText("MCP는 선택, Tool Use는 필수 — 오늘 실습은 직접 Tool 정의 방식 사용", {
      x: 0.35, y: 5.15, w: 9.3, h: 0.28, margin: 0, fontSize: 10.5, color: C.amber, align: "center", italic: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 10 — Skill이란?
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Skill: Agent의 능력 단위", "Skill");

    s.addText("Skill = Agent가 할 수 있는 구체적 능력 하나. Tool과 혼용되지만 뉘앙스가 다름.", {
      x: 0.4, y: 0.92, w: 9.2, h: 0.38, margin: 0, fontSize: 12, color: C.muted, italic: true
    });

    // Tool vs Skill comparison
    const cols = [
      { title: "Tool (함수 관점)", color: C.emerald, items: [
        "단순 함수 단위  예) search_web()",
        "입출력이 명확한 원자적 작업",
        "LLM이 JSON으로 직접 호출",
        "특정 API나 시스템에 종속",
        "예) calculator, read_file",
      ]},
      { title: "Skill (능력 관점)", color: C.violet, items: [
        "복합 목표 달성 능력",
        "여러 Tool을 조합해 실행",
        "문맥과 전략이 포함",
        "재사용·공유 가능한 단위",
        "예) '코드 리뷰', '보고서 작성'",
      ]},
    ];
    cols.forEach((col, ci) => {
      const x = 0.35 + ci * 4.75;
      accentCard(s, x, 1.42, 4.55, 3.75, col.color);
      s.addText(col.title, { x: x + 0.15, y: 1.52, w: 4.2, h: 0.42, margin: 0, fontSize: 15, bold: true, color: col.color });
      col.items.forEach((item, i) => {
        s.addShape("oval", { x: x + 0.15, y: 2.1 + i * 0.58, w: 0.2, h: 0.2, fill: { color: col.color }, line: { color: col.color } });
        s.addText(item, { x: x + 0.48, y: 2.05 + i * 0.58, w: 3.95, h: 0.45, margin: 0, fontSize: 11, color: C.white });
      });
    });

    s.addShape("rect", { x: 0.35, y: 5.28, w: 9.3, h: 0.2, fill: { color: C.divider }, line: { color: C.divider } });
    s.addText("오늘 실습: 4개의 Tool(Skill) 정의 → Agent가 자율 선택해 실행", {
      x: 0.35, y: 5.12, w: 9.3, h: 0.3, margin: 0, fontSize: 12, color: C.sky, align: "center", bold: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 11 — MCP + Skill 동작 흐름
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "MCP · Skill · Tool 의 관계와 동작 흐름", "MCP 동작");

    // Architecture flow
    const boxes = [
      { label: "사용자",        sub: "자연어 질문",       c: C.white,   fill: C.card,   x: 0.3,  y: 1.8 },
      { label: "AI Client",    sub: "Claude / Cursor",   c: C.sky,     fill: "0F2744", x: 2.4,  y: 1.8 },
      { label: "MCP Server",   sub: "Tool 모음 (플러그인)", c: C.violet,  fill: "1A1044", x: 4.5,  y: 1.8 },
      { label: "Skill / Tool", sub: "실제 함수 실행",     c: C.emerald, fill: "0A2018", x: 6.6,  y: 1.8 },
      { label: "외부 서비스",   sub: "API / DB / 파일",   c: C.amber,   fill: "1A1200", x: 8.1,  y: 1.8 },
    ];
    boxes.forEach((b, i) => {
      s.addShape("rect", { x: b.x, y: b.y, w: 1.85, h: 1.05, fill: { color: b.fill }, line: { color: b.c, width: 1.5 }, shadow: makeShadow() });
      s.addText(b.label, { x: b.x, y: b.y + 0.1, w: 1.85, h: 0.42, margin: 0, fontSize: 12, bold: true, color: b.c, align: "center" });
      s.addText(b.sub, { x: b.x, y: b.y + 0.55, w: 1.85, h: 0.38, margin: 0, fontSize: 9, color: C.muted, align: "center" });
      if (i < 4) s.addImage({ data: iRight, x: b.x + 1.88, y: b.y + 0.38, w: 0.22, h: 0.28 });
    });

    // Protocol labels
    [["JSON-RPC", 3.3, 1.55, C.violet], ["Function Call", 5.5, 1.55, C.emerald], ["HTTP / SDK", 7.6, 1.55, C.amber]].forEach(([t, x, y, c]) => {
      s.addText(String(t), { x: Number(x), y: Number(y), w: 1.3, h: 0.25, margin: 0, fontSize: 8, color: String(c), align: "center" });
    });

    // Our implementation
    s.addShape("rect", { x: 0.3, y: 3.1, w: 9.4, h: 2.25, fill: { color: C.card }, line: { color: C.emerald, width: 1 } });
    s.addShape("rect", { x: 0.3, y: 3.1, w: 0.06, h: 2.25, fill: { color: C.emerald }, line: { color: C.emerald } });
    s.addText("오늘 실습 구현 (MCP 없이 직접 Tool 정의)", { x: 0.5, y: 3.14, w: 5.0, h: 0.35, margin: 0, fontSize: 12, bold: true, color: C.emerald });
    s.addText("MCP Server 없이", { x: 0.5, y: 3.55, w: 2.0, h: 0.3, margin: 0, fontSize: 10, color: C.muted });
    s.addText("TOOL_FUNCTIONS = {                                 TOOLS = [JSON 스펙]", {
      x: 0.5, y: 3.9, w: 9.0, h: 0.3, margin: 0, fontSize: 10.5, color: C.white, fontFace: "Consolas"
    });
    s.addText("  \"calculate\": calculate,     → LLM에게 사용 가능한 Tool 목록 전달", {
      x: 0.5, y: 4.22, w: 9.0, h: 0.28, margin: 0, fontSize: 10.5, color: C.white, fontFace: "Consolas"
    });
    s.addText("  \"search_web\": search_web,   → LLM이 JSON으로 호출 지시", {
      x: 0.5, y: 4.52, w: 9.0, h: 0.28, margin: 0, fontSize: 10.5, color: C.white, fontFace: "Consolas"
    });
    s.addText("}", { x: 0.5, y: 4.82, w: 1.0, h: 0.28, margin: 0, fontSize: 10.5, color: C.white, fontFace: "Consolas" });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 12 — ReAct 패턴
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "ReAct 패턴: Agent의 생각 루프", "ReAct");

    s.addText("ReAct = Reasoning + Acting  |  Yao et al. 2022, Google Brain", {
      x: 0.4, y: 0.92, w: 9.2, h: 0.35, margin: 0, fontSize: 11.5, color: C.muted, italic: true
    });

    // 3 circles
    const phases = [
      { label: "Thought",  sub: "상황 분석\n다음 행동 계획", c: C.indigo, x: 0.9,  y: 1.45 },
      { label: "Action",   sub: "Tool 선택\n파라미터 결정",  c: C.sky,    x: 4.08, y: 1.45 },
      { label: "Observe",  sub: "결과 수신\n다시 판단",      c: C.emerald,x: 7.25, y: 1.45 },
    ];
    phases.forEach((p, i) => {
      s.addShape("oval", { x: p.x, y: p.y, w: 1.95, h: 1.7, fill: { color: C.card }, line: { color: p.c, width: 2.5 }, shadow: makeShadow() });
      s.addText(p.label, { x: p.x, y: p.y + 0.3, w: 1.95, h: 0.45, margin: 0, fontSize: 17, bold: true, color: p.c, align: "center" });
      s.addText(p.sub, { x: p.x, y: p.y + 0.82, w: 1.95, h: 0.65, margin: 0, fontSize: 9.5, color: C.muted, align: "center" });
      if (i < 2) s.addImage({ data: iRight, x: p.x + 2.0, y: p.y + 0.68, w: 0.6, h: 0.35 });
    });
    s.addText("↩  목표 달성까지 반복 (max_steps 제한)", { x: 2.5, y: 3.32, w: 5.0, h: 0.35, margin: 0, fontSize: 12, color: C.muted, align: "center", italic: true });

    // Trace example
    accentCard(s, 0.35, 3.78, 9.3, 1.6, C.indigo);
    s.addText("실제 실행 트레이스 예시", { x: 0.55, y: 3.84, w: 8.5, h: 0.3, margin: 0, fontSize: 11, bold: true, color: C.indigo });
    const traces = [
      { l: "Thought →", t: "사용자가 'Edge AI 트렌드'를 물었다. search_web Tool이 필요하다.", c: C.indigo },
      { l: "Action  →", t: 'search_web(query="Edge AI 트렌드 2025")', c: C.sky },
      { l: "Observe →", t: "[결과] NPU 내장 기기 급증, llama.cpp 온디바이스 추론 보편화...", c: C.emerald },
    ];
    traces.forEach((t, i) => {
      s.addText(t.l, { x: 0.55, y: 4.2 + i * 0.35, w: 1.05, h: 0.32, margin: 0, fontSize: 10, bold: true, color: t.c, fontFace: "Consolas" });
      s.addText(t.t, { x: 1.65, y: 4.2 + i * 0.35, w: 7.8, h: 0.32, margin: 0, fontSize: 10, color: C.white, fontFace: "Consolas" });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 13 — Agentic Design Patterns (Microsoft ref)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Agentic Design Patterns — ReAct 너머의 세계", "Agent Patterns");

    s.addText("ReAct는 시작일 뿐. 실제 프로덕션 Agent는 4가지 패턴을 조합합니다. (ref: Microsoft AI Agents for Beginners)", {
      x: 0.4, y: 0.9, w: 9.2, h: 0.35, margin: 0, fontSize: 11, color: C.muted, italic: true
    });

    const patterns = [
      {
        n: "01", name: "ReAct",
        en: "Reasoning + Acting",
        desc: "오늘 구현한 것.\nThought→Action→Observe 루프로\n단일 목표를 단계적으로 달성.",
        when: "계산, 검색, 파일 처리 등\n단순 순차 Task",
        c: C.sky,
      },
      {
        n: "02", name: "Planning",
        en: "Plan-and-Execute",
        desc: "LLM이 먼저 전체 계획(Step 목록)을\n세우고, 각 Step을 순서대로 실행.\nRe-plan도 가능.",
        when: "복잡한 프로젝트 자동화,\n다단계 코드 작성",
        c: C.violet,
      },
      {
        n: "03", name: "Multi-Agent",
        en: "Orchestrator + Specialists",
        desc: "Orchestrator가 전략 수립,\nSpecialist Agent들이 각자 전문 영역 담당.\nClaude Code가 이 구조.",
        when: "대규모 소프트웨어 개발,\n복합 도메인 리서치",
        c: C.emerald,
      },
      {
        n: "04", name: "Metacognition",
        en: "Self-Reflection",
        desc: "Agent가 자신의 출력을 스스로\n검토·비판·수정. 품질 자동 향상.\nCritic 패턴이라고도 함.",
        when: "고품질 문서·코드 생성,\n오류 자동 수정 루프",
        c: C.amber,
      },
    ];

    patterns.forEach((p, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 0.35 + col * 4.82, y = 1.38 + row * 2.08;
      accentCard(s, x, y, 4.65, 1.92, p.c);
      // Number badge
      s.addShape("rect", { x: x + 0.12, y: y + 0.1, w: 0.42, h: 0.38, fill: { color: p.c }, line: { color: p.c } });
      s.addText(p.n, { x: x + 0.12, y: y + 0.1, w: 0.42, h: 0.38, margin: 0, fontSize: 13, bold: true, color: C.bg, align: "center", valign: "middle" });
      // Name + EN
      s.addText(p.name, { x: x + 0.68, y: y + 0.1, w: 2.8, h: 0.4, margin: 0, fontSize: 16, bold: true, color: p.c });
      s.addText(p.en,   { x: x + 0.68, y: y + 0.5, w: 3.8, h: 0.28, margin: 0, fontSize: 9.5, color: C.muted });
      // Desc
      s.addText(p.desc, { x: x + 0.18, y: y + 0.82, w: 2.9, h: 0.95, margin: 0, fontSize: 10, color: C.white });
      // When box
      s.addShape("rect", { x: x + 3.15, y: y + 0.82, w: 1.38, h: 0.95, fill: { color: "0A0F1E" }, line: { color: p.c, width: 1 } });
      s.addText("언제?\n" + p.when, { x: x + 3.18, y: y + 0.84, w: 1.32, h: 0.9, margin: 0, fontSize: 8.5, color: p.c });
    });

    s.addText("오늘 실습 = ReAct (①). Day 2에서 Planning·Multi-Agent 맛보기 예정", {
      x: 0.35, y: 5.32, w: 9.3, h: 0.22, margin: 0, fontSize: 10.5, color: C.sky, align: "center", bold: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 14 — 실습 환경 세팅
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "실습 환경 세팅 — 지금 바로 따라하세요", "실습");

    const steps = [
      { n: "01", label: "Python 패키지 설치",   cmd: "pip install openai rich", c: C.sky },
      { n: "02", label: "OpenAI Key 설정",      cmd: 'export OPENAI_API_KEY="sk-..."    # 또는 .env 파일', c: C.indigo },
      { n: "02b",label: "(대안) Ollama 로컬",   cmd: "ollama pull llama3.2  &&  USE_OLLAMA=true python agent.py", c: C.emerald },
      { n: "03", label: "agent.py 실행",        cmd: "python agent.py", c: C.amber },
      { n: "04", label: "동작 확인",             cmd: "You: 오늘 날짜가 뭐야?  →  Agent가 get_datetime 호출", c: C.rose },
    ];

    steps.forEach((st, i) => {
      const y = 1.0 + i * 0.9;
      accentCard(s, 0.35, y, 9.3, 0.77, st.c);
      s.addShape("rect", { x: 0.48, y: y + 0.18, w: 0.55, h: 0.45, fill: { color: st.c }, line: { color: st.c } });
      s.addText(st.n.replace("b", ""), { x: 0.48, y: y + 0.18, w: 0.55, h: 0.45, margin: 0, fontSize: 13, bold: true, color: C.bg, align: "center", valign: "middle" });
      s.addText(st.label, { x: 1.18, y: y + 0.06, w: 2.5, h: 0.38, margin: 0, fontSize: 13.5, bold: true, color: C.white });
      s.addText(st.cmd, { x: 1.18, y: y + 0.44, w: 8.2, h: 0.28, margin: 0, fontSize: 10, color: C.amber, fontFace: "Consolas" });
    });

    s.addShape("rect", { x: 0.35, y: 5.35, w: 9.3, h: 0.17, fill: { color: C.card }, line: { color: C.rose } });
    s.addText("⚠  API Key 없으면 USE_OLLAMA=true 로 로컬 실행 — 강사에게 요청하세요", {
      x: 0.5, y: 5.37, w: 9.0, h: 0.15, margin: 0, fontSize: 9.5, color: C.rose
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 14 — agent.py 전체 구조
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "agent.py 전체 구조 — 6개 레이어", "실습 아키텍처");

    const layers = [
      { n: "L1", label: "Config",       desc: "OpenAI / Ollama 선택, Model 설정",         c: C.muted },
      { n: "L2", label: "Tool 함수들",  desc: "calculate · get_datetime · search_web · read_file", c: C.emerald },
      { n: "L3", label: "TOOLS (스펙)", desc: "LLM에게 Tool을 설명하는 JSON 배열",         c: C.sky },
      { n: "L4", label: "SYSTEM_PROMPT",desc: "Agent 역할·행동 지침 정의",                 c: C.indigo },
      { n: "L5", label: "run_agent()",  desc: "ReAct 루프: LLM 호출 → Tool 실행 → 반복", c: C.violet },
      { n: "L6", label: "main() TUI",   desc: "Rich 기반 터미널 UI, 대화 관리",           c: C.amber },
    ];

    layers.forEach((l, i) => {
      const y = 1.0 + i * 0.72;
      s.addShape("rect", { x: 0.35, y, w: 9.3, h: 0.65, fill: { color: C.card }, line: { color: l.c, width: 1.5 }, shadow: makeShadow() });
      s.addShape("rect", { x: 0.35, y, w: 0.65, h: 0.65, fill: { color: l.c }, line: { color: l.c } });
      s.addText(l.n, { x: 0.35, y, w: 0.65, h: 0.65, margin: 0, fontSize: 13, bold: true, color: C.bg, align: "center", valign: "middle" });
      s.addText(l.label, { x: 1.15, y: y + 0.04, w: 2.2, h: 0.35, margin: 0, fontSize: 13.5, bold: true, color: l.c });
      s.addText(l.desc, { x: 1.15, y: y + 0.38, w: 8.2, h: 0.28, margin: 0, fontSize: 10.5, color: C.muted });
      // Stack arrows
      if (i < 5) s.addText("↓", { x: 4.9, y: y + 0.65, w: 0.3, h: 0.07, margin: 0, fontSize: 6, color: C.divider, align: "center" });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 15a — Tool 함수 구현 (calculate / get_datetime)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "실습 코드 ①-A: Tool 함수 정의 — calculate · get_datetime", "실습 코드 1/4");

    codeBlock(s, 0.35, 0.92, 4.65, 4.5,
`# ── calculate ──────────────────────────
import math

def calculate(expression: str) -> str:
    """수식을 안전하게 계산합니다.
    math 모듈 함수도 지원합니다."""

    # eval 화이트리스트 (보안)
    allowed = {
        k: getattr(math, k)
        for k in dir(math)
        if not k.startswith("_")
    }
    allowed.update({
        "abs": abs, "round": round,
        "int": int, "float": float
    })

    try:
        result = eval(
            expression,
            {"__builtins__": {}},
            allowed
        )
        return f"{expression} = {result}"
    except Exception as e:
        return f"계산 오류: {e}"

# 테스트
# calculate("sqrt(144)")    → "sqrt(144) = 12.0"
# calculate("15 * 24")      → "15 * 24 = 360"
# calculate("sin(3.14159)") → "sin(3.14159) = ..."`, C.emerald, "L2-A: calculate");

    codeBlock(s, 5.1, 0.92, 4.55, 4.5,
`# ── get_datetime ────────────────────────
import datetime

def get_datetime(timezone: str = "KST") -> str:
    """현재 날짜와 시간을 반환합니다."""

    now = datetime.datetime.now()

    return (
        f"현재 시각 ({timezone}):\\n"
        f"{now.strftime('%Y년 %m월 %d일')}\\n"
        f"{now.strftime('%A %H:%M:%S')}\\n"
        f"Unix: {int(now.timestamp())}"
    )


# ── SYSTEM_PROMPT ────────────────────────
SYSTEM_PROMPT = """
당신은 Edge Computing 특강 데모 Agent.
다음 도구를 적극적으로 활용하세요:
- 계산 필요 → calculate
- 시간/날짜 필요 → get_datetime
- 모르는 정보 → search_web
- 파일 읽기 → read_file

항상 한국어로 답변하세요.
"""`, C.indigo, "L2-B: get_datetime + SYSTEM_PROMPT");

    // Bottom hint
    s.addShape("rect", { x: 0.35, y: 5.35, w: 9.3, h: 0.22, fill: { color: C.card }, line: { color: C.emerald } });
    s.addText("핵심: description이 정확할수록 LLM이 올바른 Tool을 선택한다", {
      x: 0.5, y: 5.37, w: 9.0, h: 0.18, margin: 0, fontSize: 10, color: C.emerald
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 15b — Tool 함수 구현 (search_web / read_file) + TOOLS 스펙
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "실습 코드 ①-B: search_web · read_file + TOOLS 스펙 등록", "실습 코드 2/4");

    codeBlock(s, 0.35, 0.92, 4.65, 2.52,
`# ── search_web ──────────────────────────
def search_web(query: str) -> str:
    """최신 정보를 검색합니다.
    실제: Tavily / SerpAPI 연동"""

    # 데모용 시뮬레이션 DB
    db = {
        "edge ai":  "NPU 내장 기기 급증...",
        "mcp":      "Anthropic 2024.11 오픈소스...",
        "ollama":   "로컬 LLM 실행 도구...",
    }
    for key, val in db.items():
        if key in query.lower():
            return val
    return f"'{query}' 검색 결과 없음"`, C.sky, "L2-C: search_web");

    codeBlock(s, 0.35, 3.55, 4.65, 2.0,
`# ── read_file ───────────────────────────
def read_file(filepath: str,
              max_chars: int = 800) -> str:
    """로컬 파일을 읽습니다."""
    try:
        with open(filepath, "r",
                  encoding="utf-8") as f:
            content = f.read(max_chars)
        return f"[{filepath}]\\n{content}"
    except FileNotFoundError:
        return f"파일 없음: {filepath}"`, C.rose, "L2-D: read_file");

    codeBlock(s, 5.1, 0.92, 4.55, 4.63,
`# ── TOOLS 스펙 + 함수 레지스트리 ─────────
TOOLS = [
  {"type": "function", "function": {
    "name": "calculate",
    "description": "수식 계산. math 함수 지원.",
    "parameters": {"type": "object",
      "properties": {
        "expression": {"type": "string",
          "description": "파이썬 수식"}},
      "required": ["expression"]}
  }},
  {"type": "function", "function": {
    "name": "get_datetime",
    "description": "현재 날짜·시간 조회",
    "parameters": {"type": "object",
      "properties": {
        "timezone": {"type": "string"}},
      "required": []}
  }},
  {"type": "function", "function": {
    "name": "search_web",
    "description": "최신 정보·모르는 내용 검색",
    "parameters": {"type": "object",
      "properties": {
        "query": {"type": "string"}},
      "required": ["query"]}
  }},
  # read_file 동일 패턴 생략...
]

# ← 핵심: 함수명과 실제 함수를 연결
TOOL_FUNCTIONS = {
    "calculate":    calculate,
    "get_datetime": get_datetime,
    "search_web":   search_web,
    "read_file":    read_file,
}`, C.amber, "L3: TOOLS 스펙 + 레지스트리");
  }

  // SLIDE 16a — run_agent() ReAct 루프
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "실습 코드 ②-A: run_agent() — ReAct 루프 전체", "실습 코드 3/4");

    codeBlock(s, 0.35, 1.0, 9.3, 4.35,
`# ── L5: run_agent — ReAct 루프 ──────────────────────────────────────────────
def run_agent(user_input: str, messages: list, max_steps: int = 6) -> str:

    messages.append({"role": "user", "content": user_input})   # 사용자 메시지 추가

    for step in range(max_steps):                               # 최대 6번 반복

        # ① Thought: LLM에게 다음 행동 물어보기
        response = client.chat.completions.create(
            model=MODEL, messages=messages,
            tools=TOOLS, tool_choice="auto"                     # auto = LLM이 Tool 선택
        )
        msg = response.choices[0].message

        # ② 최종 답변 (Tool 호출 없음 → 루프 종료)
        if not msg.tool_calls:
            messages.append({"role": "assistant", "content": msg.content})
            return msg.content                                  # ← 여기서 리턴

        # ③ Action: Tool 실행
        messages.append(msg)                                    # assistant turn 기록
        for tc in msg.tool_calls:
            fn_name = tc.function.name
            fn_args = json.loads(tc.function.arguments)

            console.print(f"  💭 Tool: {fn_name} {fn_args}")   # Thought 로그 출력

            fn  = TOOL_FUNCTIONS.get(fn_name)                  # 함수 조회
            obs = fn(**fn_args) if fn else f"알 수 없는 툴: {fn_name}"  # 실행!

            console.print(f"  🔍 결과: {obs[:80]}...")          # Observe 로그 출력

            # ④ Observe: 결과를 대화 기록에 추가 → 다음 루프에서 LLM이 참조
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": obs
            })

    return "⚠️ 최대 처리 단계 초과"`, C.violet, "L5: run_agent() 전체 코드");

    s.addShape("rect", { x: 0.35, y: 5.28, w: 9.3, h: 0.22, fill: { color: C.card }, line: { color: C.sky } });
    s.addText("Thought(①) → Action(③) → Observe(④) → 반복 — 이게 ReAct의 전부", {
      x: 0.5, y: 5.29, w: 9.0, h: 0.18, margin: 0, fontSize: 10.5, color: C.sky, align: "center"
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 16b — main() Rich TUI
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "실습 코드 ②-B: main() — Rich TUI 대화 루프", "실습 코드 4/4");

    codeBlock(s, 0.35, 1.0, 5.5, 4.35,
`# ── L6: main() — Rich TUI ──────────────────
from rich.console import Console
from rich.panel   import Panel
from rich.prompt  import Prompt
from rich.rule    import Rule

console = Console()

def main():
    global client
    client = _make_client()           # OpenAI or Ollama

    # 시작 화면
    console.print(Panel(
        "[bold cyan]Agent AI from Scratch[/bold cyan]\\n"
        "[dim]Tools: calculate | datetime | search | file[/dim]\\n"
        "[dim]'exit' 종료 | 'tools' 목록 | 'clear' 초기화[/dim]",
        border_style="cyan", padding=(0,1)))

    messages = [{"role": "system",
                 "content": SYSTEM_PROMPT}]
    turn = 0

    while True:
        user = Prompt.ask("\\n[bold green]You[/bold green]")

        if user.lower() in ("exit", "종료"):
            break
        if user.lower() == "tools":
            console.print(show_tool_table())
            continue
        if user.lower() == "clear":
            messages = [messages[0]]      # system만 유지
            turn = 0
            continue

        turn += 1
        console.print(Rule(f"[dim]Turn {turn}[/dim]"))

        with console.status("[yellow]🤔 처리중...[/yellow]"):
            answer = run_agent(user, messages)

        console.print(Panel(
            answer,
            title=f"[blue]Agent[/blue] [dim](Turn {turn})[/dim]",
            border_style="blue", padding=(0,1)))

if __name__ == "__main__":
    main()`, C.amber, "L6: main() + Rich TUI");

    accentCard(s, 6.05, 1.0, 3.6, 4.35, C.sky);
    s.addText("TUI 실행 화면 (예시)", { x: 6.22, y: 1.08, w: 3.2, h: 0.3, margin: 0, fontSize: 11, bold: true, color: C.sky });

    const tuiLines = [
      { t: "╭─────────────────────────╮", c: C.sky },
      { t: "│  Agent AI from Scratch  │", c: C.white },
      { t: "│  Tools: calc|time|...   │", c: C.muted },
      { t: "╰─────────────────────────╯", c: C.sky },
      { t: "", c: C.muted },
      { t: "You: 15 * 24 계산해줘", c: C.emerald },
      { t: "", c: C.muted },
      { t: "  💭 Tool: calculate", c: C.muted },
      { t: '       {"expression":"15*24"}', c: C.muted },
      { t: "  🔍 결과: 15 * 24 = 360", c: C.muted },
      { t: "", c: C.muted },
      { t: "╭── Agent (Turn 1) ────────╮", c: C.sky },
      { t: "│ 15 × 24 = 360 입니다!   │", c: C.white },
      { t: "╰─────────────────────────╯", c: C.sky },
      { t: "", c: C.muted },
      { t: "You: _", c: C.emerald },
    ];
    tuiLines.forEach((l, i) => {
      s.addText(l.t, { x: 6.18, y: 1.46 + i * 0.2, w: 3.35, h: 0.22, margin: 0, fontSize: 8.5, color: l.c, fontFace: "Consolas" });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 17 — nanobot 비교 실습
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "심화 실습: nanobot으로 보는 프로덕션 Agent", "nanobot 실습");

    s.addText("우리가 만든 50줄 vs HKUDS/nanobot 4,000줄 — 같은 ReAct 패턴을 직접 확인합니다", {
      x: 0.35, y: 0.9, w: 9.3, h: 0.35, margin: 0, fontSize: 12, color: C.muted, italic: true
    });

    // Step cards
    const steps = [
      {
        n: "01", title: "설치 (1분)", c: C.sky,
        cmd: "pip install nanobot-ai\nnanobot onboard   # API key 설정 (OpenAI / Ollama)",
        note: "pip 한 줄로 완료. Python 3.11+",
      },
      {
        n: "02", title: "CLI 실행 비교 (5분)", c: C.emerald,
        cmd: "# nanobot\nnanobot agent -p \"오늘 날짜와 15*24 계산해줘\"\n\n# 우리 agent\npython agent.py   # 같은 질문 입력",
        note: "결과가 동일하다 → 같은 패턴",
      },
      {
        n: "03", title: "loop.py 코드 리딩 (10분)", c: C.violet,
        cmd: "# nanobot/agent/loop.py 열기\ngit clone https://github.com/HKUDS/nanobot\ncode nanobot/nanobot/agent/loop.py",
        note: "AgentLoop.run() = 우리 run_agent()",
      },
    ];

    steps.forEach((st, i) => {
      const y = 1.38 + i * 1.32;
      accentCard(s, 0.35, y, 9.3, 1.18, st.c);
      s.addShape("rect", { x: 0.48, y: y + 0.35, w: 0.55, h: 0.5, fill: { color: st.c }, line: { color: st.c } });
      s.addText(st.n, { x: 0.48, y: y + 0.35, w: 0.55, h: 0.5, margin: 0, fontSize: 16, bold: true, color: C.bg, align: "center", valign: "middle" });
      s.addText(st.title, { x: 1.18, y: y + 0.08, w: 2.5, h: 0.38, margin: 0, fontSize: 14, bold: true, color: st.c });
      s.addText(st.cmd, { x: 1.18, y: y + 0.48, w: 5.9, h: 0.65, margin: 0, fontSize: 9, color: C.white, fontFace: "Consolas", fit: "shrink" });
      s.addShape("rect", { x: 7.3, y: y + 0.38, w: 2.25, h: 0.65, fill: { color: "0A0F1E" }, line: { color: st.c, width: 1 } });
      s.addText("💡 " + st.note, { x: 7.35, y: y + 0.42, w: 2.15, h: 0.58, margin: 0, fontSize: 9, color: st.c });
    });

    // Comparison table
    s.addShape("rect", { x: 0.35, y: 5.25, w: 9.3, h: 0.3, fill: { color: C.card }, line: { color: C.divider } });
    const cols = [
      { label: "항목", w: 1.8, x: 0.45 },
      { label: "우리 agent.py", w: 3.3, x: 2.3 },
      { label: "nanobot", w: 3.3, x: 5.7 },
    ];
    cols.forEach(c => s.addText(c.label, { x: c.x, y: 5.27, w: c.w, h: 0.25, margin: 0, fontSize: 9.5, bold: true, color: C.sky }));
    const rows = [
      ["코드 규모", "~50줄", "~4,000줄 (core)"],
      ["핵심 패턴", "ReAct Loop", "동일"],
    ];
    // just show inline
    s.addText("코드: ~50줄 (오늘 실습)  |  패턴: ReAct Loop  ↔  nanobot: ~4,000줄 (core)  |  패턴: 동일  →  확장성·채널·Memory 차이", {
      x: 0.45, y: 5.27, w: 9.1, h: 0.25, margin: 0, fontSize: 9, color: C.muted
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 17a — Structured Output (JSON 강제 출력)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Structured Output: LLM에게 JSON을 강제하는 법", "심화 패턴");

    s.addText("LLM은 확률적 → \"JSON만 출력해\" 해도 설명문을 붙인다. 해결: 3가지 테크닉 조합", {
      x: 0.35, y: 0.9, w: 9.3, h: 0.35, margin: 0, fontSize: 11.5, color: C.muted, italic: true
    });

    // Left: 3 techniques
    const techs = [
      { n: "01", t: "CRITICAL INSTRUCTIONS", d: "\"반드시 JSON만. 설명·마크다운 금지.\"\n강한 지시문으로 확률 제어", c: C.sky },
      { n: "02", t: "temperature = 0.0", d: "결정론적 출력 → 가장 확률 높은\n토큰만 선택 → JSON 정확도 ↑", c: C.emerald },
      { n: "03", t: "3회 재시도 + 파싱", d: "extract_json_from_text()로\n마크다운·설명문 자동 제거 후 재파싱", c: C.amber },
    ];
    techs.forEach((t, i) => {
      const y = 1.4 + i * 1.15;
      accentCard(s, 0.35, y, 4.55, 1.0, t.c);
      s.addShape("rect", { x: 0.48, y: y + 0.25, w: 0.5, h: 0.5, fill: { color: t.c }, line: { color: t.c } });
      s.addText(t.n, { x: 0.48, y: y + 0.25, w: 0.5, h: 0.5, margin: 0, fontSize: 16, bold: true, color: C.bg, align: "center", valign: "middle" });
      s.addText(t.t, { x: 1.12, y: y + 0.08, w: 3.5, h: 0.35, margin: 0, fontSize: 13, bold: true, color: t.c });
      s.addText(t.d, { x: 1.12, y: y + 0.45, w: 3.5, h: 0.5, margin: 0, fontSize: 10, color: C.white });
    });

    // Right: code example
    codeBlock(s, 5.1, 1.4, 4.55, 3.4,
`prompt = f"""목표를 분석하세요.

CRITICAL INSTRUCTIONS:
1. 반드시 유효한 JSON만 출력
2. 설명, 마크다운 금지
3. {{ 로 시작, }} 로 끝

형식: {{"result": "분석 내용"}}
"""

for attempt in range(3):  # 재시도
    resp = client.chat.completions.create(
        model=MODEL, messages=[...],
        temperature=0.0  # 결정론적
    )
    parsed = extract_json_from_text(resp)
    if parsed:
        return parsed  # 성공!`, C.sky, "Structured Output 패턴");

    s.addText("출처: agents-from-scratch Lesson 3 | Validation + Retries = Reliability", {
      x: 0.35, y: 5.15, w: 9.3, h: 0.3, margin: 0, fontSize: 10, color: C.muted, align: "center", italic: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 17b — Memory (Agent의 기억)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Memory: Agent에게 기억을 주는 법", "심화 패턴");

    s.addText("\"Memory is explicit storage, not consciousness\" — 기억은 의식이 아니라 저장소다", {
      x: 0.35, y: 0.9, w: 9.3, h: 0.35, margin: 0, fontSize: 11.5, color: C.muted, italic: true
    });

    // Left: Why memory?
    accentCard(s, 0.35, 1.4, 4.55, 1.6, C.rose);
    s.addText("왜 기억이 필요한가?", { x: 0.55, y: 1.5, w: 4.0, h: 0.35, margin: 0, fontSize: 14, bold: true, color: C.rose });
    const problems = [
      "프로그램 종료 → 모든 대화 소멸",
      "\"아까 말한 거 뭐였지?\" → 대응 불가",
      "사용자 이름·선호도 기억 불가",
      "세션 간 연속성 없음",
    ];
    problems.forEach((p, i) => {
      s.addText("✗ " + p, { x: 0.55, y: 1.95 + i * 0.25, w: 4.2, h: 0.22, margin: 0, fontSize: 10, color: C.white });
    });

    // Right: Solution
    accentCard(s, 5.1, 1.4, 4.55, 1.6, C.emerald);
    s.addText("해결: Memory 클래스 + JSONL", { x: 5.28, y: 1.5, w: 4.0, h: 0.35, margin: 0, fontSize: 14, bold: true, color: C.emerald });
    const solutions = [
      "Memory 클래스: add() / search() / get_recent()",
      "JSONL 파일: 대화마다 한 줄씩 append",
      "memory_search Tool: LLM이 직접 기억 검색",
      "자동 주입: 최근 기억을 프롬프트에 삽입",
    ];
    solutions.forEach((p, i) => {
      s.addText("✓ " + p, { x: 5.28, y: 1.95 + i * 0.25, w: 4.2, h: 0.22, margin: 0, fontSize: 10, color: C.white });
    });

    // Bottom: code
    codeBlock(s, 0.35, 3.15, 4.55, 2.2,
`class Memory:
    def __init__(self):
        self.items = []  # 기억 저장소
    def add(self, item: str):
        if item not in self.items:
            self.items.append(item)
            self.save_to_file()
    def search(self, query: str):
        return [i for i in self.items
                if query.lower() in i.lower()]`, C.indigo, "Memory 클래스 (핵심)");

    codeBlock(s, 5.1, 3.15, 4.55, 2.2,
`# JSONL: 한 줄 = 한 턴 (append-only)
{"role":"user","content":"내 이름은 철수"}
{"role":"assistant","content":"네, 철수님!"}
# 자동 기억 주입 (run_agent 안에서)
recent = memory.get_recent(3)
messages.append({
    "role": "system",
    "content": f"기억: {recent}"
})`, C.amber, "JSONL 대화 이력 (claw0 패턴)");
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 17c — Agentic 패턴 심화 + Production 로드맵
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Agent → Production: 어디까지 갈 수 있는가?", "로드맵");

    // Left: Planning pattern
    accentCard(s, 0.35, 0.95, 4.55, 2.4, C.indigo);
    s.addText("Planning 패턴", { x: 0.55, y: 1.05, w: 4.0, h: 0.35, margin: 0, fontSize: 14, bold: true, color: C.indigo });
    s.addText("\"계획은 생각이 아니라 데이터 구조다\"", { x: 0.55, y: 1.4, w: 4.2, h: 0.22, margin: 0, fontSize: 9.5, color: C.muted, italic: true });
    codeBlock(s, 0.45, 1.72, 4.35, 1.5,
`# 목표 → JSON 계획 분해
plan = create_plan("Edge AI 조사해줘")
# → {"steps": [
#      "search_web으로 Edge AI 검색",
#      "핵심 포인트 정리",
#      "요약문 작성"
#    ]}
execute_plan(plan)  # 순차 실행`, C.indigo, "");

    // Right: Production roadmap (claw0)
    accentCard(s, 5.1, 0.95, 4.55, 2.4, C.amber);
    s.addText("Production Agent 로드맵 (claw0)", { x: 5.28, y: 1.05, w: 4.0, h: 0.35, margin: 0, fontSize: 14, bold: true, color: C.amber });
    const roadmap = [
      { n: "01-02", t: "Loop + Tools", c: C.emerald, note: "← 우리 agent.py" },
      { n: "03", t: "Session 영속화", c: C.sky, note: "← agent_memory.py" },
      { n: "04-05", t: "채널 + 라우팅", c: C.indigo, note: "Telegram/Slack 연결" },
      { n: "06", t: "Intelligence", c: C.violet, note: "8층 프롬프트 + 메모리" },
      { n: "07-08", t: "자동실행 + 배달보장", c: C.rose, note: "Cron + WAL" },
      { n: "09-10", t: "복원력 + 동시성", c: C.amber, note: "API 로테이션 + Lane" },
    ];
    roadmap.forEach((r, i) => {
      const y = 1.45 + i * 0.3;
      s.addText(r.n, { x: 5.28, y, w: 0.55, h: 0.28, margin: 0, fontSize: 9, bold: true, color: r.c });
      s.addText(r.t, { x: 5.88, y, w: 1.8, h: 0.28, margin: 0, fontSize: 10, bold: true, color: C.white });
      s.addText(r.note, { x: 7.75, y, w: 1.8, h: 0.28, margin: 0, fontSize: 9, color: C.muted });
    });

    // Bottom: progression diagram
    s.addShape("rect", { x: 0.35, y: 3.5, w: 9.3, h: 0.04, fill: { color: C.divider }, line: { color: C.divider } });
    s.addText("제공 실습 파일 — 단계별 확장", { x: 0.35, y: 3.65, w: 9.3, h: 0.32, margin: 0, fontSize: 13, bold: true, color: C.white });

    const files = [
      { name: "agent.py",          desc: "기본 (50줄) — 4 Tools + ReAct", c: C.emerald, w: 2.15 },
      { name: "agent_memory.py",   desc: "대화 기억 + JSONL + memory_search", c: C.sky, w: 2.15 },
      { name: "agent_planner.py",  desc: "계획 수립 + JSON 파싱 + 실행", c: C.indigo, w: 2.15 },
      { name: "agent_advanced.py", desc: "종합 — 7 Tools + Memory + Plan", c: C.amber, w: 2.15 },
    ];
    files.forEach((f, i) => {
      const x = 0.35 + i * 2.38;
      accentCard(s, x, 4.05, f.w, 1.2, f.c);
      s.addText(f.name, { x: x + 0.12, y: 4.15, w: f.w - 0.2, h: 0.35, margin: 0, fontSize: 11, bold: true, color: f.c, fontFace: "Consolas" });
      s.addText(f.desc, { x: x + 0.12, y: 4.52, w: f.w - 0.2, h: 0.6, margin: 0, fontSize: 9, color: C.white });
    });
    // Arrows between cards
    for (let i = 0; i < 3; i++) {
      const ax = 0.35 + (i + 1) * 2.38 - 0.15;
      s.addText("→", { x: ax, y: 4.35, w: 0.3, h: 0.3, margin: 0, fontSize: 18, color: C.muted, align: "center", valign: "middle" });
    }
    s.addText("출처: agents-from-scratch (12 lessons) + claw0 (10 sections) — 강의 후 공유", {
      x: 0.35, y: 5.35, w: 9.3, h: 0.22, margin: 0, fontSize: 10, color: C.muted, align: "center", italic: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 18 — 실습 미션
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "실습 미션 & 확장 도전", "실습");

    const missions = [
      { lv: "기본", desc: "agent.py 실행 → 4가지 Tool 각각 동작 확인 (계산·시간·검색·파일)", c: C.emerald },
      { lv: "심화 1", desc: "Tool 추가: translate(text, lang) — 파파고/DeepL API 또는 Mock", c: C.sky },
      { lv: "심화 2", desc: "대화 저장: messages를 JSON 파일로 write → 다음 실행에서 load (Memory 흉내)", c: C.indigo },
      { lv: "심화 3", desc: "nanobot 설치 후 loop.py 읽기 → run_agent()와 AgentLoop.run() 구조 비교", c: C.violet },
      { lv: "도전", desc: "Ollama 로컬 모델(llama3.2)로 API Key 없이 agent.py + nanobot 동시 동작", c: C.amber },
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
    s.addText("막히면 손 들어주세요 — 같이 디버깅합니다 (이게 진짜 개발입니다 😄)", {
      x: 0.8, y: 5.39, w: 8.7, h: 0.17, margin: 0, fontSize: 9.5, color: C.amber
    });
  }


  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 18 — Day 2 Preview
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "Day 2 Preview: Edge에서 Agent를 돌리면?", "Next");

    s.addText('"Cloud Agent는 됐다. 이제 손 안의 기기, NPU에서 돌려보자"', {
      x: 0.5, y: 1.0, w: 9.0, h: 0.5, margin: 0, fontSize: 15, italic: true, color: C.sky, align: "center"
    });

    const topics = [
      { t: "메모리 제약",      d: "4GB DRAM에서 7B 모델?\nGGUF 4-bit 양자화 필수",       icon: iChip,  c: C.rose },
      { t: "GGUF / llama.cpp", d: "로컬 LLM 실행 표준\nOllama로 1줄 설치",              icon: iLayer, c: C.sky },
      { t: "latency 문제",     d: "클라우드 100ms →\n온디바이스 2~10s 현실",             icon: iCog,   c: C.amber },
      { t: "NPU 가속",         d: "경량화 + NPU dispatch\n(강사 GTX NPU 실무 경험담)",   icon: iBrain, c: C.indigo },
    ];
    topics.forEach((t, i) => {
      const x = (i % 2) * 4.75 + 0.35;
      const y = i < 2 ? 1.72 : 3.55;
      accentCard(s, x, y, 4.55, 1.6, t.c);
      s.addImage({ data: t.icon, x: x + 0.18, y: y + 0.48, w: 0.55, h: 0.55 });
      s.addText(t.t, { x: x + 0.9, y: y + 0.1, w: 3.5, h: 0.42, margin: 0, fontSize: 15, bold: true, color: C.white });
      s.addText(t.d, { x: x + 0.9, y: y + 0.55, w: 3.5, h: 0.88, margin: 0, fontSize: 10.5, color: C.muted });
    });

    s.addText("다음 주 준비: Ollama 설치 + llama3.2 pull 해오기", {
      x: 0.35, y: 5.28, w: 9.3, h: 0.28, margin: 0, fontSize: 12, color: C.emerald, align: "center", bold: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 19 — 오늘 요약
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    topBar(s, "오늘 배운 것 — 5문장 요약", "Summary");

    const sums = [
      { n: "01", t: "LLM은 토큰 예측 함수",      d: "기억·행동·최신 정보가 없다. 그래서 Agent가 필요하다.", c: C.indigo },
      { n: "02", t: "AI Agent 4세대 진화",        d: "대화창 → CLI·TUI → Agentic. 오늘의 Agent는 터미널에서 실행된다.", c: C.sky },
      { n: "03", t: "Tool = Skill = 능력 단위",   d: "함수를 등록하면 LLM이 스스로 골라 쓴다. MCP는 이것의 표준화.", c: C.violet },
      { n: "04", t: "ReAct: Thought→Act→Observe", d: "3단계 루프를 반복하면 복잡한 작업도 풀 수 있다.", c: C.emerald },
      { n: "05", t: "실제 동작하는 코드",          d: "agent.py 를 직접 만들었다. Tool 추가, Memory, 로컬 실행이 숙제.", c: C.amber },
    ];

    sums.forEach((sm, i) => {
      const y = 0.98 + i * 0.9;
      accentCard(s, 0.35, y, 9.3, 0.78, sm.c);
      s.addShape("rect", { x: 0.48, y: y + 0.18, w: 0.55, h: 0.45, fill: { color: sm.c }, line: { color: sm.c } });
      s.addText(sm.n, { x: 0.48, y: y + 0.18, w: 0.55, h: 0.45, margin: 0, fontSize: 16, bold: true, color: C.bg, align: "center", valign: "middle" });
      s.addText(sm.t, { x: 1.2, y: y + 0.04, w: 3.2, h: 0.38, margin: 0, fontSize: 13.5, bold: true, color: sm.c });
      s.addText(sm.d, { x: 1.2, y: y + 0.44, w: 8.0, h: 0.32, margin: 0, fontSize: 11, color: C.white });
    });

    s.addShape("rect", { x: 0.35, y: 5.38, w: 9.3, h: 0.22, fill: { color: "0D3B66" }, line: { color: C.sky, width: 1 } });
    s.addText("🚀  숙제: agent.py에 Tool 하나 더 추가해오기 (자유 주제)", {
      x: 0.5, y: 5.4, w: 9.0, h: 0.2, margin: 0, fontSize: 11.5, color: C.sky, align: "center", bold: true
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 20 — Q&A
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide(); bgFill(s);
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: "050E1A" }, line: { color: "050E1A" } });
    s.addImage({ data: iRobot, x: 4.25, y: 0.45, w: 1.5, h: 1.5 });
    s.addText("Q & A", { x: 1, y: 2.1, w: 8, h: 1.05, margin: 0, fontSize: 58, bold: true, color: C.white, align: "center" });
    s.addText("질문은 언제든지 환영합니다", { x: 1, y: 3.22, w: 8, h: 0.5, margin: 0, fontSize: 16, color: C.sky, align: "center" });
    s.addShape("rect", { x: 2.0, y: 3.9, w: 6.0, h: 0.5, fill: { color: C.card }, line: { color: C.divider } });
    s.addText("실습 코드(agent.py) · 슬라이드 강의 후 공유", { x: 2.0, y: 3.9, w: 6.0, h: 0.5, margin: 0, fontSize: 11, color: C.muted, align: "center", valign: "middle" });
    s.addText("이선우  |  Principal Engineer, SuperGate  |  GTX NPU Core Team", {
      x: 1, y: 4.62, w: 8, h: 0.3, margin: 0, fontSize: 11, color: C.muted, align: "center"
    });
  }

  await pres.writeFile({ fileName: "agent_ai_lecture_day1_v3.pptx" });
  console.log("Done ✓");
}

build().catch(console.error);
