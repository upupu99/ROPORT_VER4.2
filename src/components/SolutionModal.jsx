import React from "react";
import {
  X,
  BarChart2,
  Lightbulb,
  AlertTriangle,
  Briefcase,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

function ScoreBar({ label, score }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
        <span>{label}</span>
        <span>{score}점</span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${score}%`, transition: "width 1s ease-out" }}
        />
      </div>
    </div>
  );
}

export default function SolutionModal({ solution, onClose }) {
  if (!solution) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-0 overflow-hidden m-4">
        <div className="bg-blue-50 p-6 border-b border-blue-100 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm border border-blue-200">
              {solution.isLabAnalysis ? <BarChart2 size={24} /> : <Lightbulb size={24} />}
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                {solution.isLabAnalysis ? "Lab Analysis" : "AI Recommendation"}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-2">{solution.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-blue-100/50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Diagnosis / Score */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              {solution.isLabAnalysis ? (
                <>
                  <BarChart2 size={14} className="text-blue-400" /> Score Analysis
                </>
              ) : (
                <>
                  <AlertTriangle size={14} className="text-blue-400" /> Diagnosis (진단 내용)
                </>
              )}
            </h4>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              {solution.isLabAnalysis ? (
                <div className="space-y-4">
                  <ScoreBar label="설비 적합성 (Tech)" score={solution.scores?.tech ?? 0} />
                  <ScoreBar label="비용 효율성 (Cost)" score={solution.scores?.cost ?? 0} />
                  <ScoreBar label="기간 신속성 (Time)" score={solution.scores?.time ?? 0} />
                  <ScoreBar label="거리/접근성 (Dist)" score={solution.scores?.dist ?? 0} />
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-gray-700">현재 부품:</span>
                    <span className="text-blue-600 font-bold">{solution.currentPart}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-700">⚠️ 문제점:</span>
                    <span className="text-gray-600 text-right">{solution.issue}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Standard */}
          {!solution.isLabAnalysis && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase size={14} className="text-blue-400" /> Standard (규격 근거)
              </h4>
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-sm font-bold text-blue-700 flex items-center justify-center text-center">
                {solution.standard}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-blue-500" />{" "}
              {solution.isLabAnalysis ? "Reasoning" : "AI Solution"}
            </h4>

            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full blur-2xl opacity-20 -mr-10 -mt-10" />
              <p className="text-sm text-gray-800 leading-relaxed font-medium mb-3">
                💡 <span className="text-blue-800 font-bold">AI {solution.isLabAnalysis ? "분석" : "제안"}:</span>{" "}
                {solution.aiRecommendation}
              </p>

              {solution.isLabAnalysis && solution.link && (
                <button
                  onClick={() => window.open(solution.link, "_blank")}
                  className="w-full mt-2 bg-white text-blue-700 border border-blue-200 text-xs font-bold py-2.5 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <ExternalLink size={14} /> 시험소 사이트 이동
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
