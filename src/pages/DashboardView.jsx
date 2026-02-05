// src/pages/DashboardView.jsx
import React, { memo, useMemo, useState } from "react";
import {
  Wrench,
  CheckCircle,
  Loader2,
  AlertCircle,
  ClipboardList,
} from "lucide-react";

import RepositoryView from "../components/RepositoryView";
import { DOC_PROCESS_CONFIG } from "../data/mock";

const DashboardView = memo(function DashboardView({
  projectName,
  uploadedFiles = {},
  repositoryFiles = [],
  onUploadToSlot,
  onRemoveRepositoryFile,

  /** ⭐ App.jsx에서 내려줌 (["EU","US"]) */
  markets = ["EU", "US"],

  /** ⭐ { EU: [], US: [] } */
  remediationByMarket = {},
}) {
  const [activeRemediationTab, setActiveRemediationTab] = useState(markets[0]);
  const [activeSubmissionTab, setActiveSubmissionTab] = useState(markets[0]);

  /** =========================
   *  제출 서류 체크리스트
   * ========================= */
  const docConfig = DOC_PROCESS_CONFIG[activeSubmissionTab];
  const submissionItems = useMemo(() => {
    if (!docConfig) return [];
    return [
      ...docConfig.technicalInputs.map((item) => ({
        ...item,
        category: "Technical",
      })),
      ...(docConfig.adminInputs
        ? docConfig.adminInputs.map((item) => ({
            ...item,
            category: "Admin",
          }))
        : []),
    ];
  }, [docConfig]);

  /** =========================
   *  규제 진단 Action Items
   * ========================= */
  const remediationItems = remediationByMarket?.[activeRemediationTab] || [];

  const remediationProgress = useMemo(() => {
    if (!remediationItems.length) return 0;
    const done = remediationItems.filter((i) => i.status === "done").length;
    return Math.round((done / remediationItems.length) * 100) || 0;
  }, [remediationItems]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto h-full flex flex-col gap-6 font-sans animate-fade-in">
      {/* Greeting */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            안녕하세요, 김대동님 👋
          </h1>
          <p className="text-gray-500 text-sm font-medium">
  {projectName ? (
    <>
      진행 중인{" "}
      <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg">
        {projectName}
      </span>{" "}
      인증 현황입니다.
    </>
  ) : (
    <>진행 중인 프로젝트를 생성해주세요.</>
  )}
</p>

        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 ㅣlg:h-[520px]">
        {/* =========================
            규제 진단 조치율
        ========================= */}
        <div className="w-full lg:w-1/2 bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:h-[520px]">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {markets.map((key) => (
              <button
                key={key}
                onClick={() => setActiveRemediationTab(key)}
                className={`flex-1 py-5 text-sm font-bold transition-all relative ${
                  activeRemediationTab === key
                    ? "text-blue-600 bg-white"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                {key === "EU" && "유럽 (CE)"}
                {key === "US" && "미국 (NRTL / FCC)"}
                {activeRemediationTab === key && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-1 overflow-hidden">
            {/* Progress */}
            <div className="flex flex-col md:flex-row gap-6 mb-6 items-center">
              <div className="flex-1 w-full">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Wrench size={20} className="text-blue-500" />
                      설계 적합성 검증 진행도
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      규제 진단 후{" "}
                      <span className="font-bold text-blue-600">
                        개선 필요 항목
                      </span>{" "}
                      이행률
                    </p>
                  </div>
                  <span className="text-3xl font-black text-blue-600">
                    {remediationProgress}%
                  </span>
                </div>

                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${remediationProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center min-w-[90px]">
                  <div className="text-[10px] text-gray-500 font-bold mb-1">
                    조치 필요
                  </div>
                  <div className="text-base font-black text-blue-600">
                    {remediationItems.filter((i) => i.status !== "done").length}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center min-w-[90px]">
                  <div className="text-[10px] text-gray-500 font-bold mb-1">
                    조치 완료
                  </div>
                  <div className="text-base font-black text-blue-600">
                    {remediationItems.filter((i) => i.status === "done").length}
                  </div>
                </div>
              </div>
            </div>

            {/* =========================
                Action Items (고정 높이 + 내부 스크롤)
            ========================= */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <AlertCircle size={18} className="text-gray-400" />
                규제 진단 보완 사항 (Action Items)
              </h3>

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-gray-200 rounded">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 text-[10px] font-bold text-gray-500 border-b w-20 text-center">
                        우선순위
                      </th>
                      <th className="p-3 text-[10px] font-bold text-gray-500 border-b w-20 text-center">
                        유형
                      </th>
                      <th className="p-3 text-[10px] font-bold text-gray-500 border-b">
                        조치 내용
                      </th>
                      <th className="p-3 text-[10px] font-bold text-gray-500 border-b w-24 text-center">
                        상태
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {remediationItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-10 text-center text-gray-400 text-sm"
                        >
                          아직 규제진단 결과가 없습니다.
                          <br />
                          <span className="text-xs">
                            규제진단을 실행하면 FAIL 항목이 표시됩니다.
                          </span>
                        </td>
                      </tr>
                    ) : (
                      remediationItems.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="p-3 text-center">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                item.priority === "High" ||
                                item.priority === "Critical"
                                  ? "bg-red-50 text-red-600 border-red-100"
                                  : item.priority === "Medium"
                                  ? "bg-orange-50 text-orange-600 border-orange-100"
                                  : "bg-gray-50 text-gray-500 border-gray-100"
                              }`}
                            >
                              {item.priority}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {item.type}
                            </span>
                          </td>

                          <td className="p-3 text-xs font-bold text-gray-700">
                            {item.task}
                          </td>

                          <td className="p-3 text-center">
                            {item.status === "done" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                <CheckCircle size={10} /> 완료
                              </span>
                            )}
                            {item.status === "in_progress" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                <Loader2 size={10} className="animate-spin" />
                                진행중
                              </span>
                            )}
                            {item.status === "pending" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                대기
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            해외 제출 필수 서류
        ========================= */}
        <div className="w-full lg:w-1/2 bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:h-[520px]">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <ClipboardList size={20} className="text-blue-500" />
              해외 제출 필수 서류
            </h3>

            <div className="flex bg-gray-200/50 p-1 rounded-lg">
              {markets.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveSubmissionTab(key)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    activeSubmissionTab === key
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            <table className="w-full text-left">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 border-b">
                    구분
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-500 border-b">
                    서류명
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-500 border-b text-center">
                    준비 여부
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {submissionItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded border ${
                          item.category === "Technical"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-slate-50 text-slate-600 border-slate-100"
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="text-sm font-bold text-gray-700">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[260px]">
                        {item.desc}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {uploadedFiles[item.id] ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle size={12} /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Not Uploaded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================
          Repository (하단) - 여기서 "프로젝트 자산" 업로드/체크리스트 처리
      ========================= */}
      <RepositoryView
        files={repositoryFiles}
        onUploadToSlot={onUploadToSlot}
        onRemoveFile={onRemoveRepositoryFile} 
        heightClass="h-[calc(100vh-240px)] min-h-[780px]"
        enableExpand={true}
        markets={markets}
      />
    </div>
  );
});

export default DashboardView;
