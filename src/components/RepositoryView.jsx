// src/components/RepositoryView.jsx
import React, { memo, useMemo, useState } from "react";
import { Database, UploadCloud, CheckCircle2, Maximize2, X } from "lucide-react";

/**
 * RepositoryView
 *
 * mode:
 *  - "manage" (default): 저장소 관리 (내 PC 업로드/교체)
 *  - "picker": 저장소에 "이미 업로드된 파일(r.file)"을 선택해서 특정 슬롯(targetSlotId)에 꽂기
 *
 * props:
 *  - files: [{ id, name, type, slotId, file? }]
 *  - onUploadToSlot(slotId, file): 업로드 슬롯에 파일 꽂기 (기존 로직)
 *
 * picker mode only:
 *  - targetSlotId: picker에서 선택한 파일을 꽂을 슬롯 id
 *  - onPickFile(file): 선택한 저장소 파일을 부모가 어떻게 처리할지(보통 onUploadToSlot(targetSlotId, file))
 *  - onClose(): picker 모달 닫기
 */
const RepositoryView = memo(function RepositoryView({
  files = [],
  onUploadToSlot,

  // layout
  heightClass = "h-[760px]",
  enableExpand = true,

  // mode
  mode = "manage", // "manage" | "picker"

  // picker-only
  targetSlotId = null,
  onPickFile,
  onClose,
}) {
  const [expanded, setExpanded] = useState(false);
  const rows = useMemo(() => files || [], [files]);

  const isPicker = mode === "picker";

  const handlePick = (row) => {
    // picker에서는 저장소에 "이미 업로드된 파일"만 선택 가능
    if (!row?.file) return;

    // 1) picker 전용 콜백이 있으면 우선 사용
    if (onPickFile) {
      onPickFile(row.file, row);
      return;
    }

    // 2) 없으면 targetSlotId 기준으로 기존 onUploadToSlot에 꽂기
    if (!targetSlotId) return;
    onUploadToSlot?.(targetSlotId, row.file);
  };

  const TableContent = ({ heightClassOverride }) => (
    <div
      className={`bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden flex flex-col ${
        heightClassOverride || heightClass
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
            <Database size={20} className="text-blue-500" />
            {isPicker ? "파일 저장소에서 선택" : "파일 저장소 (RT100 기본 목록)"}
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            {isPicker
              ? "저장소에 업로드된 파일을 선택하여 해당 항목(슬롯)에 연결합니다."
              : "각 항목별로 내 PC에서 파일을 업로드하면 슬롯이 채워집니다."}
          </p>

          {isPicker && (
            <p className="text-[10px] text-gray-400 mt-2">
              대상 슬롯:{" "}
              <span className="font-black text-gray-700">
                {targetSlotId ? targetSlotId : "미지정(부모에서 targetSlotId 전달 필요)"}
              </span>
            </p>
          )}
        </div>

        {/* 우측 버튼 영역 */}
        <div className="flex items-center gap-2">
          {isPicker && (
            <button
              onClick={() => (onClose ? onClose() : setExpanded(false))}
              className="px-3 py-2 rounded-xl text-xs font-black bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <X size={16} /> 닫기
            </button>
          )}

          {enableExpand && !isPicker && (
            <button
              onClick={() => setExpanded(true)}
              className="px-3 py-2 rounded-xl text-xs font-black bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Maximize2 size={16} /> 확대
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 border-b">필수 파일명</th>
              <th className="p-4 text-xs font-bold text-gray-500 border-b w-24">유형</th>
              <th className="p-4 text-xs font-bold text-gray-500 border-b w-28 text-center">상태</th>

              {/* manage 모드: 업로드 / picker 모드: 선택 */}
              <th className="p-4 text-xs font-bold text-gray-500 border-b w-44 text-center">
                {isPicker ? "선택" : "업로드"}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400 text-sm">
                  저장소에 표시할 항목이 없습니다.
                  <div className="text-xs mt-1">files props가 비어있는지 확인하세요.</div>
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const filled = Boolean(r.file);

                return (
                  <tr key={r.id ?? `${r.name}-${r.slotId}`} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="text-sm font-black text-gray-800">{r.name}</div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {filled ? `업로드됨: ${r.file.name}` : "아직 업로드되지 않음"}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-gray-100 border border-gray-200">
                        {r.type}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      {filled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                          <CheckCircle2 size={14} /> 완료
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                          미등록
                        </span>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="p-4 text-center">
                      {/* picker 모드: 저장소 파일 선택 */}
                      {isPicker ? (
                        <button
                          type="button"
                          disabled={!filled || (!onPickFile && !targetSlotId)}
                          onClick={() => handlePick(r)}
                          className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-black border transition ${
                            filled && (onPickFile || targetSlotId)
                              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          }`}
                          title={
                            !filled
                              ? "저장소에 업로드된 파일이 있어야 선택할 수 있습니다."
                              : !onPickFile && !targetSlotId
                              ? "targetSlotId 또는 onPickFile이 필요합니다."
                              : "선택하여 해당 슬롯에 연결"
                          }
                        >
                          선택
                        </button>
                      ) : (
                        // manage 모드: 내 PC 업로드/교체 (기존 로직 유지)
                        <label
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black cursor-pointer border ${
                            filled
                              ? "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                              : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          <UploadCloud size={16} />
                          {filled ? "파일 교체" : "내 PC 업로드"}
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              // ✅ r.slotId가 실제 슬롯 id여야 함 (없으면 업로드가 안 됨)
                              onUploadToSlot?.(r.slotId, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom spacing */}
      <div className="h-16" />
    </div>
  );

  // picker 모드는 보통 "부모가 이미 모달로 띄워주는" 구조라 expanded 기능 불필요
  if (isPicker) return <TableContent />;

  if (!expanded) return <TableContent />;

  // expanded modal (manage 모드에서만)
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm p-6 flex items-center justify-center">
      <div className="w-[1100px] max-w-[95vw]">
        <div className="mb-3 flex justify-end">
          <button
            onClick={() => setExpanded(false)}
            className="px-3 py-2 rounded-xl text-xs font-black bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <X size={16} /> 닫기
          </button>
        </div>

        <TableContent heightClassOverride="h-[78vh]" />
      </div>
    </div>
  );
});

export default RepositoryView;
