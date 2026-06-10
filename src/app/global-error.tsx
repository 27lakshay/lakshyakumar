"use client";

import { useEffect } from "react";

import Link from "@/components/Link";
import Main from "@/components/Main";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import "@/styles/globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="relative min-h-dvh w-full bg-background font-sans text-foreground">
        <Main className="gap-4 pb-16">
          <Heading as="h1" size="lg">
            Something went wrong
          </Heading>
          <Text>An unexpected error occurred. You can try again or head back home.</Text>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={reset}
              className="font-mono text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Try again
            </button>
            <Link href="/">Back home</Link>
          </div>
        </Main>
      </body>
    </html>
  );
}
