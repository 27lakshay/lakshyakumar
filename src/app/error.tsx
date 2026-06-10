"use client";

import { useEffect } from "react";

import Link from "@/components/Link";
import Main from "@/components/Main";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
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
  );
}
