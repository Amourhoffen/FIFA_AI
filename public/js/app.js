import { heroPayloadSchema } from './schemas.js';
import { 
  createHeroSection, 
  animateSplitTextHeadline, 
  initBackgroundScrollParallax, 
  playPreloaderEntrance, 
  runLatencyPreloaderSimulation, 
  playClimaxRevealTransition, 
  playResetTransition 
} from './components/heroSection.js';

// Preconfigured high-fidelity FIFA 2026 matches as presets & fallback
const FALLBACK_MATCHES = [
  {
    MatchID: "fifa_m01",
    MatchName: "Argentina vs France",
    GroundName: "MetLife Stadium, New York/New Jersey",
    FirstBattingTeamCode: "ARG",
    SecondBattingTeamCode: "FRA",
    FirstBattingSummary: "Crowd Density: 98%",
    SecondBattingSummary: "Gate 4 Congestion",
    MatchStatus: "Live - 45' HT",
    TossText: "High traffic expected at concourse C",
    Commentss: "Intense atmosphere with high density in the north stands. Medical personnel on standby."
  },
  {
    MatchID: "fifa_m02",
    MatchName: "Brazil vs Germany",
    GroundName: "Azteca Stadium, Mexico City",
    FirstBattingTeamCode: "BRA",
    SecondBattingTeamCode: "GER",
    FirstBattingSummary: "Crowd Density: 92%",
    SecondBattingSummary: "Concessions Wait: 15m",
    MatchStatus: "Live - 70'",
    TossText: "Food & Beverage queues spiking",
    Commentss: "Vibrant energy but slight bottlenecks near the east gates."
  },
  {
    MatchID: "fifa_m03",
    MatchName: "USA vs Mexico",
    GroundName: "SoFi Stadium, Los Angeles",
    FirstBattingTeamCode: "USA",
    SecondBattingTeamCode: "MEX",
    FirstBattingSummary: "Crowd Density: 100%",
    SecondBattingSummary: "Security Alert: Level 2",
    MatchStatus: "Upcoming",
    TossText: "Gates open, high influx of fans",
    Commentss: "Capacity reached. Redirecting fans to alternate entrances to ease flow."
  }
];

// Quick select vibe chips
const VIBE_PRESETS = [
  { id: "vibe_octane", label: "🚨 Congestion Alert", text: "high density, bottlenecks, slow movement, potential safety hazard" },
  { id: "vibe_electric", label: "⚽ Goal Celebration", text: "sudden crowd eruption, high energy spikes, jumping in stands" },
  { id: "vibe_dominant", label: "🍔 Concession Queue", text: "long wait times, frustration, high foot traffic near food stalls" },
  { id: "vibe_clinch", label: "🎟️ Gate Influx", text: "rapid influx of fans at entry gates, ticket scanning delays" }
];

const landingCopy = heroPayloadSchema.parse({
  hero: {
    eyebrow: 'Real-time Crowd Telemetry',
    title: 'Transform live stadium telemetry into actionable crowd management.',
    summary: 'Smart Stadium ingests crowd density, masks backend latency with cinematic UI, and outputs GenAI action plans for staff and engagement alerts for fans.',
    kicker: 'Gemini-powered Crowd Intelligence',
    primaryCta: 'Generate Action Plan',
    secondaryCta: 'View Dashboard',
    liveBadge: 'Live Telemetry Sync',
    metricA: 'Telemetry → AI insight',
    metricB: 'Cloud Run inference ready',
    sentiment: 'High accuracy / real-time monitoring / predictive analytics'
  }
});

