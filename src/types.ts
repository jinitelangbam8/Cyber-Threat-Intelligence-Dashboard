export interface ThreatScan {
  id: string;
  type: "url" | "ip" | "domain" | "hash";
  value: string;
  threatScore: number;
  riskLevel: "Safe" | "Low" | "Medium" | "High" | "Critical";
  aiExplanation: string;
  timestamp: string;
  
  // URL specific fields
  hostname?: string;
  protocol?: string;
  pathPart?: string;
  queryParameters?: string;
  sslStatus?: string;
  redirects?: string[];
  suspiciousKeywords?: string[];
  securityPercentage?: number;
  recommendations?: string[];

  // IP specific fields
  country?: string;
  city?: string;
  isp?: string;
  asn?: string;
  organization?: string;
  geolocation?: { lat: number; lon: number };
  vpnDetection?: string;
  torDetection?: string;
  abuseScore?: number;
  reputationScore?: number;

  // Domain specific fields
  registrar?: string;
  domainAge?: string;
  creationDate?: string;
  expirationDate?: string;
  dnsRecords?: {
    A?: string[];
    MX?: string[];
    TXT?: string[];
    NS?: string[];
  };
  sslDetails?: {
    issuer: string;
    algorithm: string;
    expires: string;
  };

  // Hash specific fields
  malwareFamily?: string;
  threatCategory?: string;
  malwareRatio?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface LiveThreatAlert {
  id: string;
  timestamp: string;
  country: string;
  category: string;
  vector: string;
  senderIp: string;
  target: string;
  threatScore: number;
  riskLevel: string;
}

export interface ThreatFeedEvent {
  id: string;
  timestamp: string;
  country: string;
  category: string;
  vector: string;
  senderIp: string;
  target: string;
  threatScore: number;
  riskLevel: "Safe" | "Low" | "Medium" | "High" | "Critical";
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "User";
  image: string;
}
