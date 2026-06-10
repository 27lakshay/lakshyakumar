import Link from "@/components/Link";
import ThemeToggle from "@/components/ThemeToggle";
import Heading from "@/components/typography/Heading";
import Label from "@/components/typography/Label";
import { resume } from "@/content/resume";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Heading as="span" size="sm" className="text-foreground">
              {resume.identity.name}
            </Heading>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link href="/resume">
            <Label className="text-muted-foreground transition-colors hover:text-foreground">
              resume
            </Label>
          </Link>
          <Link href="/blog">
            <Label className="text-muted-foreground transition-colors hover:text-foreground">
              blog
            </Label>
          </Link>
        </div>
      </nav>
    </header>
  );
}
