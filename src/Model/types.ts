// User Role Enum
export enum UserRole {
  INDIVIDUAL = "individual",
  ORGANIZATION = "organization"
}

// User Entity
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string; // Ntel
  role: UserRole;
  priority: number; // 1-5 scale for source credibility
  password_hash: string;
  createdAt: Date;
}

// Moderator Entity
export interface Moderator {
  id: string;
  name: string;
  email: string; // Added for login
  password_hash: string;
  level: "junior" | "senior" | "admin";
}

// Theme Entity
export interface Theme {
  id: string;
  title: string;
  description?: string;
}

// Rumor Entity
export interface Rumor {
  id: string;
  text: string;
  user_id: string; // Reporter
  theme_id: string; // Added link to Theme
  location?: string; // Physical context
  createdAt: Date;
}

// Claim Entity
export interface Claim {
  id: string;
  text: string;
  rumor_id: string; // One Rumor can have multiple sub-claims
}

// Evidence Type Enum
export enum EvidenceType {
  VIDEO = "video",
  AUDIO = "audio",
  TEXT = "text",
  IMAGE = "image"
}

// Evidence Entity
export interface Evidence {
  id: string;
  type: EvidenceType;
  file_url: string; // Link to storage

  // Timing Metadata
  t_event: Date; // Time of event
  t_observation: Date; // Time captured (EXIF)
  t_upload: Date; // Time posted

  hash_file: string; // sha256:a3f9...
  metadata: Record<string, any>; // Extra EXIF data

  rumor_id: string;
  uploaded_by: string; // User ID
}

// Rule Entity
export interface Rule {
  id: string;
  evidence_type: EvidenceType;
  condition: string; // e.g., "Must have EXIF data", "Resolution > 720p"
  weight: number; // How much this rule affects confidence
}

// Stance Enum
export enum Stance {
  SUPPORT = "support",
  CONTEST = "contest",
  INVARIANT = "invariant"
}

// ClaimEvidence Entity
export interface ClaimEvidence {
  id: string;
  claim_id: string;
  evidence_id: string;
  rule_id: string;
  stance: Stance;
  score_modifier: number; // Numerical impact on verdict
}

// Verdict Entity
export interface Verdict {
  id: string;
  claim_id: string;
  status: "True" | "False" | "ProbablyTrue" | "Contested" | "Unverifiable";
  confidence_score: number; // 0.0 to 1.0

  // Arrays of IDs for quick reference
  evidences_for: string[];
  evidences_against: string[];

  moderator_id: string;
  isPublished: boolean;
  publishedAt?: Date;
  summary: string; // Explanatory text for the public
}
