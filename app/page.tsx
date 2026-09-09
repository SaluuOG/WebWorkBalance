import { headers } from "next/headers";
import { WebWorkBalanceApp } from "./webworkbalance-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id") ?? "signed-in-viewer";
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedName)
      : null;

  const displayName = fullName?.split(/\s+/)[0] ?? email?.split("@")[0] ?? "Gast";

  return <WebWorkBalanceApp currentUser={{ id: userId, name: displayName, email }} />;
}
