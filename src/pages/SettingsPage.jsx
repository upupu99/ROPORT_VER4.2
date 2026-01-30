// src/pages/SettingsPage.jsx
import React, { memo, useEffect, useMemo, useState } from "react";
import {
  Settings,
  ShieldCheck,
  BellRing,
  Lock,
  Key,
  Copy,
  Check,
  Trash2,
  History,
  User,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// Gemini Canvas 톤 맞춘 공통 UI 조각들
const SectionHeader = memo(({ children }) => (
  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
    {children}
  </h3>
));

const Badge = memo(({ tone = "gray", children }) => {
  const map = {
    gray: "bg-gray-100 text-gray-600 border-gray-200",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[tone]}`}>
      {children}
    </span>
  );
});

const Toggle = memo(({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`w-12 h-7 rounded-full border transition-all flex items-center px-1 ${
      value ? "bg-blue-600 border-blue-600 justify-end" : "bg-gray-100 border-gray-200 justify-start"
    }`}
    aria-label="toggle"
  >
    <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
  </button>
));

const SettingRow = memo(({ icon, title, desc, right, danger }) => (
  <div
    className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all ${
      danger
        ? "bg-red-50/30 border-red-100 hover:border-red-200"
        : "bg-white border-gray-200 hover:border-blue-200"
    }`}
  >
    <div className="flex gap-3 min-w-0">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
          danger ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
          {title}
          {danger && <Badge tone="red">주의</Badge>}
        </div>
        {desc && <div className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</div>}
      </div>
    </div>
    <div className="shrink-0">{right}</div>
  </div>
));

const MiniStat = memo(({ label, value, tone = "blue" }) => {
  const map = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    green: "bg-green-50 border-green-100 text-green-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };
  return (
    <div className={`p-4 rounded-2xl border ${map[tone]} min-w-[140px]`}>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-lg font-black mt-1">{value}</div>
    </div>
  );
});

