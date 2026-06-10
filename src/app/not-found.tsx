import type { Metadata } from "next";

import Link from "@/components/Link";
import Main from "@/components/Main";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";

export const metadata: Metadata = {
  title: "Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <Main className="gap-4 pb-16">
      <Heading as="h1" size="lg">
        404
      </Heading>
      <Text>Page not found.</Text>
      <Link href="/">Back home</Link>
    </Main>
  );
}
