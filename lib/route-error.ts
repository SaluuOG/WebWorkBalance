export function routeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unbekannter Fehler";
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  const combined = `${message}\n${cause}`;

  if (combined.includes("no such table")) {
    return "Die App-Datenbank wird gerade vorbereitet. Bitte lade die Seite in einem Moment neu.";
  }
  if (combined.includes("D1 binding") || combined.includes("DB is not defined")) {
    return "Die App-Datenbank ist momentan nicht erreichbar.";
  }
  return "Die Aktion konnte gerade nicht gespeichert werden.";
}
