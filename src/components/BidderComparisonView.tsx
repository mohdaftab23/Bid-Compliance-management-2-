import React from 'react';
import {
  Shield,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Building,
  Award,
  AlertOctagon,
  ChevronRight,
  Database,
  Layers
} from 'lucide-react';
import { Tender, Bidder, DueDiligenceReport } from '../types';

interface BidderComparisonViewProps {
  tender: Tender;
  bidders: Bidder[];
  reports: Record<string, DueDiligenceReport>;
  onSelectBidder: (bidder: Bidder) => void;
  onRunDueDiligence: () => void;
  onBackToDashboard: () => void;
}

export const BidderComparisonView: React.FC<BidderComparisonViewProps> = ({
  tender,
  bidders,
  reports,
  onSelectBidder,
  onRunDueDiligence,
  onBackToDashboard,
}) => {
  // Sort bidders by evaluated score descending
  const sortedBidders = [...bidders].sort((a, b) => {
    const scoreA = reports[a.id]?.overallScore ?? 0;
    const scoreB = reports[b.id]?.overallScore ?? 0;
    return scoreB - scoreA;
  });

  const topBidder = sortedBidders[0];
  const topReport = topBidder ? reports[topBidder.id] : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900 mb-1">
            <Shield className="w-4 h-4 text-blue-900" />
            <span>Tender Comparative Matrix &bull; {tender.referenceNumber}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{tender.title}</h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Side-by-side comparative analysis of compliance, engineering capacity, track record, financial solvency, and risk profiles across all received bids.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToDashboard}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-xs"
          >
            ← Dashboard
          </button>
          <button
            onClick={onRunDueDiligence}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Re-run AI Due Diligence</span>
          </button>
        </div>
      </div>

      {/* Mandatory Recommendation & Human Authority Statement */}
      <div className="p-4 rounded-lg bg-blue-50/80 border border-blue-200 text-xs text-slate-800 space-y-1.5 shadow-xs">
        <div className="flex items-center gap-2 text-blue-950 font-semibold text-sm">
          <Award className="w-4 h-4 text-blue-900" />
          <span>Preliminary Evaluation Finding (Advisory / Non-Binding)</span>
        </div>
        <p className="leading-relaxed">
          <strong>Lead Bidder Determination:</strong>{' '}
          <span className="font-semibold text-slate-900">
            "{topBidder?.companyName} received the highest evaluated score ({topReport?.overallScore}/100) among the analyzed submissions, subject to human verification and the procurement authority's applicable rules."
          </span>
        </p>
        <p className="text-[11px] text-slate-600">
          This system functions exclusively as a decision-support platform. The AI does not award contracts. Final procurement determinations strictly remain with the authorized human procurement committee.
        </p>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedBidders.map((b, index) => {
          const report = reports[b.id];
          const isHighest = index === 0 && (report?.overallScore || 0) > 0;
          const score = report?.overallScore ?? '--';
          const confidence = report?.aiConfidence ?? '--';
          const recommendation = report?.recommendation || 'PENDING';
          const passedEligibility = report?.eligibilityChecks ? report.eligibilityChecks.filter(c => c.status === 'PASS').length : 0;
          const totalEligibility = report?.eligibilityChecks?.length ?? 5;
          const hasGateFailure = report?.eligibilityChecks ? report.eligibilityChecks.some(c => c.status === 'FAIL') : false;
          const reviewStatus = report?.humanReview?.officerStatus || 'PENDING_REVIEW';
          const extVerif = report?.externalVerification;

          return (
            <div
              key={b.id}
              className={`bg-white rounded-lg border flex flex-col justify-between transition-all shadow-sm ${
                isHighest ? 'border-blue-900 ring-1 ring-blue-900/20' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className={`p-4 border-b ${isHighest ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-slate-600">Rank #{index + 1}</span>
                    {isHighest && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-white tracking-wide">
                        HIGHEST EVALUATED SCORE
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">{b.companyName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{b.businessCategory}</p>
                </div>

                {/* Big Score Block */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Evaluated Score</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">{score}</span>
                      <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block font-medium">AI Confidence</span>
                    <span className="text-base font-bold text-blue-900">{confidence}%</span>
                  </div>
                </div>

                {/* Status Badges & Gate */}
                <div className="p-4 border-b border-slate-100 space-y-2 text-xs bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Recommendation:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      recommendation === 'STRONG CANDIDATE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      recommendation === 'PROMISING CANDIDATE' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {recommendation}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Mandatory Gate:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      hasGateFailure ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {passedEligibility}/{totalEligibility} Passed
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">External Registry:</span>
                    {extVerif ? (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                        extVerif.status === 'VERIFIED' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        <Database className="w-3 h-3" />
                        {extVerif.status === 'VERIFIED' ? 'Verified Match' : 'Discrepancy'}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Unchecked</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Human Sign-off:</span>
                    {reviewStatus === 'REVIEWED_CONFIRMED' ? (
                      <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Signed Off
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold text-[11px] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Score Breakdown by Pillar */}
                <div className="p-4 space-y-2 text-xs">
                  <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                    Evaluation Pillars
                  </span>
                  {(report?.scoresByCategory || []).map((cat, cIdx) => (
                    <div key={cIdx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 truncate max-w-[150px]">{cat.category}</span>
                        <span className="font-semibold text-slate-900">{cat.awardedPoints}/{cat.maxPoints} pts</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cat.percentage >= 80 ? 'bg-emerald-600' :
                            cat.percentage >= 65 ? 'bg-blue-800' :
                            'bg-rose-600'
                          }`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => onSelectBidder(b)}
                  className="w-full py-2 px-3 rounded-md text-xs font-semibold bg-white hover:bg-slate-100 text-blue-900 border border-slate-300 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Open Full Due-Diligence Report</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Side-by-Side Verification Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Verification & Due-Diligence Attribute Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Cross-referenced attributes from Bidder Submissions vs Verified External Registries
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200">
            <Layers className="w-3.5 h-3.5" />
            3-Tier Provenance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-4 w-1/4">Evaluation Attribute</th>
                {sortedBidders.map(b => (
                  <th key={b.id} className="py-2.5 px-4 font-bold text-slate-900">
                    {b.companyName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-slate-800">Registration Number</td>
                {sortedBidders.map(b => (
                  <td key={b.id} className="py-3 px-4 font-mono text-slate-700">
                    {b.registrationNumber}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-slate-800">External Registry Status</td>
                {sortedBidders.map(b => {
                  const ext = reports[b.id]?.externalVerification;
                  return (
                    <td key={b.id} className="py-3 px-4">
                      {ext ? (
                        <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          ext.status === 'VERIFIED' ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          <Database className="w-3.5 h-3.5" />
                          {ext.status === 'VERIFIED' ? 'Active In Good Standing' : 'Operating Age Discrepancy'}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not verified</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-slate-800">Operating History (vs 5-Yr Gate)</td>
                {sortedBidders.map(b => (
                  <td key={b.id} className="py-3 px-4">
                    {2026 - b.yearEstablished >= 5 ? (
                      <span className="text-emerald-700 font-semibold">{2026 - b.yearEstablished} years (PASS)</span>
                    ) : (
                      <span className="text-rose-700 font-semibold">{2026 - b.yearEstablished} years (FAIL: &lt;5 yrs)</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-slate-800">ISO Certifications</td>
                {sortedBidders.map(b => (
                  <td key={b.id} className="py-3 px-4 text-slate-700">
                    {(b.certifications || []).map(c => `${c.name} (${c.status})`).join(', ') || 'None reported'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-slate-800">Bid Bond (10% Required)</td>
                {sortedBidders.map(b => {
                  const isAqua = b.id === 'b-aquatech';
                  const isHydro = b.id === 'b-hydrogrid';
                  return (
                    <td key={b.id} className="py-3 px-4">
                      {isAqua && <span className="text-emerald-700 font-semibold">JPMorgan Chase Surety ($420K) &bull; Verified</span>}
                      {isHydro && <span className="text-emerald-700 font-semibold">PNC Bank Guarantee ($420K) &bull; Verified</span>}
                      {!isAqua && !isHydro && <span className="text-rose-700 font-semibold">Informal credit letter (Non-compliant)</span>}
                    </td>
                  );
                })}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-slate-800">Past Municipal Projects</td>
                {sortedBidders.map(b => {
                  const projects = b.pastProjects || [];
                  const withCert = projects.filter(p => p.hasCompletionCertificate).length;
                  return (
                    <td key={b.id} className="py-3 px-4 text-slate-700">
                      {projects.length} projects recorded ({withCert} with signed completion certs)
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
