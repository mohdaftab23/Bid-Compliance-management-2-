import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, Shield, AlertTriangle, FileText, Check } from 'lucide-react';
import { Tender, Bidder } from '../types';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  tender: Tender;
  bidders: Bidder[];
  currentBidderIndex: number;
  stageName: string;
  stageDetail: string;
  currentStageIndex: number;
  totalStages: number;
  onComplete: () => void;
}

const STAGES = [
  'STAGE 1 — TENDER UNDERSTANDING: Extracting mandatory conditions, technical specs, & evaluation weights',
  'STAGE 2 — BIDDER EXTRACTION: Parsing corporate identity, certifications, past contracts & financials',
  'STAGE 3 — ELIGIBILITY / COMPLIANCE: Validating hard criteria (PASS / FAIL / PARTIAL / UNKNOWN)',
  'STAGE 4 — TECHNICAL EVALUATION: Assessing methodology, telemetry protocols, and SLA feasibility',
  'STAGE 5 — PAST PERFORMANCE: Cross-checking verified completion certificates vs self-declared claims',
  'STAGE 6 — FINANCIAL EVALUATION: Calculating audited turnover, liquidity ratio, & solvency fit',
  'STAGE 7 — DOCUMENT CONSISTENCY: Detecting cross-document contradictions & flagged anomalies',
  'STAGE 8 — SCORING & EXPLAINABILITY: Generating evidence-backed score (0-100) and AI confidence index'
];

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  tender,
  bidders,
  currentBidderIndex,
  stageName,
  stageDetail,
  currentStageIndex,
  totalStages = 8,
}) => {
  if (!isOpen || !tender) return null;

  const currentBidder = bidders[currentBidderIndex] || (bidders && bidders[0]) || null;
  const progressPct = Math.round(((currentStageIndex + 1) / totalStages) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">AI Due-Diligence Engine Running</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                  Strict Evidence Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">{tender.title} ({tender.referenceNumber})</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-mono">Evaluating Bidder</span>
            <div className="text-xs font-semibold text-slate-200">
              {currentBidderIndex + 1} of {bidders.length}: {currentBidder?.companyName || 'Candidate'}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Active Stage Callout Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-400 uppercase tracking-wider">{stageName || 'INITIALIZING PIPELINE'}</span>
              <span className="font-mono text-slate-400">{progressPct}% Complete</span>
            </div>
            <p className="text-sm text-slate-200 font-medium leading-relaxed">{stageDetail || 'Loading tender requirements and documents...'}</p>

            {/* Live Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>

          {/* Sequential Stage Timeline */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {STAGES.map((s, idx) => {
              const isDone = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isPending = idx > currentStageIndex;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-2.5 rounded-lg text-xs transition-colors ${
                    isCurrent
                      ? 'bg-blue-950/60 border border-blue-800/80 text-blue-200'
                      : isDone
                      ? 'text-slate-300 bg-slate-950/40 border border-slate-800/40'
                      : 'text-slate-500 bg-slate-900/30'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-700 inline-block text-[10px] text-center leading-4 text-slate-500">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`font-medium ${isCurrent ? 'text-white' : ''}`}>{s}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Anti-Hallucination & Legal Mandate Banner */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Anti-Hallucination Active: Verifying documentary references & classifying confidence</span>
            </div>
            <span className="text-emerald-400 text-[10px] font-mono">STRICT GROUNDING</span>
          </div>
        </div>
      </div>
    </div>
  );
};
