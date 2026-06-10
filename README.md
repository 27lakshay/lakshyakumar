# lakshya.work

Personal portfolio site built with Next.js App Router, React 19, and Tailwind CSS.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- React 19
- Tailwind CSS 4
- TypeScript

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

For local development, create `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `pnpm dev`    | Start development server |
| `pnpm build`  | Production build         |
| `pnpm start`  | Serve production build   |
| `pnpm lint`   | Run ESLint               |

## Deploy

Deploy to [Vercel](https://vercel.com) or any Node.js host that supports Next.js.

Set the production environment variable:

```bash
NEXT_PUBLIC_SITE_URL=https://www.lakshya.work
```

Then:

```bash
pnpm build
pnpm start
```

## Routes

| Path                 | Description                          |
| -------------------- | ------------------------------------ |
| `/`                  | Portfolio homepage                   |
| `/blog`              | Blog (coming soon)                   |
| `/wormhole`          | Scroll tunnel experiment             |
| `/tree`              | Interactive canvas tree showcase     |
| `/illuminated-tree`  | Full-screen illuminated tree         |
| `/resume`            | Résumé PDF                           |
