// src/components/ChatbotWidget.jsx
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

/**
 * =========================================================
 * 데모형 "상태 기반" 챗봇 (전체 완성본)
 * ✅ 처음 뜨는 위치: 우하단 위젯 버튼 바로 위(자연스럽게)
 * ✅ 드래그 이동 가능
 * ✅ 최소화/다시열기 해도 대화 유지
 * ✅ 확대/축소 가능
 * ✅ 화면/국가/업로드/ActionItems 상태 기반 답변
 * ✅ Docs 화면에서 추천 질문 버튼 제공(키 기반 답변)
 * =========================================================
 */

/** 공통 포맷(답변 템플릿) */
function formatAnswer({ title, summary, bullets = [], next = [], ask = [] }) {
  let out = `**${title}**\n\n`;
  if (summary) out += `${summary}\n\n`;
  if (bullets.length) {
    out += `✅ 핵심 포인트\n`;
    out += bullets.map((b) => `- ${b}`).join("\n") + "\n\n";
  }
  if (next.length) {
    out += `🧩 다음 액션\n`;
    out += next.map((n) => `- ${n}`).join("\n") + "\n\n";
  }
  if (ask.length) {
    out += `❓ 제가 더 정확히 답하려면\n`;
    out += ask.map((a) => `- ${a}`).join("\n") + "\n";
  }
  return out.trim();
}

/** 국가 라벨 */
function countryLabel(targetCountry) {
  if (targetCountry === "EU") return "유럽(CE)";
  if (targetCountry === "US") return "미국(NRTL/FCC)";
  if (targetCountry === "CN") return "중국(CCC)";
  return targetCountry || "—";
}

/** docs 화면에서만 추천 질문 */
function buildSuggestedQuestions(currentView) {
  if (currentView !== "docs") return [];
  return [
    { key: "DOCS_WHAT_MISSING", label: "필수 서류 중 뭐가 부족한가요?" },
    { key: "DOCS_DRAFT_OK", label: "필수 서류가 부족해도 생성 가능한가요?" },
    { key: "DOCS_AUTOFILL_TIPS", label: "파일저장소 자동 업로드가 안돼요. 뭐부터 확인해요?" },
    { key: "DOCS_OUTPUT_EXPLAIN", label: "DoC/TCF/Risk Report가 각각 뭐예요?" },
    { key: "DOCS_NEXT_STEP", label: "문서 생성 후 다음 단계는 뭐부터 해요?" },
  ];
}

/** 사용자 입력 → 시나리오 키 매칭 */
function toScenarioKey(text = "", currentView = "") {
  const t = String(text).toLowerCase().replace(/\s+/g, "");

  // 인증기관 매칭
  if (t.includes("어디") && t.includes("인증기관")) return "LABS_WHERE";
  if (t.includes("매칭") && (t.includes("어디") || t.includes("추천"))) return "LABS_WHERE";
  if (t.includes("best") || t.includes("베스트") || t.includes("최적")) return "LABS_BEST_REASON";

  // 규제진단
  if (t.includes("규제진단") && (t.includes("고치") || t.includes("수정") || t.includes("팁") || t.includes("fail")))
    return "DIAG_FIX_TIPS";
  if (t.includes("조치율") || t.includes("액션아이템") || t.includes("보완사항")) return "DIAG_ACTIONITEMS_SUMMARY";

  // 저장소/자동업로드 공통
  if (t.includes("자동") && (t.includes("업로드") || t.includes("저장소"))) return "REPO_AUTOFILL_HELP";
  if (t.includes("저장소선택") || (t.includes("저장소") && t.includes("안떠"))) return "REPO_PICKER_HELP";

  // docs 화면 전용
  if (currentView === "docs") {
    if (t.includes("부족") || t.includes("뭐가")) return "DOCS_WHAT_MISSING";
    if (t.includes("초안") || t.includes("부족해도")) return "DOCS_DRAFT_OK";
    if (t.includes("doc") || t.includes("tcf") || t.includes("의미")) return "DOCS_OUTPUT_EXPLAIN";
    if (t.includes("다음") || t.includes("이후")) return "DOCS_NEXT_STEP";
  }

  return null;
}

