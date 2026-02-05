// src/components/RepositoryView.jsx
import React, { memo, useMemo, useRef, useState } from "react";
import {
  UploadCloud,
  Database,
  ClipboardList,
  X,
  CheckCircle2,
  Download,
} from "lucide-react";

/** =========================
 * ✅ 고정 체크/매칭 대상 10개 (EU만)
 * - 이 10개만 "업로드율(진행률)" 계산
 * - 이 10개만 체크리스트에 표시
 * ========================= */
const FIXED_DOCS_EU = [
  "RT100 트랙터 CAD",
  "RT100 트랙터 BOM",
  "RT100 제품사양서",
  "RT100 회로도/블록도",
  "RT 100 시험계획서",
  "RT100 사용자 매뉴얼",
  "자율주행 트랙터 시험성적서",
  "유럽대리인계약서",
  "RT100 EHSR 체크리스트",
  "RT 100 위험성 평가서 기초자료 (ISO 12100)",
];

/** 파일명 정규화 (확장자 제거 + 공백 정리) */
function normalizeName(s = "") {
  return String(s)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "") // 확장자 제거
    .replace(/[_\-]+/g, " ")
    .replace(/[^\w\s가-힣]/g, " ") // 한글 포함
    .replace(/\s+/g, " ")
    .trim();
}

