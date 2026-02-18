

export type CarbonCredit = {
  id: string;
  name: string;
  projectType: 'Reforestation' | 'Renewable Energy' | 'Methane Capture' | 'Direct Air Capture' | 'Hydroelectric' | 'Geothermal';
  origin: string;
  price: number;
  vintageYear: number;
  availableTons: number;
  imageUrl: string;
  imageHint: string;
  description: string;
  authority: string;
  verificationStatus: 'Verified' | 'Rejected' | 'Under Validation';
  fullDescription: string;
  verificationDetails?: {
    date: string;
    method: string;
  };
  qualityMetrics: {
    additionality: number;
    permanence: number;
    leakage: number;
    mrv: number;
    registryCompliance: number;
    caStatus: number;
    integrityScore: number;
  };
};

export type Project = {
    id?: string;
    name: string;
    description: string;
    country: string;
    projectType: string;
    methodology: string;
    projectWebsite?: string;
    vintageYear: number;
    availableTons: number;
    sdgImpacts?: string[];
    developerId: string;
    status: 'Under Validation' | 'Verified' | 'Rejected';
    auditDocuments?: { name: string; url: string }[];
}

export type Transaction = {
  txHash: string;
  action: 'ISSUED' | 'LISTED' | 'SOLD' | 'RETIRED';
  creditId: string;
  from: string;
  to: string;
  timestamp: string;
  amountTons?: number;
};

export type PortfolioItem = {
  id?: string; // Document ID from Firestore
  creditId: string; // ID of the carbon credit project
  name: string; // Name of the project
  vintageYear: number; // Vintage year of the project
  tons: number;
  purchaseDate?: string;
};

export type ValidationResult = {
  legitimacyScore: number;
  environmentalImpactAssessment: string;
  redFlags: string[];
} | null;

export type ValidationState = {
  result: ValidationResult;
  error?: string;
  pending: boolean;
};

export type CartItem = {
  id?: string; // Document ID from Firestore
  creditId: string; // Corresponds to CarbonCredit ID
  name: string;
  price: number;
  quantity: number;
  vintageYear: number;
};

export type ClaimHistoryItem = {
    id?: string; // Document ID from Firestore
    creditId: string;
    projectName: string;
    tons: number;
    claimDate: string;
    certificateId: string;
}

export type UserRole = 'ADMIN' | 'DEVELOPER' | 'BUYER';

    