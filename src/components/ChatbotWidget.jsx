// src/components/ChatbotWidget.jsx
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

/**
 * ✅ 목적: "규제진단 FAIL 항목을 어떻게 고칠지"만 딥하게 안내하는 시나리오 챗봇
 */

function countryLabel(targetCountry) {
  if (targetCountry === "EU") return "유럽(CE)";
  if (targetCountry === "US") return "미국(UL/NRTL/FCC)";
  if (targetCountry === "CN") return "중국(CCC)";
  return targetCountry || "—";
}

function formatAnswer({ title, summary, sections = [] }) {
  let out = `**${title}**\n\n`;
  if (summary) out += `${summary}\n\n`;
  for (const s of sections) {
    out += `### ${s.title}\n`;
    if (Array.isArray(s.bullets) && s.bullets.length) {
      out += s.bullets.map((b) => `- ${b}`).join("\n") + "\n\n";
    } else if (typeof s.text === "string" && s.text.trim()) {
      out += `${s.text.trim()}\n\n`;
    }
  }
  return out.trim();
}

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()]/g, "");
}

function priorityWeight(p) {
  const v = String(p || "").toLowerCase();
  if (v.includes("critical")) return 5;
  if (v.includes("high")) return 4;
  if (v.includes("medium")) return 3;
  if (v.includes("low")) return 2;
  return 1;
}

function summarizeFailList(items, max = 5) {
  const arr = Array.isArray(items) ? items : [];
  const open = arr.filter((x) => x?.status !== "done");
  open.sort((a, b) => priorityWeight(b?.priority) - priorityWeight(a?.priority));
  return open.slice(0, max);
}

