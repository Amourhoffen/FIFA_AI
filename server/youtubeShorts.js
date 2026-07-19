import { z } from 'zod';

// ─── Configuration ─────────────────────────────────────────────────────────
const YT_API_BASE = 'https://www.googleapis.com/youtube/v3/search';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min cache (YouTube quota is precious)

// ─── In-memory Cache ───────────────────────────────────────────────────────
const cache = { data: null, expiresAt: 0 };

// ─── Zod Schemas — Validate messy YouTube API response ─────────────────────
const YtThumbnailSchema = z.object({
  url: z.string().url(),
  width: z.number().optional(),
  height: z.number().optional()
}).passthrough();

const YtThumbnailsSchema = z.object({
  high: YtThumbnailSchema.optional(),
  medium: YtThumbnailSchema.optional(),
  default: YtThumbnailSchema.optional()
}).passthrough();

const YtSnippetSchema = z.object({
  title: z.string(),
  channelTitle: z.string(),
  thumbnails: YtThumbnailsSchema.optional(),
  publishedAt: z.string().optional(),
  description: z.string().optional(),
  liveBroadcastContent: z.string().optional()
}).passthrough();

const YtVideoIdSchema = z.object({
  kind: z.string().optional(),
  videoId: z.string()
}).passthrough();

const YtSearchItemSchema = z.object({
  id: YtVideoIdSchema,
  snippet: YtSnippetSchema
}).passthrough();

const YtSearchResponseSchema = z.object({
  kind: z.string().optional(),
  pageInfo: z.object({
    totalResults: z.number().optional(),
    resultsPerPage: z.number().optional()
  }).passthrough().optional(),
  items: z.array(YtSearchItemSchema)
}).passthrough();

// ─── Clean mapper: raw YT item → lightweight frontend object ───────────────
function mapToCleanShort(item) {
  const thumbs = item.snippet.thumbnails || {};
  const thumbnailUrl =
    thumbs.high?.url ||
    thumbs.medium?.url ||
    thumbs.default?.url ||
    '';

  return {
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnailUrl,
    channelTitle: item.snippet.channelTitle
  };
}

// ─── Fetch from YouTube Data API v3 ────────────────────────────────────────
async function fetchTrendingShorts(apiKey) {
  const params = new URLSearchParams({
    key: apiKey,
    part: 'snippet',
    q: 'FIFA 2026 2026 OR Football',
    type: 'video',
    videoDuration: 'short',
    order: 'viewCount',
    regionCode: 'IN',
    maxResults: '10'
  });

  const response = await fetch(`${YT_API_BASE}?${params.toString()}`);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `YouTube API returned ${response.status}: ${errorBody.slice(0, 200)}`
    );
  }

  const rawJson = await response.json();

  // Validate the messy YouTube JSON with Zod
  const validated = YtSearchResponseSchema.parse(rawJson);

  // Map to clean, lightweight frontend-ready objects
  return validated.items.map(mapToCleanShort);
}

// ─── Simulated fallback when no API key is available ───────────────────────
function getSimulatedShorts() {
  return [
    {
      videoId: 'eS28JpI99d4',
      title: '🔥 Virat Kohli 98*(54) vs MI — FIFA 2026 Highlights',
      thumbnailUrl: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&q=80&w=400&h=600',
      channelTitle: 'FIFA 2026 Official'
    },
    {
      videoId: 'g9Xv3L6w55M',
      title: 'Bumrah 5/14 🎯 DESTROYS batting lineup — TATA FIFA 2026',
      thumbnailUrl: 'https://images.unsplash.com/photo-1624526267942-ab0f0b580615?auto=format&fit=crop&q=80&w=400&h=600',
      channelTitle: 'Football Shorts HD'
    },
    {
      videoId: '3pW-l0V-39k',
      title: 'Abhishek Sharma FASTEST Century FIFA 2026 🏏💥 43 balls!',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518063319808-1f609e23eb0b?auto=format&fit=crop&q=80&w=400&h=600',
      channelTitle: 'SportsMax India'
    },
    {
      videoId: 'RgKAFK5djSk',
      title: 'Last ball SIX! KL Rahul finishes LSG chase in style 🤯',
      thumbnailUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=400&h=600',
      channelTitle: 'Willow Football'
    },
    {
      videoId: 'OPf0YbXqDm0',
      title: 'Dhoni 💛 walks out to bat — Chepauk ERUPTS! CSK vs DC',
      thumbnailUrl: 'https://images.unsplash.com/photo-1589806053805-4c0175b9f71c?auto=format&fit=crop&q=80&w=400&h=600',
      channelTitle: 'Star Sports India'
    },
    {
      videoId: 'uU3rB5Q2eY8',
      title: 'Narine 4/18 + 62(28) — KKR All-Round MASTERCLASS 🔥',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=400&h=600',
      channelTitle: 'FIFA 2026 Highlights Hub'
    },
    {
      videoId: 'XJqZ2u0d1fI',
      title: 'Top 10 BIGGEST SIXES 🚀 FIFA 2026 so far!',
      thumbnailUrl: 'https://images.unsplash.com/photo-1629737153926-d62118318db4?auto=format&fit=crop&q=80&w=400&h=600',
      channelTitle: 'Football Shots'
    },
    {
      videoId: 'kXYiU_JCYtU',
      title: 'Jake Fraser-McGurk 36-ball 89* — DC go BERSERK 💥',
      thumbnailUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=400&h=600',
      channelTitle: 'ESPNcricinfo'
    }
  ];
}

// ─── HTTP Handler ──────────────────────────────────────────────────────────
export async function handleTrendingShorts(request, response) {
  // Only allow GET
  if (request.method !== 'GET') {
    response.writeHead(405, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    // ── No API key or placeholder key: return simulated shorts ──
    const isPlaceholder = !apiKey || apiKey.startsWith('your_') || apiKey.length < 20;
    if (isPlaceholder) {
      console.warn('WARNING: YOUTUBE_API_KEY is not set. Returning simulated trending shorts.');
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      const simulated = getSimulatedShorts();
      response.end(JSON.stringify({
        success: true,
        count: 8,
        isSimulated: true,
        source: 'fifa-simulated-shorts',
        shorts: simulated,
        videos: simulated.map(s => ({ ...s, thumbnail: s.thumbnailUrl }))
      }));
      return;
    }

    // ── Check cache ──
    if (cache.data && Date.now() < cache.expiresAt) {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({
        success: true,
        count: cache.data.length,
        isSimulated: false,
        source: 'youtube-data-api-v3',
        shorts: cache.data,
        videos: cache.data.map(s => ({ ...s, thumbnail: s.thumbnailUrl }))
      }));
      return;
    }

    // ── Fetch from YouTube ──
    const shorts = await fetchTrendingShorts(apiKey);

    // Update cache
    cache.data = shorts;
    cache.expiresAt = Date.now() + CACHE_TTL_MS;

    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({
      success: true,
      count: shorts.length,
      isSimulated: false,
      source: 'youtube-data-api-v3',
      shorts,
      videos: shorts.map(s => ({ ...s, thumbnail: s.thumbnailUrl }))
    }));

  } catch (error) {
    console.error('Error in /api/trending-shorts:', error);

    // If it's a Zod validation error, return structured details
    if (error.name === 'ZodError') {
      response.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({
        error: 'Bad Gateway',
        message: 'YouTube API returned an unexpected response format.',
        details: error.issues?.slice(0, 5)
      }));
      return;
    }

    response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch trending shorts'
    }));
  }
}
