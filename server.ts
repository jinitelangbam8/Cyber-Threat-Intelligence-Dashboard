import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize flat-file JSON DB to hold scans and system state securely
const DB_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DB_DIR, "db.json");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial robust dataset representing threat scans so the Recharts analytical dashboard renders beautifully on start
const INITIAL_DATABASE = {
  scans: [
    {
      id: "scan_1",
      type: "url",
      value: "https://secure-paypal-verify.servehttp.com/signin",
      threatScore: 94,
      riskLevel: "Critical",
      aiExplanation: "Phishing attempt targeting PayPal user credentials. High risk of identity theft. Embedded inside dynamic DNS dynamic domain (servehttp.com). SSL certificate lacks registration validation.",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: "scan_2",
      type: "ip",
      value: "185.220.101.4",
      threatScore: 88,
      riskLevel: "High",
      aiExplanation: "Confirmed TOR exit node identified. Frequent participant inside brute-force brute and brute-force scanning campaigns against standard cloud services.",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: "scan_3",
      type: "domain",
      value: "bankofamerica-login-auth.com",
      threatScore: 92,
      riskLevel: "Critical",
      aiExplanation: "Squatting domain mimicking Bank of America login services. Domain registration age is extremely young (under 2 days) with high host correlation to malware drops.",
      timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
    },
    {
      id: "scan_4",
      type: "hash",
      value: "4a5e1e4baab89f3a32518a88c31bc87c61cd31a5e1f13b632fa5a73a3b02ce31",
      threatScore: 99,
      riskLevel: "Critical",
      aiExplanation: "SHA256 signature matches known WannaCry Ransomware executable. Active binary payload containing cryptographic locker utilities.",
      timestamp: new Date(Date.now() - 65 * 60000).toISOString(),
    },
    {
      id: "scan_5",
      type: "url",
      value: "https://github.com/microsoft/vscode",
      threatScore: 0,
      riskLevel: "Safe",
      aiExplanation: "Highly reputable open source software development portal operated by Microsoft. Absolute validation of code identity verified.",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    }
  ],
  users: [
    { id: "usr_1", name: "Cyber Ops Lead", email: "jinitelangbam8@gmail.com", role: "Administrator", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" },
    { id: "usr_2", name: "SOC Analyst 1", email: "analyst1@enterprise.com", role: "User", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" }
  ]
};

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2));
}

function getDB() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return INITIAL_DATABASE;
  }
}

function saveDB(json: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("Failed to write to DB:", err);
  }
}

// Set up Google Gen AI Server Client
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;
if (API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
    console.log("Initialized Google Gen AI engine successfully!");
  } catch (error) {
    console.error("Failed to initialize Google Gen AI engine:", error);
  }
}

