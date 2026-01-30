// src/pages/LabsView.jsx
import React, { memo, useMemo, useState, useCallback } from "react";
import {
  Building2,
  Upload,
  FileText,
  CheckCircle,
  X,
  Search,
  AlertCircle,
  RefreshCw,
  Wand2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import StatusSummaryWidget from "../components/StatusSummaryWidget";
import FileUploader from "../components/FileUploader";
import RepositoryView from "../components/RepositoryView";

const LabsView = memo(function LabsView({
  targetCountry,
  setTargetCountry,

  // ✅ App.jsx에서 내려주는 저장소 파일 목록
  repositoryFiles = [],
}) {
  const [labFiles, setLabFiles] = useState({});
  const [repoModalTarget, setRepoModalTarget] = useState(null);

  const [isMatching, setIsMatching] = useState(false);
  const [matchComplete, setMatchComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  // ✅ 매칭 결과 카드 리스트
  const [matchedLabs, setMatchedLabs] = useState([]);

  const REQUIRED_DOCS = [
    { id: "lab_spec", category: "필수", name: "제품사양서 (Product Spec)", desc: "제품 제원 및 상세 사양 (.pdf)" },
    { id: "lab_manual", category: "필수", name: "사용자 매뉴얼 (User Manual)", desc: "설치 및 작동 가이드 (.pdf)" },
    { id: "lab_circuit", category: "필수", name: "회로도/블록도 (Circuit/Block)", desc: "전기 회로도 및 시스템 블록도 (.pdf, .dwg)" },
    { id: "lab_bom", category: "필수", name: "부품리스트 (BOM)", desc: "핵심 부품 목록 (.xlsx)" },
    { id: "lab_testplan", category: "선택", name: "시험계획서 (Test Plan)", desc: "자체 시험 계획 및 요구사항 (.docx)" },
  ];

  // ✅ 자동 업로드 매핑: REQUIRED_DOCS.id -> repositoryFiles.slotId
  const AUTO_MAP = useMemo(
    () => ({
      lab_spec: "rt100_spec",
      lab_manual: "rt100_manual",
      lab_circuit: "rt100_circuit",
      lab_bom: "rt100_bom",
      lab_testplan: "rt100_test_plan",
    }),
    []
  );

  const uploadedCount = Object.keys(labFiles).length;
  const canStart = uploadedCount >= 3;

  const handleFileChange = (e, itemId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLabFiles((prev) => ({ ...prev, [itemId]: file }));
  };

  const handlePickFromRepo = (file) => {
    if (!repoModalTarget) return;
    setLabFiles((prev) => ({ ...prev, [repoModalTarget]: { name: file?.name ?? "selected_file", ...file } }));
    setRepoModalTarget(null);
  };

  const removeFile = (itemId) => {
    setLabFiles((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const reset = useCallback(() => {
    setLabFiles({});
    setIsMatching(false);
    setMatchComplete(false);
    setProgress(0);
    setMatchedLabs([]);
    setRepoModalTarget(null);
  }, []);

  const startMatching = () => {
    if (!canStart || isMatching) return;
    setIsMatching(true);
    setMatchComplete(false);
    setProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsMatching(false);
          setMatchComplete(true);

          // ✅ 데모 매칭 결과 (사진처럼 + 상세 "보유 인증" + AI 분석)
          setMatchedLabs([
            {
              name: "KTC 군포센터",
              distance: "10m",
              car: "15km",
              price: "1,500만원",
              period: "2.5개월",
              tags: ["KOLAS", "UL"],

              // ✅ 보유 인증(카드에 표시)
              accreditations: ["KOLAS 공인시험기관", "UL 시험 협력 네트워크", "EMC/안전 동시 수행"],

              // ✅ AI 분석(좀 더 구체적으로)
              ai: {
                summary: "일정 우선(Lead Time) + 해외 대응 경험이 필요할 때 1순위.",
                bullets: [
                  "EU/US 동시 준비를 전제로, 안전(전기/기계) + EMC 시험을 한 기관에서 묶어서 진행 가능(리드타임 단축).",
                  "제출 서류(사양서/매뉴얼/회로도) 기반으로 필요한 추가 자료(리스크 평가, EHSR/체크리스트) 템플릿 제공 가능.",
                  "과거 농기계/산업기계류 시험 경험 레퍼런스가 많아, 설계 변경(조치항목) 피드백이 빠른 편.",
                ],
                nextDocs: ["회로도 최신본(REV)", "EMC 시험 계획(없으면 템플릿 제공)", "사용자 매뉴얼 경고문(초안)"],
              },
            },
            {
              name: "KTL 전주본원",
              distance: "10m",
              car: "32km",
              price: "1,200만원",
              period: "3.0개월",
              tags: ["KOLAS", "CE"],

              accreditations: ["KOLAS 공인시험기관", "CE 대응 컨설팅 경험", "문서검토(기술문서) 지원"],

              ai: {
                summary: "비용/문서 완성도 중심(CE 문서 패키지까지 정리)로 가려면 적합.",
                bullets: [
                  "CE(기계/EMC) 대응에서 기술문서(TCF) 구성 검토 경험이 많아 서류 완성도에 유리.",
                  "비용대비 범위가 좋아 예산이 민감한 케이스에서 추천(단, 일정은 보수적으로 산정).",
                  "BOM/회로도 기반 부품 안전성(인증부품) 확인 프로세스가 체계적이라 리스크 줄이기 좋음.",
                ],
                nextDocs: ["BOM(제조사/모델명 포함)", "회로도/블록도", "적용 표준 리스트(초안)"],
              },
            },
            {
              name: "HCT (민간시험소)",
              distance: "3m",
              car: "20km",
              price: "1,800만원",
              period: "1.5개월",
              tags: ["KOLAS"],

              accreditations: ["KOLAS 공인시험", "민간(일정 유연)", "커스텀 시험 설계 가능"],

              ai: {
                summary: "가장 빠른 일정이 필요하거나, 커스텀 시험/현장 조건 반영이 필요할 때 선택.",
                bullets: [
                  "민간기관이라 시험 일정 조정이 유연하고 급행(패스트트랙) 옵션 협의 가능.",
                  "제품 특성(자율주행/전장/센서 구성)에 맞춘 커스텀 시험 설계(환경/내구/EMC 일부) 협의가 쉬움.",
                  "단가가 높을 수 있어, ‘기간 단축’의 가치가 큰 프로젝트에서 효율적.",
                ],
                nextDocs: ["시험 범위 우선순위(필수/선택)", "현장 환경조건(온도/습도/진동)", "센서/통신 모듈 스펙"],
              },
            },
          ]);
        }, 300);
      }
    }, 30);
  };

  // ✅ 파일저장소 자동 업로드 (저장소 슬롯이 있으면 자동 채움)
  const autoUploadFromRepo = useCallback(() => {
    const repoBySlot = new Map((repositoryFiles || []).map((r) => [r.slotId, r]));

    REQUIRED_DOCS.forEach((doc) => {
      if (labFiles?.[doc.id]) return; // 이미 업로드된 항목은 skip
      const slotId = AUTO_MAP[doc.id];
      if (!slotId) return;

      const hit = repoBySlot.get(slotId);
      if (!hit) return;

      setLabFiles((prev) => ({
        ...prev,
        [doc.id]: { name: hit.name, ...hit },
      }));
    });
  }, [repositoryFiles, labFiles, AUTO_MAP]);

  const headerTitle = useMemo(() => {
    if (targetCountry === "EU") return "국내 인증기관 매칭 (EU 대응)";
    if (targetCountry === "US") return "국내 인증기관 매칭 (US 대응)";
    if (targetCountry === "CN") return "국내 인증기관 매칭 (CN 대응)";
    return "국내 인증기관 매칭";
  }, [targetCountry]);

  return (
    <div className="p-8 pb-48 max-w-[1400px] mx-auto animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm border border-gray-100">
              <Building2 size={24} />
            </span>
            {headerTitle}
          </h1>
          <p className="text-gray-500 mt-2 ml-16 text-sm font-medium">
            제출 서류를 기반으로 적합한 국내 시험소/인증기관을 추천합니다.
          </p>

          {!matchComplete && !isMatching && (
            <div className="ml-16 mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={autoUploadFromRepo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 shadow-sm"
              >
                <Wand2 size={16} /> 파일저장소 자동 업로드
              </button>
              <span className="text-[10px] font-bold text-gray-500">(저장소 슬롯 기반 자동 채움)</span>
            </div>
          )}
        </div>

        <div className="bg-white p-1 rounded-xl flex border border-gray-200 shadow-sm">
          {["EU", "US"].map((code) => (
            <button
              key={code}
              onClick={() => {
                setTargetCountry(code);
                reset();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                targetCountry === code
                  ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {code === "EU" && "유럽"}
              {code === "US" && "미국"}
              
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-6">
        {!matchComplete && !isMatching && (
          <StatusSummaryWidget total={REQUIRED_DOCS.length} current={uploadedCount} label="제출 서류" />
        )}

        {/* Upload */}
        {!matchComplete && !isMatching && (
          <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-lg flex flex-col overflow-hidden">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">제출 서류 업로드</h2>
              <p className="text-gray-500">정확한 매칭을 위해 가능한 모든 문서를 등록해주세요.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 px-4">
              {REQUIRED_DOCS.map((item) => (
                <div
                  key={item.id}
                  className="p-5 border border-gray-100 rounded-xl bg-gray-50 hover:border-blue-200 transition-colors flex flex-col gap-2 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mb-1 ${
                          item.category === "필수" ? "text-red-600 bg-red-50" : "text-slate-600 bg-slate-100"
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-base font-bold text-gray-800 leading-tight group-hover:text-blue-700">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">{item.desc}</span>
                    </div>

                    {labFiles[item.id] ? (
                      <CheckCircle size={24} className="text-green-500 shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-200 shrink-0" />
                    )}
                  </div>

                  {labFiles[item.id] ? (
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 mt-2 shadow-sm">
                      <span className="text-xs text-gray-600 truncate flex-1 flex items-center gap-2">
                        <FileText size={14} className="text-blue-500" />
                        {labFiles[item.id].name}
                      </span>
                      <button onClick={() => removeFile(item.id)} className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <FileUploader
                      id={item.id}
                      onFileSelect={handleFileChange}
                      onRepoSelect={(id) => setRepoModalTarget(id)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={startMatching}
                disabled={!canStart}
                className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]
                  ${
                    canStart
                      ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-blue-200"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <Search size={20} /> 시험소 매칭 시작하기
              </button>

              {!canStart && (
                <div className="mt-3 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                  <AlertCircle size={14} />
                  최소 3개 이상의 문서를 업로드해야 매칭이 가능합니다.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analyzing */}
        {isMatching && (
          <div className="max-w-xl w-full mx-auto animate-fade-in">
            <div className="h-96 bg-white rounded-[2rem] border border-gray-100 shadow-xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
              <div className="w-24 h-24 relative mb-6">
                <svg className="animate-spin w-full h-full text-blue-100" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-100 text-blue-600"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-blue-600 text-xl">
                  {progress}%
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">매칭 분석 중</h3>
              <p className="text-sm text-gray-400 text-center leading-relaxed">
                제출 서류 기반으로 적합 시험소/인증기관 후보를 탐색 중입니다.
              </p>
            </div>
          </div>
        )}

        {/* Result */}
        {matchComplete && (
          <div className="space-y-4">
            {/* ✅ 매칭 완료 섹션: 그린 → 회색 */}
            <div className="bg-white rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle size={28} className="text-gray-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">매칭 완료</h3>
                  <div className="text-xs text-gray-600 font-semibold mt-1">
                    (데모) 적합 시험소 3곳을 추천했습니다. 아래에서 비교하세요.
                  </div>
                </div>
              </div>

              <button
                onClick={reset}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw size={16} /> 다시 매칭하기
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {matchedLabs.map((lab, idx) => (
                <div
                  key={idx}
                  className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4"
                >
                  {/* ✅ 카드 우상단: AI Best Match */}
                  {idx === 0 && (
                    <span className="absolute top-4 right-4 text-[10px] font-black px-2 py-1 rounded-full bg-blue-600 text-white shadow">
                      AI Best Match
                    </span>
                  )}

                  {/* Title */}
                  <div className="flex items-start justify-between pr-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{lab.name}</h4>
                      <div className="text-[11px] text-gray-400 mt-1">
                        {lab.distance} • Car {lab.car}
                      </div>
                    </div>
                  </div>

                  {/* Price/Period */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">예상 견적</div>
                    <div className="text-right font-bold text-gray-900">{lab.price}</div>
                    <div className="text-gray-500">소요 기간</div>
                    <div className="text-right font-bold text-gray-900">{lab.period}</div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {lab.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* ✅ 보유 인증 (더 구체적으로) */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={14} className="text-gray-600" />
                      <span className="text-[11px] font-black text-gray-700">보유 인증 / 역량</span>
                    </div>
                    <ul className="space-y-1">
                      {(lab.accreditations || []).map((a, i) => (
                        <li key={i} className="text-[11px] text-gray-600 leading-relaxed flex gap-2">
                          <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ✅ AI 분석 (구체적으로) */}
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-blue-600" />
                      <span className="text-[11px] font-black text-gray-800">AI 분석</span>
                    </div>

                    <div className="text-[11px] text-gray-700 font-bold mb-2">{lab.ai?.summary}</div>

                    <ul className="space-y-1.5 mb-3">
                      {(lab.ai?.bullets || []).map((b, i) => (
                        <li key={i} className="text-[11px] text-gray-600 leading-relaxed flex gap-2">
                          <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-blue-200 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    
                  </div>

                  {/* CTA */}
                  <button className="mt-1 w-full px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">
                    상담 예약하기
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ✅ Repository Picker Modal */}
      {repoModalTarget && (
        <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm p-6 flex items-center justify-center">
          <div className="w-[1100px] max-w-[95vw]">
            <RepositoryView
              mode="picker"
              files={repositoryFiles}
              targetSlotId={repoModalTarget}
              onPickFile={(file) => handlePickFromRepo(file)}
              onClose={() => setRepoModalTarget(null)}
              heightClass="h-[78vh]"
              enableExpand={false}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default LabsView;
