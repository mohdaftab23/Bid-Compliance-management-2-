/**
 * India-First Localization Utilities for ProcureAI
 * Supports INR formatting, Indian dates (DD/MM/YYYY), Indian states/districts, and tax identifiers.
 */

export function formatINR(val: number | string | undefined | null, compact = false): string {
  if (val === undefined || val === null || val === '') return '₹0';

  let num: number;
  if (typeof val === 'number') {
    num = val;
  } else {
    // If it's a USD string from old demo data, convert roughly (1 USD ~ 85 INR)
    if (val.includes('$') || val.includes('USD')) {
      const cleaned = parseFloat(val.replace(/[^0-9.]/g, ''));
      num = isNaN(cleaned) ? 0 : Math.round(cleaned * 85);
    } else {
      const cleaned = parseFloat(val.replace(/[^0-9.]/g, ''));
      num = isNaN(cleaned) ? 0 : cleaned;
    }
  }

  if (compact) {
    if (num >= 10000000) {
      const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '');
      return `₹${cr} Cr`;
    }
    if (num >= 100000) {
      const lakh = (num / 100000).toFixed(2).replace(/\.00$/, '');
      return `₹${lakh} Lakh`;
    }
  }

  // Format with standard Indian numbering (Lakhs and Crores: 12,34,56,789)
  const isNegative = num < 0;
  const absVal = Math.abs(Math.round(num));
  const s = absVal.toString();

  if (s.length <= 3) {
    return `${isNegative ? '-' : ''}₹${s}`;
  }

  const lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return `${isNegative ? '-' : ''}₹${formattedOther},${lastThree}`;
}

export function formatIndianDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return 'DD/MM/YYYY';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateStr);
  }
}

export interface IndianRegion {
  state: string;
  districts: string[];
}

export const INDIAN_REGIONS: IndianRegion[] = [
  {
    state: 'NCT of Delhi',
    districts: [
      'New Delhi',
      'Central Delhi',
      'North Delhi',
      'South Delhi',
      'East Delhi',
      'West Delhi',
      'North East Delhi',
      'North West Delhi',
      'South East Delhi',
      'South West Delhi',
      'Shahdara'
    ]
  },
  {
    state: 'Maharashtra',
    districts: ['Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik']
  },
  {
    state: 'Karnataka',
    districts: ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru']
  },
  {
    state: 'Uttar Pradesh',
    districts: ['Lucknow', 'Noida (Gautam Buddha Nagar)', 'Ghaziabad', 'Kanpur', 'Varanasi', 'Agra']
  },
  {
    state: 'Haryana',
    districts: ['Gurugram', 'Faridabad', 'Panchkula', 'Karnal', 'Ambala', 'Sonipat']
  },
  {
    state: 'Tamil Nadu',
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem']
  },
  {
    state: 'Gujarat',
    districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar']
  },
  {
    state: 'Telangana',
    districts: ['Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Warangal']
  },
  {
    state: 'West Bengal',
    districts: ['Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah']
  }
];

export const COMMON_INDIAN_DOCUMENTS = [
  { label: 'GSTIN Registration Certificate', code: 'GST_CERT', required: true },
  { label: 'Permanent Account Number (PAN) Card', code: 'PAN_CARD', required: true },
  { label: 'Certificate of Incorporation / CIN', code: 'CIN_CERT', required: true },
  { label: 'MSME / Udyam Registration Certificate', code: 'UDYAM_CERT', required: false },
  { label: 'Audited Balance Sheets (Last 3 FYs with UDIN)', code: 'AUDITED_FIN', required: true },
  { label: 'Earnest Money Deposit (EMD) / Bid Security Declaration', code: 'EMD_RECEIPT', required: true },
  { label: 'Past Work Orders & Client Completion Certificates', code: 'WORK_ORDERS', required: true },
  { label: 'ISO 9001:2015 & ISO 14001:2015 Certificates', code: 'ISO_CERTS', required: false },
  { label: 'Non-Blacklisting / Debarment Undertaking Affidavit', code: 'NON_BLACKLIST', required: true },
  { label: 'Power of Attorney for Authorized Signatory', code: 'POA', required: true }
];
