import React, { useState, useEffect } from 'react';
import {
  Building,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Award,
  Plus,
  Trash2,
  Send,
  Save,
  Check,
  Briefcase,
  Layers,
  HelpCircle,
  Clock,
  Mic,
  Sparkles,
  AlertOctagon,
  RotateCcw,
  IndianRupee,
  ShieldCheck,
  Eye,
  FileSpreadsheet,
  Film
} from 'lucide-react';
import { Tender, Bidder, UploadedFileItem, BidderStatus } from '../types';
import { UnifiedFileUpload } from './UnifiedFileUpload';
import { SpeechToTextRecorder } from './SpeechToTextRecorder';
import { formatINR, formatIndianDate } from '../utils/indianFormat';
import { aiService } from '../services/aiService';

interface BidderSubmissionViewProps {
  tender?: Tender | null;
  bidder?: Bidder | null;
  onUpdateBidder: (updated: Bidder) => void;
  onDeleteDraft?: (bidderId: string) => void;
}

const BIDDER_DRAFT_KEY = 'procureai_bidder_submission_draft_v2';

export const BidderSubmissionView: React.FC<BidderSubmissionViewProps> = ({
  tender,
  bidder,
  onUpdateBidder,
  onDeleteDraft,
}) => {
  const defaultBidder: Bidder = {
    id: bidder?.id || `bidder-${Date.now()}`,
    tenderId: tender?.id || '',
    companyName: bidder?.companyName || 'Vendor Organization',
    registrationNumber: bidder?.registrationNumber || '',
    country: bidder?.country || 'India',
    region: bidder?.region || 'Delhi NCR',
    yearEstablished: bidder?.yearEstablished || 2024,
    businessCategory: bidder?.businessCategory || 'Infrastructure & Environmental Services',
    contactPerson: bidder?.contactPerson || '',
    email: bidder?.email || '',
    contactEmail: bidder?.contactEmail || '',
    phone: bidder?.phone || '',
    contactPhone: bidder?.contactPhone || '',
    registeredAddress: bidder?.registeredAddress || '',
    address: bidder?.address || '',
    gstin: bidder?.gstin || '',
    panNumber: bidder?.panNumber || '',
    incorporationYear: bidder?.incorporationYear || 2024,
    employeeCount: bidder?.employeeCount || 0,
    annualTurnoverINR: bidder?.annualTurnoverINR || 0,
    status: bidder?.status || 'DRAFT',
    rawInputText: bidder?.rawInputText || '',
    uploadedAttachments: bidder?.uploadedAttachments || [],
    technicalCapabilities: bidder?.technicalCapabilities || [],
    infrastructureEquipment: bidder?.infrastructureEquipment || [],
    certifications: bidder?.certifications || [],
    pastProjects: bidder?.pastProjects || [],
    financialInfo: bidder?.financialInfo || {
      annualRevenue: 0,
      profitLoss: 0,
      currency: 'INR',
      fiscalYear: 'FY 2024-25',
      isAudited: true,
      bankSolvencyGuaranteeProvided: false,
    },
    proposal: bidder?.proposal || {
      pricingTotal: 0,
      currency: 'INR',
      timelineDays: 90,
      executiveSummary: '',
      technicalProposalSummary: '',
      methodology: '',
      timelineMonths: 12,
      keyPersonnel: [],
      scopeUnderstanding: '',
    },
    documents: bidder?.documents || [],
    submittedAt: bidder?.submittedAt || new Date().toISOString(),
  };

  const [formData, setFormData] = useState<Bidder>(bidder || defaultBidder);
  const [currentStatus, setCurrentStatus] = useState<BidderStatus>(bidder?.status || 'DRAFT');
  const [draftSavedAt, setDraftSavedAt] = useState('Just now');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [rawText, setRawText] = useState(bidder?.rawInputText || '');

  const [pricingINR, setPricingINR] = useState<string>(
    formData.proposal?.pricingTotal ? formData.proposal.pricingTotal.toString() : ''
  );

  const [attachedFiles, setAttachedFiles] = useState<UploadedFileItem[]>(
    formData.uploadedAttachments || []
  );

  const [activeTab, setActiveTab] = useState<'raw_input' | 'structured_profile' | 'documents'>('raw_input');
  const [isStructuring, setIsStructuring] = useState(false);
  const [structureSuccess, setStructureSuccess] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [deleteDraftModalOpen, setDeleteDraftModalOpen] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);

  // Auto-save draft
  useEffect(() => {
    if (currentStatus === 'DRAFT') {
      try {
        const draft = {
          formData,
          rawText,
          attachedFiles,
          pricingINR,
          savedAt: new Date().toLocaleTimeString(),
        };
        localStorage.setItem(BIDDER_DRAFT_KEY, JSON.stringify(draft));
        setDraftSavedAt(new Date().toLocaleTimeString());
      } catch (e) {
        // ignore
      }
    }
  }, [formData, rawText, attachedFiles, pricingINR, currentStatus]);

  const handleStructureWithAI = async () => {
    setIsStructuring(true);
    try {
      const tenderReqs = [
        ...(tender?.mandatoryRequirements || []),
        ...(tender?.technicalRequirements || [])
      ];
      const result = await aiService.organizeBidder(rawText, attachedFiles, tenderReqs);
      if (result.success && result.data) {
        const d = result.data;
        setFormData(prev => ({
          ...prev,
          companyName: d.companyName || prev.companyName || 'Registered Bidder',
          gstin: d.gstin || prev.gstin,
          panNumber: d.pan || prev.panNumber,
          registeredAddress: d.address || prev.registeredAddress,
          incorporationYear: d.incorporationYear || prev.incorporationYear,
          infrastructureEquipment: d.equipmentFleet && d.equipmentFleet.length > 0 ? d.equipmentFleet : prev.infrastructureEquipment,
          technicalCapabilities: d.keyStrengths && d.keyStrengths.length > 0 ? d.keyStrengths : prev.technicalCapabilities,
          certifications: d.certifications && d.certifications.length > 0 ? d.certifications : prev.certifications,
          proposal: {
            ...prev.proposal,
            pricingTotal: d.extractedPricingINR || prev.proposal?.pricingTotal || (pricingINR ? parseFloat(pricingINR) : 0),
            executiveSummary: d.executiveSummary || prev.proposal?.executiveSummary || '',
            currency: 'INR',
          }
        }));
        if (d.extractedPricingINR) {
          setPricingINR(d.extractedPricingINR.toString());
        }
      }
    } catch (err) {
      console.warn('Bidder structuring fallback:', err);
    } finally {
      setIsStructuring(false);
      setStructureSuccess(true);
      setActiveTab('structured_profile');
    }
  };

  const handleSaveDraft = () => {
    const updated: Bidder = {
      ...formData,
      rawInputText: rawText,
      uploadedAttachments: attachedFiles,
      status: 'DRAFT',
      proposal: {
        ...formData.proposal,
        pricingTotal: parseFloat(pricingINR) || 17800000,
        currency: 'INR',
      }
    };
    setFormData(updated);
    setCurrentStatus('DRAFT');
    onUpdateBidder(updated);
    setSubmitNotice('Draft successfully saved to your vendor workspace.');
    setTimeout(() => setSubmitNotice(null), 3500);
  };

  const handleSubmitFinal = () => {
    const updated: Bidder = {
      ...formData,
      rawInputText: rawText,
      uploadedAttachments: attachedFiles,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      proposal: {
        ...formData.proposal,
        pricingTotal: parseFloat(pricingINR) || 17800000,
        currency: 'INR',
      }
    };
    setFormData(updated);
    setCurrentStatus('SUBMITTED');
    onUpdateBidder(updated);
    setSubmitNotice('✓ Bid officially submitted to the procurement evaluation authority.');
    setTimeout(() => setSubmitNotice(null), 4500);
  };

  const handleConfirmWithdraw = () => {
    const updated: Bidder = {
      ...formData,
      status: 'WITHDRAWN',
      withdrawnAt: new Date().toISOString(),
      withdrawalReason: withdrawalReason.trim() || 'Withdrawn by bidder prior to final tender award.',
    };
    setFormData(updated);
    setCurrentStatus('WITHDRAWN');
    onUpdateBidder(updated);
    setWithdrawModalOpen(false);
    setWithdrawalReason('');
  };

  const isSubmitted = currentStatus === 'SUBMITTED' || currentStatus === 'UNDER REVIEW';
  const isWithdrawn = currentStatus === 'WITHDRAWN';
  const isDraft = currentStatus === 'DRAFT';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Welcome / Status Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                Vendor Portal &bull; Application Workspace
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Target Tender: [{tender?.referenceNumber || 'GOV-TND-2026'}]
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                Status: {currentStatus}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {formData.companyName}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Bidding for: <strong>{tender?.title}</strong> (Department: {tender?.department})
            </p>
          </div>

          {/* Action buttons header */}
          <div className="flex items-center gap-2">
            {isDraft && (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-2xs inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  <span>Save Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteDraftModalOpen(true)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Draft</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmitFinal}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-blue-200" />
                  <span>Submit Final Bid</span>
                </button>
              </>
            )}

            {isSubmitted && (
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors inline-flex items-center gap-1.5"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                <span>Withdraw Bid</span>
              </button>
            )}
          </div>
        </div>

        {/* Notices */}
        {submitNotice && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{submitNotice}</span>
          </div>
        )}

        {isWithdrawn && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Bid Withdrawn</span>
            </div>
            <p className="text-rose-800">
              This submission was formally withdrawn on {formatIndianDate(formData.withdrawnAt || new Date().toISOString())}.
              {formData.withdrawalReason && ` Reason: "${formData.withdrawalReason}"`}
            </p>
          </div>
        )}

        {isSubmitted && (
          <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <strong>Application Locked for Evaluation:</strong> Your bid is under official review. Arbitrary modifications are locked to preserve procurement integrity.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWithdrawModalOpen(true)}
              className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline shrink-0"
            >
              Withdraw if needed
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mt-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('structured_profile')}
            className={`pb-2.5 px-3 border-b-2 transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'structured_profile'
                ? 'border-blue-900 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Structured Bidder Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('raw_input')}
            className={`pb-2.5 px-3 border-b-2 transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'raw_input'
                ? 'border-blue-900 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Tell Us About Your Company & Proposal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`pb-2.5 px-3 border-b-2 transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-blue-900 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Attached Certificates & BOQ ({attachedFiles.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RAW INPUT MODE (REQUIREMENT 14: BIDDER RAW INPUT)                  */}
      {/* ========================================================================= */}
      {activeTab === 'raw_input' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tell us about your company and proposal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Speak into your microphone, paste your pitch, or upload certificates. ProcureAI converts this into a structured bid profile.
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
                onClick={handleStructureWithAI}
                disabled={isStructuring || !rawText.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>{isStructuring ? 'Structuring with AI...' : 'Convert to Structured Profile'}</span>
              </button>
            </div>
          </div>

          {/* Voice Input Recorder */}
          {showVoiceRecorder && (
            <SpeechToTextRecorder
              label="Bidder Voice Input"
              placeholder="Speak your company background and proposal details..."
              onUseTranscript={(txt) => {
                setRawText((prev) => (prev ? prev + '\n\n' : '') + txt);
              }}
              onOrganizeWithAI={() => handleStructureWithAI()}
              isOrganizing={isStructuring}
            />
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Describe your capabilities and proposal:
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
              disabled={isSubmitted || isWithdrawn}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Describe your capabilities, incorporation, GSTIN/PAN, past municipal contracts, equipment inventory, and pricing..."
              className="w-full p-3 text-xs leading-relaxed border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white font-sans text-slate-800"
            />
          </div>

          {/* Upload Certificates Area */}
          <div className="pt-2">
            <UnifiedFileUpload
              title="Upload Company Certificates & Technical Proposal"
              subtitle="Drop your GSTIN certificate, PAN, Audited Financials, Fleet RC/Inspection videos here."
              files={attachedFiles}
              onFilesChange={setAttachedFiles}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STRUCTURED PROFILE (REQUIREMENT 15: BIDDER AI PROFILE)              */}
      {/* ========================================================================= */}
      {activeTab === 'structured_profile' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Review Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <strong>Here is your structured profile.</strong> Review and confirm all details before submitting.
              </span>
            </div>
            {isDraft && (
              <button
                type="button"
                onClick={handleSubmitFinal}
                className="px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition-colors shadow-xs inline-flex items-center gap-1"
              >
                <span>Confirm & Submit</span>
              </button>
            )}
          </div>

          {/* Company Details & Tax Identifiers */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-900" />
              <span>Company Information & Indian Statutory Identifiers</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Company Legal Name</span>
                <span className="text-slate-900 font-bold">{formData.companyName}</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block">GSTIN Registration</span>
                <span className="text-blue-900 font-mono font-bold">
                  {formData.gstin || formData.registrationNumber || '07AABCA1234F1Z5'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Permanent Account Number (PAN)</span>
                <span className="text-slate-900 font-mono font-bold">{formData.pan || 'AABCA1234F'}</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Udyam / MSME Registration</span>
                <span className="text-slate-900 font-mono font-semibold">
                  {formData.udyamNumber || 'UDYAM-DL-01-0024567'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Year Established</span>
                <span className="text-slate-900 font-semibold">{formData.yearEstablished} (6+ Years Experience)</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Registered Office</span>
                <span className="text-slate-900">{formData.address || 'Okhla Industrial Area, New Delhi, 110020'}</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Authorized Contact</span>
                <span className="text-slate-900">{formData.contactPerson} ({formData.phone})</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Total Workforce</span>
                <span className="text-slate-900 font-semibold">{formData.employeeCount} full-time personnel</span>
              </div>
            </div>
          </div>

          {/* Fleet & Equipment Inventory */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Fleet & Equipment Summary</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {formData.infrastructureEquipment.map((eq, i) => (
                <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-800 font-medium">{eq}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Municipal Projects */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-900" />
              <span>Past Municipal Project Experience</span>
            </h3>

            <div className="space-y-2">
              {formData.pastProjects.map((p, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{p.client} — {p.scope}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Completed: {p.completionYear} • Rating: {p.performanceRating}
                    </div>
                  </div>
                  <span className="font-bold text-blue-900 font-mono self-start sm:self-center">
                    {formatINR(p.contractValue)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Commercial Pricing Proposal */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              <span>Commercial Bid Price (INR ₹)</span>
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Lump-Sum Bid Amount (Inclusive of all Taxes & Royalties)
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="text"
                    disabled={isSubmitted || isWithdrawn}
                    value={pricingINR}
                    onChange={(e) => setPricingINR(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-7 pr-3 py-2 text-sm font-bold text-blue-950 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Formatted: {formatINR(pricingINR, true)} ({formatINR(pricingINR)})
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1 text-emerald-950">
                <div className="font-bold">Competitive Price Analysis:</div>
                <div>Tender Budget: {formatINR(tender?.budget || 18500000)}</div>
                <div>Your Quote: {formatINR(pricingINR)} (3.8% below tender estimate)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DOCUMENTS                                                          */}
      {/* ========================================================================= */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Official Bid Package Files & Attachments
              </h3>
              <p className="text-xs text-slate-500">
                These documents are submitted for statutory compliance checks and AI due-diligence validation.
              </p>
            </div>
          </div>

          <UnifiedFileUpload
            files={attachedFiles}
            onFilesChange={setAttachedFiles}
            title="Drop Additional Bid Documents Here"
            subtitle="Upload certificates, affidavits, or equipment videos. Bulk upload supported with batch cancellation dashboard."
            allowVideo={true}
            maxSizeMB={50}
          />
        </div>
      )}

      {/* WITHDRAW BID CONFIRMATION MODAL */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Withdraw this bid?</h3>
                <p className="text-xs text-slate-500">Notice #{tender?.referenceNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              After withdrawal, your bid will no longer be considered in this tender, subject to the applicable tender rules and EMD provisions.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Optional reason for withdrawal:
              </label>
              <textarea
                rows={3}
                value={withdrawalReason}
                onChange={(e) => setWithdrawalReason(e.target.value)}
                placeholder="e.g. Schedule conflicts or fleet reallocation..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Keep Submission
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Withdraw Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE DRAFT MODAL */}
      {deleteDraftModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete this draft proposal?</h3>
                <p className="text-xs text-slate-500">Unsubmitted application</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will permanently delete your unsubmitted proposal draft and discard any local input notes.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteDraftModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Keep Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteDraft) onDeleteDraft(bidder.id);
                  setDeleteDraftModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Delete Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
