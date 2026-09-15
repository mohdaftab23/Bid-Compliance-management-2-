export type UserRole = 'OFFICER' | 'BIDDER';

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: UserRole;
  department?: string;
  organization?: string;
  isEmailVerified?: boolean;
}

export type TenderStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'OPEN FOR BIDS'
  | 'UNDER EVALUATION'
  | 'CLOSED'
  | 'CANCELLED'
  | 'ARCHIVED'
  | 'ACTIVE'
  | 'EVALUATION'
  | 'REVIEWED';

export type BidderStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER REVIEW' | 'WITHDRAWN' | 'EVALUATED';

export interface UploadTask {
  id: string;
  file: File;
  name: string;
  size: string;
  sizeBytes: number;
  progress: number; // 0 - 100
  status: 'QUEUED' | 'UPLOADING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  category?: 'SPECIFICATION' | 'LEGAL_TERMS' | 'TECHNICAL_SCHEDULE' | 'ADDENDUM' | 'MEDIA' | 'OTHER';
  error?: string;
  previewUrl?: string;
  type: string;
  extension: string;
}

export interface UploadedFileItem {
  id: string;
  name: string;
  type: string;
  extension: string;
  size: string;
  sizeBytes: number;
  uploadedAt: string;
  category?: 'SPECIFICATION' | 'LEGAL_TERMS' | 'TECHNICAL_SCHEDULE' | 'ADDENDUM' | 'MEDIA' | 'OTHER';
  status: 'UPLOADED' | 'UPLOADING' | 'FAILED' | 'CANCELLED';
  previewUrl?: string;
  dataUrl?: string;
  isVideo?: boolean;
  isImage?: boolean;
  isPdf?: boolean;
  isSpreadsheet?: boolean;
  isDoc?: boolean;
}

export interface StructuredRequirements {
  mandatoryRequirements: string[];
  eligibilityRequirements: string[];
  technicalRequirements: string[];
  financialRequirements: string[];
  evaluationCriteria: { category: string; weight: number; description?: string }[];
  constraints: string[];
  requiredDocuments: string[];
}

export interface EvaluationWeights {
  eligibility: number; // default 20
  technical: number; // default 25
  pastPerformance: number; // default 20
  financial: number; // default 15
  proposalQuality: number; // default 10
  riskProfile: number; // default 10
}

export interface TenderDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  category: 'SPECIFICATION' | 'LEGAL_TERMS' | 'TECHNICAL_SCHEDULE' | 'ADDENDUM';
}

export interface Tender {
  id: string;
  title: string;
  referenceNumber: string;
  department: string;
  description: string;
  status: TenderStatus;
  deadline: string;
  budget: string;
  tenderType?: string;
  location?: string;
  state?: string;
  district?: string;
  pinCode?: string;
  emdBondAmount?: string;
  performanceSecurity?: string;
  eligibilityRequirements: string[];
  mandatoryRequirements?: string[];
  technicalRequirements: string[];
  financialRequirements: string[];
  constraints?: string[];
  requiredDocumentsList?: string[];
  rawRequirementsText?: string;
  rawNeedDescription?: string;
  rawVoiceTranscript?: string;
  rawInputsCount?: {
    total: number;
    documents: number;
    images: number;
    videos: number;
    transcripts: number;
  };
  cancellationReason?: string;
  cancelledAt?: string;
  archivedAt?: string;
  evaluationWeights: EvaluationWeights;
  weightsSource?: 'DEFAULT' | 'TENDER_DOCUMENT' | 'OFFICER_CUSTOM';
  detectedWeightsDocument?: string;
  documents: TenderDocument[];
  attachments?: UploadedFileItem[];
  createdAt: string;
}

export type DataSourceType = 'BIDDER_PROVIDED' | 'EXTERNAL_SOURCE' | 'AI_INFERENCE';