// Fallback logic generator when API key is missing
async function queryAIExplanation(type: string, value: string, mockDataText: string) {
  if (ai) {
    try {
      const prompt = `Perform a high-grade security threat analysis.
Target Type: ${type}
Target Value: ${value}

Generate a concise, elite paragraph serving as security-focused forensic breakdown, detailing potential threats, mitigations, and classifications. Focus strictly on facts.
If the asset looks like a normal popular benign site/IP/hash, mark it safe. Otherwise, break down the anomalies. Limit explanation to maximum 3 concise sentences.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a senior cyber threat intelligence forensic investigator. Provide cold, concise, and hyper-factual answers. Avoid fluffy introductions.",
        }
      });
      return response.text?.trim() || mockDataText;
    } catch (err) {
      console.error("Gemini query failed, falling back to local threat patterns:", err);
      return mockDataText;
    }
  }
  return mockDataText;
}

// API: Server scan history endpoint
app.get("/api/history", (req, res) => {
  const db = getDB();
  res.json(db.scans);
});

// API: Remove threats or delete log entries
app.delete("/api/history/:id", (req, res) => {
  const db = getDB();
  const idToDelete = req.params.id;
  const initialCount = db.scans.length;
  db.scans = db.scans.filter((s: any) => s.id !== idToDelete);
  saveDB(db);
  res.send({ success: db.scans.length < initialCount });
});

// API: Clear all scans (Admin power)
app.delete("/api/history-clear", (req, res) => {
  const db = getDB();
  db.scans = [];
  saveDB(db);
  res.send({ success: true, scans: [] });
});

// API: Fetch administrators
app.get("/api/admin/users", (req, res) => {
  const db = getDB();
  res.json(db.users);
});

// API: URL Threat Analyzer Routing
app.post("/api/url-analysis", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "No URL specified" });
  }

  // Pure server validation & feature extraction
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return res.status(400).json({ error: "Invalid URL string format. Specify complete URL including protocol (e... http/https)." });
  }

  const hostname = parsedUrl.hostname;
  const protocol = parsedUrl.protocol;
  const pathPart = parsedUrl.pathname;
  const queryParameters = parsedUrl.search;

  // Search for obvious malicious cues or keywords in host/path strings
  const suspiciousKeywords: string[] = [];
  const keywordSignals = ["login", "paypal", "bank", "secure", "verify", "update", "sign-in", "oauth", "password", "crypto", "free", "claim", "gift"];
  keywordSignals.forEach(keyword => {
    if (url.toLowerCase().includes(keyword)) {
      suspiciousKeywords.push(keyword);
    }
  });

  // Calculate a deterministic server threat score for visual integrity
  let score = 5;
  if (protocol === "http:") score += 20; // lack of SSL
  if (suspiciousKeywords.length > 0) score += suspiciousKeywords.length * 20;
  if (hostname.split('.').length > 3) score += 10; // sub-domain inflation
  if (pathPart.length > 40) score += 10; // query string stuffing
  if (score > 100) score = 100;

  // Classify risk range
  let riskLevel = "Safe";
  if (score > 15) riskLevel = "Low";
  if (score > 35) riskLevel = "Medium";
  if (score > 60) riskLevel = "High";
  if (score > 80) riskLevel = "Critical";

  // Create highly dynamic AI feedback or fallback
  const mockExplanation = score > 50 
    ? `Identified suspicious parameters in domain path containing (${suspiciousKeywords.join(", ") || "raw queries"}). Lacks premium SSL verification registers. Domain correlation records flag high reputation threat vectors.` 
    : `Domain hostname looks safe. Active TLS encryption configured. Zero suspicious string signatures detected inside standard path routes. No current active blocklist feeds are recording threats.`;

  const aiExplanation = await queryAIExplanation("URL", url, mockExplanation);

  // Recommendations builder
  const recommendations: string[] = [];
  if (score > 15) {
    recommendations.push("Inspect actual destination page layout flags and forms before entering authorization values.");
    recommendations.push("Enable perimeter web firewall blockers and DNS-filtering profiles.");
  }
  if (protocol === "http:") {
    recommendations.push("Mandate strict TLS upgrade. Demote unencrypted http clear-text data passages.");
  }
  if (score <= 15) {
    recommendations.push("Safe to execute. Regular perimeter defense inspection scheduled as normal.");
  }

  const result = {
    id: `scan_${Date.now()}`,
    type: "url",
    value: url,
    hostname,
    protocol,
    pathPart,
    queryParameters,
    sslStatus: protocol === "https:" ? "Active (TLS 1.3 Encryption Valid)" : "Inactive (No Encryption detected)",
    redirects: ["No active redirections detected"],
    suspiciousKeywords,
    threatScore: score,
    securityPercentage: 100 - score,
    riskLevel,
    aiExplanation,
    recommendations,
    timestamp: new Date().toISOString()
  };

  // Add scan to persistent JSON database
  const db = getDB();
  db.scans.unshift(result);
  saveDB(db);

  res.json(result);
});

// API: IP Address Intelligence
app.post("/api/ip-analysis", async (req, res) => {
  const { ip } = req.body;
  if (!ip) {
    return res.status(400).json({ error: "IP address is required" });
  }

  // Parse IP logic and simulate realistic WHOIS lookup
  const ipParts = ip.split(".");
  let isVpn = false;
  let isTor = false;
  let abuseScore = 0;

  if (ipParts.length === 4) {
    const triggerValue = parseInt(ipParts[0] || "0", 10);
    if (triggerValue > 170) {
      isVpn = true;
      abuseScore += 35;
    }
    if (triggerValue > 185 && triggerValue < 195) {
      isTor = true;
      abuseScore += 50;
    }
    abuseScore += (parseInt(ipParts[3] || "0", 10) % 45);
  } else {
    abuseScore = 40; // Default for IPv6 mockups
  }

  if (abuseScore > 100) abuseScore = 100;

  let riskLevel = "Safe";
  if (abuseScore > 15) riskLevel = "Low";
  if (abuseScore > 35) riskLevel = "Medium";
  if (abuseScore > 65) riskLevel = "High";
  if (abuseScore > 85) riskLevel = "Critical";

  // Reverse DNS lookup simulation
  const mockIsps = ["Cloudflare Inc.", "DigitalOcean LLC", "Amazon Technologies Inc.", "Chinanet Holding", "Comcast Cable", "Deutsche Telekom"];
  const mockCountries = ["United States", "Germany", "China", "Netherlands", "Russia", "Singapore", "Japan"];
  const mockCities = ["San Francisco", "Frankfurt", "Sanya", "Amsterdam", "Moscow", "Geylang", "Tokyo"];

  const hashId = (ipParts[0] ? parseInt(ipParts[0], 10) : 0) + (ipParts[1] ? parseInt(ipParts[1], 10) : 0);
  const country = mockCountries[hashId % mockCountries.length];
  const city = mockCities[hashId % mockCities.length];
  const isp = mockIsps[hashId % mockIsps.length];
  const asn = `AS${10000 + (hashId * 43) % 45000}`;

  const mockExplanation = abuseScore > 50 
    ? `Active threat footprint logged for IP ${ip}. Host resides behind proxy node structures with high volume correlation to credential stuffing and distributed denial attacks.`
    : `BENIGN. IP ${ip} resolves safely with zero current vulnerability exploits logged. Resides on regular ASN infrastructure with positive reputation metrics.`;

  const aiExplanation = await queryAIExplanation("IP Address", ip, mockExplanation);

  const result = {
    id: `scan_${Date.now()}`,
    type: "ip",
    value: ip,
    country,
    city,
    isp,
    asn,
    organization: `${isp} Core Networks`,
    geolocation: { lat: 37.7749 + (hashId % 10), lon: -122.4194 + (hashId % 10) },
    vpnDetection: isVpn ? "VPN Node Detected" : "Pure ISP Route (Non-VPN)",
    torDetection: isTor ? "TOR Exit Node Identified" : "Standard Internet Access Node",
    abuseScore,
    threatScore: abuseScore,
    reputationScore: 100 - abuseScore,
    riskLevel,
    aiExplanation,
    timestamp: new Date().toISOString()
  };

  // Add scan to database
  const db = getDB();
  db.scans.unshift(result);
  saveDB(db);

  res.json(result);
});

// API: Domain Intelligence Analysis
app.post("/api/domain-analysis", async (req, res) => {
  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ error: "Domain target parameter is required" });
  }

  // Remove protocol prefix in case users paste full links
  let hostname = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

  const domainHash = hostname.length;
  const threatScore = (domainHash * 7) % 100;
  
  let riskLevel = "Safe";
  if (threatScore > 15) riskLevel = "Low";
  if (threatScore > 40) riskLevel = "Medium";
  if (threatScore > 65) riskLevel = "High";
  if (threatScore > 85) riskLevel = "Critical";

  const creationYear = 2012 + (domainHash % 14);
  const domainAge = `${2026 - creationYear} years, ${(domainHash * 11) % 365} days`;
  
  const registrars = ["GoDaddy.com LLC", "Namecheap Inc.", "Cloudflare Inc.", "MarkMonitor Inc.", "Tucows Domains Inc."];
  const dnsServers = [
    ["ns-cloud1.cloudflare.com", "ns-cloud2.cloudflare.com"],
    ["dns1.namecheap.com", "dns2.namecheap.com"],
    ["ns1.domaincontrol.com", "ns2.domaincontrol.com"],
    ["dns1.markmonitor.com", "dns2.markmonitor.com"]
  ];

  const mockExplanation = threatScore > 50 
    ? `Domain host '${hostname}' presents questionable validation metrics. Short registration duration with mismatched NameServer records indicate defensive evasion techniques commonly deployed within adware distribution rings.`
    : `Domain '${hostname}' holds established long-term reputation indexes with verified registrar metadata, providing robust SSL configurations and active SPF email validation rules.`;

  const aiExplanation = await queryAIExplanation("Domain WHOIS", hostname, mockExplanation);

  const result = {
    id: `scan_${Date.now()}`,
    type: "domain",
    value: hostname,
    registrar: registrars[domainHash % registrars.length],
    domainAge,
    creationDate: `${creationYear}-04-${10 + (domainHash % 15)}`,
    expirationDate: `${creationYear + 15}-04-${10 + (domainHash % 15)}`,
    dnsRecords: {
      A: [`104.244.42.${domainHash % 255}`, `104.244.43.${(domainHash + 1) % 255}`],
      MX: [`mail.protection.outlook.com (Priority 10)`],
      TXT: [`v=spf1 include:_spf.google.com ~all`],
      NS: dnsServers[domainHash % dnsServers.length]
    },
    sslDetails: {
      issuer: "Let's Encrypt Authority E1",
      algorithm: "ECDSA 384-bit Encryption",
      expires: "2026-12-18"
    },
    threatScore,
    reputationScore: 100 - threatScore,
    riskLevel,
    aiExplanation,
    timestamp: new Date().toISOString()
  };

  // Saved in Database
  const db = getDB();
  db.scans.unshift(result);
  saveDB(db);

  res.json(result);
});

// API: File Hash Scanner routing
app.post("/api/hash-analysis", async (req, res) => {
  const { hash } = req.body;
  if (!hash) {
    return res.status(400).json({ error: "Malware cryptographic hash is required" });
  }

  const cleanHash = hash.trim().toLowerCase();
  const hashLen = cleanHash.length;

  if (hashLen !== 32 && hashLen !== 40 && hashLen !== 64) {
    return res.status(400).json({ error: "Invalid hash layout. Input must comply with standard MD5 (32 bytes), SHA1 (40 bytes), or SHA256 (64 bytes)." });
  }

  // Mock static signatures list for realistic cyber response
  // e.g. WannaCry, Mimikatz, Mirai, SolarWinds backdoor
  let malwareFamily = "Suspicious.Generic.Heuristic";
  let threatCategory = "Trojan Downloader";
  let threatScore = 45;

  if (cleanHash.startsWith("4a5e") || cleanHash.includes("d7a8")) {
    malwareFamily = "W32/WannaCry.Ransom";
    threatCategory = "Ransomware File Encryptor";
    threatScore = 99;
  } else if (cleanHash.startsWith("8f4") || cleanHash.includes("a1c9")) {
    malwareFamily = "Win32/Mimikatz.CredentialStealer";
    threatCategory = "Credential Extraction Utility";
    threatScore = 95;
  } else if (cleanHash.startsWith("b33") || cleanHash.includes("f8c1")) {
    malwareFamily = "Linux/Mirai.IoTBotnet";
    threatCategory = "Distributed Denial-of-Service Agent";
    threatScore = 90;
  } else if (hashLen === 32) {
    threatScore = (cleanHash.charCodeAt(0) % 20) + 15; // lower threat
    malwareFamily = "Adware.Generic.SystemTune";
    threatCategory = "Potentially Unwanted Application (PUA)";
  } else {
    // Generates dynamic deterministic score for hashes
    threatScore = (cleanHash.charCodeAt(4) + cleanHash.charCodeAt(8)) % 80 + 15;
    if (threatScore > 75) {
      malwareFamily = "Backdoor.CobaltStrike.Beacon";
      threatCategory = "Advanced Persistent Threat command hook";
    } else {
      malwareFamily = "Grayware.Utility.RemoteAccess";
      threatCategory = "Remote Administration Support tool";
    }
  }

  let riskLevel = "Safe";
  if (threatScore > 15) riskLevel = "Low";
  if (threatScore > 40) riskLevel = "Medium";
  if (threatScore > 70) riskLevel = "High";
  if (threatScore > 85) riskLevel = "Critical";

  const mockExplanation = threatScore > 60
    ? `CRITICAL. Cryptographic checksum matches signature signatures cataloged under modern APT ${malwareFamily} campaigns. Payload triggers unauthorized local socket escalation configurations immediately on launch.`
    : `Low-grade signature match of ${malwareFamily}. Binary contains basic remote tool configurations, but currently registers minor malicious outbound actions.`;

  const aiExplanation = await queryAIExplanation("File Signature Hash", cleanHash, mockExplanation);

  const result = {
    id: `scan_${Date.now()}`,
    type: "hash",
    value: cleanHash,
    malwareFamily,
    threatCategory,
    malwareRatio: `${Math.floor(threatScore * 0.7)} / 72 dynamic engines`,
    threatScore,
    riskLevel,
    aiExplanation,
    recommendations: [
      "Quarantine matching workspace directory executables instantly.",
      "Execute system-wide host indicators search on domain control levels.",
      "Enforce dynamic memory stack runtime auditing rules on user endpoint levels."
    ],
    timestamp: new Date().toISOString()
  };

  // Save to Database
  const db = getDB();
  db.scans.unshift(result);
  saveDB(db);

  res.json(result);
});

// API: Live Threat Feed refresh
app.get("/api/threat-feed", (req, res) => {
  // Return dynamically built real-time cyber attacks feed
  const countries = ["US", "DE", "CN", "NL", "RU", "SG", "JP", "UA", "BR", "IN", "GB", "CA"];
  const feedCategories = ["Phishing Campaign", "Ransomware Attack", "Brute-Force Brute", "Botnet Node Active", "CVE Vulnerability Exploitation", "Malicious SQL Injection"];
  const vectors = ["HTTPS", "SSH Port 22", "RDP Port 3389", "Custom TCP", "SMTP Port 25", "DNS Tunneling"];

  const currentBatch = Array.from({ length: 8 }).map((_, idx) => {
    const seed = (Date.now() + idx * 7) % 100;
    const country = countries[seed % countries.length];
    const category = feedCategories[seed % feedCategories.length];
    const vector = vectors[seed % vectors.length];
    const score = 35 + (seed % 65);

    let senderIp = `185.120.${seed % 255}.${10 + (seed * 3) % 240}`;
    let target = `corp-host-${seed % 10}.internal`;

    let risk = "Medium";
    if (score > 60) risk = "High";
    if (score > 85) risk = "Critical";

    return {
      id: `threat_id_${Date.now() - idx * 10000}`,
      timestamp: new Date(Date.now() - idx * 12000).toISOString(),
      country,
      category,
      vector,
      senderIp,
      target,
      threatScore: score,
      riskLevel: risk,
    };
  });

  res.json(currentBatch);
});

// API: AI Security Chat Assistant
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid dynamic chat thread" });
  }

  const latestMessage = messages[messages.length - 1]?.content || "";

  if (ai) {
    try {
      // Build systemic background instructions
      const systemInstruction = `You are a legendary cybersecurity expert and security assistant.
Provide highly visual, accessible, professional, and practical cybersecurity feedback. 
Highlight indicators, mitigation controls, and risk-management strategies using brief lists or clean markdown paragraphs.
Keep answers concise, direct, helpful, and easily actionable by systems administrators.`;

      // Transform format for generative
      const prompt = `User Cybersecurity Inquiry: "${latestMessage}"
Provide a high-quality expert cyber analyst analysis.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { systemInstruction }
      });

      const responseText = response.text || "Gemini generated an empty response. Verify security rules.";
      return res.json({ response: responseText });
    } catch (e: any) {
      console.error("Gemini assistant error:", e);
      return res.status(500).json({ error: `Gemini Query Failed: ${e.message || e}` });
    }
  } else {
    // Elegant fallbacks with deep simulation
    let fallbackText = "I am operating in security fallback offline mode because there is no `GEMINI_API_KEY` configured in secrets right now. However, I can explain that you must:\n\n1. Enforce strong multi-factor authentication everywhere.\n2. Regularly baseline network traffic to catch remote shell command hook anomalies.\n3. Sanitize inputs and block clear-text routing.";
    
    const queryLower = latestMessage.toLowerCase();
    if (queryLower.includes("phishing")) {
      fallbackText = "### Phishing Attacks Analysis & Protection\n\nPhishing is a social-engineering maneuver designed to steal sensitive accounts parameters. To defend:\n\n* **Implement SPF/DKIM/DMARC metadata records** on mail exchange gates.\n* **Exhaustively educate staff** on payload and suspicious keywords validation methods.\n* **Configure Web Application Firewalls** to intercept unregistered dynamic domain routing.";
    } else if (queryLower.includes("url") || queryLower.includes("http")) {
      fallbackText = "### URL Verification Checklist\n\nWhen verifying if a particular link is safe to traverse, always review:\n\n1. **Protocol details**: Demote direct HTTP plain text. Mandate SSL certificates.\n2. **Registry age**: Fresh target registrations (under 30 days) should trigger strict alerts.\n3. **Query parameters**: Watch out for typosquatting variations trying to match banking or single-sign-on systems.";
    }

    return res.json({ response: fallbackText });
  }
});

// Route Vite in middleware mode
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite is booting in dev middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Server is running in static production mode!");
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Cyber Intelligence backend running: http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Express startup failed:", error);
});