/** 시나리오 답변 생성기 */
function buildScenarioAnswers(context) {
  const cLabel = countryLabel(context.targetCountry);

  return {
    /** ---------------- labs ---------------- */
    LABS_WHERE: () =>
      formatAnswer({
        title: `어디로 인증기관 매칭할까요? (${cLabel})`,
        summary: `결정은 간단해요. “기간/비용/리스크” 중 **1순위**만 정하면 추천이 딱 나옵니다.`,
        bullets: [
          "기간 우선: 일정이 가장 짧은 곳(서류검토 빠른 곳)",
          "비용 우선: 견적이 낮고 필수 시험만 구성해주는 곳",
          "리스크 우선: 유사 제품 경험 + 보유 인증(KOLAS/UL/CE) + 문서검토 역량",
        ],
        next: ["1순위가 기간/비용/리스크 중 무엇인지 알려주세요", "제품이 ‘무선/자율주행 기능 포함’인지 알려주세요"],
        ask: ["지금 제일 급한 건 ‘기간’이에요? ‘비용’이에요? ‘리스크 최소화’에요?"],
      }),

    LABS_BEST_REASON: () =>
      formatAnswer({
        title: "AI Best Match는 왜 Best인가요?",
        summary: "Best Match는 단순 점수가 아니라 **요구 규격 충족 가능성**과 **커뮤니케이션 효율**이 높은 곳이에요.",
        bullets: [
          "해당 국가 규정 경험(CE/UL/FCC/CCC) + 유사 시험 수행 이력",
          "필수 서류 기반으로 ‘보완 요청’이 명확한 기관",
          "시험 + 문서검토를 같이 제공해 일정 리스크가 낮음",
        ],
        next: ["기관 카드에서 ‘보유 인증’과 ‘AI 분석 코멘트’를 기준으로 1곳 먼저 선택해보세요"],
      }),

    /** ---------------- diagnosis ---------------- */
    DIAG_FIX_TIPS: () => {
      const total = context.remediationCount || 0;
      const pending = context.remediationPending || 0;
      const done = context.remediationDone || 0;

      if (!total) {
        return formatAnswer({
          title: "규제진단 FAIL을 고치는 팁",
          summary: `지금은 대시보드에 연결된 Action Items가 0개라서, 우선 “FAIL 목록이 publish되는지”부터 확인해야 해요.`,
          bullets: [
            "규제진단 결과 생성 → FAIL만 추려서 onPublishActionItems(market, items) 호출되는지",
            "DashboardView가 remediationByMarket을 받아서 테이블에 표시하는지",
          ],
          next: ["규제진단 화면에서 ‘결과 보기’ 누를 때 publish 함수가 실행되는지 콘솔로 확인하세요"],
        });
      }

      return formatAnswer({
        title: `규제진단 FAIL 개선 가이드 (${cLabel})`,
        summary: `현재 개선 필요 항목: **${total}개** (완료 ${done} / 남음 ${pending})`,
        bullets: [
          "Critical/High 먼저 처리(안전/인터록/비상정지/가드/라벨링)",
          "문서로 해결 가능한 FAIL(경고문/매뉴얼/표준 리스트 누락)부터 빠르게 PASS 전환",
          "회로도 REV 최신 + 적용표준 리스트 정리 → 시험소 커뮤니케이션 속도 상승",
        ],
        next: ["FAIL 목록을 ‘설계조치’ vs ‘문서보완’으로 나누고, High/Critical 3개부터 처리"],
        ask: ["FAIL 중에 ‘Critical/High’가 몇 개인지 알려주면 우선순위표 만들어줄게요."],
      });
    },

    DIAG_ACTIONITEMS_SUMMARY: () => {
      const total = context.remediationCount || 0;
      return formatAnswer({
        title: "대시보드 규제진단 보완사항(조치율) 요약",
        summary: total ? `현재 ${cLabel} 기준 Action Items: **${total}개**` : `현재 ${cLabel} 기준 Action Items가 아직 없습니다.`,
        bullets: total
          ? [`완료: ${context.remediationDone}개`, `진행/대기: ${context.remediationPending}개`, "조치율은 완료 비율로 계산됩니다."]
          : ["규제진단 실행 후 FAIL이 publish 되어야 대시보드에 표시됩니다."],
      });
    },

    /** ---------------- repo/common ---------------- */
    REPO_AUTOFILL_HELP: () =>
      formatAnswer({
        title: "파일저장소 자동 업로드가 안돼요",
        summary: "자동 업로드는 보통 **파일 이름(키워드)** 매칭이라서, 아래 3가지만 보면 대부분 해결돼요.",
        bullets: [
          "저장소 슬롯에 실제 file이 들어있는지 (row.file 존재 여부)",
          "자동 매칭 키워드와 파일명에 공통 문자열이 있는지 (rt100, bom, cad 등)",
          "repositoryFiles를 페이지에 props로 내려주고 있는지",
        ],
        next: ["저장소에 실제 업로드된 파일 ‘파일명’ 1개만 알려주세요(예: RT100_BOM_v3.xlsx)"],
      }),

    REPO_PICKER_HELP: () =>
      formatAnswer({
        title: "저장소 선택 눌렀는데 안 떠요",
        summary: "대부분은 **RepositoryView가 picker 모드를 지원하지 않거나 props명이 안 맞는 문제**예요.",
        bullets: [
          "repoModalTarget 상태가 true로 바뀌는지",
          "RepositoryView에 files={repositoryFiles} 전달되는지",
          "RepositoryView 안에 ‘선택하기’ 버튼(onPickFile/onSelect)이 실제로 렌더링되는지",
        ],
        next: ["우선 repoModalTarget이 클릭 시 바뀌는지부터 확인해보세요(콘솔 로그 추천)"],
      }),

    /** ---------------- docs ---------------- */
    DOCS_WHAT_MISSING: () =>
      formatAnswer({
        title: `필수 서류 중 뭐가 부족한가요? (${cLabel})`,
        summary: `지금 업로드된 서류: **${context.uploadedCount || 0}건**`,
        bullets: ["보통 필수는: 도면/회로도, 시험(계획/성적), 매뉴얼, 위험성평가/체크리스트", "필수 일부 누락이어도 ‘초안’은 생성 가능"],
        next: ["Not Uploaded로 남아있는 항목 1~2개만 먼저 채우면 초안 품질이 확 좋아져요"],
        ask: ["현재 Not Uploaded로 남아있는 항목 이름을 2개만 말해줘도 우선순위 정리해줄게요."],
      }),

    DOCS_DRAFT_OK: () =>
      formatAnswer({
        title: "필수 서류가 부족해도 생성 가능한가요?",
        summary: "가능합니다. 대신 시스템이 ‘추정’을 많이 해서 초안 품질이 제한될 수 있어요.",
        bullets: ["초안 단계: 구조/목차/필수 문구/형식 확보", "정식 단계: 시험성적서/사양/도면 수치 반영"],
        next: ["초안 생성 → 저장소 파일 채우기 → 정식 생성 흐름이 가장 현실적입니다."],
      }),

    DOCS_AUTOFILL_TIPS: () =>
      formatAnswer({
        title: "Docs에서 파일저장소 자동 업로드 팁",
        summary: "Docs는 input id(eu_tech_1 같은 것)와 저장소 슬롯(rt100_spec 같은 것)이 달라서 ‘매핑’이 필요해요.",
        bullets: ["repositoryFiles slotId → DOC_PROCESS_CONFIG input id로 연결", "그 연결표(매핑표)만 있으면 자동 업로드는 확실히 됩니다."],
        next: ["원하면 EU/US/CN 각각 ‘slotId → input id’ 매핑표를 만들어서 자동 업로드 완성해줄게요."],
      }),

    DOCS_OUTPUT_EXPLAIN: () =>
      formatAnswer({
        title: "DoC/TCF/Risk Report가 각각 뭐예요?",
        summary: "한 줄로 말하면 ‘제출 패키지’ 구성요소들입니다.",
        bullets: ["DoC: 규정/표준을 만족한다고 선언", "TCF: 설계근거/시험근거/리스크평가 등 기술문서 패키지", "Risk Report: 위험요소 식별/저감 조치 정리(ISO 12100 등)"],
        next: ["초안 생성 후엔 ‘시험소 커뮤니케이션용’으로 목차/문구부터 다듬는 걸 추천해요."],
      }),

    DOCS_NEXT_STEP: () =>
      formatAnswer({
        title: "문서 생성 후 다음 단계는 뭐부터 해요?",
        summary: "문서 생성이 끝나면 시험소로 넘기기 전에 3가지만 체크하면 됩니다.",
        bullets: ["적용 표준 리스트가 국가(EU/US/CN)에 맞는지", "REV(도면/회로도) 최신본 기준인지", "경고문/라벨 문구가 실제 제품에 반영 가능한지"],
        next: ["이 3가지만 확정되면 → 국내 인증기관 매칭에서 커뮤니케이션이 엄청 빨라져요"],
      }),
  };
}

