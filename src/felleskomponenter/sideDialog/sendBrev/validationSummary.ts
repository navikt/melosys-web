export function buildValidationSummary(syncErrors: unknown): string[] {
  const result: string[] = [];

  const pushMsg = (msg: unknown) => {
    const isMeldingObject = (value: unknown): value is { melding: string } => {
      return typeof value === "object" && value !== null && "melding" in value;
    };

    const m = typeof msg === "string" ? msg : isMeldingObject(msg) ? msg.melding : undefined;
    if (!m) return;
    if (m === "Valideringsfeil") return; // behold eksisterende filtrering
    if (m.startsWith("Fyll ut feltet") || m.startsWith("Fyll ut feltene")) return; // ikke ta sammendragsmeldinger
    result.push(m);
  };

  const traverse = (obj: unknown) => {
    if (obj === null) return;
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }
    if (typeof obj === "object") {
      const objWithProperties = obj as { melding?: string; _error?: string };
      if (typeof objWithProperties.melding === "string") pushMsg(objWithProperties.melding);
      if (typeof objWithProperties._error === "string") pushMsg(objWithProperties._error);
      Object.values(obj).forEach(traverse);
      return;
    }
    pushMsg(obj);
  };

  if (syncErrors && typeof syncErrors === "object") {
    Object.entries(syncErrors as Record<string, unknown>).forEach(([, feilmelding]) => {
      if (typeof feilmelding === "object" && feilmelding !== null) {
        traverse(feilmelding);
      } else {
        pushMsg(feilmelding);
      }
    });
  }

  const unike = Array.from(new Set(result));
  const harBrevtittelLinje = unike.some(
    (m) => m.toLowerCase().includes("brevtittel") || m.toLowerCase().includes("brev tittel"),
  );
  return unike.filter((m) => !(harBrevtittelLinje && m.trim() === "Fyll inn tittel"));
}
