import MKV from "../../../../melosyskodeverk";

/**
 * Behandlingsresultatet til en ny vurdering er kopiert uten vedtakstype, så den må utledes.
 * Speiler getVedtakstype i trygdeavtale og FTRL. FTRL har i tillegg MANGLENDE_INNBETALING_TRYGDEAVGIFT,
 * som ikke kan forekomme for ikke-yrkesaktive.
 */
export const utledVedtakstype = (lagretVedtakstype: string | null | undefined, behandlingstype?: string): string => {
  if (lagretVedtakstype) return lagretVedtakstype;
  if (behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING) {
    return MKV.Koder.vedtakstyper.ENDRINGSVEDTAK;
  }
  return MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK;
};
