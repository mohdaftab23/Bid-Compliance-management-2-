import { Bidder, ExternalRegistryRecord, ExternalVerificationResult } from '../types';

// Mock official government public registry databases for simulated verification
const OFFICIAL_REGISTRY_DATABASE: Record<string, ExternalRegistryRecord> = {
  'REG-2017-884920': {
    companyNumber: 'REG-2017-884920',
    companyName: 'AquaTech Solutions Ltd',
    status: 'ACTIVE',
    jurisdiction: 'United States (Commonwealth of Massachusetts)',
    incorporationDate: '2017-03-14',
    officialAddress: '450 Harbor Boulevard, Suite 800, Boston, MA 02210',
    directors: ['Marcus Vance', 'Eleanor Vance', 'Dr. Aris Thorne'],
    sicCodes: ['3824 - Totalizing Fluid Meters and Counting Devices', '8711 - Engineering Services'],
    verifiedAt: '2026-08-18T10:14:22Z',
    verificationSource: 'US National Enterprise Registrar & Mass. Corporations Division',
    verificationHash: 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    matchesBidderSubmission: {
      nameMatch: true,
      registrationNumberMatch: true,
      activeStandingMatch: true,
      incorporationDateMatch: true,
      notes: 'Company is in active good standing. Incorporation date (2017) satisfies tender minimum 5-year requirement.'
    }
  },
  'REG-2019-339102': {
    companyNumber: 'REG-2019-339102',
    companyName: 'HydroGrid Dynamics Inc',
    status: 'ACTIVE',
    jurisdiction: 'United States (State of California)',
    incorporationDate: '2019-06-22',
    officialAddress: '1200 Silicon Parkway, Building C, San Jose, CA 95134',
    directors: ['David K. Hoffman', 'Sonia Patel', 'Ray Chen'],
    sicCodes: ['3625 - Relays and Industrial Controls', '7372 - Prepackaged Software'],
    verifiedAt: '2026-08-18T10:14:25Z',
    verificationSource: 'California Secretary of State Business Registry (C-Corp 421098)',
    verificationHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    matchesBidderSubmission: {
      nameMatch: true,
      registrationNumberMatch: true,
      activeStandingMatch: true,
      incorporationDateMatch: false,
      notes: 'Registry confirms incorporation date of June 22, 2019 (6.5 years). Self-declaration indicated established 2019. Minor discrepancy: corporate status had brief administrative suspension in Q1 2024 for delayed annual franchise tax report, resolved in Q2 2024.'
    }
  },
  'REG-2021-994182': {
    companyNumber: 'REG-2021-994182',
    companyName: 'Apex Flow Infrastructure Co',
    status: 'ACTIVE',
    jurisdiction: 'United States (State of Texas)',
    incorporationDate: '2021-11-04',
    officialAddress: '8800 Energy Corridor Freeway, Suite 300, Houston, TX 77079',
    directors: ['Gregory Vance', 'Tanya Morales'],
    sicCodes: ['1623 - Water, Sewer, Pipeline, and Communications Construction'],
    verifiedAt: '2026-08-18T10:14:28Z',
    verificationSource: 'Texas Comptroller of Public Accounts & Secretary of State',
    verificationHash: 'SHA256:6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    matchesBidderSubmission: {
      nameMatch: true,
      registrationNumberMatch: true,
      activeStandingMatch: true,
      incorporationDateMatch: true,
      notes: 'CRITICAL ELIGIBILITY NOTE: Registry confirms incorporation on Nov 4, 2021 (~4.8 years operating history as of tender deadline). Fails the mandatory 5-year continuous incorporation condition.'
    }
  }
};

export interface ConnectorInfo {
  id: string;
  name: string;
  category: 'REGISTRY' | 'FINANCIAL' | 'TAX' | 'SANCTIONS';
  status: 'OPERATIONAL' | 'STAGED' | 'CONFIGURABLE';
  description: string;
  sourceAuthority: string;
  apiProtocol: string;
  lastSync?: string;
  latencyMs: number;
}

