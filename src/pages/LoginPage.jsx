// src/pages/LoginPage.jsx
import React, { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-8">
        <h1 className="text-2xl font-black text-gray-900">ROPORT 로그인</h1>
        <p className="text-sm text-gray-500 mt-2">
          
        </p>

        <div className="mt-6 space-y-3">
          <div>
            <div className="text-xs font-bold text-gray-500 mb-1">아이디</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
              placeholder="kt0203"
            />
          </div>

          <div>
            <div className="text-xs font-bold text-gray-500 mb-1">비밀번호</div>
            <input
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={() => onLogin?.()}
            className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-sm"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}
