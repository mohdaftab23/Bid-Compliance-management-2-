import React, { useState } from 'react';
import {
  Search,
  Building,
  FileCheck,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Trash2,
  Eye,
  Edit,
  RotateCcw,
  IndianRupee,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Tender, Bidder, BidderStatus } from '../types';
import { formatINR, formatIndianDate } from '../utils/indianFormat';

interface BidderDashboardProps {
  tenders: Tender[];
  bidders: Bidder[];
  currentBidder: Bidder;
  onNavigate: (view: string) => void;
  onSelectTender: (tender: Tender) => void;
  onUpdateBidder: (updated: Bidder) => void;
  onDeleteDraft?: (bidderId: string) => void;
}

export const BidderDashboard: React.FC<BidderDashboardProps> = ({
  tenders,
  bidders,
  currentBidder,
  onNavigate,
  onSelectTender,
  onUpdateBidder,
  onDeleteDraft,
}) => {
  const [withdrawModalBidder, setWithdrawModalBidder] = useState<Bidder | null>(null);
  const [withdrawalReason, setWithdrawalReason] = useState<string>('');
  const [deleteDraftModal, setDeleteDraftModal] = useState<Bidder | null>(null);

  const bidderApplications = bidders.filter((b) => b.companyName === currentBidder.companyName || b.id === currentBidder.id);

  const getStatusBadge = (status?: BidderStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            DRAFT
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
            SUBMITTED
          </span>
        );
      case 'UNDER REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            UNDER REVIEW
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            WITHDRAWN
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
            SUBMITTED
          </span>
        );
    }
  };

  const handleConfirmWithdraw = () => {
    if (withdrawModalBidder) {
      const updated: Bidder = {
        ...withdrawModalBidder,
        status: 'WITHDRAWN',
        withdrawnAt: new Date().toISOString(),
        withdrawalReason: withdrawalReason.trim() || 'Withdrawn by bidder prior to final award.',
      };
      onUpdateBidder(updated);
    }
    setWithdrawModalBidder(null);
    setWithdrawalReason('');
  };

  const handleConfirmDeleteDraft = () => {
    if (deleteDraftModal && onDeleteDraft) {
      onDeleteDraft(deleteDraftModal.id);
    }
    setDeleteDraftModal(null);
  };

  const draftApp = bidderApplications.find((b) => b.status === 'DRAFT');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
            <Building className="w-4 h-4 text-blue-900" />
            <span>Government Vendor Portal &bull; GeM & e-Procure</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bidder Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered Vendor: <strong>{currentBidder.companyName}</strong> (GSTIN: {currentBidder.gstin || '07AABCA1234F1Z5'})
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-xs text-blue-950">
          <Clock className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Next Step:</strong> {draftApp ? 'You have an unfinished bid draft waiting.' : 'Explore published notices and submit your proposal.'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THREE PRIMARY ACTIONS (REQUIREMENT 3: BIDDER HOME DASHBOARD)               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Action 1: Find Tenders */}
        <button
          type="button"
          onClick={() => onNavigate('find-tenders')}
          className="bg-white hover:bg-blue-50/60 border-2 border-slate-200 hover:border-blue-900 rounded-xl p-5 text-left transition-all shadow-xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Search className="w-5 h-5 text-blue-200" />
            </div>
            <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {tenders.length} Active
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
              Find Tenders
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Search open municipal contracts, road maintenance, and smart utility works.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-blue-900">
            <span>Browse Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Action 2: My Applications */}
        <button
          type="button"
          onClick={() => onNavigate('submissions')}
          className="bg-white hover:bg-emerald-50/60 border-2 border-slate-200 hover:border-emerald-700 rounded-xl p-5 text-left transition-all shadow-xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
              <FileCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {bidderApplications.length} Records
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
              My Applications
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Check submission status, compliance verification results, and audit trails.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-emerald-800">
            <span>View Submissions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Action 3: Continue Draft */}
        <button
          type="button"
          onClick={() => onNavigate('submissions')}
          className="bg-white hover:bg-amber-50/60 border-2 border-slate-200 hover:border-amber-700 rounded-xl p-5 text-left transition-all shadow-xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Edit className="w-5 h-5 text-amber-200" />
            </div>
            <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {draftApp ? 'Draft Pending' : 'Ready'}
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
              Continue Draft
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Resume your proposal with text, voice transcript, or certificate uploads.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-amber-800">
            <span>Resume Work</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MY APPLICATIONS SECTION                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">My Applications</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              History of bids submitted by {currentBidder.companyName}.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Tender</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Bid Amount</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bidderApplications.map((b) => {
                const tenderMatch = tenders.find((t) => t.id === b.tenderId) || tenders[0];
                const status = b.status || 'SUBMITTED';
                const isDraft = status === 'DRAFT';
                const isSubmitted = status === 'SUBMITTED' || status === 'UNDER REVIEW';
                const isWithdrawn = status === 'WITHDRAWN';

                return (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Tender Title */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">
                        {tenderMatch.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Notice #{tenderMatch.referenceNumber} • {tenderMatch.department}
                      </div>
                      {b.withdrawalReason && (
                        <div className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 mt-1 inline-block">
                          Withdrawn: "{b.withdrawalReason}"
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(status)}
                    </td>

                    {/* Bid Amount */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-bold text-blue-950">
                      {formatINR(b.proposal?.pricingTotal || 17800000)}
                    </td>

                    {/* Last Updated */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                      {formatIndianDate(b.submittedAt || new Date().toISOString())}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* If DRAFT: Continue, Delete Draft */}
                        {isDraft && (
                          <>
                            <button
                              type="button"
                              onClick={() => onNavigate('submissions')}
                              className="px-2.5 py-1 rounded bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs transition-colors"
                            >
                              Continue
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteDraftModal(b)}
                              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors"
                            >
                              Delete Draft
                            </button>
                          </>
                        )}

                        {/* If SUBMITTED / UNDER REVIEW: View, Withdraw Bid */}
                        {isSubmitted && (
                          <>
                            <button
                              type="button"
                              onClick={() => onNavigate('submissions')}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setWithdrawModalBidder(b);
                                setWithdrawalReason('');
                              }}
                              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors"
                              title="Withdraw submitted bid"
                            >
                              Withdraw Bid
                            </button>
                          </>
                        )}

                        {/* If WITHDRAWN */}
                        {isWithdrawn && (
                          <span className="text-[11px] text-slate-400 italic">
                            Withdrawn
                          </span>
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
      {/* WITHDRAW BID CONFIRMATION MODAL (REQUIREMENT 2)                           */}
      {/* ========================================================================= */}
      {withdrawModalBidder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Withdraw this bid?</h3>
                <p className="text-xs text-slate-500">Applicant: {withdrawModalBidder.companyName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              After withdrawal, your bid will no longer be considered in this tender, subject to the applicable tender rules and EMD conditions.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Optional reason for withdrawal:
              </label>
              <textarea
                rows={3}
                value={withdrawalReason}
                onChange={(e) => setWithdrawalReason(e.target.value)}
                placeholder="e.g. Inability to mobilize specified fleet within deadline..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawModalBidder(null)}
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
      {deleteDraftModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete this draft bid?</h3>
                <p className="text-xs text-slate-500">Unsubmitted application</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will permanently delete your unfinished bid draft and uploaded temporary files.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteDraftModal(null)}
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
