// src/App.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";

import Sidebar from "./components/Sidebar";
import ChatbotWidget from "./components/ChatbotWidget";

import DashboardView from "./pages/DashboardView";
import DiagnosisView from "./pages/DiagnosisView";
import DocsView from "./pages/DocsView";
import LabsView from "./pages/LabsView";
import SettingsPage from "./pages/SettingsPage";

import { PROJECTS, CHAT_HISTORY } from "./data/mock";

/** ✅ 중국 제거: 앱 전체 마켓은 EU/US만 */
const MARKETS = ["EU", "US"];

/* ===============================
   초기 저장소 슬롯 (파일 저장소)
================================ */
const INITIAL_REPOSITORY_SLOTS = [
  { slotId: "rt100_bom", name: "RT100 트랙터 BOM", type: "BOM", category: "project" },
  { slotId: "rt100_cad", name: "RT100 트랙터 CAD", type: "CAD", category: "project" },
  { slotId: "pl_insurance", name: "PL보험증권", type: "PDF", category: "project" },
  { slotId: "biz_reg_en", name: "대동로보틱스 사업자 등록증(영어)", type: "PDF", category: "project" },
  { slotId: "eu_rep_contract", name: "유럽대리인계약서", type: "PDF", category: "project" },

  { slotId: "rt100_manual", name: "RT100 사용자 매뉴얼", type: "PDF", category: "submission" },
  { slotId: "rt100_test_report", name: "자율주행 트랙터 시험성적서", type: "PDF", category: "submission" },
  { slotId: "rt100_spec", name: "RT100 제품사양서", type: "PDF", category: "submission" },
  { slotId: "rt100_test_plan", name: "RT 100 시험계획서", type: "DOC", category: "submission" },
  { slotId: "rt100_circuit", name: "RT100 회로도/블록도", type: "PDF", category: "submission" },
];

/** ✅ 안전장치: CN 들어오면 EU로 강제 */
function safeCountry(c) {
  return MARKETS.includes(c) ? c : "EU";
}

