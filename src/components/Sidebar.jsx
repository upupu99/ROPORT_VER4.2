// src/components/Sidebar.jsx
import React, { memo, useMemo, useState } from "react";
import logo from "../assets/roprot 로고.png";
import {
  LayoutDashboard,
  Shield,
  MapPin,
  FileText,
  Settings,
  ChevronDown,
  Plus,
  Trash2,
  Pencil,
  Check,
} from "lucide-react";

const SectionHeader = memo(({ children }) => (
  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
    {children}
  </h3>
));

const NavItem = memo(({ icon, label, active, onClick, desc }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 rounded-2xl transition-all duration-200 group relative ${
      active
        ? "bg-white shadow-md shadow-gray-200 ring-1 ring-gray-100"
        : "hover:bg-gray-100/50"
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-xl transition-colors ${
          active
            ? "bg-blue-600 text-white shadow-blue-200"
            : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-gray-700"
        }`}
      >
        {React.cloneElement(icon, { size: 18 })}
      </div>

      <div className="min-w-0">
        <div
          className={`text-sm font-bold truncate ${
            active ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
          }`}
        >
          {label}
        </div>
        {desc && (
          <div className="text-[10px] text-gray-400 mt-0.5 font-medium leading-tight">
            {desc}
          </div>
        )}
      </div>
    </div>
  </button>
));

/**
 * ✅ 요구사항
 * - 설정(Settings)만 예외로 항상 접근 가능
 * - 그 외 메뉴 클릭 시:
 *    currentProject 없으면 -> App 전역 모달 띄우기(onRequireProject 호출)
 *    있으면 -> 정상 이동
 */
const Sidebar = memo(function Sidebar({
  currentView,
  setCurrentView,
  currentProject,
  setCurrentProject,

  projects = [],
  onDeleteProject,
  onOpenCreateProject,
  onRenameProject, // ✅ 추가

  onRequireProject,
}) {
  const hasProjects = (projects || []).length > 0;
  const [open, setOpen] = useState(false);

  // ✅ rename state
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const hasCurrentProject = Boolean(currentProject?.name);

  const currentLabel = useMemo(() => {
    if (currentProject?.name) return currentProject.name;
    return "프로젝트를 생성해주세요";
  }, [currentProject?.name]);

  const go = (viewKey) => {
    if (viewKey === "settings") {
      setCurrentView?.(viewKey);
      return;
    }
    if (!hasCurrentProject) {
      onRequireProject?.(viewKey);
      return;
    }
    setCurrentView?.(viewKey);
  };

  const startRename = (p) => {
    setRenamingId(p.id);
    setRenameValue(p.name || "");
  };

  const commitRename = (p) => {
    const next = String(renameValue || "").trim();
    if (next) onRenameProject?.(p.id, next);
    setRenamingId(null);
  };

  const cancelRename = () => {
    setRenamingId(null);
  };

  return (
    <div className="w-[260px] bg-white/60 backdrop-blur-xl h-screen flex flex-col fixed left-0 top-0 border-r border-gray-200 z-50">
      {/* Header / Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="mb-5 flex justify-center">
          <img
            src={logo}
            alt="ROPORT"
            className="h-15 w-full object-contain select-none"
            draggable={false}
          />
        </div>

        {/* Project selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-3 transition-colors"
          >
            <div className="text-left min-w-0">
              <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">
                Current Project
              </div>
              <div
                className={`text-sm font-bold truncate w-[190px] ${
                  hasCurrentProject ? "text-gray-800" : "text-gray-500"
                }`}
              >
                {currentLabel}
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 shrink-0 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-2 p-1 z-50">
              {/* Project list */}
              {hasProjects ? (
                <div className="max-h-[260px] overflow-y-auto custom-scrollbar">
                  {(projects || []).map((p) => {
                    const isCurrent = currentProject?.id === p.id;
                    const isRenaming = renamingId === p.id;

                    // ✅ "오너(현재)"만 파란 강조 / 나머지는 회색 고정 (hover도 회색만)
                    const rowClass = isCurrent
                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                      : "bg-white text-gray-700 border border-transparent hover:bg-gray-50";

                    return (
                      <div
                        key={p.id}
                        className={`w-full p-2 rounded-lg text-sm flex items-center justify-between gap-2 transition-colors ${rowClass}`}
                      >
                        {/* Left: label or rename input */}
                        <div className="flex-1 min-w-0">
                          {!isRenaming ? (
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentProject?.(p);
                                setOpen(false);
                              }}
                              className="w-full text-left truncate"
                              title={p.name}
                            >
                              <span className="font-bold">{p.name}</span>
                            </button>
                          ) : (
                            <input
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitRename(p);
                                if (e.key === "Escape") cancelRename();
                              }}
                              className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-100"
                              autoFocus
                            />
                          )}
                        </div>

                        {/* Right: actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Rename: 현재 프로젝트든 아니든 동일 동작.
                              (현재 프로젝트만 수정 허용하고 싶으면 isCurrent 체크 추가하면 됨) */}
                          {!isRenaming ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startRename(p);
                              }}
                              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                              title="프로젝트 이름 수정"
                            >
                              <Pencil size={14} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                commitRename(p);
                              }}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                              title="저장"
                            >
                              <Check size={14} />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProject?.(p.id);
                            }}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            title="프로젝트 삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-xs text-gray-500">
                  아직 생성된 프로젝트가 없습니다.
                </div>
              )}

              {/* Add new project */}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  type="button"
                  className="w-full text-left p-2 rounded-lg text-xs font-black text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                  onClick={() => {
                    onOpenCreateProject?.();
                    setOpen(false);
                  }}
                >
                  <Plus size={14} /> 새 프로젝트 생성
                </button>
              </div>
            </div>
          )}

          {/* click outside close */}
          {open && (
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => {
                setOpen(false);
                setRenamingId(null);
              }}
              aria-label="close project dropdown"
            />
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        <div>
          <SectionHeader>Main Menu</SectionHeader>
          <NavItem
            icon={<LayoutDashboard />}
            label="통합 현황"
            active={currentView === "dashboard"}
            onClick={() => go("dashboard")}
          />
        </div>

        <div>
          <SectionHeader>Agents</SectionHeader>
          <NavItem
            icon={<Shield />}
            label="설계 적합성 검증"
            desc="설계 적합성 자동 분석"
            active={currentView === "diagnosis"}
            onClick={() => go("diagnosis")}
          />
          <NavItem
            icon={<MapPin />}
            label="국내 인증기관 매칭"
            desc="최적 시험소 추천"
            active={currentView === "labs"}
            onClick={() => go("labs")}
          />
          <NavItem
            icon={<FileText />}
            label="해외 제출 서류 생성"
            desc="TCF 및 DoC 자동 작성"
            active={currentView === "docs"}
            onClick={() => go("docs")}
          />
        </div>

        <div>
          <SectionHeader>System</SectionHeader>
          <NavItem
            icon={<Settings />}
            label="설정"
            desc="보안 및 환경설정"
            active={currentView === "settings"}
            onClick={() => go("settings")}
          />
        </div>
      </nav>
    </div>
  );
});

export default Sidebar;
