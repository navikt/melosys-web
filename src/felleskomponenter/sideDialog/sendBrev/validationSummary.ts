export function buildValidationSummary(syncErrors: unknown): string[] {
  const result: string[] = [];

  const pushMsg = (msg: unknown) => {
    const m =
      typeof msg === "string"
        ? msg
        : typeof msg === "object" && msg && "melding" in (msg as any)
          ? (msg as any).melding
          : undefined;
    if (!m) return;
    if (m === "Valideringsfeil") return; // behold eksisterende filtrering
    if (m.startsWith("Fyll ut feltet") || m.startsWith("Fyll ut feltene")) return; // ikke ta sammendragsmeldinger
    result.push(m);
  };

  const traverse = (obj: unknown) => {
    if (obj == null) return;
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }
    if (typeof obj === "object") {
      if (typeof (obj as any).melding === "string") pushMsg(obj);
      if (typeof (obj as any)._error === "string") pushMsg((obj as any)._error);
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
        pushMsg(feilmelding as any);
      }
    });
  }

  const unike = Array.from(new Set(result));
  const harBrevtittelLinje = unike.some(
    (m) => m.toLowerCase().includes("brevtittel") || m.toLowerCase().includes("brev tittel"),
  );
  return unike.filter((m) => !(harBrevtittelLinje && m.trim() === "Fyll inn tittel"));
}
