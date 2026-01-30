// src/components/Sidebar.jsx
import React, { memo } from "react";
import {
  LayoutDashboard,
  Shield,
  MapPin,
  FileText,
  Settings,
  ChevronDown,
  Plus,
} from "lucide-react";

import { PROJECTS } from "../data/mock.js";

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

const Sidebar = memo(function Sidebar({
  currentView,
  setCurrentView,
  currentProject,
  setCurrentProject,
}) {
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
        <div className="relative group">
          <button className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-3 transition-colors">
            <div className="text-left min-w-0">
              <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">
                Current Project
              </div>
              <div className="text-sm font-bold text-gray-800 truncate w-40">
                {currentProject?.name || "프로젝트 선택"}
              </div>
            </div>
            <ChevronDown size={16} className="text-gray-400 shrink-0" />
          </button>

          <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-2 p-1 hidden group-hover:block z-50">
            {PROJECTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setCurrentProject(p)}
                className={`w-full text-left p-2 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-between ${
                  currentProject?.id === p.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                <span className="truncate">{p.name}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    p.country === "EU"
                      ? "bg-blue-100 text-blue-600"
                      : p.country === "US"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {p.country}
                </span>
              </button>
            ))}

            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                type="button"
                className="w-full text-left p-2 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                onClick={() => alert("새 프로젝트 추가 (프로토타입)")}
              >
                <Plus size={14} /> 새 프로젝트 추가
              </button>
            </div>
          </div>
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
            onClick={() => setCurrentView("dashboard")}
          />
        </div>

        <div>
          <SectionHeader>Agents</SectionHeader>
          <NavItem
            icon={<Shield />}
            label="규제 진단"
            desc="설계 적합성 자동 분석"
            active={currentView === "diagnosis"}
            onClick={() => setCurrentView("diagnosis")}
          />
          <NavItem
            icon={<MapPin />}
            label="국내 인증기관 매칭"
            desc="최적 시험소 추천"
            active={currentView === "labs"}
            onClick={() => setCurrentView("labs")}
          />
          <NavItem
            icon={<FileText />}
            label="해외 제출 서류 생성"
            desc="TCF 및 DoC 자동 작성"
            active={currentView === "docs"}
            onClick={() => setCurrentView("docs")}
          />
        </div>

        <div>
          <SectionHeader>System</SectionHeader>
          <NavItem
            icon={<Settings />}
            label="설정"
            desc="보안 및 환경설정"
            active={currentView === "settings"}
            onClick={() => setCurrentView("settings")}
          />
        </div>
      </nav>
    </div>
  );
});

export default Sidebar;
