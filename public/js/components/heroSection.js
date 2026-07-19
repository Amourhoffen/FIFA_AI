// GreenSock Animation Platform (GSAP) Premium Sports Aesthetic Layout Component
const heroGradient = 'linear-gradient(135deg, #7B2CBF 0%, #C77DFF 52%, #FF4D9D 100%)';
const neonGreenGlow = 'rgba(57, 255, 20, 0.4)';
const purpleGlow = 'rgba(123, 44, 191, 0.6)';

// Preconfigured high-fidelity FIFA 2026 matches as presets & fallback
const FALLBACK_MATCHES = [
  {
    MatchID: "ipl_m54",
    MatchName: "RCB vs SRH",
    GroundName: "M. Chinnaswamy Stadium, Bengaluru",
    FirstBattingTeamCode: "SRH",
    SecondBattingTeamCode: "RCB",
    FirstBattingSummary: "287/3 (20 Ov)",
    SecondBattingSummary: "262/7 (20 Ov)",
    MatchStatus: "SRH won by 25 runs",
    TossText: "RCB won the toss and elected to bowl",
    Commentss: "A historic boundary-fest with record-breaking aggregates! High-octane action all the way."
  },
  {
    MatchID: "ipl_m29",
    MatchName: "MI vs CSK",
    GroundName: "Wankhede Stadium, Mumbai",
    FirstBattingTeamCode: "CSK",
    SecondBattingTeamCode: "MI",
    FirstBattingSummary: "206/4 (20 Ov)",
    SecondBattingSummary: "186/6 (20 Ov)",
    MatchStatus: "CSK won by 20 runs",
    TossText: "MI won the toss and elected to bowl",
    Commentss: "Classic El Clasico of the FIFA 2026. Dhoni's final over hat-trick of sixes electrified the stadium!"
  },
  {
    MatchID: "ipl_m68",
    MatchName: "KKR vs RR",
    GroundName: "Eden Gardens, Kolkata",
    FirstBattingTeamCode: "KKR",
    SecondBattingTeamCode: "RR",
    FirstBattingSummary: "223/6 (20 Ov)",
    SecondBattingSummary: "224/8 (20 Ov)",
    MatchStatus: "RR won by 2 wickets",
    TossText: "RR won the toss and elected to bowl",
    Commentss: "Jos Buttler's single-handed miraculous century at the death snatched victory from the jaws of defeat."
  }
];

// Quick select vibe chips
const VIBE_PRESETS = [
  { id: "vibe_octane", label: "🔥 Goal Celebration Spike", text: "high density, sudden crowd surges, extreme stadium volume" },
  { id: "vibe_electric", label: "⚡ Last-Ball Finish", text: "gate bottleneck, maximum pressure, high wait times" },
  { id: "vibe_dominant", label: "👑 Clinical Dominance", text: "complete Concession Queue Spike, absolute control, surgical precision" },
  { id: "vibe_clinch", label: "🎯 Strategic Clincher", text: "heavy influx of fans at security checkpoints" }
];

/**
 * Text Splitting Helper for high-performance GSAP staggered typography reveals.
 * Splits string content into individual letters wrapped in inline-block spans.
 * @param {string} text 
 * @returns {string} HTML string of wrapped characters
 */
function splitWordsToSpans(text) {
  return text.split(' ').map(word => {
    const lettersHtml = word.split('').map(char => {
      return `<span class="letter inline-block transform-gpu will-change-transform-opacity">${char}</span>`;
    }).join('');
    return `<span class="word inline-block whitespace-nowrap overflow-hidden pr-2">${lettersHtml}</span>`;
  }).join(' ');
}

/**
 * Generates the full HTML layout containing the Hero Form, Preloader, and Climax Split-Screen panels.
 */
