// Server redirect only — Main exception (see AGENTS.md).
import { redirect } from "next/navigation";

export default function AsciiPage() {
  redirect("/");
}
