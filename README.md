# Smart Stadium

Smart Stadium is a second-screen web app for live FIFA 2026 matches. The first slice of the product is a cinematic landing hero that masks backend latency, sets the dark neon brand direction, and prepares the surface for sentiment-driven match moments.

## Initial Structure

* [server/index.js](server/index.js) is a Cloud Run-friendly Node server that serves the frontend and exposes a health check.
* [public/index.html](public/index.html) is the Tailwind-only landing shell.
* [public/js/app.js](public/js/app.js) bootstraps the landing screen and validates the hero content model with Zod.
* [public/js/components/heroSection.js](public/js/components/heroSection.js) renders the premium split-screen hero and GSAP reveal choreography.
* [public/js/schemas.js](public/js/schemas.js) holds the Zod schema used by the frontend.

## 📸 Screenshots

Here are the key interfaces of the FIFA Crowd Management system:

### 1. Main Dashboard (Live Telemetry & Vibe Selection)
![Main Dashboard](docs/dashboard.png)

### 2. Live Crowd Flow (Real-time Heatmap & Congestion Simulation)
![Live Crowd Flow](docs/live_flow.png)

### 3. AI Crowd Action Plan (Gemini-generated Responses)
![AI Action Plan](docs/ai_plan.png)

*(Note: To make these images appear on GitHub, please save your screenshots inside a `docs` folder in this repository named `dashboard.png`, `live_flow.png`, and `ai_plan.png` respectively, and push them to GitHub).*

## 🏗️ Architecture Graph

```mermaid
graph TD
    %% Styling
    classDef client fill:#141E27,stroke:#00A15D,stroke-width:2px,color:#fff
    classDef server fill:#0D0D12,stroke:#E21A22,stroke-width:2px,color:#fff
    classDef ai fill:#4285F4,stroke:#fff,stroke-width:2px,color:#fff
    classDef external fill:#F9A01B,stroke:#fff,stroke-width:2px,color:#fff

    %% Components
    UI[🖥️ Frontend Dashboard<br>Tailwind CSS & GSAP]:::client
    SimEngine[🎮 Live Crowd Engine<br>Canvas 2D Physics]:::client
    Server[⚙️ Node.js Backend<br>API Server]:::server
    Gemini[🧠 Google Gemini AI<br>Action Plan Synthesis]:::ai
    Telemetry[📊 Live Match API<br>Telemetry Data]:::external

    %% Connections
    UI -- "1. Fetches Match Data" --> Server
    Server -- "2. Pulls Telemetry" --> Telemetry
    Telemetry -- "3. Streams Data" --> Server
    Server -- "4. Displays Dashboard" --> UI
    
    UI -- "5. Navigates To" --> SimEngine
    SimEngine -- "6. Live Crowd Physics" --> SimEngine
    
    UI -- "7. Triggers Crowd Alert" --> Server
    Server -- "8. Sends Zod Prompt" --> Gemini
    Gemini -- "9. Generates JSON Action Plan" --> Server
    Server -- "10. Displays Dispatch Plan" --> UI
```

## 🏆 Problem Statement Alignment (Gen AI Integration)

This project heavily leverages **Google Gemini AI** to solve the complex challenge of **FIFA 2026 Crowd Management**:
1. **Live Telemetry Ingestion**: The dashboard monitors mock real-time stadium metrics (e.g., Gate Congestion, Crowd Density, Wait Times).
2. **AI Action Plan Synthesis**: When a critical threshold is reached (e.g., "Congestion Alert"), the backend securely prompts Gemini using strict Zod schemas to generate a **Crowd Action Plan**.
3. **Automated Dispatch**: The GenAI outputs actionable instructions for stadium staff (e.g., "Deploy 15 stewards to Sector B", "Open Overflow Gate 3").
4. **Fan Engagement**: Simultaneously, the AI crafts personalized push notifications to redirect fans safely, enhancing both security and the fan experience.

## Run it

Install dependencies later if you add any, then start the local Node server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) after the server starts.

## Notes

* Tailwind CSS is loaded via CDN for the initial landing screen.
* GSAP handles the hero entrance animation and latency-masking reveal.
* Tests are implemented using Jest and Supertest. run `npm test` to verify endpoints.
* Security headers (CSP, HSTS) and Rate Limiting are enforced in the Node server.