export interface ExternalRegistryRecord {
  companyNumber: string;
  companyName: string;
  status: 'ACTIVE' | 'DISSOLVED' | 'UNDER_INVESTIGATION' | 'SUSPENDED';
  jurisdiction: string;
  incorporationDate: string;
  officialAddress: string;
  directors: string[];
  sicCodes: string[];
  verifiedAt: string;
  verificationSource: string;
  verificationHash: string;
  matchesBidderSubmission: {
    nameMatch: boolean;
    registrationNumberMatch: boolean;
    activeStandingMatch: boolean;
    incorporationDateMatch: boolean;
    notes?: string;
  };
}

export interface ExternalVerificationResult {
  status: 'VERIFIED' | 'DISCREPANCY_DETECTED' | 'UNAVAILABLE' | 'NOT_PERFORMED';
  source: string;
  details: string;
  record?: ExternalRegistryRecord;
  timestamp?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  validUntil: string;
  certNumber: string;
  status: 'VALID' | 'EXPIRED' | 'UNVERIFIED';
}

export interface PastProject {
  id: string;
  projectName: string;
  clientName: string;
  contractValue: number;
  currency: string;
  duration: string;
  completionStatus: 'COMPLETED' | 'ONGOING' | 'DELAYED' | 'DISPUTED';
  completionDate: string;
  hasCompletionCertificate: boolean;
  evidenceDocName?: string;
}

export interface FinancialInfo {
  annualRevenue: number;
  profitLoss: number;
  currency: string;
  fiscalYear: string;
  isAudited: boolean;
  liquidityRatio?: number;
  bankSolvencyGuaranteeProvided: boolean;
  bankName?: string;
}

export interface BidProposal {
  technicalProposalSummary: string;
  methodology: string;
  timelineMonths: number;
  keyPersonnel: string[];
  pricingTotal: number;
  currency: string;
  scopeUnderstanding: string;
}

export type DocumentStatus = 'SUBMITTED' | 'MISSING' | 'INVALID' | 'POTENTIALLY_INCONSISTENT';

export interface SubmittedDocument {
  id: string;
  fileName: string;
  docType: 'COMPANY_REG' | 'FINANCIAL_AUDIT' | 'TECH_PROPOSAL' | 'PAST_CERT' | 'PAST_PERF_CERTS' | 'ISO_CERT' | 'TAX_CLEARANCE' | 'BANK_GUARANTEE' | 'PERSONNEL_CV' | 'OTHER';
  status: DocumentStatus;
  fileSize: string;
  uploadedAt: string;
  notes?: string;
  extractedSnippet?: string;
}

export type BidderDocument = SubmittedDocument;

export interface Bidder {
  id: string;
  tenderId: string;
  companyName: string;
  registrationNumber: string;
  country: string;
  region: string;
  yearEstablished: number;
  businessCategory: string;
  contactPerson: string;
  email: string;
  contactEmail?: string;
  phone: string;
  contactPhone?: string;
  address: string;
  registeredAddress?: string;
  employeeCount: number;
  incorporationYear?: number;
  annualTurnoverINR?: number;
  technicalCapabilities: string[];
  certifications: Certification[];
  infrastructureEquipment: string[];
  pastProjects: PastProject[];
  financialInfo: FinancialInfo;
  proposal: BidProposal;
  projectApproach?: string;
  relevantExperienceDetails?: string;
  additionalInformation?: string;
  status?: BidderStatus;
  withdrawnAt?: string;
  withdrawalReason?: string;
  gstin?: string;
  pan?: string;
  panNumber?: string;
  cin?: string;
  udyamNumber?: string;
  rawVoiceTranscript?: string;
  rawInputText?: string;
  documents: SubmittedDocument[];
  uploadedAttachments?: UploadedFileItem[];
  submittedAt: string;
}

export type RequirementStatus = 'PASS' | 'FAIL' | 'PARTIAL' | 'UNKNOWN';

export interface EligibilityCheck {
  requirement: string;
  status: RequirementStatus;
  evidence: string;
  source: string;
  explanation: string;
}