const TabButton = memo(({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
      active ? "bg-white text-blue-600 shadow-sm ring-1 ring-blue-100" : "text-gray-400 hover:text-gray-600"
    }`}
  >
    {children}
  </button>
));

const Panel = memo(({ children }) => (
  <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-7">{children}</div>
  </div>
));

function maskKey(k) {
  if (!k) return "";
  const head = k.slice(0, 7);
  const tail = k.slice(-4);
  return `${head}${"*".repeat(20)}${tail}`;
}

const SettingsPage = memo(function SettingsPage() {
  // Tabs
  const [tab, setTab] = useState("security"); // security | notifications | account | system

  // State (demo)
  const [autoLogout, setAutoLogout] = useState(true);
  const [maskSensitive, setMaskSensitive] = useState(true);
  const [auditLog, setAuditLog] = useState(true);

  const [notifyUpload, setNotifyUpload] = useState(true);
  const [notifyDone, setNotifyDone] = useState(true);
  const [notifyWarnings, setNotifyWarnings] = useState(true);

  const [apiKey, setApiKey] = useState("sk-demo-2a9f5b7c-1234-5678-90ab-abcdef012345");
  const [copied, setCopied] = useState(false);

  const profile = useMemo(
    () => ({
      name: "김대동",
      role: "Admin",
      email: "demo@roport.ai",
      phone: "010-****-1234",
      lastLogin: "2026-01-29 10:12",
    }),
    []
  );

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleRotateKey = () => {
    const suffix = Math.random().toString(36).slice(2, 10);
    setApiKey(`sk-demo-${suffix}-1234-5678-90ab-abcdef012345`);
  };

  const handleClearCache = () => {
    alert("데모: 로컬 캐시 정리 완료(가정)");
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-fade-in h-full flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm border border-gray-100">
              <Settings size={24} />
            </span>
            설정 & 관리자
          </h1>
          <p className="text-gray-500 mt-2 ml-16 text-sm font-medium">
            시스템 보안/알림/계정/환경 설정을 관리합니다.
          </p>
        </div>

        {/* Tabs (Gemini 톤 그대로) */}
        <div className="bg-white p-1 rounded-xl flex border border-gray-200 shadow-sm">
          <TabButton active={tab === "security"} onClick={() => setTab("security")}>
            보안
          </TabButton>
          <TabButton active={tab === "notifications"} onClick={() => setTab("notifications")}>
            알림
          </TabButton>
          <TabButton active={tab === "account"} onClick={() => setTab("account")}>
            계정
          </TabButton>
          <TabButton active={tab === "system"} onClick={() => setTab("system")}>
            시스템
          </TabButton>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
        <MiniStat label="SECURITY MODE" value={autoLogout ? "ON" : "OFF"} tone={autoLogout ? "green" : "amber"} />
        <MiniStat label="AUDIT LOG" value={auditLog ? "Enabled" : "Disabled"} tone={auditLog ? "blue" : "gray"} />
        <MiniStat label="PROFILE" value={profile.role} tone="gray" />
      </div>

      {/* Panels */}
      {tab === "security" && (
        <Panel>
          <SectionHeader>Security Controls</SectionHeader>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <SettingRow
              icon={<Lock size={18} />}
              title="자동 로그아웃"
              desc="비활성 상태가 지속되면 세션을 종료합니다."
              right={<Toggle value={autoLogout} onChange={setAutoLogout} />}
            />
            <SettingRow
              icon={<ShieldCheck size={18} />}
              title="감사 로그(Audit Log)"
              desc="누가/언제/무엇을 했는지 기록합니다(데모)."
              right={<Toggle value={auditLog} onChange={setAuditLog} />}
            />
            <SettingRow
              icon={<Key size={18} />}
              title="민감정보 마스킹"
              desc="API Key/개인정보 등 일부 텍스트를 마스킹 표시합니다."
              right={<Toggle value={maskSensitive} onChange={setMaskSensitive} />}
            />

            {/* API Key Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Key size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">API Key</div>
                    <div className="text-xs text-gray-400 mt-0.5">데모 키 / 실제 서비스는 서버 저장</div>
                  </div>
                </div>
                <button
                  onClick={handleRotateKey}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  재발급(데모)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-xs text-gray-700 overflow-hidden">
                  {maskSensitive ? maskKey(apiKey) : apiKey}
                </div>
                <button
                  onClick={handleCopy}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                    copied
                      ? "bg-blue-50 border-blue-100 text-blue-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "복사됨" : "복사"}
                </button>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-sm">
                <div className="flex items-center gap-2 font-bold text-blue-700 mb-1">
                  <CheckCircle size={16} /> 권장
                </div>
                <div className="text-xs text-blue-700/80 leading-relaxed">
                
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {tab === "notifications" && (
        <Panel>
          <SectionHeader>Notification Preferences</SectionHeader>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <SettingRow
              icon={<BellRing size={18} />}
              title="업로드 알림"
              desc="파일 업로드/저장소 선택 시 알림"
              right={<Toggle value={notifyUpload} onChange={setNotifyUpload} />}
            />
            <SettingRow
              icon={<CheckCircle size={18} />}
              title="완료 알림"
              desc="진단/서류 생성/매칭 완료 시 알림"
              right={<Toggle value={notifyDone} onChange={setNotifyDone} />}
            />
            <SettingRow
              icon={<AlertTriangle size={18} />}
              title="경고 알림"
              desc="누락/실패/리스크 감지 시 알림"
              right={<Toggle value={notifyWarnings} onChange={setNotifyWarnings} />}
            />

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-900">채널</div>
                  <div className="text-xs text-gray-400 mt-0.5">현재는 인앱만 데모 제공</div>
                </div>
                <Badge tone="blue">In-App</Badge>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <Mail size={16} /> Email
                  </div>
                  <div className="text-xs text-gray-400 mt-1">추후 연동</div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <Smartphone size={16} /> SMS
                  </div>
                  <div className="text-xs text-gray-400 mt-1">추후 연동</div>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {tab === "account" && (
        <Panel>
          <SectionHeader>Account</SectionHeader>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <SettingRow
              icon={<User size={18} />}
              title="사용자"
              desc="프로필 표시 정보(데모)"
              right={<Badge tone="gray">{profile.role}</Badge>}
            />
            <SettingRow
              icon={<Mail size={18} />}
              title="이메일"
              desc={profile.email}
              right={<Badge tone="blue">Verified</Badge>}
            />
            <SettingRow
              icon={<Smartphone size={18} />}
              title="연락처"
              desc={profile.phone}
              right={<Badge tone="gray">Hidden</Badge>}
            />
            <SettingRow
              icon={<History size={18} />}
              title="최근 로그인"
              desc={profile.lastLogin}
              right={<span className="text-xs font-mono text-gray-500">KST</span>}
            />
          </div>
        </Panel>
      )}

      {tab === "system" && (
        <Panel>
          <SectionHeader>System</SectionHeader>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <SettingRow
              icon={<Trash2 size={18} />}
              title="로컬 캐시 정리"
              desc="임시 데이터/캐시를 정리합니다(데모)"
              right={
                <button
                  onClick={handleClearCache}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  정리
                </button>
              }
              danger
            />

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-gray-900">환경 정보</div>
                  <div className="text-xs text-gray-400 mt-0.5">프로토타입 런타임(데모)</div>
                </div>
                <Badge tone="green">SYSTEM STABLE</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Build</div>
                  <div className="text-sm font-black text-gray-800 mt-1">Vite + React</div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">UI</div>
                  <div className="text-sm font-black text-gray-800 mt-1">Tailwind</div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="text-xs font-bold text-blue-700 mb-1">추천</div>
                <div className="text-xs text-blue-700/80 leading-relaxed">
                  나중에 진짜 “제품급”으로 보이게 하려면, 여기서부터 “조직(Team)/권한(Role)/알림정책”을 실제 데이터랑 연결하면 됨.
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
});

export default SettingsPage;
