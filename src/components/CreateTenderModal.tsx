import React, { useState } from 'react';
import { X, Plus, Trash2, Shield, Sliders, FileText } from 'lucide-react';
import { Tender } from '../types';

interface CreateTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTender: (newTender: Tender) => void;
}

export const CreateTenderModal: React.FC<CreateTenderModalProps> = ({
  isOpen,
  onClose,
  onCreateTender,
}) => {
  const [title, setTitle] = useState('');
  const [refNumber, setRefNumber] = useState(`GOV-WAT-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [department, setDepartment] = useState('Department of Municipal Infrastructure');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('$3,500,000 USD');
  const [deadline, setDeadline] = useState('2026-11-30');

  const [eligibilityReqs, setEligibilityReqs] = useState<string[]>([
    'Minimum 5 years continuous legal incorporation',
    'Valid ISO 9001 (Quality) and ISO 27001 (Security) accreditations',
    'Valid Government Tax Compliance Clearance Certificate (< 6 months)',
    'Minimum audited average annual revenue of $3,000,000 USD over last 3 years',
    'Mandatory 10% Bank Guarantee / Irrevocable Bid Bond'
  ]);
  const [newEligibleReq, setNewEligibleReq] = useState('');

  const [techReqs, setTechReqs] = useState<string[]>([
    'Dual-band LoRaWAN and cellular failover telemetry module',
    'IP68 sub-surface submersible vault enclosure rating',
    'Direct integration with Central SCADA platform via Sparkplug B / MQTT'
  ]);
  const [newTechReq, setNewTechReq] = useState('');

  if (!isOpen) return null;

  const handleAddEligible = () => {
    if (!newEligibleReq.trim()) return;
    setEligibilityReqs([...eligibilityReqs, newEligibleReq.trim()]);
    setNewEligibleReq('');
  };

  const handleRemoveEligible = (index: number) => {
    setEligibilityReqs(eligibilityReqs.filter((_, i) => i !== index));
  };

  const handleAddTech = () => {
    if (!newTechReq.trim()) return;
    setTechReqs([...techReqs, newTechReq.trim()]);
    setNewTechReq('');
  };

  const handleRemoveTech = (index: number) => {
    setTechReqs(techReqs.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !refNumber.trim()) return;

    const tender: Tender = {
      id: `t-${Date.now()}`,
      title: title.trim(),
      referenceNumber: refNumber.trim(),
      department: department.trim(),
      description: description.trim() || 'Official procurement specifications for municipal public utility deployment.',
      status: 'ACTIVE',
      deadline,
      budget,
      eligibilityRequirements: eligibilityReqs,
      technicalRequirements: techReqs,
      financialRequirements: [
        'Audited financial statements for last 3 fiscal years',
        'Positive operating net cash flow',
        'Current liquidity ratio of at least 1.25:1'
      ],
      evaluationWeights: {
        eligibility: 20,
        technical: 25,
        pastPerformance: 20,
        financial: 15,
        proposalQuality: 10,
        riskProfile: 10
      },
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          name: `${refNumber}_Tender_Specification.pdf`,
          type: 'application/pdf',
          size: '1.9 MB',
          uploadedAt: new Date().toISOString().split('T')[0],
          category: 'SPECIFICATION'
        }
      ],
      createdAt: new Date().toISOString()
    };

    onCreateTender(tender);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Government Tender</h2>
              <p className="text-xs text-slate-400">Establish criteria, mandatory conditions, and evaluation weights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tender Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Municipal Smart Grid Telemetry Rollout"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reference Number</label>
              <input
                type="text"
                required
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Procuring Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ceiling Budget</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Submission Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Scope of Work Description</label>
            <textarea
              rows={3}
              placeholder="Describe objectives, operational constraints, and deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>

          {/* Mandatory Eligibility List */}
          <div className="space-y-2 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <label className="block text-slate-300 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              Mandatory Hard Requirements (PASS / FAIL)
            </label>
            <div className="space-y-1.5">
              {eligibilityReqs.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-200 font-medium">{i + 1}. {r}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEligible(i)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add another mandatory hard criterion..."
                value={newEligibleReq}
                onChange={(e) => setNewEligibleReq(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddEligible}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Technical Requirements */}
          <div className="space-y-2 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <label className="block text-slate-300 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Technical & Performance Specifications
            </label>
            <div className="space-y-1.5">
              {techReqs.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-200 font-medium">{i + 1}. {t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(i)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add technical specification..."
                value={newTechReq}
                onChange={(e) => setNewTechReq(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-colors"
            >
              Publish Tender
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
