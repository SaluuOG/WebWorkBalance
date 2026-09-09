export type AuthenticatedSiteUser = {
  id: string;
  name: string;
  email: string | null;
};

function decodedDisplayName(headers: Headers) {
  const encoded = headers.get("oai-authenticated-user-full-name");
  if (!encoded || headers.get("oai-authenticated-user-full-name-encoding") !== "percent-encoded-utf-8") return null;
  try {
    return decodeURIComponent(encoded).trim() || null;
  } catch {
    return null;
  }
}

export function getAuthenticatedSiteUser(headers: Headers): AuthenticatedSiteUser | null {
  const id = headers.get("oai-authenticated-user-id")?.trim();
  const email = headers.get("oai-authenticated-user-email")?.trim() || null;
  if (id) {
    const fullName = decodedDisplayName(headers);
    const fallbackName = email?.split("@")[0] || "Teammitglied";
    return { id, name: fullName?.split(/\s+/)[0] || fallbackName, email };
  }

  // Öffentliche Sites liefern nicht immer ChatGPT-Identitätsheader. Eine
  // stabile, gerätegebundene Kennung hält Notizen und Lead-Zuständigkeiten
  // trotzdem zwischen zwei Browsern auseinander.
  const deviceId = headers.get("x-wwb-device-id")?.trim() ?? "";
  if (!/^device-[a-z0-9-]{12,90}$/i.test(deviceId)) return null;
  const rawDeviceName = headers.get("x-wwb-device-name")?.trim() || "Gast";
  const deviceName = rawDeviceName.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 120) || "Gast";
  return { id: deviceId, name: deviceName, email: null };
}
