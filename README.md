# Smart Stadium

Smart Stadium is a second-screen web app for live FIFA 2026 matches. The first slice of the product is a cinematic landing hero that masks backend latency, sets the dark neon brand direction, and prepares the surface for sentiment-driven match moments.

## Initial Structure

* [server/index.js](server/index.js) is a Cloud Run-friendly Node server that serves the frontend and exposes a health check.
* [public/index.html](public/index.html) is the Tailwind-only landing shell.
* [public/js/app.js](public/js/app.js) bootstraps the landing screen and validates the hero content model with Zod.
* [public/js/components/heroSection.js](public/js/components/heroSection.js) renders the premium split-screen hero and GSAP reveal choreography.
* [public/js/schemas.js](public/js/schemas.js) holds the Zod schema used by the frontend.

## Run it

Install dependencies later if you add any, then start the local Node server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) after the server starts.

## Notes

* Tailwind CSS is loaded via CDN for the initial landing screen.
* GSAP handles the hero entrance animation and latency-masking reveal.
* Firestore and Gemini integration can be added behind the Node service on the next pass.
