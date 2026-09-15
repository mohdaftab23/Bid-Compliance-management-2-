import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  FileText,
  Building,
  Scale,
  DollarSign,
  AlertOctagon,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Check,
  Edit3,
  History,
  Lock,
  Database,
  Layers,
  Info,
  Award,
  FileCheck
} from 'lucide-react';
import { Tender, Bidder, DueDiligenceReport, DataSourceType } from '../types';

interface BidderReportViewProps {
  tender: Tender;
  bidder: Bidder;
  report: DueDiligenceReport;
  onUpdateReport: (updatedReport: DueDiligenceReport) => void;
  onBackToComparison: () => void;
  onBackToDashboard: () => void;
}

export const BidderReportView: React.FC<BidderReportViewProps> = ({
  tender,
  bidder,
  report,
  onUpdateReport,
  onBackToComparison,
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'eligibility' | 'technical' | 'past' | 'financial' | 'risks' | 'evidence' | 'explainability' | 'review'>('all');
  const [officerNotes, setOfficerNotes] = useState(report.humanReview.officerNotes || '');
  const [newAnnotation, setNewAnnotation] = useState({ targetSection: 'Eligibility & Compliance', comment: '' });
  const [scoreOverride, setScoreOverride] = useState<number | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [evidenceFilter, setEvidenceFilter] = useState<'ALL' | 'BIDDER_PROVIDED' | 'EXTERNAL_SOURCE' | 'AI_INFERENCE'>('ALL');

  const handleSaveOfficerReview = (status: 'REVIEWED_CONFIRMED' | 'FLAGGED_FOR_AUDIT' | 'REJECTED_NON_COMPLIANT') => {
    const updated: DueDiligenceReport = {
      ...report,
      overallScore: scoreOverride !== null ? scoreOverride : report.overallScore,
      humanReview: {
        ...report.humanReview,
        reviewedBy: 'Procurement Officer (Current Session)',
        reviewedAt: new Date().toISOString(),
        officerStatus: status,
        officerNotes,
        scoreOverride: scoreOverride !== null ? {
          originalScore: report.overallScore,
          adjustedScore: scoreOverride,
          officerJustification: overrideReason,
          overriddenAt: new Date().toISOString()
        } : report.humanReview.scoreOverride
      }
    };
    onUpdateReport(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddAnnotation = () => {
    if (!newAnnotation.comment.trim()) return;
    const annotationItem = {
      id: `ann-${Date.now()}`,
      targetSection: newAnnotation.targetSection,
      comment: newAnnotation.comment.trim(),
      officerName: 'Procurement Officer',
      timestamp: new Date().toISOString()
    };
    const updated: DueDiligenceReport = {
      ...report,
      humanReview: {
        ...report.humanReview,
        annotations: [...report.humanReview.annotations, annotationItem]
      }
    };
    onUpdateReport(updated);
    setNewAnnotation({ ...newAnnotation, comment: '' });
  };

  const printReport = () => {
    window.print();
  };

  const filteredEvidence = (report.evidenceRepository || []).filter((ev) => {
    if (evidenceFilter === 'ALL') return true;
    return ev.dataSourceType === evidenceFilter;
  });

  const extVerif = report.externalVerification;

  return (
    <div className="space-y-6">
      {/* Top Action Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToComparison}
            className="text-xs font-semibold text-slate-700 hover:text-blue-900 px-3 py-1.5 rounded-md bg-white border border-slate-300 transition-colors shadow-xs"
          >
            ← Back to Comparison Matrix
          </button>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md bg-white border border-slate-300 transition-colors shadow-xs"
          >
            Dashboard
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={printReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Dossier</span>
          </button>
        </div>
      </div>

      {/* Report Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-900 border border-blue-200 font-semibold">
                Tender Ref: {tender.referenceNumber}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-800 border border-slate-300">
                Bidder Reg: {bidder.registrationNumber}
              </span>
              <span className="text-xs text-slate-500">Model: {report.aiModelUsed}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Due-Diligence & Decision-Support Dossier: {bidder.companyName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluation generated on {new Date(report.analyzedAt).toLocaleString()} &bull; Subject to formal Officer verification
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                Evaluated Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-blue-900">{report.overallScore}</span>
                <span className="text-xs text-slate-500 font-semibold">/ 100</span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                Confidence
              </span>
              <span className="text-base font-bold text-slate-800">{report.aiConfidence}%</span>
              <span className="block text-[10px] text-slate-500">Document Grounded</span>
            </div>
          </div>
        </div>

        {/* Advisory Statement */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-md text-xs space-y-1">
          <div className="flex items-center gap-2 text-blue-950 font-semibold">
            <Award className="w-4 h-4 text-blue-900" />
            <span>AI Preliminary Recommendation (Advisory Only)</span>
          </div>
          <p className="text-slate-800 font-medium">"{report.recommendationStatement}"</p>
          <p className="text-[11px] text-slate-500">
            Legal Requirement: ProcureAI provides evidence-backed scoring to support procurement decision-makers. The final award decision strictly remains with the human officer.
          </p>
        </div>
      </div>

      {/* External Corporate Registry Verification Card */}
      {extVerif && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-900" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                External Government Registry Verification
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                extVerif.status === 'VERIFIED'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                {extVerif.status === 'VERIFIED' ? 'AUTHENTICATED REGISTRY RECORD' : 'DISCREPANCY ALERT'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Queried: {extVerif.timestamp ? new Date(extVerif.timestamp).toLocaleTimeString() : 'Verified'}
            </span>
          </div>

          <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-900">Registry Gateway Finding:</div>
            <p className="leading-relaxed">{extVerif.details}</p>
          </div>

          {extVerif.record && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Official Entity Name</span>
                <strong className="text-slate-900 font-semibold">{extVerif.record.companyName}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Incorporation Date</span>
                <strong className="text-slate-900 font-semibold">{extVerif.record.incorporationDate}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Jurisdiction</span>
                <strong className="text-slate-900 font-semibold truncate block">{extVerif.record.jurisdiction}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Standing Status</span>
                <strong className="text-emerald-700 font-semibold">{extVerif.record.status}</strong>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
            <span>Authority: <strong className="text-slate-700">{extVerif.source}</strong></span>
            {extVerif.record?.verificationHash && (
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                {extVerif.record.verificationHash}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 text-xs font-medium">
        {[
          { id: 'all', label: 'Complete Dossier' },
          { id: 'eligibility', label: '1. Hard Eligibility' },
          { id: 'technical', label: '2. Technical Specs' },
          { id: 'past', label: '3. Past Projects' },
          { id: 'financial', label: '4. Financial Stability' },
          { id: 'risks', label: '5. Risk Matrix' },
          { id: 'evidence', label: '6. Evidence Repository' },
          { id: 'explainability', label: '7. AI Explainability' },
          { id: 'review', label: '8. Human Sign-Off' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-900 text-blue-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: MANDATORY HARD ELIGIBILITY (PASS/FAIL) */}
      {(activeTab === 'all' || activeTab === 'eligibility') && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-700" />
                Section 1: Mandatory Hard Eligibility Criteria (PASS / FAIL)
              </h2>
              <p className="text-xs text-slate-500">
                Gatekeeping criteria. Bidders must meet 100% of these requirements to be considered responsive.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {(report.eligibilityChecks || []).filter(c => c.status === 'PASS').length} of {(report.eligibilityChecks || []).length} Passed
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {(report.eligibilityChecks || []).map((chk) => (
              <div key={chk.id} className="py-3 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{chk.requirement}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      chk.status === 'PASS'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}>
                      {chk.status}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{chk.reason}</p>
                </div>
                {chk.evidenceSource && (
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-slate-500 block">Source Doc:</span>
                    <span className="text-xs font-semibold text-blue-900">{chk.evidenceSource}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: EVALUATION PILLARS BREAKDOWN */}
      {(activeTab === 'all' || activeTab === 'technical' || activeTab === 'past' || activeTab === 'financial') && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-900" />
              Section 2: Weighted Evaluation Pillars & Justifications
            </h2>
            <p className="text-xs text-slate-500">
              Category scores calculated in strict alignment with tender scoring weights
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {report.scoresByCategory.map((cat, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{cat.category}</h3>
                    <span className="text-[11px] text-slate-500">Confidence: {cat.confidence}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-blue-900">
                      {cat.awardedPoints} / {cat.maxPoints} pts
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">({cat.percentage}%)</span>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">{cat.reason}</p>

                {cat.evidenceReferences && cat.evidenceReferences.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                    {cat.evidenceReferences.map((ref, rIdx) => (
                      <span key={rIdx} className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-300 text-[11px] font-mono">
                        {ref.sourceFile} ({ref.pageOrSection})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: INCONSISTENCIES & RISK PROFILE */}
      {(activeTab === 'all' || activeTab === 'risks') && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-700" />
                Section 3: Inconsistencies & Documented Risk Flags
              </h2>
              <p className="text-xs text-slate-500">
                Discrepancies identified across declarations, cross-checks, and public records
              </p>
            </div>
            <span className="text-xs font-semibold text-rose-800">
              {(report.inconsistencies || []).length} Flags Identified
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {(report.inconsistencies || []).map((risk) => (
              <div key={risk.id} className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 text-sm">{risk.type}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    risk.priority === 'HIGH' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {risk.priority} PRIORITY
                  </span>
                </div>
                <p className="text-slate-800">{risk.description}</p>
                <div className="pt-1 text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Impact: <strong className="text-slate-800">{risk.impact}</strong></span>
                  <span>Required Action: <strong className="text-blue-900">{risk.requiredAction}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: EVIDENCE REPOSITORY WITH 3-TIER SOURCE LABELS */}
      {(activeTab === 'all' || activeTab === 'evidence') && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-900" />
                Section 4: Evidence Repository & Provenance Tracing
              </h2>
              <p className="text-xs text-slate-500">
                Every deduction, score, and finding is anchored to verifiable source snippets
              </p>
            </div>

            {/* 3-Tier Data Source Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 hidden sm:inline">Filter Origin:</span>
              <button
                onClick={() => setEvidenceFilter('ALL')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  evidenceFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({(report.evidenceRepository || []).length})
              </button>
              <button
                onClick={() => setEvidenceFilter('BIDDER_PROVIDED')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  evidenceFilter === 'BIDDER_PROVIDED' ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                }`}
              >
                Bidder-Provided
              </button>
              <button
                onClick={() => setEvidenceFilter('EXTERNAL_SOURCE')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  evidenceFilter === 'EXTERNAL_SOURCE' ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                External Source
              </button>
              <button
                onClick={() => setEvidenceFilter('AI_INFERENCE')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  evidenceFilter === 'AI_INFERENCE' ? 'bg-purple-900 text-white' : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
                }`}
              >
                AI Inference
              </button>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {filteredEvidence.map((ev) => (
              <div key={ev.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">{ev.sourceFile}</span>
                    <span className="text-slate-500">({ev.pageOrSection})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Provenance Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      ev.dataSourceType === 'EXTERNAL_SOURCE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : ev.dataSourceType === 'AI_INFERENCE'
                        ? 'bg-purple-50 text-purple-900 border-purple-300'
                        : 'bg-blue-50 text-blue-900 border-blue-300'
                    }`}>
                      {ev.dataSourceType === 'EXTERNAL_SOURCE'
                        ? 'External Registry Source'
                        : ev.dataSourceType === 'AI_INFERENCE'
                        ? 'AI Inference Engine'
                        : 'Bidder-Provided Submission'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      ev.verified ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {ev.verified ? '✓ Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
                <p className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800 leading-relaxed">
                  "{ev.evidenceText}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: EXPLAINABLE AI TRANSPARENCY FRAMEWORK */}
      {(activeTab === 'all' || activeTab === 'explainability') && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-900" />
                Section 5: Explainable AI Transparency Framework
              </h2>
              <p className="text-xs text-slate-500">
                Explicit answers to the 6 statutory procurement intelligence questions
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700">Strict Anti-Hallucination Grounding</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">1. What did the AI find?</span>
              <p className="text-slate-700 leading-relaxed">{report.explainability.whatAIFound}</p>
            </div>

            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">2. Why does it matter?</span>
              <p className="text-slate-700 leading-relaxed">{report.explainability.whyItMatters}</p>
            </div>

            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">3. What evidence supports this?</span>
              <p className="text-slate-700 leading-relaxed">{report.explainability.supportingEvidence}</p>
            </div>

            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">4. Where did the evidence come from?</span>
              <p className="text-slate-700 leading-relaxed">{report.explainability.evidenceOrigin}</p>
            </div>

            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">5. How confident is the AI?</span>
              <p className="text-slate-700 leading-relaxed">{report.explainability.confidenceLevel}</p>
            </div>

            <div className="p-3.5 rounded bg-blue-50/80 border border-blue-200 space-y-1">
              <span className="font-bold text-blue-950 uppercase tracking-wider text-[11px]">6. What should the human officer verify?</span>
              <p className="text-slate-800 leading-relaxed">{report.explainability.humanVerificationFocus}</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: AUTHORIZED HUMAN OFFICER REVIEW & SIGN-OFF */}
      {(activeTab === 'all' || activeTab === 'review') && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4 print:border-none">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-900" />
                Section 6: Authorized Human Officer Sign-Off & Audit Logging
              </h2>
              <p className="text-xs text-slate-500">
                Official determination, audit comments, annotations, and manual score overrides
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
              report.humanReview.officerStatus === 'REVIEWED_CONFIRMED'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              STATUS: {report.humanReview.officerStatus}
            </span>
          </div>

          {/* Officer Review Notes */}
          <div className="space-y-1.5 text-xs">
            <label className="block font-semibold text-slate-800">
              Procurement Officer Findings & Evaluation Notes:
            </label>
            <textarea
              rows={3}
              placeholder="Enter official evaluation notes, site visit checks, or supplementary justifications..."
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-md p-2.5 text-slate-900 placeholder-slate-400 text-xs transition-colors"
            />
          </div>

          {/* Score Override */}
          <div className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Manual Score Adjustment / Override</span>
                <span className="text-slate-500 text-[11px]">
                  Officers may adjust scores provided an explicit audit justification is recorded.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowOverrideInput(!showOverrideInput)}
                className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs border border-slate-300 transition-colors"
              >
                {showOverrideInput ? 'Cancel Override' : 'Override Score'}
              </button>
            </div>

            {showOverrideInput && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Adjusted Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="e.g. 88"
                    value={scoreOverride ?? ''}
                    onChange={(e) => setScoreOverride(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Mandatory Written Justification</label>
                  <input
                    type="text"
                    placeholder="State reason for overriding AI evaluated score..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section Annotation Add */}
          <div className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-2">
            <span className="font-semibold text-slate-900 block">Add Section-Specific Annotation</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={newAnnotation.targetSection}
                onChange={(e) => setNewAnnotation({ ...newAnnotation, targetSection: e.target.value })}
                className="bg-white border border-slate-300 rounded p-2 text-slate-900"
              >
                <option value="Eligibility & Compliance">Eligibility & Compliance</option>
                <option value="Technical Capability">Technical Capability</option>
                <option value="Past Performance">Past Performance</option>
                <option value="Financial Solvency">Financial Solvency</option>
                <option value="Risk & Red Flags">Risk & Red Flags</option>
              </select>
              <input
                type="text"
                placeholder="Annotation text or verification comment..."
                value={newAnnotation.comment}
                onChange={(e) => setNewAnnotation({ ...newAnnotation, comment: e.target.value })}
                className="sm:col-span-2 bg-white border border-slate-300 rounded p-2 text-slate-900"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddAnnotation}
                disabled={!newAnnotation.comment.trim()}
                className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs disabled:opacity-50"
              >
                Add Annotation
              </button>
            </div>
          </div>

          {/* Display Existing Annotations */}
          {report.humanReview.annotations && report.humanReview.annotations.length > 0 && (
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-800 block">Recorded Annotations:</span>
              {report.humanReview.annotations.map((ann) => (
                <div key={ann.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between gap-2">
                  <div>
                    <span className="font-bold text-blue-900 block">[{ann.targetSection}]</span>
                    <span className="text-slate-800">{ann.comment}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(ann.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Confirmation Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" />
                Human Review Saved to Immutable Audit Trail!
              </span>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => handleSaveOfficerReview('REJECTED_NON_COMPLIANT')}
                className="px-3 py-2 rounded-md text-xs font-semibold bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 transition-colors shadow-xs"
              >
                Reject as Non-Compliant
              </button>
              <button
                onClick={() => handleSaveOfficerReview('FLAGGED_FOR_AUDIT')}
                className="px-3 py-2 rounded-md text-xs font-semibold bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 transition-colors shadow-xs"
              >
                Flag for Committee Audit
              </button>
              <button
                onClick={() => handleSaveOfficerReview('REVIEWED_CONFIRMED')}
                className="px-4 py-2 rounded-md text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white transition-colors shadow-xs"
              >
                Confirm & Sign Off Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
