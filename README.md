# Enterprise Cyber Threat Intelligence Dashboard

An elite, production-ready, full-stack AI-assisted threat intelligence command center. Features real-time endpoint analysers, WHOIS dns parsing algorithms, binary signature checksum monitoring, and a global phishing alert feed.

## Visual and Design Core
- **Dual Font Pairing**: Styled using **Inter** for spacious modern layouts coupled with **JetBrains Mono** for pristine telemetry stats and cryptographic signatures.
- **Micro-Animations**: Clean fade-in transitions and pulsing cyber status indicators.
- **Dual Themes**: Supports smooth Dark and Light configurations natively.

## Technical Specifications
- **Real-Time Feed**: Tracks phishing domains, ransomware campaigns, and botnets in real-time.
- **Deep Integrations**: Coordinated with the Google Gen AI `@google/genai` model for automated security forensic reports and mitigation checklists.
- **Dynamic Charting**: Employs Recharts for visualizing threat server volatility, safety ratios, and attack vectors.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment variables
Create a `.env` or `.env.local` file at root level and configure:
```env
GEMINI_API_KEY="your-google-gemini-key"
```

### 3. Run Development server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```
