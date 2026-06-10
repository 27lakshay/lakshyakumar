import Link from "@/components/Link";
import { resume } from "@/content/resume";
import { cn } from "@/lib/utils";

type PortfolioLinksProps = {
  className?: string;
  location?: string;
};

export default function PortfolioLinks({
  className,
  location = "hero",
}: PortfolioLinksProps) {
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
        const isResume = link.href === "/resume.pdf";

        return (
          <Link
            key={link.label}
            href={link.href}
            external={external}
            trackEvent={isResume ? "Resume Download" : "Outbound Link"}
            trackProps={
              isResume
                ? { location }
                : { label: link.label, location }
            }
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            {link.label}
            {external ? (
              <span className="sr-only"> (opens in new tab)</span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
