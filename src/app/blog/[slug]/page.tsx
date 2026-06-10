import type { Metadata } from "next";

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
    <article>
      <h1>{slug.replace(/-/g, " ")}</h1>
    </article>
  );
}
