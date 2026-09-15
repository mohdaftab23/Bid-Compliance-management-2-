import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Users,
  Shield,
  Sliders,
  Calendar,
  DollarSign,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Plus,
  Database,
  RefreshCw,
  Info,
  Layers
} from 'lucide-react';
import { Tender, Bidder, DueDiligenceReport } from '../types';

interface TenderDetailsViewProps {
  tender: Tender;
  bidders: Bidder[];
  reports: Record<string, DueDiligenceReport>;
  onSelectBidder: (bidder: Bidder) => void;
  onRunDueDiligence: () => void;
  onOpenComparison: () => void;
  onUpdateWeights: (weights: Tender['evaluationWeights']) => void;
}

export const TenderDetailsView: React.FC<TenderDetailsViewProps> = ({
  tender,
  bidders,
  reports,
  onSelectBidder,
  onRunDueDiligence,
  onOpenComparison,
  onUpdateWeights,
}) => {
  const [activeTab, setActiveTab] = useState<'bidders' | 'requirements' | 'weights' | 'documents'>('bidders');
  const [weights, setWeights] = useState(tender.evaluationWeights);
  const [isSaved, setIsSaved] = useState(false);

  const totalWeight = (Object.values(weights) as number[]).reduce((a, b) => a + b, 0);

  const handleWeightChange = (key: keyof Tender['evaluationWeights'], value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, value))
    }));
  };

  const handleResetToDocument = () => {
    // Document defined weights (standard 20, 25, 20, 15, 10, 10)
    setWeights({
      eligibility: 20,
      technical: 25,
      pastPerformance: 20,
      financial: 15,
      proposalQuality: 10,
      riskProfile: 10
    });
  };

  const handleResetToDefault = () => {
    // Default weights
    setWeights({
      eligibility: 20,
      technical: 25,
      pastPerformance: 20,
      financial: 15,
      proposalQuality: 10,
      riskProfile: 10
    });
  };

  const handleSaveWeights = () => {
    onUpdateWeights(weights);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-900 border border-blue-200 font-semibold">
                {tender.referenceNumber}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {tender.status}
              </span>
              <span className="text-xs text-slate-500">Dept: {tender.department}</span>
              {tender.weightsSource === 'TENDER_DOCUMENT' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200">
                  Weights: Document Prioritized
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{tender.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenComparison}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 text-blue-900 border border-blue-200 transition-colors shadow-xs"
            >
              Side-by-Side Matrix
            </button>
            <button
              onClick={onRunDueDiligence}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Run AI Due Diligence</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">{tender.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-md border border-slate-200">
          <div>
            <span className="text-slate-500 block text-[11px]">Ceiling Budget</span>
            <span className="text-sm font-bold text-slate-900">{tender.budget}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Submission Deadline</span>
            <span className="text-sm font-bold text-slate-900">{tender.deadline}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Mandatory Hard Gates</span>
            <span className="text-sm font-bold text-slate-900">{tender.eligibilityRequirements?.length ?? 0} Criteria</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Bidders Received</span>
            <span className="text-sm font-bold text-emerald-800">{bidders?.length ?? 0} Submissions</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('bidders')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'bidders'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Submitted Bidders ({bidders?.length ?? 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('requirements')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'requirements'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Specifications ({(tender.eligibilityRequirements?.length ?? 0) + (tender.technicalRequirements?.length ?? 0)})</span>
        </button>
        <button
          onClick={() => setActiveTab('weights')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'weights'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Evaluation Weights ({totalWeight} pts)</span>
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'documents'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Tender Documents ({((tender.attachments?.length || tender.documents?.length) ?? 0)})</span>
        </button>
      </div>

      {/* TAB 1: BIDDERS TABLE */}
      {activeTab === 'bidders' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Submissions for Evaluation
            </span>
            <span className="text-xs text-slate-500">
              Ranked by AI Evaluated Score
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-4">Rank</th>
                  <th className="py-2.5 px-4">Company Name</th>
                  <th className="py-2.5 px-4">Registration & Source</th>
                  <th className="py-2.5 px-4">Hard Gates</th>
                  <th className="py-2.5 px-4 text-center">Score</th>
                  <th className="py-2.5 px-4">Recommendation</th>
                  <th className="py-2.5 px-4">Officer Review</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bidders.map((b, idx) => {
                  const report = reports[b.id];
                  const score = report?.overallScore ?? '--';
                  const rec = report?.recommendation ?? 'PENDING';
                  const passedReqs = report?.eligibilityChecks ? report.eligibilityChecks.filter((c) => c.status === 'PASS').length : 0;
                  const totalReqs = report?.eligibilityChecks?.length ?? 5;
                  const isFailed = report?.eligibilityChecks ? report.eligibilityChecks.some((c) => c.status === 'FAIL') : false;
                  const officerStatus = report?.humanReview?.officerStatus ?? 'PENDING_REVIEW';
                  const extVerif = report?.externalVerification;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">#{idx + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 text-sm block">{b.companyName}</span>
                        <span className="text-[11px] text-slate-500">{b.businessCategory}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-slate-700 block">{b.registrationNumber}</span>
                          {extVerif ? (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                              extVerif.status === 'VERIFIED' ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              <Database className="w-3 h-3" />
                              {extVerif.status === 'VERIFIED' ? 'Registry Matched' : 'Discrepancy Alert'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Self-declared</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          isFailed
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {passedReqs}/{totalReqs} Passed
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-base font-bold ${
                          typeof score === 'number' && score >= 80 ? 'text-emerald-700' :
                          typeof score === 'number' && score >= 70 ? 'text-blue-900' :
                          'text-rose-700'
                        }`}>
                          {score}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          rec === 'STRONG CANDIDATE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          rec === 'PROMISING CANDIDATE' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {rec}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {officerStatus === 'REVIEWED_CONFIRMED' ? (
                          <span className="text-emerald-800 flex items-center gap-1 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Signed Off
                          </span>
                        ) : (
                          <span className="text-amber-700 flex items-center gap-1 font-semibold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectBidder(b)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-700 font-semibold text-xs border border-slate-300 transition-colors"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REQUIREMENTS */}
      {activeTab === 'requirements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-700" />
                Mandatory Hard Eligibility Criteria (PASS / FAIL)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                Non-Negotiable
              </span>
            </div>
            <p className="text-xs text-slate-500">Bidders must satisfy 100% of hard criteria to pass responsiveness.</p>
            <ul className="space-y-2 text-xs">
              {(tender.eligibilityRequirements || []).map((req, i) => (
                <li key={i} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-800 flex items-start gap-2">
                  <span className="font-mono font-bold text-rose-700 shrink-0">{i + 1}.</span>
                  <span>{req}</span>
                </li>
              ))}
              {(!tender.eligibilityRequirements || tender.eligibilityRequirements.length === 0) && (
                <li className="p-3 text-slate-400 italic">No mandatory eligibility criteria specified.</li>
              )}
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-900" />
                Technical & Operational Specifications
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                Weighted
              </span>
            </div>
            <p className="text-xs text-slate-500">Evaluated on technical capability, engineering specs, and SLA guarantees.</p>
            <ul className="space-y-2 text-xs">
              {(tender.technicalRequirements || []).map((tech, i) => (
                <li key={i} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-800 flex items-start gap-2">
                  <span className="font-mono font-bold text-blue-900 shrink-0">{i + 1}.</span>
                  <span>{tech}</span>
                </li>
              ))}
              {(!tender.technicalRequirements || tender.technicalRequirements.length === 0) && (
                <li className="p-3 text-slate-400 italic">No technical specifications specified.</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURABLE WEIGHTS & DOCUMENT PRIORITIZATION */}
      {activeTab === 'weights' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-5">
          {/* Header & Source Notification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-900" />
                  Evaluation Scoring Weights Policy
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                  {tender.weightsSource === 'TENDER_DOCUMENT' ? 'Prioritized from Document' : 'Default Policy'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure points distribution across the 6 evaluation pillars. Sum must strictly equal 100 points.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-md border ${
                totalWeight === 100
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                Total: {totalWeight} / 100 pts
              </span>
            </div>
          </div>

          {/* Document Priority Notice */}
          {tender.weightsSource === 'TENDER_DOCUMENT' && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-900 font-semibold">
                <Info className="w-4 h-4 text-indigo-700" />
                <span>Document Prioritization Active</span>
              </div>
              <p className="text-slate-700">
                ProcureAI detected explicit evaluation weights inside uploaded specification: <strong className="font-mono text-slate-900">{tender.detectedWeightsDocument}</strong>. Per government procurement transparency regulations, document-defined weights override default presets.
              </p>
            </div>
          )}

          {/* Weight Sliders & Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {(
              [
                { key: 'eligibility', label: 'Eligibility & Compliance', desc: 'Mandatory hard requirements, company status, regulatory standing' },
                { key: 'technical', label: 'Technical Capability', desc: 'Engineering specs, equipment, SLA, methodologies' },
                { key: 'pastPerformance', label: 'Past Performance', desc: 'Similar scale public contracts, completion certificates' },
                { key: 'financial', label: 'Financial Capability', desc: 'Audited revenues, liquidity ratio, bid bond sufficiency' },
                { key: 'proposalQuality', label: 'Proposal Quality', desc: 'Completeness, clarity, responsiveness to tender requirements' },
                { key: 'riskProfile', label: 'Risk Profile', desc: 'Inconsistencies, missing documents, legal or audit red flags' },
              ] as const
            ).map(({ key, label, desc }) => (
              <div key={key} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900 block">{label}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{desc}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={60}
                      step={5}
                      value={weights[key]}
                      onChange={(e) => handleWeightChange(key, Number(e.target.value))}
                      className="w-14 px-1.5 py-0.5 text-right font-bold text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    />
                    <span className="text-slate-500 font-semibold">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={weights[key]}
                  onChange={(e) => handleWeightChange(key, Number(e.target.value))}
                  className="w-full accent-blue-900 cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetToDocument}
                className="px-2.5 py-1.5 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
              >
                Reset to Document Weights
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-2.5 py-1.5 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
              >
                Reset to Default Weights
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isSaved && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Weights Saved Successfully!
                </span>
              )}
              <button
                onClick={handleSaveWeights}
                disabled={totalWeight !== 100}
                className="px-4 py-2 rounded-md text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white disabled:opacity-50 transition-colors shadow-xs"
              >
                Save Evaluation Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENTS & MEDIA */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Official Tender Package Documents & Media</h3>
              <p className="text-xs text-slate-500">Published RFP terms, technical schedules, site maps, and inspection footage</p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {((tender.attachments && tender.attachments.length > 0)
              ? tender.attachments
              : (tender.documents || []).map(d => ({
                  id: d.id,
                  name: d.name,
                  type: d.type,
                  size: d.size,
                  uploadedAt: d.uploadedAt,
                  category: d.category,
                  isPdf: d.name ? d.name.endsWith('.pdf') : false,
                  isVideo: d.name ? (d.name.endsWith('.mp4') || d.name.endsWith('.mov')) : false,
                  isImage: d.name ? (d.name.endsWith('.png') || d.name.endsWith('.jpg') || d.name.endsWith('.jpeg')) : false
                }))
            ).map((doc: any) => (
              <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded flex items-center justify-center font-bold text-xs border ${
                    doc.isVideo
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : doc.isImage
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-blue-50 text-blue-900 border-blue-200'
                  }`}>
                    {doc.isVideo ? 'MP4' : doc.isImage ? 'IMG' : 'PDF'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 text-xs block">{doc.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {doc.size} &bull; Uploaded {doc.uploadedAt} &bull; Category: {doc.category || 'SPECIFICATION'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                    Verified Package Asset
                  </span>
                </div>
              </div>
            ))}
            {(!tender.attachments?.length && !tender.documents?.length) && (
              <div className="py-6 text-center text-slate-400 text-xs italic">
                No tender documents attached to this specification.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
