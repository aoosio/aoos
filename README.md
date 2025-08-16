# AOOS UI (MVP)

## 1) Prereqs
- Supabase project ready; DB & RLS as we set.
- Templates seeded; org + suppliers seeded.
- Vercel project ready; domain configured.

## 2) Install
```bash
pnpm i # or npm i or yarn
pnpm dev


app/(public)/layout.tsx             // old public layout  
app/(public)/page.tsx               // old landing page  
app/(protected)/layout.tsx          // old protected layout  
app/(protected)/home/page.tsx       // old home/dashboard page  
app/(shell)/layout.tsx              // old combined shell layout  
*(and any other obsolete files in these directories that are unused)*