function uniq(arr) {
  const out = [];
  const seen = new Set();
  for (const x of arr) {
    const k = String(x || "").trim();
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

/** -------------------------------
 * 플레이북 룰: task 문장 기반으로 "원인/수정/증빙/검증" 자동 생성
 * ------------------------------*/
function buildPlaybookForFail({ item, targetCountry }) {
  const task = String(item?.task || "");
  const t = normalizeText(task);
  const c = targetCountry;

  const base = {
    standard: null,
    rootCause: [
      "요구사항(표준/지침) 대비 설계·문서가 '증빙 가능한 형태'로 정리되지 않았거나",
      "실물 반영(라벨/색상/부품 정격/배선 규격)과 문서(매뉴얼/도면/BOM) 간 REV 불일치가 발생하는 경우가 많습니다.",
    ],
    quickFix: [
      "현 상태 사진/도면(REV)부터 확보 → 무엇이 표준 요구사항에 안 맞는지 '눈에 보이게' 만듭니다.",
      "문서로 PASS 전환 가능한 항목(라벨/경고문구/표준리스트/체크리스트)을 먼저 처리해 조치율을 빠르게 끌어올립니다.",
    ],
    properFix: [
      "설계 변경이 필요한 항목은 (부품 변경/BOM 반영/회로도 반영/매뉴얼 반영) 4종 세트를 같이 수정합니다.",
      "시험소/인증기관 커뮤니케이션을 위해 '변경 전/후 비교표'를 한 장으로 만듭니다.",
    ],
    evidence: [
      "변경 전/후 사진(라벨/버튼/배선/부품 실물)",
      "도면/회로도 REV(변경사항 마킹)",
      "BOM 업데이트(제조사/모델명/정격 포함)",
      "매뉴얼 경고문구/라벨 섹션 업데이트",
    ],
    validation: [
      "기능 확인(해당 기능이 실제로 요구대로 동작하는지) + 사진 증빙",
      "문서 리뷰(REV 일치, 표준/지침/부품인증 근거 포함)",
      "필요 시 시험 계획/성적서로 최종 증빙",
    ],
    pitfalls: [
      "실물은 바꿨는데 문서(회로도/BOM/매뉴얼)가 그대로인 상태 → 가장 흔한 재FAIL 원인",
      "표준 번호/요구 문구가 문서에 있으나, 실제 제품 반영(라벨/색상/부착 위치)이 빠져있는 상태",
    ],
  };

  const extra = {
    standard: null,
    rootCause: [],
    quickFix: [],
    properFix: [],
    evidence: [],
    validation: [],
    pitfalls: [],
  };

  if (t.includes("비상정지") || t.includes("emergency") || t.includes("iso13850")) {
    extra.standard = "ISO 13850 (Emergency Stop)";
    extra.rootCause.push(
      "비상정지 버튼의 색상/형상/배치 또는 '정지 → 재가동' 로직이 ISO 13850 요구와 불일치할 수 있습니다."
    );
    extra.quickFix.push(
      "버튼/배경 색상(적색 버튼 + 황색 배경)과 부착 위치(작업자 접근성)부터 실물 기준으로 점검합니다."
    );
    extra.properFix.push(
      "정지 로직: E-Stop 입력 시 위험 에너지가 안전 상태로 떨어지는지(모터/구동부 차단), 복귀는 '의도적 조작' 후 재시작 절차가 필요한지 확인합니다."
    );
    extra.evidence.push(
      "E-Stop 실물 사진(전면/측면/주변 배경 포함), 배선/릴레이/PLC 입력부 회로 스냅샷"
    );
    extra.validation.push(
      "시나리오 시험: 동작 중 E-Stop → 즉시 정지 → Reset → 재가동(재시작 버튼/절차 필요 여부) 기록"
    );
    extra.pitfalls.push("버튼 색상만 바꾸고, '정지 후 재시작 절차'가 매뉴얼/라벨에 반영되지 않는 경우");
  }

  if (t.includes("케이블") || t.includes("h05vv") || t.includes("전원") || t.includes("powercable")) {
    extra.standard = extra.standard || (c === "EU" ? "EN 60204-1 (Electrical Equipment of Machines)" : null);
    extra.rootCause.push("케이블 규격(절연/단면/온도등급) 또는 인증 근거가 BOM/문서에 명확히 연결되지 않았을 수 있습니다.");
    extra.quickFix.push("현 케이블 모델명/규격을 실물/구매서류로 특정하고, BOM에 정확히 기입합니다.");
    extra.properFix.push("요구 규격 케이블로 교체 시, '회로도/배선도/부품표' 3종을 동시에 업데이트합니다.");
    extra.evidence.push("케이블 스펙시트(제조사/모델/규격), 구매/납품 증빙(가능하면)");
    extra.validation.push("배선 점검(색상/단자 압착/접지 포함) + 사진 증빙, 문서 REV 일치 확인");
    extra.pitfalls.push("케이블은 교체했는데 회로도/배선도 표기가 구형인 상태");
  }

  if (t.includes("접지") || t.includes("g/y") || t.includes("ground") || t.includes("earth")) {
    extra.standard = extra.standard || (c === "EU" ? "EN 60204-1 / IEC 60445(표기/색상 관행)" : null);
    extra.rootCause.push("접지 도체 색상/표기, 단자/접지 포인트 표시가 표준 관행과 불일치할 수 있습니다.");
    extra.quickFix.push("접지선 색상(G/Y) 및 단자 표기, 접지 포인트 라벨을 실물에서 바로 확인합니다.");
    extra.properFix.push("접지 구성(샤시 접지, 보호접지)과 도면상의 표기/접지 네트 구성을 일치시키고 사진으로 증빙합니다.");
    extra.evidence.push("접지 포인트 사진(라벨 포함), 회로도 접지 심볼/네트 표기 캡처");
    extra.validation.push("연속성(continuity) 간이 점검 기록(멀티미터) + 사진/기록");
    extra.pitfalls.push("색상만 맞췄는데 접지 포인트 표기/도면 연결이 빠진 상태");
  }

  if (t.includes("ul489") || (t.includes("차단기") && t.includes("ul"))) {
    extra.standard = "UL 489 (Molded-Case Circuit Breakers)";
    extra.rootCause.push("메인 차단기가 UL Listed/인증 정격 요건을 충족하지 않거나, 인증근거가 BOM/문서에 연결되지 않았을 수 있습니다.");
    extra.quickFix.push("현 차단기 모델명/정격(전압/전류/차단용량)을 확정하고 UL Listed 여부를 증빙합니다.");
    extra.properFix.push("UL 489 인증품으로 변경 시, BOM/회로도/패널 라벨(정격표기)까지 동시 반영합니다.");
    extra.evidence.push("UL 인증서/Listing 정보(캡처 가능), 스펙시트, BOM 반영본");
    extra.validation.push("정격 적합성 체크리스트(전압/전류/차단용량) 1페이지로 정리 후 문서 리뷰");
    extra.pitfalls.push("부품만 교체했는데, 패널 정격 라벨/문서 표기가 그대로라 재FAIL");
  }

  if (t.includes("ansi") || t.includes("z535") || t.includes("라벨") || t.includes("signalword") || t.includes("경고")) {
    extra.standard = extra.standard || "ANSI Z535 (Safety Signs and Labels)";
    extra.rootCause.push("Signal Word(DANGER/WARNING/CAUTION), pictogram, 색상/배치가 규격에 맞게 구성되지 않았을 수 있습니다.");
    extra.quickFix.push("라벨 초안(문구/Signal Word/그림)을 먼저 만들고, 제품 실제 부착 위치를 지정합니다.");
    extra.properFix.push("매뉴얼의 경고 섹션과 제품 라벨이 같은 위험요소/문구로 동기화되도록 정리합니다.");
    extra.evidence.push("라벨 도면/시안, 제품 부착 사진(전/후), 매뉴얼 경고 섹션 업데이트");
    extra.validation.push("라벨 체크: Signal Word/색상/가독성/부착 위치 확인 + 문서 일치 확인");
    extra.pitfalls.push("라벨은 있는데 '위험요소 분석(리스크)'와 연결이 안 되어 설득력이 약해지는 경우");
  }

  if (t.includes("매뉴얼") || t.includes("문서") || t.includes("체크리스트") || t.includes("report") || t.includes("성적서")) {
    extra.rootCause.push("필수 서류가 누락되었거나, 형식/목차/표준 인용 방식이 인증기관이 원하는 형태가 아닐 수 있습니다.");
    extra.quickFix.push("현재 제출 패키지의 '목차'를 먼저 만들고, 없는 섹션을 한 번에 식별합니다.");
    extra.properFix.push("표준/지침 리스트 + 증빙(시험/도면/리스크평가) 연결표를 만들어 심사 시간을 줄입니다.");
    extra.evidence.push("문서 목차/표준 리스트, 관련 섹션(경고문/라벨/사양/시험 결과) 업데이트본");
    extra.validation.push("문서 리뷰: 표준 인용/REV/파일명 규칙/서명(필요 시) 체크리스트로 점검");
  }

  const merged = {
    standard: extra.standard || base.standard,
    rootCause: uniq([...extra.rootCause, ...base.rootCause]),
    quickFix: uniq([...extra.quickFix, ...base.quickFix]),
    properFix: uniq([...extra.properFix, ...base.properFix]),
    evidence: uniq([...extra.evidence, ...base.evidence]),
    validation: uniq([...extra.validation, ...base.validation]),
    pitfalls: uniq([...extra.pitfalls, ...base.pitfalls]),
  };

  const pr = String(item?.priority || "—");
  const ty = String(item?.type || "—");
  const status = String(item?.status || "pending");

  return {
    title: `FAIL 해결 플레이북`,
    summary: `항목: **${task}**\n상태: **${status}** • 우선순위: **${pr}** • 유형: **${ty}**${
      merged.standard ? `\n연관 표준(추정): **${merged.standard}**` : ""
    }`,
    sections: [
      { title: "1) 원인 가설", bullets: merged.rootCause },
      { title: "2) 빠른 수정(Quick Fix) – 24~48시간 안에 할 것", bullets: merged.quickFix },
      { title: "3) 제대로 수정(Proper Fix) – 인증기관 설득 가능한 형태", bullets: merged.properFix },
      { title: "4) 증빙 패키지(필수)", bullets: merged.evidence },
      { title: "5) 검증 방법", bullets: merged.validation },
      { title: "6) 자주 터지는 함정", bullets: merged.pitfalls },
    ],
  };
}

function isFailFixIntent(text = "") {
  const t = normalizeText(text);
  if (!t) return false;
  return (
    (t.includes("fail") || t.includes("불합격") || t.includes("불합") || t.includes("미통과") || t.includes("탈락")) &&
    (t.includes("어떻게") || t.includes("고치") || t.includes("수정") || t.includes("해결") || t.includes("fix") || t.includes("가이드"))
  ) || (t.includes("규제진단") && (t.includes("fail") || t.includes("고치") || t.includes("수정") || t.includes("해결")));
}

function parsePickIndex(text = "") {
  const raw = String(text || "").trim();
  const m = raw.match(/^\s*(\d+)\s*(번)?\s*$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n)) return null;
  return n;
}

const ChatbotWidget = memo(function ChatbotWidget({
  currentView = "dashboard",
  targetCountry = "EU",
  dashboardRemediationByMarket = { EU: [], US: [], CN: [] },

  /** ✅ NEW: 로그인 후 기본으로 닫힌 상태로 시작하고 싶을 때 */
  defaultOpen = false,
}) {
  // ✅ 여기만 바뀜: true -> defaultOpen
  const [open, setOpen] = useState(Boolean(defaultOpen));

  const [expanded, setExpanded] = useState(false);
  const [pos, setPos] = useState(null);

  const [input, setInput] = useState("");

  const [pendingPick, setPendingPick] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text:
        "안녕하세요! 👋\n" +
        "저는 **규제진단 FAIL 항목을 어떻게 수정하면 PASS로 바뀌는지**만 딥하게 안내하는 봇이에요.\n\n" +
        "예) “규제진단 FAIL 어떻게 고쳐?” / “미통과 항목 수정 가이드 줘”",
    },
  ]);

  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, expanded]);

  useEffect(() => {
    if (!pos) return;
    const panelW = expanded ? 520 : 360;
    const panelH = expanded ? 560 : 520;
    const margin = 24;
    const x = window.innerWidth - panelW - margin;
    const y = window.innerHeight - panelH - (margin + 60);
    setPos({ x: Math.max(8, x), y: Math.max(8, y) });
  }, [pos, expanded]);

  useEffect(() => {
    function onResize() {
      if (!pos) return;
      const panelW = expanded ? 520 : 360;
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

  const remediation = useMemo(() => {
    const bucket = dashboardRemediationByMarket?.[targetCountry] || [];
    return Array.isArray(bucket) ? bucket : [];
  }, [dashboardRemediationByMarket, targetCountry]);

  function appendMessage(role, text) {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role, text }]);
  }

  function answerFailPickFlow() {
    const top = summarizeFailList(remediation, 5);

    if (!top.length) {
      appendMessage(
        "ai",
        formatAnswer({
          title: `FAIL 항목이 아직 없어요 (${countryLabel(targetCountry)})`,
          summary:
            "현재 시장에 연결된 Action Items(FAIL)이 0개입니다.\n\n" +
            "1) 규제진단에서 FAIL이 publish 되고 있는지\n" +
            "2) Dashboard가 remediationByMarket을 받고 있는지\n" +
            "3) targetCountry(EU/US)가 맞는지\n" +
            "를 먼저 확인해 주세요.",
          sections: [
            {
              title: "다음 액션",
              bullets: [
                "규제진단 실행 → 결과 보기 → FAIL publish 확인(콘솔 로그 추천)",
                "Dashboard에 Action Items가 실제로 표시되는지 확인",
              ],
            },
          ],
        })
      );
      return;
    }

    const list = top
      .map((x, i) => {
        const pr = x?.priority ? `(${x.priority})` : "";
        return `${i + 1}. ${x?.task || "—"} ${pr}`.trim();
      })
      .join("\n");

    appendMessage(
      "ai",
      formatAnswer({
        title: `어느 FAIL 항목부터 딥하게 볼까요? (${countryLabel(targetCountry)})`,
        summary:
          "아래는 **우선순위(High/Critical) 기준 TOP 5**입니다.\n" +
          "번호로 답하면 그 항목을 **원인/수정액션/증빙/검증**까지 플레이북으로 만들어 드릴게요.\n\n" +
          list,
        sections: [
          {
            title: "선택 방법",
            bullets: ["예) `1` 또는 `2번`이라고 입력", "또는 아래 버튼 클릭"],
          },
        ],
      })
    );

    setPendingPick({ options: top, market: targetCountry });
  }

  function answerFailPlaybookByIndex(index1based) {
    if (!pendingPick?.options?.length) return;
    const idx = index1based - 1;
    const pick = pendingPick.options[idx];
    if (!pick) {
      appendMessage("ai", "해당 번호의 항목이 없어요. 1~5 중에서 골라줘!");
      return;
    }

    const play = buildPlaybookForFail({ item: pick, targetCountry });
    appendMessage("ai", formatAnswer(play));
    setPendingPick(null);
  }

  function handleAsk(text) {
    const userText = text ?? input;
    if (!String(userText).trim()) return;

    appendMessage("user", userText);
    setInput("");

    if (pendingPick?.options?.length) {
      const n = parsePickIndex(userText);
      if (n != null) {
        answerFailPlaybookByIndex(n);
        return;
      }
      appendMessage("ai", "번호(예: 1 또는 2번)로 선택해줘. 딥 가이드 바로 줄게!");
      return;
    }

    if (isFailFixIntent(userText)) {
      answerFailPickFlow();
      return;
    }

    appendMessage(
      "ai",
      "지금 버전은 **규제진단 FAIL 수정 가이드 전용**이에요.\n\n예) “규제진단 FAIL 어떻게 고쳐?” 라고 물어봐줘!"
    );
  }

  // 최소화 상태(= 닫힘 상태)
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

  const panelWidthClass = expanded ? "w-[520px]" : "w-[360px]";
  const messageHeightClass = expanded ? "h-[420px]" : "h-[320px]";

  const pickButtons = pendingPick?.options?.length
    ? pendingPick.options.map((it, i) => ({
        idx: i + 1,
        label: `${i + 1}. ${String(it?.task || "—").slice(0, 26)}${String(it?.task || "").length > 26 ? "…" : ""}`,
      }))
    : [];

  return (
    <div
      className={`fixed z-[90] ${panelWidthClass} bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden`}
      style={{ left: pos?.x ?? 24, top: pos?.y ?? 24 }}
    >
      {/* Header */}
      <div
        onMouseDown={onMouseDownHeader}
        className="cursor-move px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-sm font-black text-gray-900">FAIL Fix Assistant</div>
            <div className="text-[10px] font-bold text-gray-400">
              {countryLabel(targetCountry)} • {currentView}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-500"
            title={expanded ? "축소" : "확대"}
          >
            <span className="text-xs font-black">{expanded ? "▢" : "▣"}</span>
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-500"
            title="최소화"
          >
            <span className="text-lg leading-none">–</span>
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-500"
            title="닫기"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ✅ 선택 버튼 영역 */}
      {pickButtons.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/60">
          <div className="text-[10px] font-black text-gray-600 mb-2">FAIL 항목 선택</div>
          <div className="flex flex-wrap gap-2">
            {pickButtons.map((b) => (
              <button
                key={b.idx}
                onClick={() => {
                  appendMessage("user", String(b.idx));
                  setTimeout(() => answerFailPlaybookByIndex(b.idx), 120);
                }}
                className="text-[10px] font-bold px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200"
                title={b.label}
              >
                {b.label}
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
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예) 규제진단 FAIL 어떻게 고쳐?"
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

  // ✅ 아래 함수가 파일 원본에 있었는데, 위에서 써야 해서 함수 선언을 올려야 합니다.
  // 하지만 기존 코드 구조 유지하려면 아래처럼 파일 하단에 두면 안 되고,
  // onMouseDownHeader / drag 관련 로직이 본문에 필요합니다.
  // → (원본 코드 그대로) drag 관련 함수/훅은 아래에 다시 붙여주세요.
});

export default ChatbotWidget;
