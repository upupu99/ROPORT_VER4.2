import React, { memo } from "react";
import { Monitor, FolderSearch } from "lucide-react";

const FileUploader = memo(function FileUploader({ id, onFileSelect, onRepoSelect }) {
  return (
    <div className="mt-2 flex gap-2 w-full">
      <label className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-500 hover:bg-white hover:border-blue-400 hover:text-blue-600 cursor-pointer transition-all bg-white/50">
        <Monitor size={14} /> 내 PC 업로드
        <input
          type="file"
          className="hidden"
          onChange={(e) => onFileSelect?.(e, id)}
        />
      </label>

      <button
        type="button"
        onClick={() => onRepoSelect?.(id)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-white hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-all bg-gray-50"
      >
        <FolderSearch size={14} /> 파일 저장소 선택
      </button>
    </div>
  );
});

export default FileUploader;