/** bytes -> human */
function humanSize(bytes = 0) {
  const b = Number(bytes) || 0;
  if (b < 1024) return `${b} B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

/** files props를 표기용으로 정리 */
function normalizeFiles(files) {
  const arr = Array.isArray(files) ? files : [];
  return arr
    .map((f, idx) => {
      if (!f) return null;
      const name = f.name || f.filename || f.originalName || `file-${idx}`;
      const size = f.size ?? f.bytes ?? 0;

      return {
        id: f.id || `${name}-${idx}`,
        name,
        size,
        raw: f,
      };
    })
    .filter(Boolean);
}

const RepositoryView = memo(function RepositoryView({
  mode = "default",
  files = [],
  onUploadToSlot,
  onRemoveFile,
  onPickFile,
  onClose,
  onDownloadFile, // ✅ 추가 (없으면 alert로 대체)
  heightClass = "h-[760px]",
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);

  const rows = useMemo(() => normalizeFiles(files), [files]);
  const uploadedNames = useMemo(() => rows.map((r) => r.name), [rows]);

  /** ✅ 10개 고정 문서 Set */
  const requiredSet = useMemo(
    () => new Set(FIXED_DOCS_EU.map(normalizeName)),
    []
  );

  /** ✅ 업로드된 파일 중, 10개 문서에 해당하는 것만 추림 */
  const uploadedAllowedNames = useMemo(() => {
    return uploadedNames.filter((name) => requiredSet.has(normalizeName(name)));
  }, [uploadedNames, requiredSet]);

  /** ✅ 체크리스트/진행률 계산 (EU 고정 10개 기준) */
  const checklist = useMemo(() => {
    const matchedMap = {}; // key: normalized required doc, value: original uploaded filename

    for (const up of uploadedAllowedNames) {
      const n = normalizeName(up);
      if (!matchedMap[n]) matchedMap[n] = up; // 첫 번째만 인정
    }

    const total = FIXED_DOCS_EU.length;
    const done = Object.keys(matchedMap).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    const list = FIXED_DOCS_EU.map((label) => {
      const key = normalizeName(label);
      return {
        id: key,
        label,
        hit: matchedMap[key] || null,
      };
    });

    return { list, matchedMap, total, done, percent };
  }, [uploadedAllowedNames]);

  /** ✅ 업로드 처리 */
  const handleFiles = (fileList) => {
    const list = Array.from(fileList || []);
    if (list.length === 0) return;

    if (typeof onUploadToSlot === "function") {
      list.forEach((f) => onUploadToSlot(f));
    }
  };

  /** ✅ “다운로드 버튼” 클릭 (UI만) */
  const handleDownload = (row) => {
    if (typeof onDownloadFile === "function") {
      onDownloadFile(row.raw);
      return;
    }
    // 실제 다운로드 기능은 없어도 된다고 했으니 UI 동작만
    alert(`다운로드(UI): ${row.name}`);
  };

  /** ✅ 드래그&드롭 */
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (!e.dataTransfer?.files?.length) return;
    handleFiles(e.dataTransfer.files);
  };

  const isPicker = mode === "picker";

  /** ✅ 체크리스트 모달 (EU만) */
  const ChecklistModal = checklistOpen ? (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/35"
        onClick={() => setChecklistOpen(false)}
      />
      <div className="relative w-[min(920px,92vw)] max-h-[84vh] bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/60 flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-black text-gray-900">
              문서 체크리스트 (EU)
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ✅ 아래 10개 문서명과 업로드 파일명이 (확장자 제외 / 공백 정리 후)
              정확히 일치할 때만 체크됩니다.
            </div>
          </div>
          <button
            onClick={() => setChecklistOpen(false)}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
            aria-label="close"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 pb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm font-black text-gray-800">업로드 진행률</div>

          <div className="min-w-[260px]">
            <div className="flex items-end justify-between mb-2">
              <div className="text-xs font-bold text-gray-600">진행</div>
              <div className="text-sm font-black text-blue-600">
                {checklist.done}/{checklist.total} ({checklist.percent}%)
              </div>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${checklist.percent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 overflow-y-auto custom-scrollbar max-h-[60vh]">
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-xs font-black text-gray-500 border-b w-[56px] text-center">
                    상태
                  </th>
                  <th className="p-4 text-xs font-black text-gray-500 border-b">
                    필요 문서
                  </th>
                  <th className="p-4 text-xs font-black text-gray-500 border-b">
                    매칭된 파일명
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {checklist.list.map((item) => {
                  const done = Boolean(item.hit);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="p-4 text-center">
                        {done ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50 border border-green-100">
                            <CheckCircle2
                              size={16}
                              className="text-green-600"
                            />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 border border-gray-200">
                            <span className="text-[10px] font-black text-gray-400">
                              —
                            </span>
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-black text-gray-800">
                          {item.label}
                        </div>
                      </td>
                      <td className="p-4">
                        {done ? (
                          <div className="text-xs font-bold text-gray-700">
                            {item.hit}
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-gray-400">
                            아직 매칭된 파일이 없습니다.
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-[11px] text-gray-500">
            * 미국(US) 체크리스트는 현재 제외되어 EU 10개 문서만 기준으로
            계산합니다.
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div
      className={`bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden flex flex-col ${heightClass}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
            <Database size={20} className="text-blue-500" />
            프로젝트 자산
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {isPicker
              ? "저장소에서 파일을 선택하세요."
              : "아래 영역에 드래그&드롭하거나, 오른쪽 상단 버튼으로 업로드하세요."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isPicker && (
            <button
              onClick={() => setChecklistOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition text-sm font-black text-gray-700"
            >
              <ClipboardList size={16} className="text-blue-600" />
              문서 체크리스트
            </button>
          )}

          {!isPicker && (
            <>
              <button
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm font-black text-white shadow-sm"
              >
                <UploadCloud size={16} />
                파일 업로드
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </>
          )}

          {isPicker && (
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition"
              aria-label="close"
              title="닫기"
            >
              <X size={18} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 min-h-0 overflow-hidden">
        {!isPicker ? (
          <div
            onDragEnter={() => setDragOver(true)}
            onDragLeave={() => setDragOver(false)}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={onDrop}
            className={`h-full rounded-3xl border transition overflow-hidden flex flex-col ${
              dragOver ? "border-blue-300 bg-blue-50/30" : "border-gray-200 bg-white"
            }`}
          >
            <div
              className={`px-5 py-4 border-b ${
                dragOver ? "border-blue-100" : "border-gray-100"
              }`}
            >
              <div className="text-sm font-black text-gray-800 flex items-center gap-2">
                <UploadCloud
                  size={16}
                  className={dragOver ? "text-blue-600" : "text-gray-500"}
                />
                {dragOver ? "여기에 놓으면 업로드됩니다" : "여기로 드래그&드롭 업로드"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                (또는 오른쪽 상단 “파일 업로드” 버튼)
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-xs font-black text-gray-500 border-b">
                      파일명
                    </th>
                    <th className="p-4 text-xs font-black text-gray-500 border-b w-[140px] text-right">
                      크기
                    </th>
                    {/* ✅ 프로젝트 자산(통합화면)에서만 다운로드 버튼 */}
                    <th className="p-4 text-xs font-black text-gray-500 border-b w-[88px] text-center">
                      다운로드
                    </th>
                    <th className="p-4 text-xs font-black text-gray-500 border-b w-[56px] text-center">
                      삭제
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-gray-400 text-sm">
                        아직 업로드된 파일이 없습니다.
                        <div className="text-xs mt-2">
                          이 박스에 드래그&드롭 해보세요.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/60">
                        <td className="p-4">
                          <div className="text-sm font-black text-gray-800">
                            {r.name}
                          </div>
                        </td>
                        <td className="p-4 text-right text-xs font-bold text-gray-600">
                          {humanSize(r.size)}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDownload(r)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
                            aria-label="download"
                            title="다운로드"
                          >
                            <Download size={16} className="text-gray-600" />
                          </button>
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => onRemoveFile?.(r.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
                            aria-label="remove"
                            title="삭제"
                          >
                            <X size={16} className="text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // picker 모드
          <div className="h-full rounded-3xl border border-gray-200 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-xs font-black text-gray-500 border-b">
                      파일명
                    </th>
                    <th className="p-4 text-xs font-black text-gray-500 border-b w-[140px] text-right">
                      크기
                    </th>
                    <th className="p-4 text-xs font-black text-gray-500 border-b w-[120px] text-center">
                      선택
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-10 text-center text-gray-400 text-sm">
                        저장소에 파일이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} className="hover:bg-blue-50/30">
                        <td className="p-4">
                          <div className="text-sm font-black text-gray-800">
                            {r.name}
                          </div>
                        </td>
                        <td className="p-4 text-right text-xs font-bold text-gray-600">
                          {humanSize(r.size)}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => onPickFile?.(r.raw)}
                            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black"
                          >
                            선택
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {ChecklistModal}
    </div>
  );
});

export default RepositoryView;
