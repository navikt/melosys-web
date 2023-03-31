import React from "react";
import MKV from "../../../../../../melosyskodeverk";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";
import { MedlemskapsperiodeProp, sorterPerioder } from "../vurderingPerioder";

const { AVSLAATT, INNVILGET } = MKV.Koder.innvilgelsesResultat;

const IkkeStottetIMelosys = (
  <Nav.AlertStripeInfo className="infomelding">
    Søknaden kan foreløpig ikke behandles i Melosys. Avslutt saken som bortfalt.
  </Nav.AlertStripeInfo>
);

const IngenMedlemskapsperioder = (
  <Nav.AlertStripeAdvarsel className="infomelding">
    Du må legge inn minst én periode før du kan fortsette.
  </Nav.AlertStripeAdvarsel>
);

const OppholdIPeriodene = (
  <Nav.AlertStripeAdvarsel className="infomelding">Det er opphold mellom innvilgede perioder.</Nav.AlertStripeAdvarsel>
);

const OverlappendePerioder = (
  <Nav.AlertStripeAdvarsel className="infomelding">Innvilgede perioder overlapper.</Nav.AlertStripeAdvarsel>
);

const IngenSluttdato = (
  <Nav.AlertStripeInfo className="infomelding">
    Du må oppgi sluttdato for å kunne angi resultat. Dette blir sluttdatoen på vedtaket.
  </Nav.AlertStripeInfo>
);

const erIkkeStøtteIMelosys = (medlemskapsperioder: MedlemskapsperiodeProp[], mottaksdato: string | undefined) => {
  const erPeriodeTidligereEnnMottaksdato = (periode: MedlemskapsperiodeProp) =>
    Utils.dato.erGyldigPeriode(periode.fomDato, Utils.dato.formatterDatoTilNorsk(mottaksdato)) &&
    Utils.dato.erGyldigPeriode(periode.tomDato, Utils.dato.formatterDatoTilNorsk(mottaksdato));

  return (
    medlemskapsperioder.every((periode) => periode.innvilgelsesResultat === AVSLAATT) ||
    medlemskapsperioder.some(
      (periode) => !erPeriodeTidligereEnnMottaksdato(periode) && periode.innvilgelsesResultat === AVSLAATT
    )
  );
};

const perioderErLike = (periode1: MedlemskapsperiodeProp, periode2: MedlemskapsperiodeProp) =>
  periode1.fomDato === periode2.fomDato && periode1.tomDato === periode2.tomDato;

const finnesOverlappendePerioder = (medlemskapsperioder: MedlemskapsperiodeProp[]) => {
  const sortertePerioder = medlemskapsperioder.sort(sorterPerioder);

  if (!sortertePerioder?.length || sortertePerioder.length < 2) return false;

  for (let i = 0; i < sortertePerioder.length - 1; i += 1) {
    const periode = sortertePerioder[i];
    const nestePeriode = sortertePerioder[i + 1];

    if (Utils.dato.perioderOverlapper(periode.fomDato, periode.tomDato, nestePeriode.fomDato, nestePeriode.tomDato)) {
      const innvilgelsesResultater = [periode.innvilgelsesResultat, nestePeriode.innvilgelsesResultat];
      const énAvslåttÉnInnvilget =
        innvilgelsesResultater.includes(AVSLAATT) && innvilgelsesResultater.includes(INNVILGET);
      return !(énAvslåttÉnInnvilget && perioderErLike(periode, nestePeriode));
    }
  }
  return false;
};

const finnesOppholdIInnvilgedePerioder = (medlemskapsperioder: MedlemskapsperiodeProp[]) => {
  const innvilgedePerioder = medlemskapsperioder
    ?.filter((periode) => periode.innvilgelsesResultat === INNVILGET)
    .sort(sorterPerioder);

  if (!innvilgedePerioder?.length || innvilgedePerioder.length < 2) return false;

  for (let i = 0; i < innvilgedePerioder.length - 1; i += 1) {
    const periode = innvilgedePerioder[i];
    const nestePeriode = innvilgedePerioder[i + 1];

    const nestePeriodeErPåfølgende = nestePeriode.fomDato === Utils.dato.plussEnDag(periode.tomDato);
    if (!(nestePeriodeErPåfølgende || perioderErLike(periode, nestePeriode))) {
      return true;
    }
  }
  return false;
};

enum TypeFeilmelding {
  INGEN_MEDLEMSKAPSPERIODER = "INGEN_MEDLEMSKAPSPERIODER",
  IKKE_STØTTET_I_MELOSYS = "IKKE_STØTTET_I_MELOSYS",
  INGEN_SLUTTDATO = "INGEN_SLUTTDATO",
  OVERLAPPENDE_PERIODER = "OVERLAPPENDE_PERIODER",
  OPPHOLD_I_PERIODENE = "OPPHOLD_I_PERIODENE",
}

export function finnAktivFeilmelding(
  medlemskapsperioder: MedlemskapsperiodeProp[],
  mottaksdato?: string
): string | undefined {
  const ingenMedlemskapsperioder = medlemskapsperioder?.length === undefined || medlemskapsperioder?.length === 0;
  if (ingenMedlemskapsperioder) {
    return TypeFeilmelding.INGEN_MEDLEMSKAPSPERIODER;
  }

  if (erIkkeStøtteIMelosys(medlemskapsperioder, mottaksdato)) {
    return TypeFeilmelding.IKKE_STØTTET_I_MELOSYS;
  }

  const manglerSluttdato = Utils._isEmpty(medlemskapsperioder[medlemskapsperioder.length - 1].tomDato);
  if (manglerSluttdato) {
    return TypeFeilmelding.INGEN_SLUTTDATO;
  }

  if (finnesOverlappendePerioder(medlemskapsperioder)) {
    return TypeFeilmelding.OVERLAPPENDE_PERIODER;
  }

  if (finnesOppholdIInnvilgedePerioder(medlemskapsperioder)) {
    return TypeFeilmelding.OPPHOLD_I_PERIODENE;
  }

  return undefined;
}

export const Feilmelding = ({ type }: { type?: string }) => {
  switch (type) {
    case TypeFeilmelding.INGEN_MEDLEMSKAPSPERIODER:
      return IngenMedlemskapsperioder;
    case TypeFeilmelding.IKKE_STØTTET_I_MELOSYS:
      return IkkeStottetIMelosys;
    case TypeFeilmelding.INGEN_SLUTTDATO:
      return IngenSluttdato;
    case TypeFeilmelding.OVERLAPPENDE_PERIODER:
      return OverlappendePerioder;
    case TypeFeilmelding.OPPHOLD_I_PERIODENE:
      return OppholdIPeriodene;
    default:
      return null;
  }
};
