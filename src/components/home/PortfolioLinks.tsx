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
      {links.map((link) => {
        const external = link.href.startsWith("http");

        return (
          <a
            key={link.label}
            href={link.href}
            {...(external
              ? { target: "_blank", rel: "noreferrer" }
              : undefined)}
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            {link.label}
            {external ? (
              <span className="sr-only"> (opens in new tab)</span>
            ) : null}
          </a>
        );
      })}
    </div>
  );
}
