import { KTObject } from "@navikt/melosys-kodeverk";

interface FaktaType {
  tittel: string;
  kodeverk: string;
}

export const FaktaTypeOverskrifter: Record<string, FaktaType> = {
  IKKE_YRKESAKTIV_RELASJON: {
    tittel: "Angi brukers relasjon",
    kodeverk: "ikkeyrkesaktivrelasjontype",
  },
  IKKE_YRKESAKTIV_FTRL_2_1_OPPHOLD: {
    tittel: "Angi brukers situasjon",
    kodeverk: "ikkeyrkesaktivoppholdtype",
  },
  ARBEIDSSITUASJON: {
    tittel: "Angi brukers situasjon",
    kodeverk: "arbeidssituasjontype",
  },
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

export interface VilkårOgBegrunnelser {
  vilkår: string;
  defaultOppfylt?: boolean | null;
  muligeBegrunnelser: string[];
}

export interface AvklarteFakta {
  faktaType: KTObject;
  muligeFakta: string[];
}
