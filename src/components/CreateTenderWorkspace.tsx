import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  Trash2,
  Check,
  UploadCloud,
  FileCheck,
  Save,
  HelpCircle,
  Clock,
  Mic,
  Film,
  Image as ImageIcon,
  FileSpreadsheet,
  Layers,
  RefreshCw,
  Eye,
  Sliders,
  AlertOctagon,
  ShieldCheck,
  FileCode,
  Building,
  MapPin,
  Calendar,
  IndianRupee
} from 'lucide-react';
import { Tender, UploadedFileItem, StructuredRequirements, EvaluationWeights, TenderStatus } from '../types';
import { UnifiedFileUpload } from './UnifiedFileUpload';
import { SpeechToTextRecorder } from './SpeechToTextRecorder';
import { aiService } from '../services/aiService';
import { formatINR, INDIAN_REGIONS, formatIndianDate } from '../utils/indianFormat';

interface CreateTenderWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTender: (newTender: Tender) => void;
}

const DRAFT_KEY = 'procureai_tender_workspace_draft_v2';

export const CreateTenderWorkspace: React.FC<CreateTenderWorkspaceProps> = ({
  isOpen,
  onClose,
  onCreateTender,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [draftSavedTimestamp, setDraftSavedTimestamp] = useState<string>('Just now');
  const [showPublishConfirm, setShowPublishConfirm] = useState<boolean>(false);
  const [activeHelpTooltip, setActiveHelpTooltip] = useState<string | null>(null);

  // STEP 1: Basic Details (India-First)
  const [title, setTitle] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [state, setState] = useState('NCT of Delhi');
  const [district, setDistrict] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [location, setLocation] = useState('');
  const [tenderType, setTenderType] = useState('Open Competitive Bidding (GeM & e-Procure)');
  const [deadline, setDeadline] = useState('');
  const [budgetINR, setBudgetINR] = useState('');
  const [emdAmount, setEmdAmount] = useState('');
  const [performanceSecurity, setPerformanceSecurity] = useState('5% of Contract Value');

  // STEP 2: What You Need (Raw Input Mode & Multimodal)
  const [rawNeedText, setRawNeedText] = useState('');
  const [voiceTranscripts, setVoiceTranscripts] = useState<string[]>([]);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState<boolean>(false);
  const [rawAttachedFiles, setRawAttachedFiles] = useState<UploadedFileItem[]>([]);
  const [isOrganizingWithAI, setIsOrganizingWithAI] = useState<boolean>(false);
  const [aiOrganizeSuccess, setAiOrganizeSuccess] = useState<boolean>(false);
  const [activeDiffView, setActiveDiffView] = useState<'side_by_side' | 'raw_only' | 'draft_only'>('side_by_side');

  // AI-Synthesized Draft Preview (Editable)
  const [synthesizedTitle, setSynthesizedTitle] = useState('');
  const [synthesizedScope, setSynthesizedScope] = useState('');
  const [draftAccepted, setDraftAccepted] = useState<boolean>(false);

  // STEP 3: Requirements (Structured conditions)
  const [structuredReqs, setStructuredReqs] = useState<StructuredRequirements>({
    mandatoryRequirements: [],
    eligibilityRequirements: [],
    technicalRequirements: [],
    financialRequirements: [],
    evaluationCriteria: [
      { category: 'Technical Capacity & Fleet Readiness', weight: 35 },
      { category: 'Past Municipal Project Performance', weight: 25 },
      { category: 'Financial Solvency & UDIN Audits', weight: 20 },
      { category: 'Environmental & Safety Accreditations', weight: 10 },
      { category: 'Implementation Methodology', weight: 10 }
    ],
    constraints: [],
    requiredDocuments: []
  });

  const [newMandatoryItem, setNewMandatoryItem] = useState('');
  const [newTechItem, setNewTechItem] = useState('');
  const [newFinancialItem, setNewFinancialItem] = useState('');

  // STEP 4: Official Documents & Attachments (with Batch Status Monitoring)
  const [officialDocuments, setOfficialDocuments] = useState<UploadedFileItem[]>([]);

  // Load saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.refNumber) setRefNumber(parsed.refNumber);
        if (parsed.department) setDepartment(parsed.department);
        if (parsed.state) setState(parsed.state);
        if (parsed.district) setDistrict(parsed.district);
        if (parsed.pinCode) setPinCode(parsed.pinCode);
        if (parsed.budgetINR) setBudgetINR(parsed.budgetINR);
        if (parsed.rawNeedText) setRawNeedText(parsed.rawNeedText);
        if (parsed.structuredReqs) setStructuredReqs(parsed.structuredReqs);
        if (parsed.officialDocuments) setOfficialDocuments(parsed.officialDocuments);
      }
    } catch (e) {
      console.warn('Draft restore notice:', e);
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const draft = {
      title,
      refNumber,
      department,
      state,
      district,
      pinCode,
      location,
      tenderType,
      deadline,
      budgetINR,
      emdAmount,
      performanceSecurity,
      rawNeedText,
      structuredReqs,
      officialDocuments,
      savedAt: new Date().toLocaleTimeString(),
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setDraftSavedTimestamp(new Date().toLocaleTimeString());
    } catch (e) {
      // ignore
    }
  }, [
    title, refNumber, department, state, district, pinCode, location,
    tenderType, deadline, budgetINR, emdAmount, performanceSecurity,
    rawNeedText, structuredReqs, officialDocuments
  ]);

  if (!isOpen) return null;

  // Multimodal Raw Input Count
  const textCount = rawNeedText.trim() ? 1 : 0;
  const voiceCount = voiceTranscripts.length;
  const docCount = rawAttachedFiles.filter(f => f.isPdf || f.isDoc || f.isSpreadsheet).length;
  const imgCount = rawAttachedFiles.filter(f => f.isImage).length;
  const vidCount = rawAttachedFiles.filter(f => f.isVideo).length;
  const totalRawInputs = textCount + voiceCount + rawAttachedFiles.length;

  const handleOrganizeWithAI = async () => {
    setIsOrganizingWithAI(true);
    const combinedRaw = [
      rawNeedText,
      ...voiceTranscripts.map((vt, i) => `[Voice Transcript ${i + 1}]: ${vt}`),
      rawAttachedFiles.length > 0
        ? `[Attached Reference Files]: ${rawAttachedFiles.map(f => f.name).join(', ')}`
        : ''
    ].filter(Boolean).join('\n\n');

    try {
      const result = await aiService.extractRequirements(combinedRaw);
      if (result.success && result.data) {
        setStructuredReqs(result.data);
      }
    } catch (e) {
      console.warn('AI structuring notice:', e);
    }

    const synthesizedHeading = title || (combinedRaw.length > 5 ? combinedRaw.slice(0, 65).trim() + '...' : 'Procurement Tender Notice');
    setSynthesizedTitle(synthesizedHeading);
    setSynthesizedScope(
      `# Official Tender Scope & Operational Specifications\n\n` +
      `The ${department || 'Procuring Authority'} hereby invites sealed electronic tenders from qualified and experienced vendors for the execution of: ${synthesizedHeading}.\n\n` +
      `### Summary of Stated Needs\n` +
      (combinedRaw || 'Specifications derived from raw inputs provided by the procurement officer.') + `\n\n` +
      `### Key Deliverables & Operational Requirements\n` +
      `• Turnkey execution in accordance with government procurement norms and applicable municipal regulations.\n` +
      `• Scheduled milestone deliverables with verified quality assurance and reporting.\n` +
      `• Deployment of certified personnel, compliant machinery, and telematics as required.\n` +
      `• 24x7 emergency response and resolution mechanism within statutory dispatch windows.`
    );

    setIsOrganizingWithAI(false);
    setAiOrganizeSuccess(true);
    setDraftAccepted(false);
  };

  const handleFinalPublish = (status: TenderStatus = 'OPEN FOR BIDS') => {
    const weights: EvaluationWeights = {
      technical: 35,
      pastPerformance: 25,
      eligibility: 20,
      financial: 10,
      proposalQuality: 5,
      riskProfile: 5,
    };

    const newTender: Tender = {
      id: `tender-in-${Date.now()}`,
      title: title.trim() || 'Mechanized Road Cleaning & Environmental Services',
      referenceNumber: refNumber.trim() || `MCD-ENG-2026-${Date.now().toString().slice(-4)}`,
      department: department.trim() || 'Municipal Corporation of Delhi',
      tenderType,
      location: `${district}, ${state}, PIN ${pinCode}`,
      state,
      district,
      pinCode,
      budget: formatINR(budgetINR),
      emdBondAmount: formatINR(emdAmount),
      performanceSecurity,
      description: synthesizedScope || rawNeedText,
      status,
      deadline,
      mandatoryRequirements: structuredReqs.mandatoryRequirements,
      eligibilityRequirements: structuredReqs.eligibilityRequirements,
      technicalRequirements: structuredReqs.technicalRequirements,
      financialRequirements: structuredReqs.financialRequirements,
      constraints: structuredReqs.constraints,
      requiredDocumentsList: structuredReqs.requiredDocuments,
      rawRequirementsText: rawNeedText,
      rawNeedDescription: rawNeedText,
      rawVoiceTranscript: voiceTranscripts.join('\n---\n'),
      rawInputsCount: {
        total: totalRawInputs,
        documents: docCount,
        images: imgCount,
        videos: vidCount,
        transcripts: voiceCount
      },
      evaluationWeights: weights,
      weightsSource: 'OFFICER_CUSTOM',
      documents: officialDocuments.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        size: f.size,
        uploadedAt: f.uploadedAt,
        category: (f.category as any) || 'SPECIFICATION',
      })),
      attachments: officialDocuments,
      createdAt: new Date().toISOString(),
    };

    onCreateTender(newTender);
    localStorage.removeItem(DRAFT_KEY);
    setShowPublishConfirm(false);
    onClose();
  };

  const steps = [
    { num: 1, label: 'Basic Details' },
    { num: 2, label: 'What You Need' },
    { num: 3, label: 'Requirements' },
    { num: 4, label: 'Documents' },
    { num: 5, label: 'Review & Publish' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[94vh] flex flex-col overflow-hidden text-slate-800">
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <FileCheck className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 leading-tight">
                  New Tender Workspace
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  Step {currentStep} of 5
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Ref: {refNumber}</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Auto-saved ({draftSavedTimestamp})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFinalPublish('DRAFT')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <Save className="w-3.5 h-3.5 inline mr-1" />
              Save as Draft
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Close Workspace"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 overflow-x-auto select-none">
          <div className="flex items-center justify-between min-w-[620px] max-w-4xl mx-auto">
            {steps.map((step, idx) => {
              const isPast = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <React.Fragment key={step.num}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.num)}
                    className={`flex items-center gap-2 group transition-colors ${
                      isCurrent
                        ? 'text-blue-900 font-bold'
                        : isPast
                        ? 'text-emerald-700 font-semibold'
                        : 'text-slate-400 font-medium hover:text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                        isCurrent
                          ? 'bg-blue-900 text-white shadow-xs ring-2 ring-blue-200'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5" /> : step.num}
                    </span>
                    <span className="text-xs whitespace-nowrap">{step.label}</span>
                  </button>

                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 rounded transition-colors ${
                        currentStep > step.num ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ========================================================================= */}
          {/* STEP 1: BASIC DETAILS                                                     */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* "What do I do next?" Context Box */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start justify-between gap-3 text-xs text-blue-950">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold">What do I do next?</span>
                    <p className="text-slate-600 mt-0.5">
                      Enter the essential identifier details of your procurement (Tender Title, Department, Delhi Location, and INR Budget). Click <strong>Continue to What You Need</strong> when ready.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="shrink-0 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs inline-flex items-center gap-1"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Tender Identification & Classification
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tender Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Municipal Roads Cleaning in Urban Region of Delhi"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reference / Tender Notice No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Procuring Organization / Department <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Municipal Corporation of Delhi (MCD)"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>
                </div>

                {/* India-First Location Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State / UT <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        const match = INDIAN_REGIONS.find(r => r.state === e.target.value);
                        if (match && match.districts.length > 0) {
                          setDistrict(match.districts[0]);
                        }
                      }}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                    >
                      {INDIAN_REGIONS.map((r) => (
                        <option key={r.state} value={r.state}>
                          {r.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      District
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                    >
                      {(INDIAN_REGIONS.find(r => r.state === state)?.districts || ['Delhi District']).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="110001"
                      className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>
                </div>

                {/* Financial & Deadline Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estimated Contract Value (INR ₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="text"
                        value={budgetINR}
                        onChange={(e) => setBudgetINR(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-7 pr-3 py-2 text-sm font-bold text-blue-950 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Formatted: {formatINR(budgetINR, true)} ({formatINR(budgetINR)})
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      EMD / Bid Security (INR ₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="text"
                        value={emdAmount}
                        onChange={(e) => setEmdAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-7 pr-3 py-2 text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Formatted: {formatINR(emdAmount)} (approx. 2%)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Submission Deadline (DD/MM/YYYY)
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Formatted: {formatIndianDate(deadline)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: WHAT YOU NEED (RAW INPUT MODE & MULTIMODAL SYNTHESIS)              */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* "What do I do next?" Context Box */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start justify-between gap-3 text-xs text-blue-950">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold">Great. Now describe what you need.</span>
                    <p className="text-slate-600 mt-0.5">
                      Tell us in your own words, speak into your microphone, or upload existing notes/documents. Click <strong>Organize with AI</strong> to generate a structured tender draft with human review.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="shrink-0 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs inline-flex items-center gap-1"
                >
                  <span>Continue to Requirements</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Raw Input Canvas */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Describe What You Need (Raw Input Mode)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      You can type normally, speak, or upload existing documents. ProcureAI will organize the information into a professional tender draft.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                        showVoiceRecorder
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 text-blue-600" />
                      <span>{showVoiceRecorder ? 'Hide Microphone' : '🎤 Speak'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOrganizeWithAI}
                      disabled={isOrganizingWithAI || (!rawNeedText.trim() && voiceTranscripts.length === 0)}
                      className="px-4 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      {isOrganizingWithAI ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Organizing with AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                          <span>Organize with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Optional Voice Recorder */}
                {showVoiceRecorder && (
                  <SpeechToTextRecorder
                    label="Procurement Officer Voice Input"
                    placeholder="Speak your requirements clearly (e.g. 'I need road cleaning sweepers in Delhi for 5 years...')"
                    onUseTranscript={(transcript) => {
                      setVoiceTranscripts((prev) => [...prev, transcript]);
                      setRawNeedText((prev) => (prev ? prev + '\n\n' : '') + transcript);
                    }}
                    onOrganizeWithAI={() => handleOrganizeWithAI()}
                    isOrganizing={isOrganizingWithAI}
                  />
                )}

                {/* Multimodal Inputs Summary Banner */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Multimodal Input Summary:</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[11px]">
                      {totalRawInputs} inputs received
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                    <span>{textCount} text draft</span>
                    <span>•</span>
                    <span>{voiceCount} voice transcripts</span>
                    <span>•</span>
                    <span>{docCount} documents</span>
                    <span>•</span>
                    <span>{imgCount} images</span>
                    <span>•</span>
                    <span>{vidCount} videos</span>
                  </div>
                </div>

                {/* Large Input Textarea with Microphone Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Describe what you need:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors inline-flex items-center gap-1.5 shadow-2xs ${
                        showVoiceRecorder
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border-blue-200'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 text-blue-600" />
                      <span>{showVoiceRecorder ? 'Hide Microphone' : '🎤 Speak Requirements'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={rawNeedText}
                    onChange={(e) => setRawNeedText(e.target.value)}
                    placeholder="Describe your requirements in plain language... For example: 'We require 12 mechanical sweepers with GPS tracking for daily night cleaning across Delhi roads. Contractors must have 5 years experience and valid GSTIN...'"
                    className="w-full p-3 text-xs leading-relaxed border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white font-sans text-slate-800"
                  />
                </div>

                {/* Upload Reference Documents for Raw Extraction */}
                <div className="pt-2">
                  <UnifiedFileUpload
                    title="Upload Existing Notes, RFPs, or Site Inspection Files"
                    subtitle="Upload any preliminary documents, route maps, or sample videos to extract specifications."
                    files={rawAttachedFiles}
                    onFilesChange={setRawAttachedFiles}
                  />
                </div>
              </div>

              {/* ========================================================================= */}
              {/* BEFORE / AFTER VIEW (RAW vs PROFESSIONAL DRAFT)                            */}
              {/* ========================================================================= */}
              {aiOrganizeSuccess && (
                <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm space-y-4 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Before / After Synthesis Review
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Compare your raw notes with the generated professional government draft.
                        </p>
                      </div>
                    </div>

                    {/* View mode toggle */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setActiveDiffView('side_by_side')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          activeDiffView === 'side_by_side'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Side-by-Side
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDiffView('raw_only')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          activeDiffView === 'raw_only'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Raw Only
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDiffView('draft_only')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          activeDiffView === 'draft_only'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Draft Only
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Raw Input */}
                    {(activeDiffView === 'side_by_side' || activeDiffView === 'raw_only') && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                          <span>Raw Information (Original)</span>
                          <span className="text-[10px] text-slate-400 font-normal">Never overwritten</span>
                        </div>
                        <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap max-h-72 overflow-y-auto">
                          {rawNeedText || 'No raw text provided.'}
                        </div>
                      </div>
                    )}

                    {/* Right: Synthesized Professional Draft */}
                    {(activeDiffView === 'side_by_side' || activeDiffView === 'draft_only') && (
                      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-blue-900 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                            Professional Tender Draft
                          </span>
                          <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-1.5 py-0.5 rounded">
                            AI-Assisted
                          </span>
                        </div>

                        <div className="p-3 bg-white border border-blue-200 rounded-lg text-xs text-slate-800 leading-relaxed max-h-72 overflow-y-auto space-y-3">
                          <div>
                            <span className="font-bold text-slate-900 block mb-1">Standardized Title:</span>
                            <div className="p-2 bg-slate-50 rounded border border-slate-200 font-semibold">
                              {synthesizedTitle}
                            </div>
                          </div>

                          <div>
                            <span className="font-bold text-slate-900 block mb-1">Scope & Specifications:</span>
                            <div className="p-2 bg-slate-50 rounded border border-slate-200 whitespace-pre-wrap text-[11px]">
                              {synthesizedScope}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions on Generated Draft */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      {draftAccepted ? (
                        <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Draft accepted for Step 3 Requirements.
                        </span>
                      ) : (
                        <span>Review draft before proceeding.</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSynthesizedTitle(title);
                          setDraftAccepted(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Draft</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOrganizeWithAI}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Regenerate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAiOrganizeSuccess(false);
                          setDraftAccepted(false);
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: REQUIREMENTS & EVALUATION CRITERIA                                 */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* "What do I do next?" Context Box */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start justify-between gap-3 text-xs text-blue-950">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold">Review the structured tender requirements.</span>
                    <p className="text-slate-600 mt-0.5">
                      Verify mandatory pass/fail rules (GSTIN, EMD, Turnover) and technical specifications. You can add or remove conditions. Click <strong>Continue to Documents</strong> when ready.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="shrink-0 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs inline-flex items-center gap-1"
                >
                  <span>Continue to Documents</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mandatory Pass/Fail Criteria */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Mandatory Pass/Fail Eligibility Conditions
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">Non-compliance results in immediate disqualification</span>
                </div>

                <div className="space-y-2">
                  {structuredReqs.mandatoryRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 font-medium">{req}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setStructuredReqs({
                            ...structuredReqs,
                            mandatoryRequirements: structuredReqs.mandatoryRequirements.filter((_, i) => i !== idx)
                          });
                        }}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newMandatoryItem}
                    onChange={(e) => setNewMandatoryItem(e.target.value)}
                    placeholder="Add custom mandatory requirement (e.g. Valid GSTIN & Non-Blacklist Affidavit)..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMandatoryItem.trim()) return;
                      setStructuredReqs({
                        ...structuredReqs,
                        mandatoryRequirements: [...structuredReqs.mandatoryRequirements, newMandatoryItem.trim()]
                      });
                      setNewMandatoryItem('');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-900" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Technical Specifications & Operational Schedules
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  {structuredReqs.technicalRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          T{idx + 1}
                        </span>
                        <span className="text-slate-800 font-medium">{req}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setStructuredReqs({
                            ...structuredReqs,
                            technicalRequirements: structuredReqs.technicalRequirements.filter((_, i) => i !== idx)
                          });
                        }}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newTechItem}
                    onChange={(e) => setNewTechItem(e.target.value)}
                    placeholder="Add technical specification (e.g. Euro-VI Sweepers with GPS telemetry)..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newTechItem.trim()) return;
                      setStructuredReqs({
                        ...structuredReqs,
                        technicalRequirements: [...structuredReqs.technicalRequirements, newTechItem.trim()]
                      });
                      setNewTechItem('');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: DOCUMENTS & MEDIA (WITH BATCH STATUS MONITORING)                    */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* "What do I do next?" Context Box */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start justify-between gap-3 text-xs text-blue-950">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <span className="font-bold">Attach official documents and inspection media.</span>
                    <p className="text-slate-600 mt-0.5">
                      Upload tender specifications, BOQ schedules, route maps, or site inspection videos. Use batch upload to track and cancel multiple files simultaneously.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="shrink-0 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs inline-flex items-center gap-1"
                >
                  <span>Continue to Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Tender Specification Documents & Media Library
                    </h3>
                    <p className="text-xs text-slate-500">
                      Files will be published to the vendor portal and indexed for automated due-diligence cross-matching.
                    </p>
                  </div>
                </div>

                <UnifiedFileUpload
                  files={officialDocuments}
                  onFilesChange={setOfficialDocuments}
                  title="Drop Tender Specification Files Here"
                  subtitle="Bulk upload supported. View progress and cancel multiple simultaneous uploads from the batch dashboard below."
                  allowVideo={true}
                  maxSizeMB={50}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: REVIEW & PUBLISH (HUMAN APPROVAL GATEWAY)                         */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Human Approval Callout */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>AI-Generated Draft Ready for Human Approval</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  The AI has structured your input, but no tender is published automatically. Please review the summary below before authorizing publication on the public portal.
                </p>
              </div>

              {/* Comprehensive Summary Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Tender Summary Overview
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Tender Title</span>
                    <span className="text-slate-900 font-semibold">{title}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Notice Reference</span>
                    <span className="text-slate-900 font-mono">{refNumber}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Department</span>
                    <span className="text-slate-900">{department}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Jurisdiction</span>
                    <span className="text-slate-900">{district}, {state} (PIN {pinCode})</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Estimated Budget</span>
                    <span className="text-blue-900 font-bold">{formatINR(budgetINR)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Submission Deadline</span>
                    <span className="text-slate-900 font-medium">{formatIndianDate(deadline)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">EMD Amount</span>
                    <span className="text-slate-900 font-semibold">{formatINR(emdAmount)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Mandatory Criteria</span>
                    <span className="text-slate-900 font-semibold">{structuredReqs.mandatoryRequirements.length} pass/fail rules</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Attached Documents</span>
                    <span className="text-slate-900 font-semibold">{officialDocuments.length} files attached</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-800 block mb-1">Approved Scope of Work</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto font-sans leading-relaxed">
                    {synthesizedScope || rawNeedText}
                  </div>
                </div>

                {/* Final Decision Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      Edit Basic Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      Edit Raw Input
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleFinalPublish('DRAFT')}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-xs"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPublishConfirm(true)}
                      className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition-colors inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Approve & Publish Tender</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-slate-700 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                className="px-4 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowPublishConfirm(true)}
                className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Publish Tender</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Final Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-blue-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Publish Tender to Public Portal?</h3>
                <p className="text-xs text-slate-500">Notice #{refNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Upon publication, this tender will open for bidder submissions under the <strong>OPEN FOR BIDS</strong> status. Bidders will be able to review specifications and upload bids.
            </p>

            <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1 text-slate-700 font-mono">
              <div>• Budget: {formatINR(budgetINR)}</div>
              <div>• EMD: {formatINR(emdAmount)}</div>
              <div>• Deadline: {formatIndianDate(deadline)}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => handleFinalPublish('OPEN FOR BIDS')}
                className="px-4 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs"
              >
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
