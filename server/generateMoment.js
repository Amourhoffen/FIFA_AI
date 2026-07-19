import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

// Strictly use Zod to validate the incoming request payload
// Expecting userSentiment as a string, matchData as an object, and userId as a string.
export const generateMomentSchema = z.object({
  userSentiment: z.string({
    required_error: "userSentiment is required",
    invalid_type_error: "userSentiment must be a string"
  }).min(1, "userSentiment cannot be empty"),
  matchData: z.record(z.any(), {
    required_error: "matchData is required",
    invalid_type_error: "matchData must be an object containing match stats"
  }),
  userId: z.string({
    required_error: "userId is required",
    invalid_type_error: "userId must be a string"
  }).min(1, "userId cannot be empty")
});

/**
 * Modular handler for the /api/generate-moment POST route.
 * Handles reading request body, validating it with Zod, calling Gemini AI, and managing errors gracefully.
 * 
 * @param {import('node:http').IncomingMessage} request 
 * @param {import('node:http').ServerResponse} response 
 */
export async function handleGenerateMoment(request, response) {
  try {
    // 1. Only allow POST requests for this endpoint
    if (request.method !== 'POST') {
      response.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: 'Method Not Allowed. This endpoint requires POST.' }));
      return;
    }

    // 2. Read request body stream chunk by chunk
    let rawBody = '';
    for await (const chunk of request) {
      rawBody += chunk;
    }

    // 3. Try to parse the body as JSON
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(rawBody || '{}');
    } catch (parseError) {
      response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: 'Bad Request. The request body must be valid JSON.' }));
      return;
    }

    // 4. Validate payload with Zod
    const validation = generateMomentSchema.safeParse(parsedPayload);
    if (!validation.success) {
      response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({
        error: 'Validation Error',
        message: 'The request payload failed validation checks.',
        errors: validation.error.flatten().fieldErrors
      }));
      return;
    }

    const { userSentiment, matchData, userId } = validation.data;

    const matchName = matchData.MatchName || `${matchData.FirstBattingTeamCode || 'Team A'} vs ${matchData.SecondBattingTeamCode || 'Team B'}`;
    const venue = matchData.GroundName || matchData.city || 'the stadium';
    const team1 = matchData.FirstBattingTeamCode || 'Team A';
    const team2 = matchData.SecondBattingTeamCode || 'Team B';
    const score1 = matchData.FirstBattingSummary || '--';
    const score2 = matchData.SecondBattingSummary || '--';
    const commentary = matchData.Commentss || matchData.MatchStatus || '';

    // 5. Check for the Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY not set. Generating structured fallback content.");
      
      const fallbackStoryline = 
`🚨 CROWD ACTION PLAN — ${matchName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[STATUS — 0:00 to 0:03]
Venue: ${venue}
Telemetry Trigger: "${userSentiment}"

[OBSERVATION — 0:03 to 0:25]
Current Status: ${score1} | ${score2}
Context: ${commentary}

[ACTION PLAN — 0:25 to 0:30]
1. Dispatch additional stewards to affected sectors.
2. Open overflow gates temporarily.
3. Send push notifications advising fans of wait times.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 FAN ENGAGEMENT NOTIFICATION
"Heads up fans at ${venue}! We are experiencing high volume. Enjoy 10% off concessions while you wait! #SmartStadium"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 STAFF COMMS

Priority: HIGH 🔴
Location: ${venue} | Alert: ${userSentiment}
Deploying response team immediately.`;

      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({
        success: true,
        storyline: fallbackStoryline,
        userId,
        isSimulated: true
      }));
      return;
    }

    // 6. Initialize Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey });

    // 7. Structured professional prompt
    const matchDetails = JSON.stringify(matchData, null, 2);
    const systemPrompt = `You are an elite stadium operations AI for "FIFA 2026 Smart Stadium". You produce REAL, PROFESSIONAL, PRODUCTION-READY crowd management plans for FIFA 2026 football matches based on live telemetry data.

Your output MUST contain these 3 clearly separated sections:

1. 🚨 CROWD ACTION PLAN
   - STATUS: Venue and the triggered telemetry alert
   - OBSERVATION: Current crowd density, congestion, or safety issues based on the alert
   - ACTION PLAN: 3 clear steps for stadium staff to resolve the issue

2. 📝 FAN ENGAGEMENT NOTIFICATION
   - A short, polite push notification to fans in the stadium advising them of the situation and offering a helpful tip or discount to redirect traffic.

3. 💬 STAFF COMMS
   - A quick, urgent dispatch message for the security and operations team.

RULES:
- Use the telemetry alert (vibe) to determine the severity and type of action needed
- Include REAL venue names and details from the match data
- Use emojis strategically for impact (e.g., 🚨, ⚠️, 🍔, 🎟️)
- Output clean plain text — NO markdown headers, NO blockquotes, NO asterisks
- Separate sections with ━━━ dividers
- Make it professional and authoritative`;

    const userPrompt = `Generate a crowd management plan for this FIFA 2026 match:

Fan Sentiment Vibe: "${userSentiment}"
Fan ID: ${userId}

Match Data:
${matchDetails}`;

    // 8. Call the Google Gen AI API
    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ]
    });

    const storyline = geminiResponse.text || "Unable to generate content. Please try again.";

    // 9. Send the response back
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({
      success: true,
      storyline,
      userId,
      isSimulated: false
    }));

  } catch (error) {
    console.error("Critical error in /api/generate-moment API route:", error);
    response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected server error occurred during synthesis'
    }));
  }
}
