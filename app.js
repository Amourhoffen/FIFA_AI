const isLocal = window.location.protocol === 'file:';
const LIVE_API_URL = isLocal ? "http://localhost:3000/api/live-matches" : "/api/live-matches";
const REFRESH_INTERVAL_MS = 3000;

const QUICK_ACTIONS = [
  { id: "live", label: "Live Now", emoji: "●" },
  { id: "football", label: "Football", emoji: "★" },
  { id: "football", label: "Football", emoji: "⚽" }
];

const TEAM_THEMES = {
  ALL: { label: "All Teams", accent: "#C77DFF", gradient: "linear-gradient(135deg, #7B2CBF, #C77DFF)" },
  CSK: { label: "Chennai Super Kings", accent: "#FBBF24", gradient: "linear-gradient(135deg, #7B2CBF, #F472B6)" },
  MI: { label: "Mumbai Indians", accent: "#60A5FA", gradient: "linear-gradient(135deg, #2563EB, #7C3AED)" },
  RCB: { label: "Royal Challengers Bengaluru", accent: "#F87171", gradient: "linear-gradient(135deg, #DC2626, #F472B6)" },
  KKR: { label: "Kolkata Knight Riders", accent: "#C084FC", gradient: "linear-gradient(135deg, #6D28D9, #C084FC)" },
  SRH: { label: "Sunrisers Hyderabad", accent: "#FB923C", gradient: "linear-gradient(135deg, #EA580C, #F97316)" },
  RR: { label: "Rajasthan Royals", accent: "#F472B6", gradient: "linear-gradient(135deg, #BE185D, #F472B6)" },
  DC: { label: "Delhi Capitals", accent: "#60A5FA", gradient: "linear-gradient(135deg, #1D4ED8, #38BDF8)" },
  GT: { label: "Gujarat Titans", accent: "#38BDF8", gradient: "linear-gradient(135deg, #0F766E, #38BDF8)" },
  PBKS: { label: "Punjab Kings", accent: "#FB7185", gradient: "linear-gradient(135deg, #BE123C, #FB7185)" },
  LSG: { label: "Lucknow Super Giants", accent: "#2DD4BF", gradient: "linear-gradient(135deg, #0F766E, #2DD4BF)" }
};

function createArtworkDataUri(primary, secondary, label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
        <radialGradient id="glow" cx="30%" cy="18%" r="70%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="1200" fill="url(#bg)" />
      <rect width="1200" height="1200" fill="url(#glow)" />
      <g opacity="0.28" fill="none" stroke="#ffffff" stroke-width="18">
        <path d="M160 930c120-170 280-250 440-250s320 80 440 250" />
        <path d="M250 870c90-110 206-164 350-164s260 54 350 164" />
        <path d="M320 810c70-70 160-108 280-108s210 38 280 108" />
      </g>
      <g opacity="0.22" fill="#ffffff">
        <circle cx="180" cy="160" r="36" />
        <circle cx="1020" cy="220" r="28" />
        <circle cx="940" cy="940" r="42" />
        <circle cx="300" cy="980" r="30" />
      </g>
      <text x="80" y="1120" fill="#ffffff" fill-opacity="0.88" font-family="Poppins, Arial, sans-serif" font-size="72" font-weight="800" letter-spacing="3">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

const SPORT_IMAGES = {
  live: createArtworkDataUri("#7B2CBF", "#0D0D12", "Live Match"),
  upcoming: createArtworkDataUri("#C77DFF", "#1A1A24", "Upcoming Fixture"),
  result: createArtworkDataUri("#FF4D9D", "#0D0D12", "Result Highlights"),
  football: createArtworkDataUri("#1D4ED8", "#0D0D12", "Football Soon")
};

const ZOD = window.Zod || window.z || null;
const MatchSchema = ZOD ? ZOD.object({
  MatchID: ZOD.union([ZOD.string(), ZOD.number()]).optional(),
  MatchName: ZOD.string().optional(),
  MatchStatus: ZOD.string().optional(),
  MatchTime: ZOD.string().optional(),
  MatchDate: ZOD.string().optional(),
  MATCH_COMMENCE_START_DATE: ZOD.string().optional(),
  MatchDateNew: ZOD.string().optional(),
  GroundName: ZOD.string().optional(),
  city: ZOD.string().optional(),
  FirstBattingTeamName: ZOD.string().optional(),
  SecondBattingTeamName: ZOD.string().optional(),
  FirstBattingTeamCode: ZOD.string().optional(),
  SecondBattingTeamCode: ZOD.string().optional(),
  HomeTeamName: ZOD.string().optional(),
  AwayTeamName: ZOD.string().optional(),
  HomeTeamID: ZOD.string().optional(),
  AwayTeamID: ZOD.string().optional(),
  FirstBattingSummary: ZOD.string().optional(),
  SecondBattingSummary: ZOD.string().optional(),
  Commentss: ZOD.string().optional(),
  PreMatchCommentary: ZOD.string().optional(),
  PostMatchCommentary: ZOD.string().optional(),
  CurrentStrikerName: ZOD.string().optional(),
  CurrentBowlerName: ZOD.string().optional(),
  TossDetails: ZOD.string().optional(),
  TossText: ZOD.string().optional(),
  ProjectedScore: ZOD.union([ZOD.string(), ZOD.number()]).optional(),
  RunRate: ZOD.union([ZOD.string(), ZOD.number()]).optional(),
  ProjectedRunRate: ZOD.union([ZOD.string(), ZOD.number()]).optional(),
  MatchProgress: ZOD.union([ZOD.string(), ZOD.number()]).optional()
}).passthrough() : null;
const FeedSchema = ZOD ? ZOD.object({ Matchsummary: ZOD.array(MatchSchema).default([]) }).passthrough() : null;

const state = {
  matches: [],
  activeAction: "football",
  searchQuery: "",
  focusMatchId: null,
  requestToken: 0,
  refreshTimer: null,
  reducedMotion: false
};

const elements = {};

function bootstrap() {
  cacheElements();
  wireControls();
  renderQuickActions();
  applyReducedMotionPreference();
  loadFeed();
  loadTrendingShorts();
  state.refreshTimer = window.setInterval(loadFeed, REFRESH_INTERVAL_MS);
}

function cacheElements() {
  elements.menuButton = document.getElementById("menuButton");
  elements.profileButton = document.getElementById("profileButton");
  elements.searchInput = document.getElementById("searchInput");
  elements.quickActionRail = document.getElementById("quickActionRail");
  elements.heroBanner = document.getElementById("heroBanner");
  elements.feedTitle = document.getElementById("feedTitle");
  elements.matchCount = document.getElementById("matchCount");
  elements.matchList = document.getElementById("matchList");
}

function wireControls() {
  elements.searchInput?.addEventListener("input", () => {
    state.searchQuery = elements.searchInput.value || "";
    render();
  });

  elements.menuButton?.addEventListener("click", () => showToast("Menu coming soon"));
  elements.profileButton?.addEventListener("click", () => showToast("Profile coming soon"));
}

function renderQuickActions() {
  if (!elements.quickActionRail) return;

  elements.quickActionRail.innerHTML = QUICK_ACTIONS.map((action) => `
    <button
      type="button"
      data-action-id="${escapeHtml(action.id)}"
      class="shrink-0 rounded-full border px-4 py-3 text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5 ${action.id === state.activeAction ? "border-white bg-white text-black shadow-premium" : "border-white/10 bg-white/5 text-white"}">
      <span class="mr-2 text-[0.82rem]">${escapeHtml(action.emoji)}</span>
      <span>${escapeHtml(action.label)}</span>
    </button>
  `).join("");

  elements.quickActionRail.querySelectorAll("[data-action-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeAction = button.getAttribute("data-action-id") || "live";
      renderQuickActions();
      render();
    });
  });
}

