import React, { useState } from 'react';
import { Shield, History, Search, Download, Filter, CheckCircle2, AlertTriangle, Sparkles, User, FileText } from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditTrailViewProps {
  logs: AuditEvent[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesQuery =
      log.details.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(filterQuery.toLowerCase());

    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    return matchesQuery && matchesAction;
  });

  const exportAuditCSV = () => {
    const header = 'Timestamp,Action,Actor,Role,TenderID,BidderID,Details\n';
    const rows = filteredLogs.map(l =>
      `"${l.timestamp}","${l.action}","${l.actor}","${l.actorRole}","${l.tenderId}","${l.bidderId || ''}","${l.details.replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `procureai_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900 mb-1">
            <History className="w-4 h-4 text-blue-900" />
            <span>Gov-Enterprise Audit Standard Level 4</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Government Procurement Audit Trail</h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Tamper-evident, timestamped log of tender publications, bidder uploads, external registry queries, AI analysis executions, and officer review decisions.
          </p>
        </div>
        <button
          onClick={exportAuditCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit actions, actors, or details..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-900 rounded-md pl-8 pr-3 py-1.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-700 text-xs focus:outline-none focus:bg-white"
        >
          <option value="ALL">All Actions</option>
          <option value="TENDER_PUBLISHED">Tender Published</option>
          <option value="BID_SUBMISSION_RECEIVED">Bid Submissions</option>
          <option value="AI_ANALYSIS_EXECUTED">AI Analysis Executions</option>
          <option value="HUMAN_REVIEW_CONFIRMED">Human Officer Sign-Offs</option>
          <option value="SCORE_OVERRIDDEN">Officer Score Overrides</option>
          <option value="SETTINGS_UPDATED">Policy & Engine Updates</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Chronological Event Stream</span>
          <span className="text-xs text-slate-500 font-mono">{filteredLogs.length} Events Recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Actor</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredLogs.map((log) => {
                const actionBadgeColor =
                  log.action === 'HUMAN_REVIEW_CONFIRMED'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : log.action === 'AI_ANALYSIS_EXECUTED'
                    ? 'bg-blue-50 text-blue-900 border-blue-200'
                    : log.action === 'SCORE_OVERRIDDEN'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-300';

                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${actionBadgeColor}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-mono text-slate-500">{log.actorRole}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 leading-relaxed max-w-xl">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
