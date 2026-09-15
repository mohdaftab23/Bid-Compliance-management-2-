/**
 * AIProvider Abstraction
 * Decouples AI synthesis, organization, and due diligence analysis
 * from underlying models (e.g. Gemini, Claude, local models, or custom backends).
 */

import { DueDiligenceReport, Tender, Bidder, StructuredRequirements, UploadedFileItem } from '../types';

export interface AIStatus {
  connected: boolean;
  provider: string;
  model: string;
  maskedKey: string | null;
  hasEnvKey: boolean;
}

export interface OrganizedTenderOutput {
  title?: string;
  background?: string;
  objective?: string;
  scopeOfWork?: string;
  eligibilityRequirements?: string[];
  technicalRequirements?: string[];
  financialRequirements?: string[];
  mandatoryConditions?: string[];
  evaluationCriteria?: Array<{ category: string; weight: number; description: string }>;
  requiredDocuments?: string[];
  timeline?: string;
  submissionRequirements?: string[];
  constraints?: string[];
  otherConditions?: string[];
  missingInformationNoted?: string[];
}

export interface OrganizedBidderOutput {
  companyName?: string;
  companyOverview?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  incorporationYear?: number;
  equipmentFleet?: string[];
  keyStrengths?: string[];
  relevantExperience?: string[];
  previousProjects?: Array<{ client: string; year: string; value: string; description: string }>;
  technicalCapability?: string[];
  manpower?: string;
  equipment?: string[];
  certifications?: string[];
  financialInformation?: {
    auditedTurnover?: string;
    netCashFlow?: string;
    solvencyRatio?: string;
  };
  proposedApproach?: string;
  timeline?: string;
  pricing?: string;
  extractedPricingINR?: number;
  executiveSummary?: string;
  supportingEvidence?: string[];
  missingInformationNoted?: string[];
}

export interface AIProvider {
  getStatus(): Promise<AIStatus>;
  testKey(apiKey: string): Promise<{ success: boolean; message?: string; error?: string }>;
  setKey(apiKey: string): Promise<{ success: boolean; message?: string; error?: string; maskedKey?: string }>;
  disconnectKey(): Promise<{ success: boolean; message?: string }>;
  extractRequirements(rawText: string): Promise<{
    success: boolean;
    data?: StructuredRequirements;
    message?: string;
    source?: string;
    error?: string;
  }>;
  organizeTender(
    rawText: string,
    attachedFiles?: UploadedFileItem[]
  ): Promise<{
    success: boolean;
    data?: OrganizedTenderOutput;
    message?: string;
    source?: string;
    error?: string;
  }>;
  organizeBidder(
    rawText: string,
    attachedFiles?: UploadedFileItem[],
    tenderRequirements?: string[]
  ): Promise<{
    success: boolean;
    data?: OrganizedBidderOutput;
    message?: string;
    source?: string;
    error?: string;
  }>;
  runDueDiligence(
    tender: Tender,
    bidder: Bidder,
    onProgress?: (stageIndex: number, stageName: string, detail: string) => void
  ): Promise<DueDiligenceReport>;
}
