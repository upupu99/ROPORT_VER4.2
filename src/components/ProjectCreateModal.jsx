// src/components/ProjectCreateModal.jsx
import React, { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";

export default function ProjectCreateModal({
  open,
  onClose,
  onCreate, // (projectName) => void
  defaultName = "",
}) {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (open) setName(defaultName || "");
  }, [open, defaultName]);

  if (!open) return null;

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate?.(trimmed);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[min(520px,92vw)] bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <div className="text-base font-black text-gray-900">새 프로젝트 추가</div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
            aria-label="close"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="p-5">
          <div className="text-xs font-bold text-gray-500 mb-2">프로젝트 이름</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예) 자율주행 트랙터 X1"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />

          <button
            onClick={submit}
            disabled={!name.trim()}
            className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black transition
              ${name.trim() ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
            `}
          >
            <Plus size={16} />
            생성하고 이동
          </button>

          <div className="mt-3 text-[11px] text-gray-500">
            * 프로토타입용: 실제 서버 저장 없이 “생성된 것처럼” 처리합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