/** fallback */
function buildFallbackAnswer(context) {
  const cLabel = countryLabel(context.targetCountry);
  return formatAnswer({
    title: "제가 질문을 정확히 못 잡았어요 😅",
    summary: `데모 시나리오 기반이라 아래처럼 질문해주면 바로 답할 수 있어요. (${cLabel})`,
    bullets: ["“어디로 인증기관 매칭할까?”", "“규제진단 FAIL 고치는 팁 알려줘”", "“파일저장소 자동 업로드가 안돼요”", "“(Docs) 필수 서류 중 뭐가 부족해?”"],
  });
}

const ChatbotWidget = memo(function ChatbotWidget({
  currentView = "dashboard",
  targetCountry = "EU",
  uploadedFiles = {},
  repositoryFiles = [],
  dashboardRemediationByMarket = { EU: [], US: [], CN: [] },
}) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // ✅ 처음엔 null → useEffect에서 우하단 위로 “자연스럽게” 자동 배치
  const [pos, setPos] = useState(null);

  const [input, setInput] = useState("");

  // 드래그 이동
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // 대화 내용(최소화/재오픈해도 유지)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text:
        "안녕하세요! 👋\n" +
        "현재 진행 상황을 기반으로 규제진단/인증기관 매칭/제출서류 관련 질문에 답해드릴게요.\n\n" +
        "예) “규제진단 FAIL을 어떻게 고치지?” / “어디 인증기관으로 매칭할까?”",
    },
  ]);

  // ✅ 현재 상태 요약(Context)
  const context = useMemo(() => {
    const remediation = dashboardRemediationByMarket?.[targetCountry] || [];
    const pending = remediation.filter((x) => x.status !== "done").length;
    const done = remediation.filter((x) => x.status === "done").length;

    const uploadedCount = Object.keys(uploadedFiles || {}).length;
    const repoUploadedCount = (repositoryFiles || []).filter((r) => r?.file).length;

    return {
      currentView,
      targetCountry,
      remediationCount: remediation.length,
      remediationPending: pending,
      remediationDone: done,
      uploadedCount,
      repoUploadedCount,
    };
  }, [currentView, targetCountry, uploadedFiles, repositoryFiles, dashboardRemediationByMarket]);

  const scenarioAnswers = useMemo(() => buildScenarioAnswers(context), [context]);
  const suggestedQuestions = useMemo(() => buildSuggestedQuestions(currentView), [currentView]);

  // ✅ 처음 1번만 자연스러운 위치로 배치(우하단 버튼 바로 위)
  useEffect(() => {
    if (pos) return;

    const panelW = expanded ? 520 : 340;
    const panelH = expanded ? 560 : 520;
    const margin = 24;

    const x = window.innerWidth - panelW - margin;
    const y = window.innerHeight - panelH - (margin + 60); // 아래 플로팅 버튼 공간 확보

    setPos({
      x: Math.max(8, x),
      y: Math.max(8, y),
    });
  }, [pos, expanded]);

  // 창 크기 바뀌면 화면 밖으로 나가지 않게 보정
  useEffect(() => {
    function onResize() {
      if (!pos) return;
      const panelW = expanded ? 520 : 340;
      const panelH = expanded ? 560 : 520;

      setPos((p) => {
        if (!p) return p;
        return {
          x: Math.max(8, Math.min(p.x, window.innerWidth - panelW - 8)),
          y: Math.max(8, Math.min(p.y, window.innerHeight - panelH - 8)),
        };
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [pos, expanded]);

  function appendMessage(role, text) {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role, text }]);
  }

  function handleAsk(text) {
    const userText = text ?? input;
    if (!String(userText).trim()) return;

    appendMessage("user", userText);
    setInput("");

    const key = toScenarioKey(userText, currentView);

    if (key && scenarioAnswers[key]) {
      const answer = scenarioAnswers[key]();
      setTimeout(() => appendMessage("ai", answer), 220);
      return;
    }

    setTimeout(() => appendMessage("ai", buildFallbackAnswer(context)), 220);
  }

  // 드래그
  function onMouseDownHeader(e) {
    draggingRef.current = true;
    dragOffsetRef.current = { x: e.clientX - (pos?.x ?? 0), y: e.clientY - (pos?.y ?? 0) };
  }

  useEffect(() => {
    function onMove(e) {
      if (!draggingRef.current) return;
      const panelW = expanded ? 520 : 340;
      const panelH = expanded ? 560 : 520;

      const nextX = e.clientX - dragOffsetRef.current.x;
      const nextY = e.clientY - dragOffsetRef.current.y;

      const clampedX = Math.max(8, Math.min(nextX, window.innerWidth - panelW - 8));
      const clampedY = Math.max(8, Math.min(nextY, window.innerHeight - panelH - 8));

      setPos({ x: clampedX, y: clampedY });
    }
    function onUp() {
      draggingRef.current = false;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [expanded, pos]);

  // 최소화 상태(대화 유지)
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center justify-center"
        title="AI Assistant 열기"
      >
        <MessageCircle size={22} />
      </button>
    );
  }

  const panelWidthClass = expanded ? "w-[520px]" : "w-[340px]";
  const messageHeightClass = expanded ? "h-[420px]" : "h-[320px]";

  return (
    <div
      className={`fixed z-[90] ${panelWidthClass} bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden`}
      style={{ left: pos?.x ?? 24, top: pos?.y ?? 24 }}
    >
      {/* Header (드래그 핸들) */}
      <div
        onMouseDown={onMouseDownHeader}
        className="cursor-move px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-sm font-black text-gray-900">AI Assistant</div>
            <div className="text-[10px] font-bold text-gray-400">
              {countryLabel(targetCountry)} • {currentView}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* 확대/축소 */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-500"
            title={expanded ? "축소" : "확대"}
          >
            <span className="text-xs font-black">{expanded ? "▢" : "▣"}</span>
          </button>

          {/* 최소화 */}
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-500"
            title="최소화"
          >
            <span className="text-lg leading-none">–</span>
          </button>

          {/* 닫기(동작은 최소화와 동일, 원하면 따로 reset 넣을 수 있음) */}
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-500"
            title="닫기"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Suggested questions (docs 화면에서만) */}
      {suggestedQuestions.length > 0 && (
        <div className="px-3 pt-3 pb-2 border-b border-gray-100 bg-gray-50/50">
          <div className="text-[10px] font-black text-gray-600 mb-2">추천 질문</div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q.key}
                onClick={() => {
                  appendMessage("user", q.label);
                  const ans = scenarioAnswers[q.key]?.() ?? "답변 시나리오가 없습니다.";
                  setTimeout(() => appendMessage("ai", ans), 200);
                }}
                className="text-[10px] font-bold px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className={`${messageHeightClass} overflow-y-auto custom-scrollbar px-3 py-3 flex flex-col gap-2`}>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] whitespace-pre-wrap text-xs leading-relaxed px-3 py-2 rounded-2xl border ${
                m.role === "user"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="질문을 입력하세요…"
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-blue-100"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAsk();
          }}
        />
        <button
          onClick={() => handleAsk()}
          className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
          title="보내기"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
});

export default ChatbotWidget;
