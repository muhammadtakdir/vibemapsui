# VibeMap - Social Location-based NFT Platform on Sui

VibeMap is a Telegram Mini App where users can check in at physical locations, mint NFT stamps, and collect achievements on the Sui blockchain.

## Project Structure
- `src/` - React Frontend
- `src/backend/` - Hono Backend API
- `api/` - Vercel Serverless Function entry point
- `move/` - Sui Smart Contracts

## Setup

### 1. Smart Contracts
```bash
cd move/vibe_map
sui move build
sui client publish --gas-budget 100000000
```

### 2. Environment
Update `.env` in the root with:
- Supabase credentials
- Sui Package ID (from step 1)
- Backend Wallet Seed Phrase

### 3. Database
Push schema to Supabase:
```bash
npx drizzle-kit push
```

### 4. Development
Start the Frontend (Vite):
```bash
npm run dev
```

To run the Backend locally (optional, as Vercel handles it in prod):
You can create a script `src/backend/local.ts` to run it with `tsx`.

## Deployment (Vercel)
1. Push to GitHub.
2. Import project to Vercel.
3. Add Environment Variables in Vercel settings.
4. Deploy! (Frontend and API will be deployed together).

## AI Tool Disclosure
Full disclosure of AI tools used can be found in [AI_TOOL_DISCLOSURE.md](./AI_TOOL_DISCLOSURE.md).
