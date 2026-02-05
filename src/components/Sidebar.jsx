// src/components/Sidebar.jsx
import React, { memo, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Shield,
  MapPin,
  FileText,
  Settings,
  ChevronDown,
  Plus,
  Trash2,
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

  onRequireProject, // ✅ App 전역 모달 트리거 (viewKey 전달)
}) {
  const hasProjects = (projects || []).length > 0;
  const [open, setOpen] = useState(false);

  const hasCurrentProject = Boolean(currentProject?.name);

  const currentLabel = useMemo(() => {
    if (currentProject?.name) return currentProject.name;
    return "프로젝트를 생성해주세요";
  }, [currentProject?.name]);

  const go = (viewKey) => {
    // ✅ 설정은 예외
    if (viewKey === "settings") {
      setCurrentView?.(viewKey);
      return;
    }

    // ✅ 프로젝트 없으면 App 전역 모달
    if (!hasCurrentProject) {
      onRequireProject?.(viewKey);
      return;
    }

    setCurrentView?.(viewKey);
  };

  return (
    <div className="w-[260px] bg-white/60 backdrop-blur-xl h-screen flex flex-col fixed left-0 top-0 border-r border-gray-200 z-50">
      {/* Header / Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100 relative">
            <img
              src="https://static.toss.im/png-icons/securities/icn-sec-fill-000490.png"
              alt="ROPORT Logo"
              className="w-full h-full object-cover scale-[1.5]"
            />
          </div>

          <div>
            <span className="text-base font-bold text-gray-900 tracking-tight block">
              ROPORT
            </span>
            <span className="text-[10px] font-semibold text-gray-400 tracking-wide">
              GLOBAL CERTIFICATION
            </span>
          </div>
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
                  {(projects || []).map((p) => (
                    <div
                      key={p.id}
                      className={`w-full p-2 rounded-lg text-sm flex items-center justify-between gap-2 ${
                        currentProject?.id === p.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentProject?.(p);
                          setOpen(false);
                        }}
                        className="flex-1 text-left truncate"
                        title={p.name}
                      >
                        <span className="font-bold">{p.name}</span>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteProject?.(p.id);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        title="프로젝트 삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
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
              onClick={() => setOpen(false)}
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
            onClick={() => go("settings")} // ✅ 예외
          />
        </div>
      </nav>
    </div>
  );
});

export default Sidebar;
