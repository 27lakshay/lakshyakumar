import Link from "@/components/Link";
import { resume } from "@/content/resume";
import { cn } from "@/lib/utils";

type PortfolioLinksProps = {
  className?: string;
};

export default function PortfolioLinks({ className }: PortfolioLinksProps) {
  const { links } = resume.identity;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-4 font-mono text-sm text-muted-foreground",
        className,
      )}
    >
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
