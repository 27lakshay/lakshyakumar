export default function Footer() {
  return (
    <footer className="border-t border-border px-4 py-4 text-center">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Lakshya Kumar. All rights reserved.
      </p>
    </footer>
  );
}
