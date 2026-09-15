import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { OfficerDashboard } from './components/OfficerDashboard';
import { TenderDetailsView } from './components/TenderDetailsView';
import { BidderComparisonView } from './components/BidderComparisonView';
import { BidderReportView } from './components/BidderReportView';
import { BidderSubmissionView } from './components/BidderSubmissionView';
import { BidderDashboard } from './components/BidderDashboard';
import { AuditTrailView } from './components/AuditTrailView';
import { SettingsView } from './components/SettingsView';
import { ExternalIntegrationsView } from './components/ExternalIntegrationsView';
import { AIConfigModal } from './components/AIConfigModal';
import { AnalysisProgressModal } from './components/AnalysisProgressModal';
import { CreateTenderWorkspace } from './components/CreateTenderWorkspace';
import { AuthView } from './components/AuthView';
import {
  INITIAL_TENDERS,
  INITIAL_BIDDERS,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS
} from './data/demoData';
import { Tender, Bidder, DueDiligenceReport, AuditEvent, UserRole, User } from './types';
import { aiService, AIStatus } from './services/aiService';

export default function App() {
  // Current Authenticated User state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('procureai_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [tenders, setTenders] = useState<Tender[]>(INITIAL_TENDERS);
  const [bidders, setBidders] = useState<Bidder[]>(INITIAL_BIDDERS);
  const [reports, setReports] = useState<Record<string, DueDiligenceReport>>(INITIAL_REPORTS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);

  const [currentView, setCurrentView] = useState<string>(() => {
    return currentUser?.role === 'BIDDER' ? 'submissions' : 'dashboard';
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return currentUser?.role || 'OFFICER';
  });

  const [selectedTender, setSelectedTender] = useState<Tender>(INITIAL_TENDERS[0]);
  const [selectedBidder, setSelectedBidder] = useState<Bidder>(INITIAL_BIDDERS[0]);

  // AI Connection State
  const [aiStatus, setAiStatus] = useState<AIStatus>({
    connected: false,
    provider: 'Google Gemini',
    model: 'gemini-3.8-flash',
    maskedKey: null,
    hasEnvKey: false
  });
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [forceGate, setForceGate] = useState(false);

  // Modals
  const [isCreateTenderOpen, setIsCreateTenderOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  // Analysis Progress State
  const [analysisProgress, setAnalysisProgress] = useState({
    currentBidderIndex: 0,
    stageIndex: 0,
    stageName: '',
    stageDetail: '',
  });

  const checkAIStatus = async () => {
    const status = await aiService.getStatus();
    setAiStatus(status);
    return status;
  };

  useEffect(() => {
    checkAIStatus().then(status => {
      // If no key is set yet, show the setup prompt
      if (!status.connected) {
        setIsAIModalOpen(true);
      }
    });
  }, []);

  const handleKeyConfigured = async () => {
    const status = await checkAIStatus();
    setForceGate(false);
    // Add audit log
    const event: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SETTINGS_UPDATED',
      actor: 'System Administrator',
      actorRole: 'OFFICER',
      details: 'Gemini AI engine configuration verified and activated (gemini-3.8-flash).'
    };
    setAuditLogs(prev => [event, ...prev]);
  };

  // Run AI Due Diligence across all bidders for the active tender
  const handleRunDueDiligence = async () => {
    // If not connected, invite user to connect first
    if (!aiStatus.connected) {
      setIsAIModalOpen(true);
      return;
    }

    setIsAnalysisOpen(true);
    const updatedReports: Record<string, DueDiligenceReport> = { ...reports };

    for (let bIdx = 0; bIdx < bidders.length; bIdx++) {
      const currentB = bidders[bIdx];
      setAnalysisProgress(prev => ({
        ...prev,
        currentBidderIndex: bIdx,
      }));

      const newReport = await aiService.runDueDiligence(
        selectedTender,
        currentB,
        (stageIndex, stageName, stageDetail) => {
          setAnalysisProgress({
            currentBidderIndex: bIdx,
            stageIndex,
            stageName,
            stageDetail
          });
        }
      );

      updatedReports[currentB.id] = newReport;
    }

    setReports(updatedReports);
    setIsAnalysisOpen(false);

    // Record audit event
    const auditEv: AuditEvent = {
      id: `aud-${Date.now()}`,
      tenderId: selectedTender.id,
      timestamp: new Date().toISOString(),
      action: 'AI_ANALYSIS_EXECUTED',
      actor: 'Authorized Procurement Officer',
      actorRole: 'OFFICER',
      details: `Full 8-stage AI due-diligence executed across ${bidders.length} submissions using ${aiStatus.model}. Lead candidate: ${bidders[0].companyName} (${updatedReports[bidders[0].id]?.overallScore}/100).`
    };
    setAuditLogs(prev => [auditEv, ...prev]);

    // Automatically transition to the side-by-side comparison matrix
    setCurrentView('comparison');
  };

  const handleCreateTender = (newTender: Tender) => {
    setTenders(prev => [newTender, ...prev]);
    setSelectedTender(newTender);
    // Add audit log
    const auditEv: AuditEvent = {
      id: `aud-${Date.now()}`,
      tenderId: newTender.id,
      timestamp: new Date().toISOString(),
      action: 'TENDER_PUBLISHED',
      actor: 'Procurement Officer',
      actorRole: 'OFFICER',
      details: `Tender ${newTender.referenceNumber} created: "${newTender.title}" with ${newTender.eligibilityRequirements?.length ?? 0} mandatory criteria.`
    };
    setAuditLogs(prev => [auditEv, ...prev]);
    setCurrentView('tenders');
  };

  const handleUpdateReport = (updatedReport: DueDiligenceReport) => {
    setReports(prev => ({
      ...prev,
      [updatedReport.bidderId]: updatedReport
    }));

    // Record audit event for human review signoff or score override
    const auditEv: AuditEvent = {
      id: `aud-${Date.now()}`,
      tenderId: updatedReport.tenderId,
      bidderId: updatedReport.bidderId,
      timestamp: new Date().toISOString(),
      action: updatedReport.humanReview.scoreOverride ? 'SCORE_OVERRIDDEN' : 'HUMAN_REVIEW_CONFIRMED',
      actor: updatedReport.humanReview.reviewedBy || 'Procurement Officer',
      actorRole: 'OFFICER',
      details: updatedReport.humanReview.scoreOverride
        ? `Score adjusted from ${updatedReport.humanReview.scoreOverride.originalScore} to ${updatedReport.humanReview.scoreOverride.adjustedScore}. Reason: ${updatedReport.humanReview.scoreOverride.officerJustification}`
        : `Formal review signed off with status ${updatedReport.humanReview.officerStatus} for ${bidders.find(b => b.id === updatedReport.bidderId)?.companyName}.`
    };
    setAuditLogs(prev => [auditEv, ...prev]);
  };

  const handleUpdateBidder = (updatedBidder: Bidder) => {
    setBidders(prev => prev.map(b => b.id === updatedBidder.id ? updatedBidder : b));
    setSelectedBidder(updatedBidder);

    const auditEv: AuditEvent = {
      id: `aud-${Date.now()}`,
      tenderId: updatedBidder.tenderId,
      bidderId: updatedBidder.id,
      timestamp: new Date().toISOString(),
      action: 'BID_SUBMISSION_RECEIVED',
      actor: updatedBidder.contactPerson,
      actorRole: 'BIDDER',
      details: `${updatedBidder.companyName} updated submission documents (${updatedBidder.documents.length} attachments on file).`
    };
    setAuditLogs(prev => [auditEv, ...prev]);
  };

  const handleUpdateWeights = (newWeights: Tender['evaluationWeights']) => {
    const updated = {
      ...selectedTender,
      evaluationWeights: newWeights,
      weightsSource: 'CUSTOM' as const
    };
    setSelectedTender(updated);
    setTenders(prev => prev.map(t => t.id === updated.id ? updated : t));

    const auditEv: AuditEvent = {
      id: `aud-${Date.now()}`,
      tenderId: updated.id,
      timestamp: new Date().toISOString(),
      action: 'SETTINGS_UPDATED',
      actor: 'Procurement Officer',
      actorRole: 'OFFICER',
      details: `Evaluation weights updated for tender ${updated.referenceNumber}.`
    };
    setAuditLogs(prev => [auditEv, ...prev]);
  };

  const handleCancelTender = (tenderId: string, reason?: string) => {
    setTenders(prev =>
      prev.map(t =>
        t.id === tenderId
          ? {
              ...t,
              status: 'CANCELLED' as const,
              cancellationReason: reason,
              cancelledAt: new Date().toISOString(),
            }
          : t
      )
    );

    const targetTender = tenders.find(t => t.id === tenderId);
    const auditEv: AuditEvent = {
      id: `aud-${Date.now()}`,
      tenderId,
      timestamp: new Date().toISOString(),
      action: 'TENDER_STATUS_CHANGED',
      actor: 'Procurement Officer',
      actorRole: 'OFFICER',
      details: `Tender ${targetTender?.referenceNumber || tenderId} CANCELLED. Reason: ${reason || 'Administrative cancellation'}.`
    };
    setAuditLogs(prev => [auditEv, ...prev]);
  };

  const handleCloseTender = (tenderId: string) => {
    setTenders(prev =>
      prev.map(t =>
        t.id === tenderId
          ? {
              ...t,
              status: 'CLOSED' as const,
            }
          : t
      )
    );

    const targetTender = tenders.find(t => t.id === tenderId);
    const auditEv: AuditEvent = {
      id: `aud-${Date.now()}`,
      tenderId,
      timestamp: new Date().toISOString(),
      action: 'TENDER_STATUS_CHANGED',
      actor: 'Procurement Officer',
      actorRole: 'OFFICER',
      details: `Tender ${targetTender?.referenceNumber || tenderId} officially CLOSED to new submissions.`
    };
    setAuditLogs(prev => [auditEv, ...prev]);
  };

  const handleArchiveTender = (tenderId: string) => {
    setTenders(prev =>
      prev.map(t =>
        t.id === tenderId
          ? {
              ...t,
              status: 'ARCHIVED' as const,
              archivedAt: new Date().toISOString(),
            }
          : t
      )
    );

    const targetTender = tenders.find(t => t.id === tenderId);
    const auditEv: AuditEvent = {
      id: `aud-${Date.now()}`,
      tenderId,
      timestamp: new Date().toISOString(),
      action: 'TENDER_STATUS_CHANGED',
      actor: 'Procurement Officer',
      actorRole: 'OFFICER',
      details: `Tender ${targetTender?.referenceNumber || tenderId} moved to ARCHIVE.`
    };
    setAuditLogs(prev => [auditEv, ...prev]);
  };

  const handleDeleteDraftTender = (tenderId: string) => {
    const targetTender = tenders.find(t => t.id === tenderId);
    setTenders(prev => prev.filter(t => t.id !== tenderId));

    const auditEv: AuditEvent = {
      id: `aud-${Date.now()}`,
      tenderId,
      timestamp: new Date().toISOString(),
      action: 'TENDER_STATUS_CHANGED',
      actor: 'Procurement Officer',
      actorRole: 'OFFICER',
      details: `Draft tender ${targetTender?.referenceNumber || tenderId} permanently deleted.`
    };
    setAuditLogs(prev => [auditEv, ...prev]);
  };

  const handleDeleteBidderDraft = (bidderId: string) => {
    setBidders(prev => prev.filter(b => b.id !== bidderId));
  };

  const handleLogout = () => {
    localStorage.removeItem('procureai_auth_user');
    setCurrentUser(null);
  };

  // If user is not authenticated, show initial Login / Sign-up / Verification screen
  if (!currentUser) {
    const handleAuth = (user: User) => {
      setCurrentUser(user);
      setUserRole(user.role);
      setCurrentView(user.role === 'OFFICER' ? 'dashboard' : 'submissions');
    };

    return (
      <AuthView
        onAuthenticated={handleAuth}
        onLoginSuccess={handleAuth}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans selection:bg-blue-900 selection:text-white">
      {/* Enterprise Restrained Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => {
          if (view === 'submissions') {
            setSelectedBidder(bidders[0]);
          }
          setCurrentView(view);
        }}
        userRole={userRole}
        onToggleRole={() => {
          const newRole = userRole === 'OFFICER' ? 'BIDDER' : 'OFFICER';
          setUserRole(newRole);
          setCurrentView('dashboard');
        }}
        aiConnected={aiStatus.connected}
        onOpenAIConfig={() => setIsAIModalOpen(true)}
        tendersCount={tenders.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <HeaderBar
          tenders={tenders}
          selectedTender={selectedTender}
          onSelectTender={(t) => {
            setSelectedTender(t);
            // If on tender-specific view, keep it
            if (currentView === 'tender-detail') {
              setCurrentView('tenders');
            }
          }}
          userRole={userRole}
          onRunDueDiligence={handleRunDueDiligence}
          onOpenCreateTender={() => setIsCreateTenderOpen(true)}
          onOpenComparison={() => setCurrentView('comparison')}
          aiConnected={aiStatus.connected}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAIConfig={() => setIsAIModalOpen(true)}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* OFFICER VIEWS */}
          {userRole === 'OFFICER' && (
            <>
              {currentView === 'dashboard' && (
                <OfficerDashboard
                  tenders={tenders}
                  bidders={bidders}
                  reports={reports}
                  onSelectTender={(t) => {
                    setSelectedTender(t);
                    setCurrentView('tenders');
                  }}
                  onSelectBidder={(b) => {
                    setSelectedBidder(b);
                    setCurrentView('report');
                  }}
                  onRunDueDiligence={handleRunDueDiligence}
                  onOpenCreateTender={() => setIsCreateTenderOpen(true)}
                  onOpenComparison={() => setCurrentView('comparison')}
                  onCancelTender={handleCancelTender}
                  onCloseTender={handleCloseTender}
                  onArchiveTender={handleArchiveTender}
                  onDeleteDraftTender={handleDeleteDraftTender}
                />
              )}

              {currentView === 'tenders' && (
                <TenderDetailsView
                  tender={selectedTender}
                  bidders={bidders.filter(b => b.tenderId === selectedTender.id)}
                  reports={reports}
                  onSelectBidder={(b) => {
                    setSelectedBidder(b);
                    setCurrentView('report');
                  }}
                  onRunDueDiligence={handleRunDueDiligence}
                  onOpenComparison={() => setCurrentView('comparison')}
                  onUpdateWeights={handleUpdateWeights}
                />
              )}

              {currentView === 'comparison' && (
                <BidderComparisonView
                  tender={selectedTender}
                  bidders={bidders.filter(b => b.tenderId === selectedTender.id)}
                  reports={reports}
                  onSelectBidder={(b) => {
                    setSelectedBidder(b);
                    setCurrentView('report');
                  }}
                  onRunDueDiligence={handleRunDueDiligence}
                  onBackToDashboard={() => setCurrentView('dashboard')}
                />
              )}

              {currentView === 'report' && (
                <BidderReportView
                  tender={selectedTender}
                  bidder={selectedBidder}
                  report={reports[selectedBidder.id] || INITIAL_REPORTS['b-aquatech']}
                  onUpdateReport={handleUpdateReport}
                  onBackToComparison={() => setCurrentView('comparison')}
                  onBackToDashboard={() => setCurrentView('dashboard')}
                />
              )}

              {currentView === 'integrations' && (
                <ExternalIntegrationsView />
              )}

              {currentView === 'audit' && (
                <AuditTrailView logs={auditLogs} />
              )}

              {currentView === 'settings' && (
                <SettingsView
                  aiStatus={aiStatus}
                  onRefreshStatus={checkAIStatus}
                  onOpenAIModal={() => setIsAIModalOpen(true)}
                />
              )}
            </>
          )}

          {/* BIDDER VIEWS */}
          {userRole === 'BIDDER' && (
            <>
              {currentView === 'dashboard' && (
                <BidderDashboard
                  tenders={tenders}
                  bidders={bidders}
                  currentBidder={selectedBidder || bidders[0]}
                  onNavigate={(v) => setCurrentView(v)}
                  onSelectTender={(t) => {
                    setSelectedTender(t);
                    setCurrentView('tender-browser');
                  }}
                  onUpdateBidder={handleUpdateBidder}
                  onDeleteDraft={handleDeleteBidderDraft}
                />
              )}

              {currentView === 'submissions' && (
                <BidderSubmissionView
                  tender={selectedTender}
                  bidder={selectedBidder}
                  onUpdateBidder={handleUpdateBidder}
                  onDeleteDraft={(id) => {
                    handleDeleteBidderDraft(id);
                    setCurrentView('dashboard');
                  }}
                />
              )}

              {(currentView === 'tender-browser' || currentView === 'find-tenders') && (
                <TenderDetailsView
                  tender={selectedTender}
                  bidders={bidders.filter(b => b.tenderId === selectedTender.id)}
                  reports={reports}
                  onSelectBidder={() => {}}
                  onRunDueDiligence={() => {}}
                  onOpenComparison={() => {}}
                  onUpdateWeights={() => {}}
                />
              )}

              {currentView === 'integrations' && (
                <ExternalIntegrationsView />
              )}

              {currentView === 'settings' && (
                <SettingsView
                  aiStatus={aiStatus}
                  onRefreshStatus={checkAIStatus}
                  onOpenAIModal={() => setIsAIModalOpen(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global AI Configuration Modal */}
      <AIConfigModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onKeyConfigured={handleKeyConfigured}
        initialMaskedKey={aiStatus.maskedKey}
        forceFirstTimeGate={forceGate}
      />

      {/* Global Analysis Progress Modal */}
      <AnalysisProgressModal
        isOpen={isAnalysisOpen}
        tender={selectedTender}
        bidders={bidders}
        currentBidderIndex={analysisProgress.currentBidderIndex}
        currentStageIndex={analysisProgress.stageIndex}
        stageName={analysisProgress.stageName}
        stageDetail={analysisProgress.stageDetail}
        totalStages={8}
        onComplete={() => setIsAnalysisOpen(false)}
      />

      {/* Global Create Tender Workspace (5-Step AI Extraction Wizard) */}
      <CreateTenderWorkspace
        isOpen={isCreateTenderOpen}
        onClose={() => setIsCreateTenderOpen(false)}
        onCreateTender={handleCreateTender}
      />
    </div>
  );
}
