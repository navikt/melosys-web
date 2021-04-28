import { KTObject } from "@navikt/melosys-kodeverk";

import { RegisterAdresse, MidlertidigAdresse, UstrukturertAdresse, Periode, Person } from "../types";

import { getAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

export interface Oppsummering {
  saksnummer: string;
  sakstype: KTObject;
  status: KTObject;
  registrertDato: string;
  endretDato: string;
  endretAvNavn: string;
  sisteOpplysningerHentetDato: string;
  behandlingstype: KTObject;
  behandlingsstatus: KTObject;
  behandlingsfrist: string | null;
  svarFrist: string | null;
  behandlingstema: KTObject;
}

interface Arbeidsavtale {
  arbeidstidsordning: KTObject;
  avtaltArbeidstimerPerUke: number | null;
  endringsdatoStillingsprosent: string | null;
  maritimArbeidsavtale: boolean;
  avloenningstype: string;
  skipsregister: KTObject;
  yrke: KTObject;
  antallTimerGammeltAa: number | null;
  beregnetStillingsprosent: number | null;
  fartsomraade: KTObject | null;
  beregnetAntallTimerPrUke: number | null;
  stillingsprosent: number | null;
  skipstype: KTObject | null;
  gyldighetsperiode: Periode;
}

interface Utenlandsopphold {
  rapporteringsAarMaaned: string;
  periode: Periode;
  land: string | null;
}

interface PermisjonOgPermittering {
  permisjonsId: string | null;
  permisjonsPeriode: Periode;
  permisjonsprosent: number | null;
  permisjonOgPermittering: string | null;
}

interface TimerTimelonnet {
  rapporteringsAarMaaned: string;
  timelonnetPeriode: Periode;
  antallTimer: number | null;
}

interface Arbeidsforhold {
  Aordning: boolean;
  opprettelsestidspunkt: string;
  opplysningspliktigID: string;
  utenlandsopphold: Utenlandsopphold[];
  arbeidsforholdIDnav: number;
  arbeidsavtaler: Arbeidsavtale[];
  permisjonOgPermittering: PermisjonOgPermittering[];
  arbeidsgivertype: string;
  arbeidsgiverID: string;
  ansettelsesPeriode: Periode;
  arbeidsforholdstype: string;
  arbeidstakerID: string;
  opplysningspliktigtype: string;
  sistBekreftet: string;
  timerTimelonnet: TimerTimelonnet[];
  arbeidsforholdID: string;
}

interface Organisasjon {
  orgnr: string;
  oppstartdato: string | null;
  postadresse: RegisterAdresse;
  organisasjonsform: string | null;
  navn: string;
  forretningsadresse: RegisterAdresse;
}

interface Medlemsperiode {
  periodeID: number;
  periode: Periode;
  periodetype: KTObject | null;
  status: KTObject | null;
  grunnlagstype: KTObject | null;
  land: KTObject;
  lovvalg: KTObject;
  trygdedekning: KTObject;
  kildedokumenttype: KTObject;
  kilde: KTObject;
}

export interface Personhistorikk {
  bostedsadressePerioder: {
    bostedsadresse: RegisterAdresse;
    periode: Periode;
  }[];
  postadressePerioder: {
    postadresse: UstrukturertAdresse;
    periode: Periode;
  }[];
  midlertidigAdressePerioder: {
    midlertidigAdresse: MidlertidigAdresse;
    periode: Periode;
  }[];
}

interface Sed {
  rinaSaksnummer: string;
  rinaDokumentID: string;
  fnr: string;
  lovvalgsperiode: {
    fom: string;
    tom: string;
  };
  lovvalgsbestemmelse: string;
  lovvalgslandKode: string;
  erEnding: boolean;
  statsborgerskapKoder: string[];
}

interface ArbeidsinntektMaaned {
  arbeidsInntektInformasjon: {
    inntektListe: {
      opplysningspliktigID: string;
      levereringstidspunkt: string;
      utbetaltIPeriode: string;
      inntektsperiodetype: string;
      inntektskilde: string;
      fordel: string;
      beloep: number;
      inntektsstatus: string;
      utloeserArbeidsgiveravgift: boolean;
      opptjeningsland: string | null;
      informasjonsstatus: string;
      virksomhetID: string;
      beskrivelse: string;
      inntektsmottakerID: string;
      inngaarIGrunnlagForTrekk: boolean;
      opptjeningsperiode: {
        fom: string | null;
        tom: string | null;
      };
    }[];
  };
  aarMaaned: string;
}

interface FrilansInntektMaaned {
  frilansInntektInformasjon: {
    arbeidsforholdFrilanserListe: {
      frilansPeriode: Periode;
      yrke: string;
    }[];
  };
  aarMaaned: string;
}

interface Inntekt {
  arbeidsInntektMaanedListe: ArbeidsinntektMaaned[];
  frilansInntektMaanedListe: FrilansInntektMaaned[];
}

interface BehandlingResDto {
  behandlingID: number;
  redigerbart: boolean;
  saksopplysninger: {
    arbeidsforhold: Arbeidsforhold[];
    organisasjoner: Organisasjon[];
    inntekt: Inntekt;
    medlemskap: {
      medlemsperiode: Medlemsperiode[];
    };
    person: Person;
    personhistorikk: Personhistorikk;
    sakOgBehandling: {
      eosBarnetrygd: boolean;
    };
    sed: Sed | null;
  };
  oppsummering: Oppsummering;
}

export const hentBehandling = (behandlingID: number): Promise<BehandlingResDto> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}`);
