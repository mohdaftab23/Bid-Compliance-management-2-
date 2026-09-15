import React, { useState } from 'react';
import {
  PlusCircle,
  Users,
  FileText,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Archive,
  Trash2,
  AlertOctagon,
  Edit,
  Eye,
  Calendar,
  IndianRupee,
  Building,
  HelpCircle
} from 'lucide-react';
import { Tender, Bidder, DueDiligenceReport, TenderStatus } from '../types';
import { formatINR, formatIndianDate } from '../utils/indianFormat';

interface OfficerDashboardProps {
  tenders: Tender[];
  bidders: Bidder[];
  reports: Record<string, DueDiligenceReport>;
  onSelectTender: (tender: Tender) => void;
  onSelectBidder: (bidder: Bidder) => void;
  onRunDueDiligence: () => void;
  onOpenCreateTender: () => void;
  onOpenComparison: () => void;
  onCancelTender?: (tenderId: string, reason?: string) => void;
  onCloseTender?: (tenderId: string) => void;
  onArchiveTender?: (tenderId: string) => void;
  onDeleteDraftTender?: (tenderId: string) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  tenders,
  bidders,
  reports,
  onSelectTender,
  onSelectBidder,
  onRunDueDiligence,
  onOpenCreateTender,
  onOpenComparison,
  onCancelTender,
  onCloseTender,
  onArchiveTender,
  onDeleteDraftTender,
}) => {
  // Modal state for Cancel Tender confirmation
  const [cancelModalTender, setCancelModalTender] = useState<Tender | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');

  // Modal state for Delete Draft confirmation
  const [deleteDraftModalTender, setDeleteDraftModalTender] = useState<Tender | null>(null);

  const getStatusBadge = (status: TenderStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            DRAFT
          </span>
        );
      case 'OPEN FOR BIDS':
      case 'ACTIVE':
      case 'PUBLISHED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            OPEN FOR BIDS
          </span>
        );
      case 'UNDER EVALUATION':
      case 'EVALUATION':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            UNDER EVALUATION
          </span>
        );
      case 'CLOSED':
      case 'REVIEWED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            CLOSED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            CANCELLED
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600 border border-slate-300">
            ARCHIVED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const handleConfirmCancel = () => {
    if (cancelModalTender && onCancelTender) {
      onCancelTender(cancelModalTender.id, cancellationReason);
    }
    setCancelModalTender(null);
    setCancellationReason('');
  };

  const handleConfirmDeleteDraft = () => {
    if (deleteDraftModalTender && onDeleteDraftTender) {
      onDeleteDraftTender(deleteDraftModalTender.id);
    }
    setDeleteDraftModalTender(null);
  };

  return (
    <div className="space-y-6">
      {/* Welcome / Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
            <Shield className="w-4 h-4 text-blue-900" />
            <span>Government of India &bull; e-Procurement Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Procurement Officer Home
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your tender lifecycles, review incoming vendor bids, and perform evidence-based due diligence.
          </p>
        </div>

        {/* Next recommended action badge */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-xs text-blue-950">
          <Clock className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Next Step:</strong> {bidders.length > 0 ? 'Review candidate submissions or create a new tender.' : 'Create your first tender to invite public bids.'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THREE PRIMARY ACTIONS (REQUIREMENT 3: SIMPLE HOME DASHBOARD)               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Action 1: Create Tender */}
        <button
          type="button"
          onClick={onOpenCreateTender}
          className="bg-white hover:bg-blue-50/60 border-2 border-slate-200 hover:border-blue-900 rounded-xl p-5 text-left transition-all shadow-xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-xs">
              <PlusCircle className="w-5 h-5 text-blue-200" />
            </div>
            <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              New Notice
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
              + Create Tender
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Start guided 5-step creation with text, speech, or file upload.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-blue-900">
            <span>Start Creating</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Action 2: Review Bids */}
        <button
          type="button"
          onClick={onOpenComparison}
          className="bg-white hover:bg-emerald-50/60 border-2 border-slate-200 hover:border-emerald-700 rounded-xl p-5 text-left transition-all shadow-xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
              <Users className="w-5 h-5 text-emerald-200" />
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {bidders.length} Submitted
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
              Review Bids
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Evaluate vendor submissions, compare compliance, and check risk scores.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-emerald-800">
            <span>Open Evaluation Matrix</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Action 3: View Tenders */}
        <button
          type="button"
          onClick={() => {
            if (tenders.length > 0) {
              onSelectTender(tenders[0]);
            }
          }}
          className="bg-white hover:bg-slate-100/70 border-2 border-slate-200 hover:border-slate-800 rounded-xl p-5 text-left transition-all shadow-xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-5 h-5 text-slate-300" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              {tenders.length} Total
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
              View Tenders
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Browse specifications, manage requirements, and update tender documents.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-slate-800">
            <span>Inspect Active Notices</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* YOUR TENDERS SECTION (REQUIREMENT 3)                                       */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Your Tenders</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Current procurement notices under your jurisdiction.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCreateTender}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white transition-colors shadow-2xs inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-200" />
              <span>+ Create Tender</span>
            </button>
          </div>
        </div>

        {/* Tenders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Tender Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Bids</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Budget (INR)</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tenders.map((t) => {
                const bidsCount = bidders.filter((b) => b.tenderId === t.id).length;
                const isDraft = t.status === 'DRAFT';
                const isOpen = t.status === 'OPEN FOR BIDS' || t.status === 'ACTIVE' || t.status === 'PUBLISHED';
                const isClosed = t.status === 'CLOSED' || t.status === 'REVIEWED';
                const isCancelled = t.status === 'CANCELLED';
                const isArchived = t.status === 'ARCHIVED';

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Tender Name & Notice Reference */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-xs hover:text-blue-900 cursor-pointer" onClick={() => onSelectTender(t)}>
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>{t.referenceNumber}</span>
                        <span>•</span>
                        <span>{t.department}</span>
                      </div>
                      {t.cancellationReason && (
                        <div className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-1 max-w-sm">
                          Cancelled: "{t.cancellationReason}"
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(t.status)}
                    </td>

                    {/* Bids */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">
                        {bidsCount} {bidsCount === 1 ? 'Bid' : 'Bids'}
                      </span>
                    </td>

                    {/* Deadline */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                      {formatIndianDate(t.deadline)}
                    </td>

                    {/* Budget */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-bold text-blue-950">
                      {formatINR(t.budget)}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View / Open */}
                        <button
                          type="button"
                          onClick={() => onSelectTender(t)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>

                        {/* If DRAFT: Edit, Delete Draft */}
                        {isDraft && (
                          <>
                            <button
                              type="button"
                              onClick={() => onSelectTender(t)}
                              className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteDraftModalTender(t)}
                              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}

                        {/* If PUBLISHED / OPEN: Close Tender, Cancel Tender */}
                        {isOpen && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (onCloseTender) onCloseTender(t.id);
                              }}
                              className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs transition-colors"
                              title="Close tender to new submissions"
                            >
                              Close Tender
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCancelModalTender(t);
                                setCancellationReason('');
                              }}
                              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors"
                              title="Cancel tender"
                            >
                              Cancel Tender
                            </button>
                          </>
                        )}

                        {/* If CLOSED: Archive */}
                        {isClosed && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onArchiveTender) onArchiveTender(t.id);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                          >
                            <Archive className="w-3 h-3" />
                            <span>Archive</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CANCEL TENDER CONFIRMATION MODAL (REQUIREMENT 1)                          */}
      {/* ========================================================================= */}
      {cancelModalTender && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cancel this tender?</h3>
                <p className="text-xs text-slate-500">Notice #{cancelModalTender.referenceNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              After cancellation, bidders will no longer be able to submit bids. All current submissions will be marked as cancelled in the public portal. Important procurement records will be safely retained in the audit registry.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Optional cancellation reason:
              </label>
              <textarea
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Budget reallocation / Scope revision required by the Municipal Corporation..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalTender(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Keep Tender
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Cancel Tender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE DRAFT CONFIRMATION MODAL                                           */}
      {/* ========================================================================= */}
      {deleteDraftModalTender && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete this draft tender?</h3>
                <p className="text-xs text-slate-500">Notice #{deleteDraftModalTender.referenceNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This draft tender has not been published yet. Deleting it will permanently discard unfinalized draft notes.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteDraftModalTender(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Keep Draft
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDraft}
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
