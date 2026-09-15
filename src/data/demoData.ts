import { Tender, Bidder, DueDiligenceReport, AuditEvent } from '../types';

/**
 * Initial empty data structures for ProcureAI.
 * The application starts completely empty for every new user.
 * No demo tenders, bidders, companies, applications, or fictional reports.
 */
export const INITIAL_TENDERS: Tender[] = [];

export const INITIAL_BIDDERS: Bidder[] = [];

export const INITIAL_REPORTS: Record<string, DueDiligenceReport> = {};

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [];
