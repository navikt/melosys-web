export const FaktaTypeOverskrifter: Record<string, string> = {
  IKKE_YRKESAKTIV_RELASJON: "Angi brukers relasjon",
  IKKE_YRKESAKTIV_FTRL_2_1_OPPHOLD: "",
  FULLSTENDIG_MANGLENDE_INNBETALING: "",
};

export interface VurderingBestemmelseProps {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export interface Begrunnelse {
  begrunnelseKode: string;
  begrunnelseFritekst?: string | null;
}

export interface VilkårOgBestemmelser {
  vilkår: string;
  defaultOppfylt: boolean;
  muligeBegrunnelser: Begrunnelse[];
}

export interface AvklarteFakta {
  faktaType: string;
  muligeFakta: string[];
}
