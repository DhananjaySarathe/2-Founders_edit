# 2_founders pitch site

Static page + one Vercel Edge Function for country detection.

## Deploy (2 minutes)
1. `npm i -g vercel` (once), then from this folder: `vercel` → follow prompts → `vercel --prod`.
   Or drag this folder into vercel.com/new.
2. Open `index.html`, edit the CONFIG block at the bottom: email, WhatsApp number, booking link.

## Links to use in emails
- India list:   https://YOUR-SITE/?r=in&c=CompanyName
- Global list:  https://YOUR-SITE/?r=global&c=CompanyName

`r` forces the region (you already know which list a lead is in).
`c` shows "Made for CompanyName" at the top and lets you spot visits in Vercel Analytics.
Without `r`, the page detects the country via Vercel's IP geo header (/api/geo),
falling back to the browser timezone. The footer has a switch between Hindi and English work.

## Pitch video
Served from /media/pitch.mp4 (compressed from 57 MB to 3.5 MB), autoplays muted with a
"Tap for sound" button. To use YouTube instead, set `pitch: { type: "youtube", id: "..." }`.
Self-hosted MP4 autoplays more reliably than a YouTube embed, so keep it here and use the
YouTube link in emails.

## Link previews
For WhatsApp/LinkedIn previews, change the og:image in <head> to the full URL,
e.g. https://YOUR-SITE/media/pitch-poster.jpg
