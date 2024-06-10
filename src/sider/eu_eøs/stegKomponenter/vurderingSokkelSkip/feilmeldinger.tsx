import * as Nav from "../../../../navFrontend";
import { Avklartfakta } from "../../../../services/modules/avklartefakta";
import * as KV from "../../../../kodeverk";
import { ArbeidsstedOffshore, ArbeidsstedSkip } from "../../../../kodeverk/form";

const { SKIP_ETT_LAND, SOKKEL_UTLAND } = KV.Koder.VurderingSokkelSkipTyper;
const { SKIP, SOKKEL } = KV.Koder;

const UlogiskKombinasjonError = (
  <Nav.Alert variant="error" className="alertstripe_feilmelding">
    Kombinasjonen av sokkel/skip/arbeidsland og brukers arbeidssituasjon er ulogisk
  </Nav.Alert>
);

const FlereArbeidslandError = (
  <Nav.Alert variant="error" className="alertstripe_feilmelding">
    Det er oppgitt mer enn ett arbeidssted/-land
  </Nav.Alert>
);

enum TypeFeilmelding {
  ULOGISK_KOMBINASJON_ERROR = "ULOGISK_KOMBINASJON_ERROR",
  FLERE_ARBEIDSLAND_ERROR = "FLERE_ARBEIDSLAND_ERROR",
}

const harArbeidsstedPaaSokkelOgArbeidssituasjonSkipEttLand = (
  sokkelSkipKonklusjon: Avklartfakta,
  sokkelEllerSkipListe: Avklartfakta[]
) => {
  if (sokkelSkipKonklusjon?.fakta?.length > 0 && sokkelSkipKonklusjon.fakta[0] === SKIP_ETT_LAND) {
    return Boolean(sokkelEllerSkipListe.find((el) => el.fakta?.length > 0 && el.fakta[0] === SOKKEL));
  }
  return false;
};

const harArbeidsstedPaaSkipTerritorialFarvannOgArbeidssituasjonSkipEttLand = (
  sokkelSkipKonklusjon: Avklartfakta,
  maritimtArbeid?: (ArbeidsstedOffshore | ArbeidsstedSkip)[],
  sokkelEllerSkipListe?: Avklartfakta[]
) => {
  if (sokkelSkipKonklusjon?.fakta?.length > 0 && sokkelSkipKonklusjon.fakta[0] === SKIP_ETT_LAND) {
    const arbeidssted = maritimtArbeid?.find((el) => ("territorialfarvann" in el ? el.territorialfarvann : false));
    return (
      arbeidssted &&
      sokkelEllerSkipListe?.find(
        (el) => el.subjektID === arbeidssted.enhetNavn && el.fakta?.length > 0 && el.fakta[0] === SKIP
      )
    );
  }
  return false;
};

const harArbeidsstedPaaSkipFlaglandOgArbeidssituasjonSokkelUtland = (
  sokkelSkipKonklusjon: Avklartfakta,
  maritimtArbeid?: (ArbeidsstedOffshore | ArbeidsstedSkip)[],
  sokkelEllerSkipListe?: Avklartfakta[]
) => {
  if (sokkelSkipKonklusjon?.fakta?.length > 0 && sokkelSkipKonklusjon.fakta[0] === SOKKEL_UTLAND) {
    const arbeidssted = maritimtArbeid?.find((el) => ("flaggLandkode" in el ? el.flaggLandkode : false));
    return (
      arbeidssted &&
      sokkelEllerSkipListe?.find(
        (el) => el.subjektID === arbeidssted.enhetNavn && el.fakta?.length > 0 && el.fakta[0] === SKIP
      )
    );
  }
  return false;
};

const harFlereArbeidsland = (arbeidslandListe: Avklartfakta[]) => {
  return arbeidslandListe?.length && arbeidslandListe.length > 1;
};

export const finnAktivFeilmelding = (
  sokkelSkipKonklusjon: Avklartfakta,
  sokkelEllerSkipListe: Avklartfakta[],
  arbeidslandListe: Avklartfakta[],
  maritimtArbeid?: (ArbeidsstedOffshore | ArbeidsstedSkip)[]
): string | undefined => {
  if (harFlereArbeidsland(arbeidslandListe)) {
    return TypeFeilmelding.FLERE_ARBEIDSLAND_ERROR;
  }
  if (
    harArbeidsstedPaaSokkelOgArbeidssituasjonSkipEttLand(sokkelSkipKonklusjon, sokkelEllerSkipListe) ||
    harArbeidsstedPaaSkipTerritorialFarvannOgArbeidssituasjonSkipEttLand(
      sokkelSkipKonklusjon,
      maritimtArbeid,
      sokkelEllerSkipListe
    ) ||
    harArbeidsstedPaaSkipFlaglandOgArbeidssituasjonSokkelUtland(
      sokkelSkipKonklusjon,
      maritimtArbeid,
      sokkelEllerSkipListe
    )
  ) {
    return TypeFeilmelding.ULOGISK_KOMBINASJON_ERROR;
  }
  return undefined;
};

export const feilMeldingBlokkerer = (type?: string): boolean => {
  switch (type) {
    case TypeFeilmelding.ULOGISK_KOMBINASJON_ERROR:
    case TypeFeilmelding.FLERE_ARBEIDSLAND_ERROR:
      return true;
    default:
      return false;
  }
};

export const Feilmelding = ({ type }: { type?: string }) => {
  switch (type) {
    case TypeFeilmelding.ULOGISK_KOMBINASJON_ERROR:
      return UlogiskKombinasjonError;
    case TypeFeilmelding.FLERE_ARBEIDSLAND_ERROR:
      return FlereArbeidslandError;
    default:
      return null;
  }
};