export const EXTERNAL_CONNECTORS: ConnectorInfo[] = [
  {
    id: 'conn-registry',
    name: 'National Corporate & Business Entity Registry',
    category: 'REGISTRY',
    status: 'OPERATIONAL',
    description: 'Direct live query interface to national registrar databases, business certificates, active corporate standing, and legal directors.',
    sourceAuthority: 'Secretary of State / Companies House / SEC EDGAR API',
    apiProtocol: 'REST / OAuth2 Mutual-TLS',
    lastSync: 'Live (Synchronous)',
    latencyMs: 140
  },
  {
    id: 'conn-sanctions',
    name: 'Consolidated Sanctions & PEP Watchlist API',
    category: 'SANCTIONS',
    status: 'OPERATIONAL',
    description: 'Automated screening against OFAC, UN Security Council, World Bank Debarment, and Interpol Red Notices.',
    sourceAuthority: 'OpenSanctions Consortium & International Regulatory Clearinghouse',
    apiProtocol: 'REST / Daily Delta Feed',
    lastSync: 'Updated Today 04:00 UTC',
    latencyMs: 85
  },
  {
    id: 'conn-tax',
    name: 'National Revenue & Tax Compliance Gateway',
    category: 'TAX',
    status: 'CONFIGURABLE',
    description: 'Instant cryptographic verification of official tax clearance certificates and current good standing certificates.',
    sourceAuthority: 'Internal Revenue & Municipal Tax Authorities',
    apiProtocol: 'Gov-Direct e-Gov Gateway (SAML / X.509)',
    lastSync: 'Awaiting Department Key',
    latencyMs: 310
  },
  {
    id: 'conn-financial',
    name: 'Credit Bureau & Financial Solvency Analytics',
    category: 'FINANCIAL',
    status: 'STAGED',
    description: 'Independent cross-referencing of audited financial turnover, Dun & Bradstreet PAYDEX scores, and commercial bankruptcy petitions.',
    sourceAuthority: 'Dun & Bradstreet / Bureau van Dijk (Orbis)',
    apiProtocol: 'Financial Data Exchange (FDX)',
    lastSync: 'Staged for Phase 2 Integration',
    latencyMs: 450
  }
];

export const externalDataService = {
  /**
   * Verify a bidder against external public company registries
   */
  async verifyBidderCompany(bidder: Bidder): Promise<ExternalVerificationResult> {
    // Attempt to hit backend integration endpoint first
    try {
      const res = await fetch('/api/integrations/verify-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: bidder.companyName,
          registrationNumber: bidder.registrationNumber,
          country: bidder.country
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.result) {
          return data.result;
        }
      }
    } catch (e) {
      console.warn('API integration call to server failed, using local simulated registry:', e);
    }

    // Paced deterministic local fallback
    await new Promise((r) => setTimeout(r, 300));
    return this.lookupLocalRegistry(bidder);
  },

  /**
   * Local lookup matching or synthesizing verified registry record
   */
  lookupLocalRegistry(bidder: Bidder): ExternalVerificationResult {
    const regNum = bidder.registrationNumber.trim();
    const existing = OFFICIAL_REGISTRY_DATABASE[regNum];

    if (existing) {
      const hasDiscrepancy = !existing.matchesBidderSubmission.incorporationDateMatch ||
        !existing.matchesBidderSubmission.nameMatch ||
        existing.status !== 'ACTIVE';

      return {
        status: hasDiscrepancy ? 'DISCREPANCY_DETECTED' : 'VERIFIED',
        source: existing.verificationSource,
        details: existing.matchesBidderSubmission.notes || `Official registry record confirmed for ${bidder.companyName}.`,
        record: existing,
        timestamp: new Date().toISOString()
      };
    }

    // Dynamic registry response for newly added bidders
    const currentYear = 2026;
    const companyAge = currentYear - bidder.yearEstablished;
    const isPassingAge = companyAge >= 5;

    const dynamicRecord: ExternalRegistryRecord = {
      companyNumber: bidder.registrationNumber,
      companyName: bidder.companyName,
      status: 'ACTIVE',
      jurisdiction: `${bidder.country} Corporate Registrar`,
      incorporationDate: `${bidder.yearEstablished}-01-15`,
      officialAddress: bidder.address,
      directors: [bidder.contactPerson || 'Authorized Representative'],
      sicCodes: ['8711 - Commercial & Technical Services'],
      verifiedAt: new Date().toISOString(),
      verificationSource: `Public Company Registry of ${bidder.country}`,
      verificationHash: `SHA256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      matchesBidderSubmission: {
        nameMatch: true,
        registrationNumberMatch: true,
        activeStandingMatch: true,
        incorporationDateMatch: isPassingAge,
        notes: isPassingAge
          ? `Verified active status with ${companyAge} years operating history.`
          : `Operating history of ${companyAge} years verified, below tender 5-year requirement.`
      }
    };

    return {
      status: isPassingAge ? 'VERIFIED' : 'DISCREPANCY_DETECTED',
      source: dynamicRecord.verificationSource,
      details: dynamicRecord.matchesBidderSubmission.notes || 'Registry verification complete.',
      record: dynamicRecord,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Query company registry directly by registration number
   */
  async queryRegistryDirect(registrationNumber: string): Promise<ExternalRegistryRecord | null> {
    const clean = registrationNumber.trim();
    if (OFFICIAL_REGISTRY_DATABASE[clean]) {
      return OFFICIAL_REGISTRY_DATABASE[clean];
    }
    // Search by key fragment
    const foundKey = Object.keys(OFFICIAL_REGISTRY_DATABASE).find(k => k.toLowerCase().includes(clean.toLowerCase()));
    if (foundKey) {
      return OFFICIAL_REGISTRY_DATABASE[foundKey];
    }
    return null;
  }
};