export default function App() {
  /* ===============================
     공통 / 네비게이션
  ================================ */
  const [currentView, setCurrentView] = useState("dashboard");
  const [currentProject, setCurrentProject] = useState(PROJECTS?.[0] ?? null);

  /** ✅ 국가: EU/US만 */
  const [targetCountry, setTargetCountry] = useState(safeCountry(PROJECTS?.[0]?.country ?? "EU"));

  /* ===============================
     규제 진단 진행 상태
  ================================ */
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  /* =====================================================
     ⭐ 규제진단 FAIL → 대시보드 Action Items (EU/US만)
  ===================================================== */
  const [dashboardRemediationByMarket, setDashboardRemediationByMarket] = useState({
    EU: [],
    US: [],
  });

  /* ===============================
     문서 / 제출 관리 (Docs)
  ================================ */
  const [docStep, setDocStep] = useState("input"); // input | processing | result
  const [docProgress, setDocProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState({});

  const handleFileUpload = useCallback((reqId, fileName) => {
    setUploadedFiles((prev) => ({ ...prev, [reqId]: fileName }));
  }, []);

  const handleRemoveFile = useCallback((reqId) => {
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[reqId];
      return next;
    });
  }, []);

  const resetDocProcess = useCallback(() => {
    setDocStep("input");
    setDocProgress(0);
    setUploadedFiles({});
  }, []);

  /** ✅ 파일 유지하고 input으로만 복귀 */
  const changeDocOnly = useCallback(() => {
    setDocStep("input");
    setDocProgress(0);
    // uploadedFiles 유지
  }, []);

  /* ===============================
     파일 저장소 (Repository)
  ================================ */
  const [repositoryFiles, setRepositoryFiles] = useState(
    INITIAL_REPOSITORY_SLOTS.map((s) => ({
      id: `slot-${s.slotId}`,
      slotId: s.slotId,
      name: s.name,
      type: s.type,
      category: s.category,
      origin: "Required Slot",
      date: "-",
      size: "-",
      file: null,
    }))
  );

  const uploadToSlot = useCallback((slotId, file) => {
    const today = new Date().toISOString().slice(0, 10);
    const size = typeof file?.size === "number" ? `${Math.round(file.size / 1024)} KB` : "—";

    setRepositoryFiles((prev) =>
      prev.map((f) =>
        f.slotId === slotId
          ? { ...f, file, origin: "Local Upload", date: today, size }
          : f
      )
    );
  }, []);

  /* ===============================
     프로젝트 바뀌면 국가 반영 (CN이면 EU로)
  ================================ */
  useEffect(() => {
    if (!currentProject) return;
    setTargetCountry(safeCountry(currentProject.country));
  }, [currentProject]);

  /* ===============================
     규제 진단 시뮬레이션
  ================================ */
  const startAnalysis = useCallback(() => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisComplete(true);
        }, 300);
      }
    }, 30);
  }, [isAnalyzing]);

  /* ===============================
     Docs 생성 시뮬레이션
  ================================ */
  const startDocGeneration = useCallback(() => {
    setDocStep("processing");
    setDocProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setDocProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setDocStep("result"), 300);
      }
    }, 30);
  }, []);

  /* ===============================
     (기존 UI 유지용) 보안 타이머/채팅 데이터
     - UI 안 흔들리게 원래 구조 유지
  ================================ */
  const [securityTimer, setSecurityTimer] = useState(86400);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecurityTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback((s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m ${s % 60}s`;
  }, []);

  // (사용 안 해도 mock import 유지해도 됨. UI 영향 없음)
  const [messages] = useState(CHAT_HISTORY);
  const chatEndRef = useRef(null);

  return (
    <div className="flex bg-[#f3f4f6] min-h-screen font-sans selection:bg-blue-100 text-gray-900">
      {/* 전역 스타일 (원래 UI 유지) */}
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        body { font-family: 'Pretendard', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-up { animation: fade-in 0.4s ease-out; }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
      />

      <div className="flex-1 ml-[260px]">
        {/* Header (원래 UI 유지) */}
        <header className="bg-white/80 backdrop-blur-xl h-20 border-b border-gray-200/50 flex items-center justify-between px-8 sticky top-0 z-40 transition-all duration-300">
          <div className="font-bold text-gray-700 text-lg flex items-center gap-2">
            <span className="text-gray-400 font-normal">Dashboard /</span>
            {currentView === "dashboard" && "Overview"}
            {currentView === "diagnosis" && "Regulation Diagnosis"}
            {currentView === "docs" && "Document Generation"}
            {currentView === "labs" && "Lab Matching"}
            {currentView === "settings" && "Settings & Admin"}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wide">SYSTEM STABLE</span>
            </div>

            <div className="w-9 h-9 bg-gradient-to-tr from-gray-100 to-gray-200 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold shadow-sm cursor-pointer hover:ring-4 hover:ring-gray-100 transition-all">
              KD
            </div>
          </div>
        </header>

        {/* Main (원래 UI 유지) */}
        <main className="animate-fade-in pb-10 custom-scrollbar">
          {currentView === "dashboard" && (
            <DashboardView
              uploadedFiles={uploadedFiles}
              repositoryFiles={repositoryFiles}
              onUploadToSlot={uploadToSlot}
              remediationByMarket={dashboardRemediationByMarket}
              // ✅ DashboardView도 내부 탭이 EU/US로 바뀌어야 함(다음 단계에서 파일 수정)
              markets={MARKETS}
            />
          )}

          {currentView === "diagnosis" && (
            <DiagnosisView
              targetCountry={targetCountry}
              setTargetCountry={(c) => {
                const next = safeCountry(c);
                setCurrentProject((p) => (p ? { ...p, country: next } : p));
                // 분석/결과 초기화
                setAnalysisComplete(false);
              }}
              analysisComplete={analysisComplete}
              isAnalyzing={isAnalyzing}
              progress={progress}
              startAnalysis={startAnalysis}
              setAnalysisComplete={setAnalysisComplete}
              repositoryFiles={repositoryFiles}
              markets={MARKETS}
              onPublishActionItems={(market, items) => {
                const m = safeCountry(market);
                setDashboardRemediationByMarket((prev) => ({
                  ...prev,
                  [m]: items,
                }));
              }}
            />
          )}

          {currentView === "docs" && (
            <DocsView
              targetCountry={targetCountry}
              setTargetCountry={(c) => {
                const next = safeCountry(c);
                setCurrentProject((p) => (p ? { ...p, country: next } : p));
                resetDocProcess();
              }}
              securityTimer={securityTimer}
              formatTime={formatTime}
              docStep={docStep}
              docProgress={docProgress}
              startDocGeneration={startDocGeneration}
              resetDocProcess={resetDocProcess}
              changeDocOnly={changeDocOnly}
              uploadedFiles={uploadedFiles}
              handleFileUpload={handleFileUpload}
              handleRemoveFile={handleRemoveFile}
              repositoryFiles={repositoryFiles}
              markets={MARKETS}
            />
          )}

          {currentView === "labs" && (
            <LabsView
              targetCountry={targetCountry}
              setTargetCountry={(c) => {
                const next = safeCountry(c);
                setCurrentProject((p) => (p ? { ...p, country: next } : p));
              }}
              repositoryFiles={repositoryFiles}
              markets={MARKETS}
            />
          )}

          {currentView === "settings" && <SettingsPage />}
        
        </main>
      </div>

      {/* ✅ 새 챗봇(드래그/최소화/확대/상태기반) */}
      <ChatbotWidget
        currentView={currentView}
        targetCountry={targetCountry}
        uploadedFiles={uploadedFiles}
        repositoryFiles={repositoryFiles}
        dashboardRemediationByMarket={dashboardRemediationByMarket}
        messages={messages}
        chatEndRef={chatEndRef}
      />
    </div>
  );
}
