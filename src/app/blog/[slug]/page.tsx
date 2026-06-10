import type { Metadata } from "next";

import Main from "@/components/Main";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ");

  return {
    title,
    description: `Blog post: ${title}`,
    robots: { index: false, follow: false },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  return (
    <Main className="gap-4 pb-16">
      <article>
        <h1 className="font-mono text-4xl text-foreground md:text-6xl">
          {slug.replace(/-/g, " ")}
        </h1>
      </article>
    </Main>
  );
}