function renderLanding() {
  const root = document.getElementById('app');
  if (!root) {
    return;
  }

  // Render our layout inside #app
  root.innerHTML = createHeroSection(landingCopy.hero);

  // Initialize backgrounds and typography reveals
  initBackgroundScrollParallax();
  animateSplitTextHeadline();

  // Core state variables
  let selectedMatchIndex = 0;
  let selectedVibeId = 'vibe_octane';

  // DOM selections
  const matchCards = document.querySelectorAll('.match-card');
  const vibeChips = document.querySelectorAll('.vibe-chip');
  const customVibeInput = document.getElementById('customVibeInput');
  const fanIdInput = document.getElementById('fanIdInput');
  const previewSentiment = document.getElementById('previewSentimentDisplay');
  const generateMomentBtn = document.getElementById('generateMomentBtn');

  // Bind Match Selection Cards
  matchCards.forEach(card => {
    card.addEventListener('click', () => {
      matchCards.forEach(c => {
        c.classList.remove('border-fifa-pink', 'shadow-[0_0_18px_rgba(199,125,255,0.25)]', 'bg-white/10');
        c.classList.add('border-white/10', 'hover:border-white/20', 'bg-white/5');
      });

      card.classList.remove('border-white/10', 'hover:border-white/20', 'bg-white/5');
      card.classList.add('border-fifa-pink', 'shadow-[0_0_18px_rgba(199,125,255,0.25)]', 'bg-white/10');

      selectedMatchIndex = parseInt(card.getAttribute('data-match-index'), 10);
      
      // Gentle bounce pop
      if (window.gsap) {
        gsap.fromTo(card, 
          { scale: 0.98 }, 
          { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.3)' }
        );
      }
    });
  });

  // Bind Vibe Preset Chips
  vibeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      vibeChips.forEach(c => {
        c.classList.remove('bg-gradient-to-br', 'from-fifa-glow', 'to-fifa-pink', 'border-fifa-pink', 'shadow-premium');
        c.classList.add('bg-white/5', 'border-white/10', 'hover:bg-white/10');
      });

      chip.classList.remove('bg-white/5', 'border-white/10', 'hover:bg-white/10');
      chip.classList.add('bg-gradient-to-br', 'from-fifa-glow', 'to-fifa-pink', 'border-fifa-pink', 'shadow-premium');

      if (customVibeInput) {
        customVibeInput.value = '';
      }

      selectedVibeId = chip.getAttribute('data-vibe-id');
      const vibeText = chip.getAttribute('data-vibe-text');
      
      if (previewSentiment) {
        previewSentiment.innerText = vibeText;
        if (window.gsap) {
          gsap.fromTo(previewSentiment, { opacity: 0.4 }, { opacity: 1, duration: 0.3 });
        }
      }

      if (window.gsap) {
        gsap.fromTo(chip, 
          { scale: 0.95 }, 
          { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );
      }
    });
  });

  // Bind Custom Vibe text input
  if (customVibeInput) {
    customVibeInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val.length > 0) {
        vibeChips.forEach(c => {
          c.classList.remove('bg-gradient-to-br', 'from-fifa-glow', 'to-fifa-pink', 'border-fifa-pink', 'shadow-premium');
          c.classList.add('bg-white/5', 'border-white/10', 'hover:bg-white/10');
        });
        selectedVibeId = null;
        if (previewSentiment) {
          previewSentiment.innerText = val;
        }
      } else {
        // Revert to first preset if text cleared
        if (vibeChips[0]) {
          vibeChips[0].click();
        }
      }
    });
  }

  // Bind main Synthesize trigger button
  if (generateMomentBtn) {
    generateMomentBtn.addEventListener('click', () => {
      const userId = (fanIdInput && fanIdInput.value.trim()) || 'EB_FAN_88';
      let sentimentText = '';

      if (selectedVibeId) {
        const found = VIBE_PRESETS.find(v => v.id === selectedVibeId);
        sentimentText = found ? found.text : '';
      } else if (customVibeInput) {
        sentimentText = customVibeInput.value.trim();
      }

      if (!sentimentText) {
        sentimentText = VIBE_PRESETS[0].text;
      }

      const matchData = FALLBACK_MATCHES[selectedMatchIndex];

      let apiResponseData = null;
      let preloaderFinished = false;

      const preloaderSteps = [
        "Ingesting live stadium telemetry...",
        "Calibrating crowd density matrix...",
        "Syncing security and concession wait times...",
        "Running predictive bottleneck algorithms...",
        "Requesting Google Gemini 2.5 Flash synthesis...",
        "Structuring automated crowd action plan..."
      ];

      // 1. Trigger latency masking preloader screen entrance
      playPreloaderEntrance(() => {
        
        // 2. Start preloader simulation timeline to mask latency
        runLatencyPreloaderSimulation(preloaderSteps, 4.5, () => {
          preloaderFinished = true;
          checkAndRevealClimax();
        });

        const isLocal = window.location.protocol === 'file:';
        const generateApiUrl = isLocal ? "http://localhost:3000/api/generate-moment" : "/api/generate-moment";
        fetch(generateApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            userSentiment: sentimentText,
            matchData: matchData
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          apiResponseData = data;
          checkAndRevealClimax();
        })
        .catch(err => {
          console.warn("API request error, generating structured fallback:", err);
          const team1 = matchData.FirstBattingTeamCode || 'Team A';
          const team2 = matchData.SecondBattingTeamCode || 'Team B';
          const venue = matchData.GroundName || 'the stadium';
          const score1 = matchData.FirstBattingSummary || '--';
          const score2 = matchData.SecondBattingSummary || '--';
          const comment = matchData.Commentss || matchData.MatchStatus || '';
          
          apiResponseData = {
            success: true,
            userId: userId,
            isSimulated: true,
            storyline: `🚨 CROWD ACTION PLAN — ${matchData.MatchName}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[STATUS — 0:00 to 0:03]\nVenue: ${venue}\nTelemetry Trigger: "${sentimentText}"\n\n[OBSERVATION — 0:03 to 0:25]\nCurrent Status: ${score1} | ${score2}\nContext: ${comment}\n\n[ACTION PLAN — 0:25 to 0:30]\n1. Dispatch additional stewards to affected sectors.\n2. Open overflow gates temporarily.\n3. Send push notifications advising fans of wait times.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📝 FAN ENGAGEMENT NOTIFICATION\n"Heads up fans at ${venue}! We are experiencing high volume. Enjoy 10% off concessions while you wait! #SmartStadium"\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n💬 STAFF COMMS\n\nPriority: HIGH 🔴\nLocation: ${venue} | Alert: ${sentimentText}\nDeploying response team immediately.`
          };
          checkAndRevealClimax();
        });
      });

      function checkAndRevealClimax() {
        if (preloaderFinished && apiResponseData) {
          const selectedVibe = selectedVibeId ? VIBE_PRESETS.find(v => v.id === selectedVibeId) : null;
          const storyData = {
            userId: apiResponseData.userId || userId,
            sentimentLabel: selectedVibe ? selectedVibe.label : `🔮 Custom Vibe`,
            vibeId: selectedVibeId || 'vibe_custom',
            matchName: matchData.MatchName,
            firstBattingTeamCode: matchData.FirstBattingTeamCode,
            firstBattingSummary: matchData.FirstBattingSummary,
            secondBattingTeamCode: matchData.SecondBattingTeamCode,
            secondBattingSummary: matchData.SecondBattingSummary,
            matchStatus: matchData.MatchStatus,
            storyline: apiResponseData.storyline,
            isSimulated: apiResponseData.isSimulated || false
          };
          
          playClimaxRevealTransition(storyData);
          bindClimaxButtons();
        }
      }
    });
  }

  function bindClimaxButtons() {
    const copyBtn = document.getElementById('copyStoryBtn');
    const resetBtn = document.getElementById('resetMomentBtn');

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const textToCopy = document.getElementById('climaxStoryText').innerText;
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            copyBtn.innerText = '✔ COPIED STORY!';
            if (window.gsap) {
              gsap.fromTo(copyBtn, { scale: 0.96 }, { scale: 1, duration: 0.35, ease: 'back.out' });
            }
            setTimeout(() => {
              copyBtn.innerText = '📋 COPY TO SHARE';
            }, 2000);
          })
          .catch(err => {
            console.error('Could not copy story text: ', err);
          });
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        playResetTransition();
        // Clear custom input and trigger first chip click
        if (customVibeInput) customVibeInput.value = '';
        if (vibeChips[0]) vibeChips[0].click();
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', renderLanding);
