<!-- BEGIN:nextjs-agent-rules -->
 
# Next.js: ALWAYS read docs before coding
 
Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.
 
<!-- END:nextjs-agent-rules -->

# Page layout: always use `Main`

Every new `src/app/**/page.tsx` must wrap its visible content in `<Main>` from `@/components/Main` (import: `import Main from "@/components/Main"`).

**Exceptions** (document in a one-line comment at the top of the file if used):

- Full-bleed canvas/WebGL routes (`fixed inset-0`, no standard page chrome) — e.g. `/tree`, `/illuminated-tree`, `/wormhole`
- Server-only `redirect()` with no UI — e.g. `/ascii`

Redirect/interstitial pages (`/resume`, `/out/[slug]`) still use `<Main>` plus copy; they are not exceptions.