export function createHeroSection(hero) {
  // Generate matches list HTML
  const matchesListHtml = FALLBACK_MATCHES.map((match, index) => {
    const isFirst = index === 0;
    const activeBorderClass = isFirst ? 'border-fifa-pink shadow-[0_0_18px_rgba(199,125,255,0.25)] bg-white/10' : 'border-white/10 hover:border-white/20 bg-white/5';
    return `
      <div 
        class="match-card relative overflow-hidden rounded-[20px] border p-4 cursor-pointer transition-all duration-300 ${activeBorderClass} transform-gpu will-change-transform-opacity" 
        data-match-id="${match.MatchID}" 
        data-match-index="${index}">
        <div class="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-[#FF4D9D]/15 px-2.5 py-1 border border-[#FF4D9D]/30 text-[0.62rem] font-extrabold uppercase tracking-widest text-[#FF4D9D]">
          <span class="h-1.5 w-1.5 rounded-full bg-fifa-magenta animate-pulse"></span> Live Feeds
        </div>
        <div class="flex items-center justify-between min-w-0 pr-12">
          <div>
            <h4 class="text-base font-extrabold tracking-tight">${match.MatchName}</h4>
            <p class="text-[0.68rem] text-fifa-muted mt-0.5 truncate max-w-[200px]">${match.GroundName}</p>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
          <div class="text-[0.7rem] text-white/80">
            <strong>${match.FirstBattingTeamCode}:</strong> ${match.FirstBattingSummary} <br/>
            <strong>${match.SecondBattingTeamCode}:</strong> ${match.SecondBattingSummary}
          </div>
          <div class="text-right text-[0.68rem] font-bold text-fifa-pink">
            ${match.MatchStatus}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Generate Vibe chips HTML
  const vibeChipsHtml = VIBE_PRESETS.map((vibe, index) => {
    const isFirst = index === 0;
    const activeClass = isFirst ? 'bg-gradient-to-br from-fifa-glow to-fifa-pink border-fifa-pink shadow-premium' : 'bg-white/5 border-white/10 hover:bg-white/10';
    return `
      <button 
        type="button" 
        class="vibe-chip rounded-full border px-4 py-2 text-xs font-semibold tracking-wide text-white transition-all duration-200 ${activeClass} transform-gpu will-change-transform-opacity"
        data-vibe-id="${vibe.id}"
        data-vibe-text="${vibe.text}">
        ${vibe.label}
      </button>
    `;
  }).join('');

  return `
    <div class="relative w-full min-h-screen overflow-hidden">
      <!-- PARALLAX BACKGROUND ELEMENT: Glowing Sports-Themed Neon Orbs -->
      <div id="parallax-bg-1" class="absolute -top-[10%] -left-[15%] -z-30 h-[600px] w-[600px] rounded-full bg-radial-gradient from-fifa-glow/30 via-transparent to-transparent opacity-60 pointer-events-none blur-[120px]"></div>
      <div id="parallax-bg-2" class="absolute top-[40%] -right-[15%] -z-30 h-[500px] w-[500px] rounded-full bg-radial-gradient from-fifa-magenta/20 via-transparent to-transparent opacity-50 pointer-events-none blur-[100px]"></div>
      <div id="parallax-bg-3" class="absolute -bottom-[10%] left-[20%] -z-30 h-[450px] w-[450px] rounded-full bg-radial-gradient from-[#39FF14]/15 via-transparent to-transparent opacity-40 pointer-events-none blur-[90px]"></div>

      <!-- MAIN CONTAINER: Glassmorphism Shell -->
      <div class="w-full py-4 md:py-8 min-h-screen flex flex-col justify-between">
        
        <!-- Premium Glassmorphic Navigation Header -->
        <header class="w-full max-w-6xl mx-auto px-4 mb-6 md:mb-10 flex items-center justify-between gap-3 animate-bar" id="vmmHeader">
          <div class="flex items-center gap-3 rounded-[24px] border border-white/10 bg-fifa-surface/80 px-4 py-3 shadow-premium backdrop-blur-xl w-full justify-between">
            <div class="flex items-center gap-3">
              <div class="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#7B2CBF] via-[#C77DFF] to-[#FF4D9D] text-white shadow-premium">
                <span class="text-sm font-extrabold">VM</span>
              </div>
              <div>
                <p class="mb-0.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-fifa-pink">Smart Stadium</p>
                <h1 class="text-sm font-bold tracking-tight text-white">AI Crowd Plan</h1>
              </div>
            </div>
            
            <a href="/" class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 hover:border-fifa-pink px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-premium transition-all duration-150 hover:-translate-x-1 group" id="navToDashboardBtn">
              <svg class="h-3.5 w-3.5 fill-none stroke-current stroke-[2.5] stroke-linecap-round stroke-linejoin-round transition-transform duration-150 group-hover:-translate-x-0.5" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </a>
          </div>
        </header>

        <!-- ============================================ -->
        <!-- 1. HERO & INPUT INTERACTIVE SECTION          -->
        <!-- ============================================ -->
        <section id="heroSection" class="w-full flex flex-col gap-6 md:gap-10 transform-gpu will-change-transform-opacity">
          
          <!-- Cinematic Staggered Header -->
          <div class="text-center max-w-4xl mx-auto flex flex-col gap-3 px-4">
            <div class="inline-flex w-fit mx-auto items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-white/90 shadow-premium backdrop-blur-md">
              <span class="h-2 w-2 rounded-full bg-fifa-pink shadow-[0_0_12px_#C77DFF] animate-pulse"></span>
              ${hero.eyebrow}
            </div>
            
            <h2 id="heroHeadline" class="text-[2.2rem] md:text-[4rem] font-black leading-[0.9] tracking-[-0.05em] uppercase text-white bg-clip-text">
              ${splitWordsToSpans(hero.title)}
            </h2>
            
            <p id="heroSummary" class="max-w-[55ch] mx-auto text-sm md:text-base leading-relaxed text-fifa-muted/95 mt-2">
              ${hero.summary}
            </p>
          </div>

          <!-- Master Interactive Form: Two-column grid -->
          <div class="grid gap-6 md:grid-cols-12 max-w-6xl mx-auto w-full px-4 items-start">
            
            <!-- Left inputs (User ID, Sentiment, custom Vibe) -->
            <div class="md:col-span-7 flex flex-col gap-5 rounded-[28px] border border-white/10 bg-fifa-surface/80 p-5 md:p-7 shadow-premium backdrop-blur-xl relative">
              <div class="absolute inset-0 -z-10 bg-gradient-to-b from-white/5 to-transparent rounded-[28px]"></div>
              
              <div class="flex flex-col gap-2">
                <span class="text-[0.7rem] font-black uppercase tracking-[0.16em] text-fifa-pink">Step 01</span>
                <h3 class="text-xl font-bold tracking-tight text-white">Select a Live FIFA 2026 Match</h3>
                <p class="text-xs text-fifa-muted">Choose the match to sync with your sentiment.</p>
                <div class="mt-2 flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                  ${matchesListHtml}
                </div>
              </div>

              <div class="border-t border-white/5 pt-4 flex flex-col gap-3">
                <span class="text-[0.7rem] font-black uppercase tracking-[0.16em] text-fifa-pink">Step 02</span>
                <h3 class="text-xl font-bold tracking-tight text-white">Select Telemetry Anomaly</h3>
                <p class="text-xs text-fifa-muted">What is the current crowd anomaly?</p>
                
                <div class="flex flex-wrap gap-2 mt-1">
                  ${vibeChipsHtml}
                </div>

                <div class="mt-3 relative rounded-[18px] border border-white/10 bg-black/25 px-4 py-3">
                  <input 
                    id="customVibeInput" 
                    type="text" 
                    placeholder="Or type custom telemetry anomaly (e.g. VIP entrance overload...)" 
                    class="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-fifa-muted/60"
                  />
                </div>
              </div>

              <div class="border-t border-white/5 pt-4 flex flex-col gap-3">
                <span class="text-[0.7rem] font-black uppercase tracking-[0.16em] text-fifa-pink">Step 03</span>
                <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div class="flex-1 relative rounded-[18px] border border-white/10 bg-black/25 px-4 py-3">
                    <span class="absolute -top-2 left-3 rounded-full bg-fifa-bg border border-white/10 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-fifa-pink">Fan User ID</span>
                    <input 
                      id="fanIdInput" 
                      type="text" 
                      value="EB_FAN_88"
                      class="w-full border-0 bg-transparent text-sm text-white font-extrabold outline-none"
                    />
                  </div>

                  <button 
                    id="generateMomentBtn" 
                    type="button" 
                    class="rounded-full bg-gradient-to-br from-fifa-glow via-fifa-pink to-fifa-magenta px-7 py-4 text-xs font-black uppercase tracking-[0.12em] text-white shadow-premium transform-gpu transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(199,125,255,0.4)] flex items-center justify-center gap-2"
                    style="box-shadow: 0 0 20px rgba(123,44,191,0.3)">
                    GENERATE ACTION PLAN ⚡
                  </button>
                </div>
              </div>

            </div>

            <!-- Right Preview card -->
            <div class="md:col-span-5 rounded-[28px] border border-white/10 bg-fifa-surface/60 p-5 md:p-6 shadow-premium backdrop-blur-xl relative overflow-hidden flex flex-col gap-5 justify-between min-h-[460px]">
              <div class="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-black/50"></div>
              
              <div class="flex items-center justify-between">
                <span class="rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-white">Live Match preview</span>
                <span class="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_12px_#4ade80]"></span>
              </div>

              <!-- Graphic visualization -->
              <div class="flex-1 flex flex-col items-center justify-center text-center p-4 relative">
                <!-- Pulse circle -->
                <div class="absolute h-36 w-36 rounded-full border border-white/5 animate-pulse bg-gradient-to-br from-fifa-glow/10 to-transparent"></div>
                <div class="absolute h-48 w-48 rounded-full border border-white/5 animate-ping duration-1000 opacity-20"></div>
                
                <div class="z-10 flex flex-col gap-3">
                  <div class="w-16 h-16 rounded-full bg-[#1A1A24] border border-white/10 flex items-center justify-center mx-auto shadow-premium bg-gradient-to-br from-white/5 to-white/10">
                    <svg viewBox="0 0 24 24" class="h-7 w-7 text-fifa-pink fill-none stroke-current stroke-2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  </div>
                  <h4 class="text-lg font-extrabold text-white tracking-tight">AI Synthesis Pending</h4>
                  <p class="text-xs text-fifa-muted max-w-[240px] mx-auto leading-relaxed">Fill out your stadium sentiment and hit synthesize to generate your cinematic narrative storyline instantly.</p>
                </div>
              </div>

              <div class="border-t border-white/5 pt-4">
                <div class="flex items-center justify-between">
                  <div class="min-w-0">
                    <span class="block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/50">Selected Sentiment</span>
                    <strong id="previewSentimentDisplay" class="mt-0.5 block truncate text-xs font-semibold text-fifa-pink">high density, sudden crowd surges, extreme stadium volume</strong>
                  </div>
                  <div class="h-8 w-8 rounded-full bg-[#FF4D9D]/20 border border-[#FF4D9D]/30 flex items-center justify-center text-xs">💖</div>
                </div>
              </div>
            </div>

          </div>

        </section>

        <!-- ============================================ -->
        <!-- 2. LATENCY MASKING PRELOADER SECTION        -->
        <!-- ============================================ -->
        <section id="preloaderSection" class="hidden fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0D0D12]/92 backdrop-blur-2xl px-6">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(123,44,191,0.18),_transparent_60%)] pointer-events-none"></div>
          
          <div class="w-full max-w-md text-center flex flex-col items-center gap-7">
            <!-- Pulsing, Glowing Loader Graphics -->
            <div class="relative flex items-center justify-center">
              <div class="absolute h-28 w-28 rounded-full border border-fifa-pink/20 animate-ping opacity-35"></div>
              <div class="absolute h-24 w-24 rounded-full border border-fifa-glow/30 animate-pulse"></div>
              <!-- Glowing spinning orbit ring -->
              <div class="h-20 w-20 rounded-full border-4 border-t-fifa-glow border-r-transparent border-b-fifa-magenta border-l-transparent animate-spin duration-700"></div>
              <span class="absolute text-xs font-black tracking-widest text-white/80">AI</span>
            </div>

            <!-- Loader status stack -->
            <div class="flex flex-col gap-2 w-full">
              <h3 class="text-xl font-bold uppercase tracking-wider text-white">Generating Crowd Action Plan</h3>
              <p class="text-xs text-fifa-pink tracking-widest font-extrabold uppercase">Latency-Masked AI Engine Active</p>
              
              <!-- Neon Progress Bar -->
              <div class="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden relative border border-white/5">
                <div id="loaderProgressBar" class="h-full bg-gradient-to-r from-fifa-glow via-fifa-pink to-fifa-magenta rounded-full w-[5%] transform-gpu will-change-[width]"></div>
              </div>
            </div>

            <!-- Preloader staggered loading status logs -->
            <div id="preloaderLogsContainer" class="flex flex-col gap-2 min-h-[40px] text-sm text-fifa-muted font-medium w-full">
              <div class="log-item opacity-0 transform-gpu will-change-transform-opacity">● Mapping fan vibe parameters...</div>
            </div>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- 3. CLIMAX REVEAL SPLIT-SCREEN SECTION        -->
        <!-- ============================================ -->
        <section id="climaxSection" class="hidden w-full flex-col gap-6 max-w-6xl mx-auto px-4 transform-gpu will-change-transform-opacity">
          
          <!-- Climax Banner -->
          <div class="text-center max-w-2xl mx-auto flex flex-col gap-2">
            <span class="inline-flex w-fit mx-auto items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-green-400 shadow-[0_0_12px_rgba(74,222,128,0.15)]">
              <span class="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></span>
              Synthesis Complete
            </span>
            <h2 class="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">Crowd Action Plan</h2>
          </div>

          <!-- Split-screen Climax display -->
          <div class="grid gap-6 md:grid-cols-2 w-full items-stretch">
            
            <!-- LEFT PANEL: User Vibe details (Slide-in left) -->
            <div id="climaxLeftPanel" class="rounded-[28px] border border-white/10 bg-fifa-surface/90 p-5 md:p-7 shadow-premium backdrop-blur-xl flex flex-col justify-between gap-6 transform-gpu will-change-transform-opacity">
              <div class="flex flex-col gap-5">
                <div class="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <span class="block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-fifa-pink">Fan Profile</span>
                    <strong id="climaxFanId" class="mt-0.5 block text-lg font-black tracking-tight text-white">EB_FAN_88</strong>
                  </div>
                  <div class="text-right">
                    <span class="block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/50">Vibe Signature</span>
                    <span id="climaxSentimentBadge" class="mt-1 inline-block rounded-full bg-fifa-glow/30 border border-fifa-pink/30 px-3 py-1 text-[0.68rem] font-bold text-white">🔥 Goal Celebration Spike</span>
                  </div>
                </div>

                <!-- Match Details -->
                <div class="flex flex-col gap-3 rounded-[20px] border border-white/5 bg-black/25 p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-[0.65rem] font-bold uppercase tracking-wider text-white/60" id="climaxMatchName">RCB vs SRH</span>
                    <span class="rounded-full bg-[#39FF14]/15 px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-widest text-[#39FF14] border border-[#39FF14]/30">Verified statistics</span>
                  </div>
                  
                  <div class="flex justify-between items-center mt-1">
                    <div id="climaxFirstBatting" class="text-xs">
                      <strong>SRH:</strong> 287/3
                    </div>
                    <div class="text-xs text-center font-black text-white/20">vs</div>
                    <div id="climaxSecondBatting" class="text-xs text-right">
                      <strong>RCB:</strong> 262/7
                    </div>
                  </div>

                  <p id="climaxMatchStatus" class="text-xs font-bold text-fifa-pink border-t border-white/5 pt-2 mt-1"></p>
                </div>

                <!-- Premium Sentiment Vector Radar Graphic using SVG -->
                <div class="flex flex-col gap-2">
                  <span class="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/50">Stochastic Sentiment Radar</span>
                  
                  <div class="h-44 rounded-[20px] border border-white/5 bg-black/30 flex items-center justify-center relative overflow-hidden">
                    <svg viewBox="0 0 200 200" class="h-40 w-40">
                      <!-- Radar grid -->
                      <polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
                      <polygon points="100,40 160,100 100,160 40,100" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                      <polygon points="100,60 140,100 100,140 60,100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                      <polygon points="100,80 120,100 100,120 80,100" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
                      
                      <!-- Axes -->
                      <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                      <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                      
                      <!-- Axis Labels -->
                      <text x="100" y="15" fill="rgba(255,255,255,0.4)" font-size="7" font-weight="900" text-anchor="middle">TENSION</text>
                      <text x="190" y="102" fill="rgba(255,255,255,0.4)" font-size="7" font-weight="900" text-anchor="start">ENERGY</text>
                      <text x="100" y="192" fill="rgba(255,255,255,0.4)" font-size="7" font-weight="900" text-anchor="middle">VOLUME</text>
                      <text x="10" y="102" fill="rgba(255,255,255,0.4)" font-size="7" font-weight="900" text-anchor="end">DRAMA</text>
                      
                      <!-- Pulsing Sentiment vector shape (GSAP Target) -->
                      <polygon id="radarPolygon" points="100,30 170,100 100,165 35,100" fill="rgba(199,125,255,0.18)" stroke="#C77DFF" stroke-width="2"/>
                      
                      <!-- Scatter dots -->
                      <circle cx="100" cy="30" r="3" fill="#FF4D9D" />
                      <circle cx="170" cy="100" r="3" fill="#7B2CBF" />
                      <circle cx="100" cy="165" r="3" fill="#39FF14" />
                      <circle cx="35" cy="100" r="3" fill="#FF4D9D" />
                    </svg>
                    
                    <!-- Neon glowing data indicator -->
                    <div class="absolute bottom-2 right-3 flex items-center gap-1">
                      <span class="h-1.5 w-1.5 rounded-full bg-[#39FF14]"></span>
                      <span class="text-[0.55rem] font-bold uppercase tracking-wider text-white/60">Momentum Index: 98.4%</span>
                    </div>
                  </div>
                </div>

              </div>

              <div class="text-[0.62rem] text-fifa-muted text-center pt-2">
                Synthesized securely via Google Gemini 2.5 Flash for containerized Cloud Run.
              </div>
            </div>

            <!-- RIGHT PANEL: AI Generated Storyline (Slide-in right) -->
            <div id="climaxRightPanel" class="rounded-[28px] border border-white/10 bg-fifa-surface/90 p-5 md:p-7 shadow-premium backdrop-blur-xl flex flex-col justify-between gap-6 transform-gpu will-change-transform-opacity relative overflow-hidden">
              <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fifa-glow via-fifa-pink to-fifa-magenta"></div>
              
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <!-- AI Archetype badge -->
                  <div class="rounded-full bg-gradient-to-r from-[#7B2CBF] to-[#FF4D9D] px-3.5 py-1.5 text-[0.65rem] font-black uppercase tracking-widest text-white shadow-premium">
                    ⚡ FIFA 2026 HISTORIC EPIC
                  </div>
                  <span id="simulationBadge" class="hidden rounded-full bg-yellow-400 px-3 py-1 text-[0.65rem] font-black uppercase tracking-wide text-black">SIMULATED</span>
                </div>

                <!-- Storyline body container -->
                <div class="flex flex-col gap-3">
                  <span class="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/50">Personalized Match Storyline</span>
                  <div class="rounded-[20px] border border-white/5 bg-black/25 p-4 md:p-5 relative min-h-[220px]">
                    <p id="climaxStoryText" class="text-sm md:text-base leading-relaxed text-white/90 whitespace-pre-line leading-7 tracking-wide select-text transform-gpu will-change-transform-opacity">
                      Synthesis is parsing raw match variables...
                    </p>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  id="copyStoryBtn" 
                  type="button" 
                  class="flex-1 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-xs font-black uppercase tracking-[0.12em] text-white transition-all duration-200 hover:bg-white/10 flex items-center justify-center gap-2 transform-gpu will-change-transform">
                  📋 COPY TO SHARE
                </button>
                <button 
                  id="resetMomentBtn" 
                  type="button" 
                  class="flex-1 rounded-full bg-gradient-to-br from-fifa-glow via-fifa-pink to-fifa-magenta px-6 py-4 text-xs font-black uppercase tracking-[0.12em] text-white shadow-premium transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 transform-gpu will-change-transform">
                  🔄 GENERATE NEW PLAN
                </button>
              </div>

            </div>

          </div>

        </section>

      </div>
    </div>
  `;
}

/**
 * Executes a high-performance character-by-character staggered fade-up reveal on the Hero Headline.
 */
export function animateSplitTextHeadline() {
  if (!window.gsap) return;

  const tl = gsap.timeline();
  
  // Stagger animate individual character spans for a cinematic text reveal
  tl.fromTo('#heroHeadline .letter', 
    { 
      opacity: 0, 
      y: 24, 
      scaleY: 1.3
    }, 
    { 
      opacity: 1, 
      y: 0, 
      scaleY: 1,
      duration: 0.6, 
      stagger: 0.015, 
      ease: 'power3.out' 
    }
  );

  // Fade-up the sub-headline and summary
  tl.fromTo('#heroSummary', 
    { 
      opacity: 0, 
      y: 20 
    }, 
    { 
      opacity: 1, 
      y: 0, 
      duration: 0.5, 
      ease: 'power2.out' 
    }, 
    "-=0.4"
  );

  // Stagger reveal core form components gently
  tl.fromTo('.match-card, .vibe-chip', 
    { 
      opacity: 0, 
      y: 15 
    }, 
    { 
      opacity: 1, 
      y: 0, 
      duration: 0.45, 
      stagger: 0.03, 
      ease: 'power2.out' 
    }, 
    "-=0.3"
  );
}

/**
 * Prepares background elements for ScrollTrigger parallax motion.
 * Binds background glow positions directly to browser scroll progress.
 */
export function initBackgroundScrollParallax() {
  if (!window.gsap || !window.ScrollTrigger) return;
  
  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Orb 1 moves down & left
  gsap.to('#parallax-bg-1', {
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2
    },
    y: 180,
    x: -80,
    ease: 'none'
  });

  // Orb 2 moves up & right
  gsap.to('#parallax-bg-2', {
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2
    },
    y: -150,
    x: 90,
    ease: 'none'
  });

  // Orb 3 rotates slightly
  gsap.to('#parallax-bg-3', {
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8
    },
    y: -100,
    x: -50,
    scale: 1.15,
    ease: 'none'
  });
}

/**
 * Transitions layout state into Latency Masking preloader modal.
 * Uses hardware accelerated staggers to sequentially reveal loading indicators.
 */
export function playPreloaderEntrance(onCompleteCallback) {
  if (!window.gsap) return;

  const heroSec = document.getElementById('heroSection');
  const loaderSec = document.getElementById('preloaderSection');
  
  if (!heroSec || !loaderSec) return;

  // 1. Hide the active Hero form
  gsap.to(heroSec, {
    opacity: 0,
    y: -30,
    duration: 0.4,
    ease: 'power2.in',
    onComplete: () => {
      heroSec.classList.add('hidden');
      
      // 2. Prepare and reveal preloader section
      loaderSec.classList.remove('hidden');
      gsap.fromTo(loaderSec, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.45, ease: 'power2.out', onComplete: onCompleteCallback }
      );
    }
  });
}

/**
 * Sequentially updates and staggers preloader loading steps to mask async LLM generation time.
 * @param {Array<string>} steps 
 * @param {number} durationSeconds 
 * @param {Function} onFinished 
 */
export function runLatencyPreloaderSimulation(steps, durationSeconds, onFinished) {
  if (!window.gsap) return;

  const logsContainer = document.getElementById('preloaderLogsContainer');
  const progressBar = document.getElementById('loaderProgressBar');
  if (!logsContainer || !progressBar) return;

  const stepTime = (durationSeconds * 1000) / steps.length;
  let currentStep = 0;

  // Reset loader bar
  progressBar.style.width = '5%';

  // Animate loader bar progress
  gsap.to(progressBar, {
    width: '100%',
    duration: durationSeconds,
    ease: 'power1.inOut'
  });

  function showNextStep() {
    if (currentStep >= steps.length) {
      if (onFinished) setTimeout(onFinished, 400);
      return;
    }

    const nextLog = document.createElement('div');
    nextLog.className = 'log-item opacity-0 text-white font-semibold text-xs tracking-wider transform-gpu will-change-transform-opacity';
    nextLog.innerHTML = `⚡ <span class="text-fifa-pink">${steps[currentStep]}</span>`;
    
    // Clear out old logs
    logsContainer.innerHTML = '';
    logsContainer.appendChild(nextLog);

    // Stagger fade-in the text elegantly
    gsap.fromTo(nextLog, 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );

    currentStep++;
    setTimeout(showNextStep, stepTime);
  }

  showNextStep();
}

/**
 * Transitions layout from preloader to Split-Screen Climax layout.
 * Synchronously slides in Left and Right panels in lockstep using timeline positions.
 */
export function playClimaxRevealTransition(storyData) {
  if (!window.gsap) return;

  const loaderSec = document.getElementById('preloaderSection');
  const climaxSec = document.getElementById('climaxSection');
  
  if (!loaderSec || !climaxSec) return;

  // Fill in the generated storyline and user details
  document.getElementById('climaxFanId').innerText = storyData.userId;
  document.getElementById('climaxSentimentBadge').innerText = storyData.sentimentLabel;
  document.getElementById('climaxMatchName').innerText = storyData.matchName;
  document.getElementById('climaxFirstBatting').innerHTML = `<strong>${storyData.firstBattingTeamCode}:</strong> ${storyData.firstBattingSummary}`;
  document.getElementById('climaxSecondBatting').innerHTML = `<strong>${storyData.secondBattingTeamCode}:</strong> ${storyData.secondBattingSummary}`;
  document.getElementById('climaxMatchStatus').innerText = storyData.matchStatus;
  
  // Set archetype badge
  const vibeTitleMap = {
    vibe_octane: '⚡ FIFA 2026 HISTORIC EPIC',
    vibe_electric: '💥 CRITICAL CLINCHER',
    vibe_dominant: '🏆 CLINICAL DOMINANCE',
    vibe_clinch: '🧠 TACTICAL Concession Queue Spike'
  };
  const archetypeBadge = climaxSec.querySelector('.rounded-full.bg-gradient-to-r');
  if (archetypeBadge) {
    archetypeBadge.innerText = vibeTitleMap[storyData.vibeId] || '🏏 VIRAL FIFA 2026 MOMENT';
  }

  // Simulated badge toggle
  const simBadge = document.getElementById('simulationBadge');
  if (simBadge) {
    if (storyData.isSimulated) {
      simBadge.classList.remove('hidden');
    } else {
      simBadge.classList.add('hidden');
    }
  }

  // Set story body text
  const storyTextElem = document.getElementById('climaxStoryText');
  storyTextElem.innerHTML = storyData.storyline;

  // 1. Fade out preloader
  gsap.to(loaderSec, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.in',
    onComplete: () => {
      loaderSec.classList.add('hidden');
      
      // 2. Prepare climax display
      climaxSec.classList.remove('hidden');
      
      // Create synchronous GSAP Climax slide-in timeline
      const climaxTl = gsap.timeline();

      // Synchronously slide-in left & right panels in lockstep
      climaxTl.fromTo('#climaxLeftPanel', 
        { opacity: 0, x: -100 }, 
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }
      );

      // Start right panel at EXACT SAME MOMENT (utilizing < position parameter)
      climaxTl.fromTo('#climaxRightPanel', 
        { opacity: 0, x: 100 }, 
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' },
        "<" 
      );

      // Animate the story body text with a beautiful letter fade-up stagger
      climaxTl.fromTo('#climaxStoryText', 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        "-=0.2"
      );

      // Pulse the radar polygon size for vector aesthetics
      climaxTl.fromTo('#radarPolygon',
        { scale: 0.9, transformOrigin: '50% 50%' },
        { scale: 1.05, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut' },
        "-=0.3"
      );
    }
  });
}

/**
 * Transitions layout back from the generated climax screen to the initial Hero input section.
 */
export function playResetTransition() {
  if (!window.gsap) return;

  const climaxSec = document.getElementById('climaxSection');
  const heroSec = document.getElementById('heroSection');

  if (!climaxSec || !heroSec) return;

  gsap.to(climaxSec, {
    opacity: 0,
    y: 30,
    duration: 0.4,
    ease: 'power2.in',
    onComplete: () => {
      climaxSec.classList.add('hidden');
      
      // Setup hero form view again
      heroSec.classList.remove('hidden');
      
      // Smooth fade-in
      gsap.fromTo(heroSec, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', onComplete: animateSplitTextHeadline }
      );
    }
  });
}
