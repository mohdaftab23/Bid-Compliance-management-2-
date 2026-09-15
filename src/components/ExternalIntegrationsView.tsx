import React, { useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, Search, Shield, RefreshCw, ExternalLink, ArrowRight, FileCheck, Layers } from 'lucide-react';
import { EXTERNAL_CONNECTORS, externalDataService, ConnectorInfo } from '../services/externalDataService';
import { ExternalRegistryRecord } from '../types';

export const ExternalIntegrationsView: React.FC = () => {
  const [connectors] = useState<ConnectorInfo[]>(EXTERNAL_CONNECTORS);
  const [queryRegNumber, setQueryRegNumber] = useState('REG-2017-884920');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<ExternalRegistryRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTestQuery = async (regNum: string) => {
    setIsQuerying(true);
    setHasSearched(true);
    try {
      const result = await externalDataService.queryRegistryDirect(regNum);
      setQueryResult(result);
    } catch (e) {
      console.error(e);
      setQueryResult(null);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">External Data Integrations</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              Gov Verification Gateways
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Direct connections to official government registries and public databases. ProcureAI cross-checks bidder self-declarations against authenticated external sources without human manual lookups.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Public Registry API: Live
          </span>
        </div>
      </div>

      {/* 3-Tier Data Provenance Architecture Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Layers className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <h3 className="font-semibold text-slate-900">Mandatory Data Provenance Standard</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              In accordance with government procurement transparency regulations, ProcureAI strictly partitions all evaluation inputs into three distinct audit classes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 bg-white border border-slate-200 rounded-md">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-900">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  1. Bidder-Provided Data
                </span>
                <p className="text-xs text-slate-500 mt-1">Self-declared statements, vendor proposals, and attached files.</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-md">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  2. External Source Data
                </span>
                <p className="text-xs text-slate-500 mt-1">Official corporate registrar feeds, tax clearances, sanctions lists.</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-md">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-900">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  3. AI Inferences
                </span>
                <p className="text-xs text-slate-500 mt-1">Algorithmic risk correlations, compliance deductions, and scores.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Connectors Grid */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Configured External Gateways</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectors.map((connector) => (
            <div key={connector.id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-900" />
                    <h3 className="font-semibold text-sm text-slate-900">{connector.name}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    connector.status === 'OPERATIONAL'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : connector.status === 'CONFIGURABLE'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {connector.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{connector.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>Authority: <strong className="text-slate-700">{connector.sourceAuthority}</strong></span>
                <span>Latency: <strong className="text-slate-700">{connector.latencyMs}ms</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Verification Test Bench */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Simulate Public Company Registry Verification</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Enter any enterprise registration number to test live gateway retrieval and cross-referencing.
            </p>
          </div>
          {/* Quick presets */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="hidden sm:inline">Try preset:</span>
            <button
              onClick={() => { setQueryRegNumber('REG-2017-884920'); handleTestQuery('REG-2017-884920'); }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-mono text-[11px]"
            >
              AquaTech (PASS)
            </button>
            <button
              onClick={() => { setQueryRegNumber('REG-2021-994182'); handleTestQuery('REG-2021-994182'); }}
              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded font-mono text-[11px]"
            >
              Apex Flow (&lt;5 yrs)
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={queryRegNumber}
              onChange={(e) => setQueryRegNumber(e.target.value)}
              placeholder="e.g. REG-2017-884920"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white text-slate-900 font-mono"
            />
          </div>
          <button
            onClick={() => handleTestQuery(queryRegNumber)}
            disabled={isQuerying || !queryRegNumber.trim()}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isQuerying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Query Registry</span>
          </button>
        </div>

        {/* Query Result Card */}
        {hasSearched && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            {queryResult ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Official Registrar Record</span>
                    <h3 className="text-base font-bold text-slate-900">{queryResult.companyName}</h3>
                    <p className="text-xs text-slate-600 font-mono">Reg #: {queryResult.companyNumber} &bull; {queryResult.jurisdiction}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                    queryResult.matchesBidderSubmission.incorporationDateMatch && queryResult.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {queryResult.matchesBidderSubmission.incorporationDateMatch ? 'VERIFIED MATCH' : 'DISCREPANCY DETECTED'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block">Incorporation Date</span>
                    <strong className="text-slate-900">{queryResult.incorporationDate}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block">Standing</span>
                    <strong className="text-slate-900">{queryResult.status}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block">Directors</span>
                    <strong className="text-slate-900 truncate block">{queryResult.directors.join(', ')}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block">SIC Classification</span>
                    <strong className="text-slate-900 truncate block">{queryResult.sicCodes[0]}</strong>
                  </div>
                </div>

                <div className="bg-white p-3 rounded border border-slate-200 text-xs space-y-1">
                  <span className="font-semibold text-slate-900">Registry Evaluation Notes:</span>
                  <p className="text-slate-700">{queryResult.matchesBidderSubmission.notes}</p>
                  <div className="pt-2 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                    <span>Authority: {queryResult.verificationSource}</span>
                    <span className="font-mono truncate max-w-xs">{queryResult.verificationHash}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>No company record found in the external registry for registration number <strong>{queryRegNumber}</strong>. An inquiry may need to be issued to the bidder.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
