import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  Check,
  Loader2
} from 'lucide-react';
import { AIStatus, aiService } from '../services/aiService';

interface SettingsViewProps {
  aiStatus: AIStatus;
  onRefreshStatus: () => void;
  onOpenAIModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  aiStatus,
  onRefreshStatus,
  onOpenAIModal,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; text: string } | null>(null);

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);

    const keyToTest = apiKeyInput.trim();
    const res = await aiService.testKey(keyToTest);
    setIsTesting(false);

    if (res.success) {
      setTestResult({ success: true, text: '✓ AI connected successfully' });
    } else {
      setTestResult({ success: false, text: res.error || '⚠ Connection error: Unable to connect to AI service.' });
    }
  };

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, text: 'Please enter an API key to save.' });
      return;
    }
    setIsSaving(true);
    setTestResult(null);

    const res = await aiService.setKey(apiKeyInput.trim());
    setIsSaving(false);

    if (res.success) {
      setApiKeyInput('');
      setTestResult({ success: true, text: '✓ AI API key saved and verified.' });
      onRefreshStatus();
    } else {
      setTestResult({ success: false, text: res.error || '⚠ Failed to save API key.' });
    }
  };

  const handleRemoveKey = async () => {
    await aiService.disconnectKey();
    setApiKeyInput('');
    setTestResult(null);
    onRefreshStatus();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900 mb-1">
          <Shield className="w-4 h-4 text-blue-900" />
          <span>System Settings</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Settings</h1>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl">
          Manage AI engine credentials, security protocols, and audit parameters.
        </p>
      </div>

      {/* AI Configuration Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">AI Configuration</h2>
              <p className="text-xs text-slate-500">
                Add your AI API key to enable AI-powered analysis and organization.
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="self-start sm:self-auto">
            {aiStatus.connected ? (
              <span className="px-2.5 py-1 rounded text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ● Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded text-xs font-bold border bg-slate-50 text-slate-700 border-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                ○ Not configured
              </span>
            )}
          </div>
        </div>

        {/* Status banner if not configured */}
        {!aiStatus.connected && (
          <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-950 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-bold">AI is not configured yet.</span>
              <p className="text-slate-600 mt-0.5">
                The application works normally without an AI key. To enable automated synthesis and due diligence, add an API key below.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAIModal}
              className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              Configure AI
            </button>
          </div>
        )}

        {/* API Key Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              API Key
            </label>
            <div className="relative max-w-xl">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder={aiStatus.connected ? '••••••••••••••••••••' : 'Enter your AI API key...'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 pr-10 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {aiStatus.maskedKey && (
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Current active key: {aiStatus.maskedKey}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting}
              className="px-3.5 py-2 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              onClick={handleSaveKey}
              disabled={isSaving || !apiKeyInput.trim()}
              className="px-3.5 py-2 rounded-md text-xs font-semibold bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save API Key</span>
            </button>

            {aiStatus.connected && (
              <button
                type="button"
                onClick={handleRemoveKey}
                className="px-3.5 py-2 rounded-md text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove API Key</span>
              </button>
            )}
          </div>

          {/* Feedback messages */}
          {testResult && (
            <div
              className={`p-3 rounded-md border text-xs font-semibold flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{testResult.text}</span>
            </div>
          )}
        </div>

        {/* Security Disclosures */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <span className="font-semibold text-slate-900 block flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-900" />
            Security & Data Protection Standards
          </span>
          <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-600">
            <li>API keys are stored securely server-side and never exposed in browser pages or logs.</li>
            <li>Original tender and proposal documents are never overwritten or deleted by AI.</li>
            <li>AI suggestions are subject to review and verification by the human procurement officer.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
