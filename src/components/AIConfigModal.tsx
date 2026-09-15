import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, X, Lock, ShieldCheck, Trash2 } from 'lucide-react';
import { aiService } from '../services/aiService';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyConfigured: () => void;
  initialMaskedKey?: string | null;
  forceFirstTimeGate?: boolean;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({
  isOpen,
  onClose,
  onKeyConfigured,
  initialMaskedKey,
  forceFirstTimeGate = false,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setErrorMsg('Please enter an API key to test.');
      return;
    }
    setErrorMsg(null);
    setTestResult(null);
    setIsTesting(true);

    const res = await aiService.testKey(apiKey.trim());
    setIsTesting(false);

    if (res.success) {
      setTestResult({ success: true, message: '✓ AI connected successfully' });
    } else {
      setTestResult({ success: false, message: res.error || 'Unable to connect to AI service. Please check your API key.' });
    }
  };

  const handleSaveAndContinue = async () => {
    if (!apiKey.trim()) {
      setErrorMsg('Please enter a valid API key.');
      return;
    }
    setErrorMsg(null);
    setIsSaving(true);

    const res = await aiService.setKey(apiKey.trim());
    setIsSaving(false);

    if (res.success) {
      onKeyConfigured();
      onClose();
    } else {
      setErrorMsg(res.error || 'Unable to connect to AI service. Please check your API key.');
    }
  };

  const handleRemoveKey = async () => {
    await aiService.disconnectKey();
    setApiKey('');
    setTestResult(null);
    setErrorMsg(null);
    onKeyConfigured();
    onClose();
  };

  const isConfigured = Boolean(initialMaskedKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">AI Configuration</h2>
              <p className="text-xs text-slate-400">ProcureAI Analysis & Synthesis Engine</p>
            </div>
          </div>
          {!forceFirstTimeGate && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-300 leading-relaxed">
            Add your AI API key to enable AI-powered analysis and organization.
          </p>

          {/* Current Key Status */}
          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-slate-400 font-medium">Status:</span>
              <div className="flex items-center gap-1.5 font-semibold">
                {isConfigured ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    ● Connected
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
                    ○ Not configured
                  </span>
                )}
              </div>
            </div>

            {initialMaskedKey && (
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Saved Key</span>
                <code className="font-mono text-slate-200 tracking-wider text-xs">{initialMaskedKey}</code>
              </div>
            )}
          </div>

          {/* Input field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="Enter your AI API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 pr-10 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Keys are processed securely server-side. Never exposed in public web traffic or logs.</span>
            </p>
          </div>

          {/* Status feedback */}
          {testResult && (
            <div
              className={`p-3.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Security & Audit notice */}
          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/60 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>ProcureAI Engine:</strong> AI assists in organizing and analyzing information. Human procurement officers stay in complete control of all final decisions and awards.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {initialMaskedKey ? (
            <button
              type="button"
              onClick={handleRemoveKey}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove API Key</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !apiKey.trim()}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
            >
              {isTesting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Test Connection</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAndContinue}
              disabled={isSaving || !apiKey.trim()}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save API Key</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
