# Imposter — Design System

The one thing to remember: **a calm, confident dark table you gather around** — the
secret word on a crisp card, one clear accent, zero clutter. Party energy without the noise.

Derived via `/design-consultation` principles (anti-slop: no purple gradients, no
glassmorphism everywhere, no everything-centered, real type hierarchy, one accent).

## Foundations

**Dark-first.** A party game is played in a room with phones out — a near-black table
reads as premium, cuts glare, and lets the word/role pop. Not purple. Deep blue-black.

### Color (semantic, 3 hues with meaning)
- `ink-950 #0B0E14` page · `ink-900 #141922` card · `ink-800 #1C2330` raised
- `ink-700 #2A3342` hairline border · `ink-600 #384456` hover border
- text: `snow #F2F5F9` primary · `mist #C4CEDA` secondary · `fog #9AA7B8` muted
- **mint `#34D399`** = brand, primary actions, "live", crew/safe, go
- **coral `#FB6F6F`** = the impostor, danger
- **amber `#F6C560`** = attention: who-starts, host badge
- One accent per surface. Green = safe/go, red = impostor, amber = pay attention. Never rainbow.

### Type
- Display: **Space Grotesk** — headings, room code, the secret word. Geometric, characterful, great digits.
- Body/UI: **Hanken Grotesk** — friendly, legible, not Inter/Roboto.
- Scale is confident: hero `text-4xl→6xl`, the word `text-6xl→7xl`, labels are `text-xs uppercase tracking-wider text-fog`.
- Display tracking tight (`-0.02em`); the room code tracks wide.

### Shape / space / motion
- Radius: cards `rounded-2xl` (16px), controls `rounded-xl` (12px). No giant blobs.
- Hairline borders (`border border-ink-700`) instead of heavy shadows/glass.
- Spacing on a 4/8 grid; cards `p-6`. Content max-width ~`max-w-md` for game screens (phone-first).
- Motion is tasteful: fade/slide-in on mount, reveal card scales in, the live-dot pulses. No bouncing emoji.

## Components
- **Button**: primary = solid mint, near-black text, `h-12 rounded-xl font-semibold`, `active:scale-95`. Secondary = `ink-800` + hairline. Ghost = muted text. Danger = coral. No gradients.
- **Card**: `bg-ink-900 border border-ink-700 rounded-2xl`.
- **Room code**: Space Grotesk, `tracking-[0.3em]`, on an `ink-800` chip with copy + share + QR.
- **Player row**: initial avatar in a tinted circle, name, connection dot (mint=connected / fog=away), amber crown chip for host.
- **Role card**: crew → mint-tinted, the word huge. Impostor → coral-tinted, "IMPOSTER" + hint in quotes. Round/category as a small caps label.
- **Connection pill** (top-right, subtle): dot + label — mint "Live", amber pulsing "Reconnecting", fog "Offline".

## Screens (information hierarchy)
1. **Home** — wordmark; two clear choices (Play on this device / Play with friends online); a prominent "Join with a code" field. Not three centered emoji cards.
2. **Create** — one decision at a time: your name, category, then Create. 
3. **Lobby** — the code is the hero (big, copy/share/QR). Live player list. Host: Start (enabled at min players); others: "waiting for host". 
4. **Round** — your role card is the hero. Secondary: round + category + who starts, player list, connection pill. Host: Next round / Back to lobby. Others: "waiting for host".
5. **Pass-and-play** — setup (players + category), then a calm tap-through per-seat reveal.
