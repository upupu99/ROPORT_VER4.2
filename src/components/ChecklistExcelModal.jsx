import React, { useMemo } from "react";
import { X, FileSpreadsheet } from "lucide-react";

function pickReg(item, market) {
  // 1) US/EU/CN 직키
  const direct = item?.regulations?.[market];
  if (direct) {
    return {
      std: direct.std || "-",
      req: direct.req || "-",
      fail: "-",
      severity: direct.severity || direct.mark || "-",
    };
  }

  // 2) CAD 류 (EU_ISO_13854 등)
  const regs = item?.regulations || {};
  const keys = Object.keys(regs);
  const bestKey = keys.find((k) => k.toUpperCase().includes(market)) || keys[0];
  if (!bestKey) return { std: "-", req: "-", fail: "-", severity: "-" };

  const r = regs[bestKey];
  return {
    std: r.standard || "-",
    req: r.criteria || r.req || "-",
    fail: r.fail_condition || "-",
    severity: r.severity || "-",
  };
}

function s(v) {
  if (v == null) return "-";
  if (typeof v === "string") return v;
  try { return JSON.stringify(v); } catch { return String(v); }
}

export default function ChecklistExcelModal({
  open,
  onClose,
  schema,
  market = "EU",
  resultsById = {}, // { [id]: { status: "PASS"|"FAIL", reason: string, guide: string } }
}) {
  const rows = useMemo(() => {
    const cps = schema?.critical_checkpoints || [];
    const out = [];
    cps.forEach((g) => {
      (g.items || []).forEach((item) => {
        const reg = pickReg(item, market);
        const res = resultsById[item.id];
        out.push({
          group: g.group,
          id: item.id,
          name: item.name,
          source: item.source || "-",
          std: reg.std,
          req: reg.req,
          fail: reg.fail,
          severity: reg.severity,
          status: res?.status || "",
          reason: res?.reason || "",
          guide: res?.guide || "",
        });
      });
    });
    return out;
  }, [schema, market, resultsById]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[min(1300px,95vw)] h-[min(84vh,860px)] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-emerald-600" />
            <div className="font-extrabold text-gray-900">
              규제 체크리스트 (판단 기준)
              <span className="ml-2 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                {market}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
            aria-label="close"
          >
            <X size={16} className="text-gray-700" />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-gray-200">
                <th className="p-3 text-[11px] font-black text-gray-500 w-44">GROUP</th>
                <th className="p-3 text-[11px] font-black text-gray-500 w-28">ID</th>
                <th className="p-3 text-[11px] font-black text-gray-500">항목</th>
                <th className="p-3 text-[11px] font-black text-gray-500 w-24">SOURCE</th>
                <th className="p-3 text-[11px] font-black text-gray-500 w-64">표준/규격</th>
                <th className="p-3 text-[11px] font-black text-gray-500 w-64">요구사항/기준</th>
                <th className="p-3 text-[11px] font-black text-gray-500 w-64">FAIL 조건</th>
                <th className="p-3 text-[11px] font-black text-gray-500 w-28">Severity</th>
                <th className="p-3 text-[11px] font-black text-gray-500 w-20 text-center">O/X</th>
                <th className="p-3 text-[11px] font-black text-gray-500 w-[420px]">개선 가이드</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={r.status === "FAIL" ? "bg-red-50/40 hover:bg-red-50/60" : "hover:bg-emerald-50/30"}
                >
                  <td className="p-3 text-[11px] font-extrabold text-gray-600">{r.group}</td>
                  <td className="p-3 text-[11px] font-extrabold text-gray-900">{r.id}</td>
                  <td className="p-3 text-[12px] font-bold text-gray-900">{r.name}</td>
                  <td className="p-3 text-[11px] font-black text-gray-500">{r.source}</td>
                  <td className="p-3 text-[11px] text-gray-700">{s(r.std)}</td>
                  <td className="p-3 text-[11px] text-gray-700">{s(r.req)}</td>
                  <td className="p-3 text-[11px] text-gray-600">{s(r.fail)}</td>
                  <td className="p-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-700">
                      {String(r.severity)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {r.status === "PASS" && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-green-50 text-green-700 border border-green-100">
                        O
                      </span>
                    )}
                    {r.status === "FAIL" && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-100">
                        X
                      </span>
                    )}
                    {!r.status && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-400">
                        -
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[11px] text-gray-800">
                    {r.status === "FAIL" ? (
                      <div>
                        {r.reason && (
                          <div className="text-[10px] font-black text-red-700 mb-1">원인: {r.reason}</div>
                        )}
                        <div className="text-[11px]">{r.guide}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">(진단 후 FAIL 항목에 표시)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500 font-semibold">
            이 표는 “어떤 기준으로 판단하는지”를 보여주는 근거표입니다.
          </div>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-black hover:bg-black">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