export interface EvidenceReference {
  id: string;
  sourceFile: string;
  pageOrSection: string;
  evidenceText: string;
  classification: 'Tender-provided' | 'Bidder-provided' | 'Public-source' | 'Third-party verification' | 'AI inference' | 'External registry';
  dataSourceType?: DataSourceType;
  verified: boolean;
}

export interface CategoryScore {
  category: string;
  maxPoints: number;
  awardedPoints: number;
  percentage: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  evidenceReferences: {
    sourceFile: string;
    pageOrSection: string;
    evidenceText: string;
  }[];
}

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ConsistencyItem {
  title: string;
  severity: SeverityLevel;
  evidence: string;
  explanation: string;
  fieldAffected: string;
}

export interface RiskItem {
  id: string;
  title: string;
  category: 'Compliance Risk' | 'Financial Risk' | 'Technical Risk' | 'Performance Risk' | 'Documentation Risk' | 'Verification Risk' | 'Conflict of Interest';
  severity: SeverityLevel;
  evidence: string;
  explanation: string;
  recommendedHumanVerification: string;
}

export interface MissingInfoItem {
  title: string;
  description: string;
  impact: string;
  requiredAction: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface HumanAnnotation {
  id: string;
  targetSection: string;
  comment: string;
  officerName: string;
  timestamp: string;
}

export interface ScoreOverrideDetail {
  originalScore: number;
  adjustedScore: number;
  officerJustification: string;
  overriddenAt: string;
}

export interface HumanReview {
  reviewedBy?: string;
  reviewedAt?: string;
  officerStatus: 'PENDING_REVIEW' | 'REVIEWED_CONFIRMED' | 'OVERRIDDEN' | 'FLAGGED_FOR_AUDIT' | 'REJECTED_NON_COMPLIANT';
  officerNotes: string;
  officerScoreOverride?: number;
  scoreOverride?: ScoreOverrideDetail;
  annotations: HumanAnnotation[];
}

export interface DueDiligenceReport {
  tenderId: string;
  bidderId: string;
  analyzedAt: string;
  aiModelUsed: string;
  overallScore: number; // 0 - 100
  aiConfidence: number; // 0 - 100
  recommendation: 'STRONG CANDIDATE' | 'PROMISING CANDIDATE' | 'REQUIRES FURTHER REVIEW' | 'HIGH RISK' | 'INELIGIBLE';
  recommendationStatement: string;
  scoresByCategory: CategoryScore[];
  eligibilityChecks: EligibilityCheck[];
  technicalEvaluation: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    feasibilityScore: number;
    evidence: { sourceFile: string; pageOrSection: string; evidenceText: string }[];
  };
  pastPerformance: {
    summary: string;
    verifiedProjectsCount: number;
    similarityRating: string;
    delayOrDisputeFlags: string[];
    evidenceBreakdown: {
      verifiedEvidence: string[];
      selfDeclared: string[];
      unverifiedClaims: string[];
      missingInfo: string[];
    };
  };
  financialEvaluation: {
    summary: string;
    stabilityRating: string;
    contractCapabilityFit: string;
    financialInconsistencies: string[];
    unknownMetrics: string[];
  };
  documentConsistency: {
    inconsistencies: ConsistencyItem[];
  };
  riskAssessment: RiskItem[];
  missingInformation: MissingInfoItem[];
  evidenceRepository: EvidenceReference[];
  explainability: {
    whatAIFound: string;
    whyItMatters: string;
    supportingEvidence: string;
    evidenceOrigin: string;
    confidenceLevel: string;
    requiresHumanVerification: boolean;
    humanVerificationFocus: string;
  };
  externalVerification?: ExternalVerificationResult;
  humanReview: HumanReview;
}

export interface AuditEvent {
  id: string;
  tenderId?: string;
  bidderId?: string;
  timestamp: string;
  action: string;
  actor: string;
  actorRole: UserRole;
  details: string;
}