function applyReducedMotionPreference() {
  try {
    state.reducedMotion = window.localStorage.getItem("fifaReducedMotion") === "1";
  } catch (error) {
    state.reducedMotion = false;
  }
}

function loadFeed(manual = false) {
  const token = ++state.requestToken;
  if (!manual && state.matches.length === 0) {
    renderLoadingState();
  }

  return fetch(`${LIVE_API_URL}?_=${Date.now()}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(payload => {
      if (token !== state.requestToken) return;
      const isInitialLoad = state.matches.length === 0;
      state.matches = parseFeedPayload(payload);
      render();
      if (isInitialLoad || manual) {
        animateReveal();
      }
      return state.matches;
    })
    .catch(err => {
      if (token !== state.requestToken) return;
      render();
      showToast("Feed unavailable, retrying live data");
      console.warn("Feed fetch error:", err);
    });
}

function parseFeedPayload(payload) {
  const rawMatches = Array.isArray(payload?.Matchsummary) ? payload.Matchsummary : [];
  if (!MatchSchema) {
    return rawMatches;
  }

  return rawMatches.filter((match) => MatchSchema.safeParse(match).success);
}

function render() {
  const visibleMatches = filterMatches(state.matches);
  const sections = buildSections(visibleMatches);
  const featuredMatch = getFeaturedMatch(visibleMatches);

  renderHero(featuredMatch, visibleMatches);
  renderMatchSections(sections);
  updatePredictionGame(featuredMatch);

  elements.feedTitle && (elements.feedTitle.textContent = state.activeAction === "football" ? "Football highlights" : "Live matches");
  elements.matchCount && (elements.matchCount.textContent = String(visibleMatches.length));
}

function updatePredictionGame(match) {
  const container = document.getElementById('predictionGameContainer');
  const result = document.getElementById('predictionResult');
  
  if (!container || container.dataset.locked === "true") return;

  if (match) {
    const t1 = match.FirstBattingTeamCode || "T1";
    const t2 = match.SecondBattingTeamCode || "T2";
    container.innerHTML = `
      <button onclick="playPredictionGame('${escapeHtml(t1)}')" class="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm font-bold transition-all active:scale-95 text-white">${escapeHtml(t1)}</button>
      <div class="text-[0.7rem] font-bold text-white/50">VS</div>
      <button onclick="playPredictionGame('${escapeHtml(t2)}')" class="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm font-bold transition-all active:scale-95 text-white">${escapeHtml(t2)}</button>
    `;

    const label1 = document.querySelector('#sumoWrestler1 .sumo-label');
    const label2 = document.querySelector('#sumoWrestler2 .sumo-label');
    if (label1) label1.textContent = t1;
    if (label2) label2.textContent = t2;

    if(result) {
      result.classList.add('hidden');
      result.classList.replace('text-green-400', 'text-fifa-glow');
    }
  }
}

window.playPredictionGame = function(team) {
  const container = document.getElementById('predictionGameContainer');
  const result = document.getElementById('predictionResult');
  const ring = document.getElementById('sumoRingContainer');
  const w1 = document.getElementById('sumoWrestler1');
  const w2 = document.getElementById('sumoWrestler2');
  const shockwave = document.getElementById('sumoShockwave');

  if(container && result) {
    container.dataset.locked = "true";
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => {
      b.disabled = true;
      b.style.opacity = '0.5';
    });
    result.textContent = `Prediction locked for ${team}! 🎯 Generating reward points...`;
    result.classList.remove('hidden');

    if (ring && w1 && w2 && shockwave) {
      // Unhide the ring container
      ring.classList.remove('hidden');
      
      // Reset wrestlers positions and scales/rotations using GSAP
      gsap.killTweensOf([w1, w2, shockwave, ring]);
      gsap.set(w1, { left: '10%', scale: 1, rotation: 0, opacity: 1 });
      gsap.set(w2, { right: '10%', scale: 1, rotation: 0, opacity: 1 });
      gsap.set(shockwave, { scale: 0.1, opacity: 0 });
      gsap.set(ring, { x: 0, y: 0 });

      const label1 = w1.querySelector('.sumo-label')?.textContent || 'T1';
      const isTeam1Voted = (team === label1);

      // Create GSAP Timeline
      const tl = gsap.timeline();

      // 1. Charge to the center
      tl.to(w1, { left: '42%', duration: 0.8, ease: 'power2.in' })
        .to(w2, { right: '42%', duration: 0.8, ease: 'power2.in' }, '<');

      // 2. Collision event
      tl.add(() => {
        // Shockwave expansion
        gsap.fromTo(shockwave, 
          { scale: 0.5, opacity: 1 },
          { scale: 3, opacity: 0, duration: 0.5, ease: 'power1.out' }
        );
        // Screen shake on the ring container
        gsap.to(ring, {
          x: 'random(-5, 5)',
          y: 'random(-5, 5)',
          duration: 0.05,
          repeat: 8,
          yoyo: true,
          onComplete: () => {
            gsap.set(ring, { x: 0, y: 0 });
          }
        });
      });

      // 3. Push out sequence: winner pushes loser out of bounds with spin
      if (isTeam1Voted) {
        tl.to(w1, { left: '55%', duration: 0.4, ease: 'power1.out' })
          .to(w2, { 
            right: '-30%', 
            rotation: 720, 
            scale: 0.8, 
            opacity: 0.3,
            duration: 0.8, 
            ease: 'power2.out' 
          }, '<');
      } else {
        tl.to(w2, { right: '55%', duration: 0.4, ease: 'power1.out' })
          .to(w1, { 
            left: '-30%', 
            rotation: -720, 
            scale: 0.8, 
            opacity: 0.3,
            duration: 0.8, 
            ease: 'power2.out' 
          }, '<');
      }
    }

    setTimeout(() => {
      result.textContent = `🎉 +50 Fan Points awarded! Keep watching!`;
      result.classList.replace('text-fifa-glow', 'text-green-400');
    }, 1800);
  }
}

async function loadTrendingShorts() {
  const container = document.getElementById("shortsContainer");
  if (!container) return;
  
  try {
    const res = await fetch("/api/trending-shorts");
    const data = await res.json();
    if (data.success && data.videos && data.videos.length > 0) {
      container.innerHTML = data.videos.map(video => `
        <div class="shrink-0 w-[140px] md:w-[160px] snap-center rounded-2xl overflow-hidden border border-white/10 relative group">
          <button type="button" onclick="openVideoModal('${escapeHtml(video.videoId)}')" class="block relative aspect-[9/16] w-full text-left bg-black cursor-pointer">
            <img src="${escapeHtml(video.thumbnail)}" alt="Thumbnail" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
            <div class="absolute bottom-2 left-2 right-2">
              <h4 class="text-[0.65rem] font-bold text-white line-clamp-3 leading-snug">${escapeHtml(video.title)}</h4>
            </div>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
               <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center pl-1 shadow-lg shadow-red-600/30">
                 <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
               </div>
            </div>
          </button>
        </div>
      `).join("");
    } else {
      container.innerHTML = `<div class="text-sm text-white/50 p-4">No trending shorts found.</div>`;
    }
  } catch (err) {
    container.innerHTML = `<div class="text-sm text-white/50 p-4">Shorts unavailable right now.</div>`;
  }
}

function renderLoadingState() {
  if (elements.heroBanner) {
    elements.heroBanner.innerHTML = `
      <div class="grid gap-4 p-5 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div class="grid gap-3">
          <p class="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/65">Loading</p>
          <h3 class="text-2xl font-semibold tracking-[-0.04em]">Syncing the official feed</h3>
          <p class="max-w-[32ch] text-sm leading-6 text-white/80">Preparing FIFA AI's premium live sports view.</p>
        </div>
        <div class="min-h-[220px] rounded-[24px] border border-white/10 bg-white/8"></div>
      </div>
    `;
  }

  if (elements.matchList) {
    elements.matchList.innerHTML = `
      <article class="rounded-[20px] border border-white/10 bg-fifa-surface p-5 shadow-premium">
        <p class="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-fifa-muted">Please wait</p>
        <h3 class="mb-2 text-lg font-semibold tracking-[-0.04em]">Fetching live matches</h3>
        <p class="text-sm leading-6 text-white/75">The official schedule feed is loading right now.</p>
      </article>
    `;
  }
}

function filterMatches(matches) {
  const query = normalizeText(state.searchQuery);
  let filtered = Array.isArray(matches) ? [...matches] : [];

  if (query) {
    filtered = filtered.filter((match) => {
      const haystack = [
        match.MatchName,
        match.FirstBattingTeamName,
        match.SecondBattingTeamName,
        match.HomeTeamName,
        match.AwayTeamName,
        match.GroundName,
        match.city,
        match.MatchTime,
        match.Commentss
      ].filter(Boolean).map(normalizeText).join(" ");

      return haystack.includes(query);
    });
  }

  if (state.activeAction === "football") {
    return [];
  }

  if (state.activeAction === "live") {
    filtered = filtered.filter((match) => String(match.MatchStatus || "").toLowerCase() === "live");
  }

  return sortMatches(filtered);
}

function buildSections(matches) {
  if (state.activeAction === "football") {
    return [{ title: "Football mode", items: [] }];
  }

  if (state.activeAction === "live") {
    return [{ title: "Live now", items: matches.filter((match) => String(match.MatchStatus || "").toLowerCase() === "live") }];
  }

  return [
    { title: "Live now", items: matches.filter((match) => String(match.MatchStatus || "").toLowerCase() === "live") },
    { title: "Coming up", items: matches.filter((match) => String(match.MatchStatus || "").toLowerCase() === "upcoming") },
    { title: "Recent results", items: matches.filter((match) => String(match.MatchStatus || "").toLowerCase() === "post") }
  ];
}

function renderHero(match, matches) {
  if (!elements.heroBanner) {
    return;
  }

  if (state.activeAction === "football") {
    elements.heroBanner.innerHTML = `
      <div class="grid gap-4 p-5 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div class="grid gap-3">
          <p class="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/65">Football coming soon</p>
          <h3 class="text-2xl font-semibold tracking-[-0.04em]">Premium football streams and game drops</h3>
          <p class="max-w-[32ch] text-sm leading-6 text-white/80">FIFA AI is tuned for live sports discovery. Football content can slot in here next.</p>
          <div class="flex flex-wrap items-center gap-2">
            <button class="rounded-full bg-white px-4 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-black">Play Now</button>
          </div>
        </div>
        <div class="relative min-h-[220px] overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
          <div class="absolute inset-0 bg-cover bg-center opacity-50" style="background-image:url('${SPORT_IMAGES.football}')"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-white/10 via-black/10 to-black/80"></div>
          <div class="absolute bottom-4 left-4 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-white">Soon</div>
        </div>
      </div>
    `;
    return;
  }

  const theme = getMatchTheme(match);
  const title = match ? (match.MatchName || buildMatchTitle(match)) : "Live sports";
  const subtitle = match ? buildHeroSubtitle(match) : "Premium dark mode for every live moment.";
  const metricA = match ? buildScoreLine(match) : `${matches.length} matches available`;
  const metricB = match ? formatMatchDate(match) : "Official feed connected";
  const image = getHeroImage(match);

  elements.heroBanner.innerHTML = `
    <div class="grid gap-4 p-5 md:grid-cols-[1.1fr_0.9fr] md:items-center">
      <div class="grid gap-3">
        <p class="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/65">${escapeHtml(match ? statusText(match.MatchStatus) : "Featured")}</p>
        <h3 class="text-[1.7rem] font-semibold leading-[0.98] tracking-[-0.04em] md:text-[2.15rem]">${escapeHtml(title)}</h3>
        <p class="max-w-[32ch] text-sm leading-6 text-white/80">${escapeHtml(subtitle)}</p>

        <div class="grid grid-cols-2 gap-2">
          <div class="min-w-0 rounded-[18px] border border-white/10 bg-black/20 p-3">
            <span class="block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/70">Score</span>
            <strong class="mt-1 block truncate text-sm font-semibold">${escapeHtml(metricA)}</strong>
          </div>
          <div class="min-w-0 rounded-[18px] border border-white/10 bg-black/20 p-3">
            <span class="block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/70">Time</span>
            <strong class="mt-1 block truncate text-sm font-semibold">${escapeHtml(metricB)}</strong>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button class="rounded-full bg-gradient-to-br from-fifa-glow via-fifa-pink to-fifa-magenta px-4 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white shadow-premium">Get Rewards</button>
          <div class="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white">HD stream</div>
        </div>
      </div>

      <div class="relative min-h-[220px] overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
        <div class="absolute inset-0 bg-cover bg-center opacity-50" style="background-image:url('${image}')"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-white/10 via-black/10 to-black/80"></div>
        <div class="absolute inset-x-4 bottom-4 grid gap-2 rounded-[20px] border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
          <span class="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-white">Live energy</span>
          <strong class="text-[1.35rem] font-semibold tracking-[-0.04em] text-white">${escapeHtml(match ? (match.FirstBattingTeamCode || "EB") : "EB")}</strong>
        </div>
        <div class="absolute left-0 top-0 h-full w-full rounded-[24px]" style="background:${theme.gradient};opacity:0.08"></div>
      </div>
    </div>
  `;
}

function renderMatchSections(sections) {
  if (!elements.matchList) {
    return;
  }

  const hasAnyItems = sections.some((section) => Array.isArray(section.items) && section.items.length > 0);
  const scrollTop = elements.matchList.scrollTop;

  if (!hasAnyItems) {
    if (state.activeAction === "live") {
      elements.matchList.innerHTML = `
        <article class="rounded-[20px] border border-white/10 bg-fifa-surface/80 p-6 shadow-premium backdrop-blur-xl relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-fifa-glow/10 blur-3xl pointer-events-none"></div>
          <p class="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-fifa-pink">No Live Matches</p>
          <h3 class="mb-2 text-xl font-bold tracking-tight text-white">FIFA 2026 Live Feed is Currently Idle</h3>
          <p class="text-sm leading-6 text-white/70 mb-4">
            There are no active matches with a "Live" status in the S3 schedule feed at this moment. 
            All scheduled and concluded matches are available in the main directory.
          </p>
          <button id="switchToFootballBtn" class="flex items-center gap-2 rounded-full bg-gradient-to-br from-fifa-glow via-fifa-pink to-fifa-magenta px-5 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white shadow-premium transition-all duration-150 hover:-translate-y-0.5">
            <span>Explore All Matches</span>
            <svg class="h-3.5 w-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </article>
      `;
      const btn = elements.matchList.querySelector("#switchToFootballBtn");
      if (btn) {
        btn.addEventListener("click", () => {
          state.activeAction = "football";
          renderQuickActions();
          render();
        });
      }
      return;
    }

    elements.matchList.innerHTML = state.activeAction === "football"
      ? `
        <article class="rounded-[20px] border border-white/10 bg-fifa-surface p-5 shadow-premium">
          <p class="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-fifa-muted">Football mode</p>
          <h3 class="mb-2 text-lg font-semibold tracking-[-0.04em]">Football live feed will land here</h3>
          <p class="text-sm leading-6 text-white/75">Switch back to Football or Live Now to see the current official fixtures.</p>
        </article>
      `
      : `
        <article class="rounded-[20px] border border-white/10 bg-fifa-surface p-5 shadow-premium">
          <p class="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-fifa-muted">No matches found</p>
          <h3 class="mb-2 text-lg font-semibold tracking-[-0.04em]">Nothing matches this search</h3>
          <p class="text-sm leading-6 text-white/75">Try a different team name, venue, or switch the chip selection.</p>
        </article>
      `;
    return;
  }

  elements.matchList.innerHTML = sections
    .filter((section) => section.items.length > 0)
    .map((section) => `
      <section class="grid gap-2">
        <div class="flex items-center justify-between gap-2 px-1 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-fifa-muted">
          <h3 class="m-0 text-[0.98rem] font-semibold tracking-[-0.03em] text-white">${escapeHtml(section.title)}</h3>
          <span>${section.items.length}</span>
        </div>
        <div class="grid gap-3">
          ${section.items.map((match, index) => renderMatchCard(match, index)).join("")}
        </div>
      </section>
    `)
    .join("");

  elements.matchList.querySelectorAll("[data-match-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.focusMatchId = button.getAttribute("data-match-id");
      render();
      if (!state.reducedMotion) {
        button.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
  
  elements.matchList.scrollTop = scrollTop;
}

function renderMatchCard(match, index) {
  const theme = getMatchTheme(match);
  const status = statusText(match.MatchStatus);
  const isLive = String(match.MatchStatus || "").toLowerCase() === "live";
  const image = getMatchImage(match, index);
  const isSelected = String(state.focusMatchId || "") === String(match.MatchID || index);
  const title = match.MatchName || buildMatchTitle(match);
  const subtitle = buildCardSubtitle(match);
  const scoreLine = buildScoreLine(match);
  const metaLine = buildMetaLine(match);
  const accent = theme.accent;

  return `
    <button
      type="button"
      data-match-id="${escapeHtml(String(match.MatchID || index))}"
      class="group relative isolate overflow-hidden rounded-[20px] border border-white/10 bg-fifa-surface p-4 text-left shadow-premium transition-transform duration-150 hover:-translate-y-0.5 ${isSelected ? "ring-2 ring-white/35" : ""}">
      <div class="absolute inset-0 -z-20 bg-cover bg-center opacity-70" style="background-image:url('${image}')"></div>
      <div class="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-black/30 to-black/85"></div>
      <div class="absolute inset-0 -z-[5] bg-gradient-to-br from-transparent via-transparent to-white/5"></div>

      <div class="flex items-center justify-between gap-2">
        <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2.5 py-2 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-white ${isLive ? 'live-pulse !border-fifa-pink !text-fifa-pink !bg-fifa-pink/10' : ''}">${isLive ? '<span class="h-1.5 w-1.5 rounded-full bg-fifa-pink animate-pulse"></span>' : ''}${escapeHtml(status)}</span>
        <span class="truncate text-[0.72rem] font-bold uppercase tracking-[0.08em] text-white/75">${escapeHtml(metaLine)}</span>
      </div>

      <div class="mt-3 grid gap-1">
        <h4 class="truncate text-[1.08rem] font-semibold leading-[1.12] tracking-[-0.03em] text-white">${escapeHtml(title)}</h4>
        <p class="truncate text-sm leading-6 text-white/78">${escapeHtml(subtitle)}</p>
      </div>

      <div class="mt-4 rounded-[20px] border border-white/10 bg-black/35 p-3 backdrop-blur-md">
        <div class="flex items-stretch justify-between gap-2">
          <div class="min-w-0 flex-1">
            <span class="block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/65">${escapeHtml(match.FirstBattingTeamCode || match.HomeTeamID || "T1")}</span>
            <strong class="mt-1 block truncate text-sm font-semibold text-white">${escapeHtml(match.FirstBattingTeamName || "Team 1")}</strong>
            <small class="block truncate text-[0.82rem] text-white/76">${escapeHtml(match.FirstBattingSummary || "--")}</small>
          </div>

          <div class="grid h-11 w-11 shrink-0 place-items-center self-center rounded-full border border-white/10 bg-white/10 text-[0.72rem] font-extrabold tracking-[0.12em] text-white">VS</div>

          <div class="min-w-0 flex-1 text-right">
            <span class="block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/65">${escapeHtml(match.SecondBattingTeamCode || match.AwayTeamID || "T2")}</span>
            <strong class="mt-1 block truncate text-sm font-semibold text-white">${escapeHtml(match.SecondBattingTeamName || "Team 2")}</strong>
            <small class="block truncate text-[0.82rem] text-white/76">${escapeHtml(match.SecondBattingSummary || "--")}</small>
          </div>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <div class="inline-flex max-w-full items-center rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[0.72rem] font-bold tracking-[0.04em] text-white ${isLive ? 'score-flash' : ''}">${escapeHtml(scoreLine)}</div>
        <div class="inline-flex max-w-full items-center rounded-full border border-white/10 px-3 py-2 text-[0.72rem] font-bold tracking-[0.04em] text-white/78">${escapeHtml(match.city || match.GroundName || "Venue pending")}</div>
      </div>

      ${isLive ? `
      <!-- Live Win Probability Advanced Feature -->
      <div class="mt-4 pt-4 border-t border-white/5">
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-[0.65rem] font-bold uppercase tracking-widest text-white/60 flex items-center gap-1.5"><span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span> Win Probability</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="text-[0.7rem] font-extrabold text-white w-8 shrink-0">${escapeHtml(match.FirstBattingTeamCode || match.HomeTeamID || 'T1')}</div>
          <div class="flex-1 h-2 rounded-full overflow-hidden flex shadow-inner bg-white/5 border border-white/5 relative">
            <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000" style="width: ${match.MatchProgress || 55}%"></div>
            <div class="h-full bg-gradient-to-l from-rose-500 to-orange-400 shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all duration-1000" style="width: ${100 - (match.MatchProgress || 55)}%"></div>
          </div>
          <div class="text-[0.7rem] font-extrabold text-white w-8 shrink-0 text-right">${escapeHtml(match.SecondBattingTeamCode || match.AwayTeamID || 'T2')}</div>
        </div>
        <div class="flex justify-between items-center mt-1 px-0.5">
          <span class="text-[0.6rem] font-bold text-cyan-400">${match.MatchProgress || 55}%</span>
          <span class="text-[0.6rem] font-bold text-rose-400">${100 - (match.MatchProgress || 55)}%</span>
        </div>
      </div>
      ` : `
      <div class="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div class="h-full rounded-full bg-gradient-to-r from-fifa-glow via-fifa-pink to-fifa-magenta" style="width:${match.MatchStatus && String(match.MatchStatus).toLowerCase() === "upcoming" ? "34%" : "100%"}"></div>
      </div>
      `}

      <span class="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/5" aria-hidden="true"></span>
      <span class="pointer-events-none absolute right-3 top-3 h-2.5 w-2.5 rounded-full" style="background:${accent};box-shadow:0 0 0 6px color-mix(in srgb, ${accent} 18%, transparent)"></span>
    </button>
  `;
}

function getFeaturedMatch(matches) {
  const selected = matches.find((match) => String(match.MatchID) === String(state.focusMatchId));
  if (selected) return selected;

  const live = matches.find((match) => String(match.MatchStatus || "").toLowerCase() === "live");
  if (live) return live;

  const upcoming = matches.find((match) => String(match.MatchStatus || "").toLowerCase() === "upcoming");
  if (upcoming) return upcoming;

  return matches[0] || null;
}

function sortMatches(matches) {
  return [...matches].sort((left, right) => {
    const leftRank = statusRank(left.MatchStatus);
    const rightRank = statusRank(right.MatchStatus);
    if (leftRank !== rightRank) return leftRank - rightRank;
    return getMatchDateValue(left) - getMatchDateValue(right);
  });
}

function statusRank(status) {
  switch (String(status || "").toLowerCase()) {
    case "live": return 0;
    case "upcoming": return 1;
    case "post": return 2;
    default: return 3;
  }
}

function getMatchDateValue(match) {
  const raw = match.MATCH_COMMENCE_START_DATE || match.MatchDate || match.MatchDateNew || "";
  const parsed = new Date(String(raw).replace(" ", "T") + "+05:30");
  return Number.isNaN(parsed.getTime()) ? Number.MAX_SAFE_INTEGER : parsed.getTime();
}

function getMatchTheme(match) {
  const code = String(match?.FirstBattingTeamCode || match?.HomeTeamID || "ALL").toUpperCase();
  return TEAM_THEMES[code] || TEAM_THEMES.ALL;
}

function buildMatchTitle(match) {
  return [match.FirstBattingTeamName || match.HomeTeamName || "Team 1", match.SecondBattingTeamName || match.AwayTeamName || "Team 2"].filter(Boolean).join(" vs ");
}

function buildHeroSubtitle(match) {
  if (String(match.MatchStatus || "").toLowerCase() === "live") return `Live from ${match.GroundName || "the venue"} with the current momentum wrapped in premium dark glass.`;
  if (String(match.MatchStatus || "").toLowerCase() === "upcoming") return `Next up at ${match.MatchTime || "TBD"} IST, with a polished rewards-first layout that feels like a streaming app.`;
  return `Finished result with cinematic overlays, team-first typography, and fast-scanning score treatment.`;
}

function buildCardSubtitle(match) {
  if (String(match.MatchStatus || "").toLowerCase() === "live") return `${match.CurrentStrikerName || "Striker"} vs ${match.CurrentBowlerName || "Bowler"} · ${match.GroundName || "Venue pending"}`;
  if (String(match.MatchStatus || "").toLowerCase() === "upcoming") return `${match.MatchTime || "TBD"} IST · ${match.GroundName || "Venue pending"}`;
  return match.Commentss || `${match.GroundName || "Venue pending"} · Result available`;
}

function buildMetaLine(match) {
  if (String(match.MatchStatus || "").toLowerCase() === "live") return `Live · ${formatMatchDate(match)}`;
  if (String(match.MatchStatus || "").toLowerCase() === "upcoming") return `Upcoming · ${formatMatchDate(match)}`;
  return `Result · ${formatMatchDate(match)}`;
}

function buildScoreLine(match) {
  const first = match.FirstBattingTeamCode || match.FirstBattingTeamName || "T1";
  const second = match.SecondBattingTeamCode || match.SecondBattingTeamName || "T2";
  const firstScore = match.FirstBattingSummary || "--";
  const secondScore = match.SecondBattingSummary || "--";

  if (String(match.MatchStatus || "").toLowerCase() === "live") return `${first} ${firstScore} ${second} ${secondScore}`;
  if (String(match.MatchStatus || "").toLowerCase() === "upcoming") return `${first} vs ${second}`;
  return `${first} ${firstScore} · ${second} ${secondScore}`;
}

function getMatchImage(match, index) {
  const status = String(match?.MatchStatus || "").toLowerCase();
  if (status === "live") return SPORT_IMAGES.live;
  if (status === "upcoming") return SPORT_IMAGES.upcoming;
  if (status === "post") return SPORT_IMAGES.result;
  const teamIndex = Math.abs(hashCode(String(match?.MatchName || index))) % 3;
  return [SPORT_IMAGES.live, SPORT_IMAGES.upcoming, SPORT_IMAGES.result][teamIndex];
}

function getHeroImage(match) {
  if (!match) return SPORT_IMAGES.live;
  const status = String(match.MatchStatus || "").toLowerCase();
  if (status === "live") return SPORT_IMAGES.live;
  if (status === "upcoming") return SPORT_IMAGES.upcoming;
  return SPORT_IMAGES.result;
}

function statusText(status) {
  switch (String(status || "").toLowerCase()) {
    case "live": return "Live now";
    case "upcoming": return "Upcoming";
    case "post": return "Result";
    default: return "Scheduled";
  }
}

function formatMatchDate(match) {
  const raw = match.MATCH_COMMENCE_START_DATE || match.MatchDate || "";
  if (!raw) return match.MatchTime || "TBD";
  const date = new Date(String(raw).replace(" ", "T") + "+05:30");
  if (Number.isNaN(date.getTime())) return match.MatchDateNew || raw;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(date);
}

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function hashCode(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function showToast(message) {
  let toast = document.querySelector(".fifa-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "fifa-toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-[#0D0D12]/95 px-4 py-3 text-sm font-semibold text-white shadow-premium opacity-0";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  if (window.gsap && !state.reducedMotion) {
    gsap.killTweensOf(toast);
    gsap.fromTo(toast, { opacity: 0, y: 16, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.24, ease: "power2.out" });
    clearTimeout(window._fifaToastTimer);
    window._fifaToastTimer = window.setTimeout(() => {
      gsap.to(toast, { opacity: 0, y: 14, duration: 0.2, ease: "power2.in" });
    }, 2200);
  } else {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
    clearTimeout(window._fifaToastTimer);
    window._fifaToastTimer = window.setTimeout(() => {
      toast.style.opacity = "0";
    }, 2200);
  }
}

function animateReveal() {
  if (!window.gsap || state.reducedMotion) return;

  gsap.fromTo('[data-animate="app-bar"]', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
  gsap.fromTo('#heroBanner', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" });
  gsap.fromTo('#matchList > *', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" });
}

function openVideoModal(videoId) {
  const modal = document.getElementById("videoModal");
  const modalContent = document.getElementById("videoModalContent");
  const container = document.getElementById("videoPlayerContainer");
  
  if (!modal || !container) return;
  
  // Display a simulated crowd telemetry feed instead of a YouTube video
  container.innerHTML = `
    <div class="w-full h-full flex flex-col items-center justify-center bg-[#0D0D12] text-white">
      <svg class="w-16 h-16 mb-4 text-[#00A15D] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
      <h2 class="text-xl font-bold mb-2">Live Telemetry Feed: ${videoId}</h2>
      <p class="text-sm text-gray-400">Monitoring crowd density and flow in real-time...</p>
    </div>
  `;
  
  // Show modal
  modal.classList.remove("opacity-0", "pointer-events-none");
  modalContent.classList.remove("scale-95");
  modalContent.classList.add("scale-100");

  if (window.gsap && !state.reducedMotion) {
    gsap.fromTo(modalContent, 
      { y: window.innerHeight, scale: 0.8, opacity: 0, borderRadius: "50px" }, 
      { y: 0, scale: 1, opacity: 1, borderRadius: window.innerWidth < 640 ? "0px" : "32px", duration: 0.6, ease: "power4.out" }
    );
  }
}

function closeVideoModal() {
  const modal = document.getElementById("videoModal");
  const modalContent = document.getElementById("videoModalContent");
  const container = document.getElementById("videoPlayerContainer");
  
  if (!modal) return;
  
  if (window.gsap && !state.reducedMotion) {
    gsap.to(modalContent, {
      y: window.innerHeight,
      scale: 0.9,
      opacity: 0,
      duration: 0.5,
      ease: "power3.in",
      onComplete: () => {
        modal.classList.add("opacity-0", "pointer-events-none");
        if (container) container.innerHTML = '';
      }
    });
  } else {
    modal.classList.add("opacity-0", "pointer-events-none");
    modalContent.classList.remove("scale-100");
    modalContent.classList.add("scale-95");
    setTimeout(() => {
      if (container) container.innerHTML = '';
    }, 300);
  }
}

// Ensure the openVideoModal is available globally
window.openVideoModal = openVideoModal;

// --- VMM Modal Logic ---
let selectedVibe = null;

window.openVmmModal = function() {
  const modal = document.getElementById("vmmModal");
  const content = document.getElementById("vmmModalContent");
  if (!modal || !content) return;
  
  modal.classList.remove("opacity-0", "pointer-events-none");
  content.classList.remove("scale-95");
  content.classList.add("scale-100");
  
  // Animation for opening if GSAP is loaded
  if (window.gsap && !state.reducedMotion) {
    gsap.fromTo(content, {y: 40, scale: 0.96}, {y: 0, scale: 1, duration: 0.5, ease: "back.out(1.2)"});
  }
};

window.closeVmmModal = function() {
  const modal = document.getElementById("vmmModal");
  const content = document.getElementById("vmmModalContent");
  if (!modal || !content) return;
  
  modal.classList.add("opacity-0", "pointer-events-none");
  content.classList.remove("scale-100");
  content.classList.add("scale-95");
  
  setTimeout(window.resetVmm, 300); // Reset after close
};

window.selectVibe = function(btnElement, vibe) {
  selectedVibe = vibe;
  
  // Update button UI
  document.querySelectorAll('.vibe-btn').forEach(btn => {
    btn.classList.remove('border-fifa-pink', 'bg-white/10');
    btn.classList.add('border-white/10', 'bg-white/5');
  });
  
  btnElement.classList.remove('border-white/10', 'bg-white/5');
  btnElement.classList.add('border-fifa-pink', 'bg-white/10');
  
  // Enable generate button
  const genBtn = document.getElementById("generateScriptBtn");
  if (genBtn) {
    genBtn.disabled = false;
  }
};

window.generateAiScript = function() {
  const setupState = document.getElementById("vmmSetupState");
  const loadingState = document.getElementById("vmmLoadingState");
  const resultState = document.getElementById("vmmResultState");
  const loadingText = document.getElementById("vmmLoadingText");
  const scriptContent = document.getElementById("generatedScriptContent");
  
  if (!selectedVibe) return;

  // Transition to loading state
  setupState.classList.add("opacity-0");
  setTimeout(() => {
    setupState.classList.add("hidden");
    loadingState.classList.remove("hidden");
    setTimeout(() => loadingState.classList.remove("opacity-0"), 50);
  }, 300);

  const steps = [
    "Analyzing live feed data...",
    "Extracting key match moments...",
    "Applying " + selectedVibe + " tone...",
    "Formatting screenplay..."
  ];
  
  let step = 0;
  const interval = setInterval(() => {
    if (step < steps.length) {
      loadingText.textContent = steps[step];
      step++;
    }
  }, 800);

  // Mock Gemini API generation (simulated delay 3.5s)
  setTimeout(() => {
    clearInterval(interval);
    
    // Generate simulated text based on vibe
    scriptContent.innerHTML = `[SCENE START]

<b>VISUAL:</b> Fast-paced montage of crowd reactions, tense faces, and the stadium lights pulsing.
<b>AUDIO:</b> Deep bass drop followed by rising heartbeat sound effect.

<b>NARRATOR (V.O.):</b>
"You thought the game was over? The ${selectedVibe} energy just reached a whole new level."

<b>VISUAL:</b> Slow-motion replay of the critical moment (six, wicket, or run-out) with stylized neon glitch transitions.
<b>TEXT OVERLAY:</b> "THE MOMENT EVERYTHING CHANGED."

<b>AUDIO:</b> Stadium crowd roar peaks, then sudden silence for 1 second. 

<b>NARRATOR (V.O.):</b>
"This is why we watch. This is football."

<b>VISUAL:</b> FIFA AI logo with a glowing pink aura.
<b>TEXT OVERLAY:</b> "Powered by FIFA Gemini"

[SCENE END]`;

    loadingState.classList.add("opacity-0");
    setTimeout(() => {
      loadingState.classList.add("hidden");
      resultState.classList.remove("hidden");
      setTimeout(() => resultState.classList.remove("opacity-0"), 50);
    }, 300);
    
  }, 3500);
};

window.copyScript = function() {
  const scriptContent = document.getElementById("generatedScriptContent").innerText;
  navigator.clipboard.writeText(scriptContent).then(() => {
    const btn = document.getElementById("copyScriptBtn");
    const originalText = btn.innerText;
    btn.innerText = "COPIED!";
    btn.classList.add("bg-green-500/20", "text-green-400");
    
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.remove("bg-green-500/20", "text-green-400");
    }, 2000);
  });
};

window.resetVmm = function() {
  selectedVibe = null;
  
  document.querySelectorAll('.vibe-btn').forEach(btn => {
    btn.classList.remove('border-fifa-pink', 'bg-white/10');
    btn.classList.add('border-white/10', 'bg-white/5');
  });
  
  const genBtn = document.getElementById("generateScriptBtn");
  if (genBtn) {
    genBtn.disabled = true;
  }
  
  const setupState = document.getElementById("vmmSetupState");
  const loadingState = document.getElementById("vmmLoadingState");
  const resultState = document.getElementById("vmmResultState");
  
  if (setupState) {
    setupState.classList.remove("hidden");
    setupState.classList.remove("opacity-0");
  }
  if (loadingState) {
    loadingState.classList.add("hidden", "opacity-0");
  }
  if (resultState) {
    resultState.classList.add("hidden", "opacity-0");
  }
};

window.addEventListener("DOMContentLoaded", () => {
  bootstrap();
  const closeBtn = document.getElementById("closeVideoModal");
  if (closeBtn) closeBtn.addEventListener("click", closeVideoModal);
});