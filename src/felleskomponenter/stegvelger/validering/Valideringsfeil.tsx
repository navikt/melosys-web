import React, { Fragment } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import mapBehandlingsgrunnlagpathTilMenypunkt from "./mapBehandlingsgrunnlagpathTilMenypunkt";

import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";

import MKV from "../../../melosyskodeverk";
import { Feilmelding } from "../../../@types";

export const Feilbeskrivelse = ({ tittel, innhold }: Feilmelding) => (
  <div className="validering">
    <Nav.Typo.Element className="valideringKode">{tittel}</Nav.Typo.Element>
    <Nav.Tekstomrade>{innhold}</Nav.Tekstomrade>
  </div>
);

interface ValideringType {
  kode: string;
  felter: string[];
}

export default ({ validering }: { validering: ValideringType }) => {
  const { tittel, innhold } = hentFeilmelding(validering.kode);
  const felter = validering.felter
    .map((felt) => {
      const { menypunkt, entryNr, felt: feltNavn } = mapBehandlingsgrunnlagpathTilMenypunkt(felt);

      const key = `${menypunkt}${entryNr}${feltNavn}`;
      const tekst = menypunkt && feltNavn ? `${menypunkt} - ${feltNavn}` : null;

      if (!tekst) return null;

      return <li key={key}>{tekst}</li>;
    })
    .filter((felt) => felt);

  return (
    <Fragment>
      <Feilbeskrivelse tittel={tittel} innhold={innhold} />
      {felter.length > 0 && (
        <Fragment>
          Sjekk følgende felt(er):
          <ul>{felter}</ul>
        </Fragment>
      )}
    </Fragment>
  );
};

const hentFeilmelding = (valideringKode: string) => {
  let feilmelding = feilmeldingMap.get(valideringKode);

  if (!feilmelding) {
    const valideringKodeObjekt: KTObject = KV.kodeTilObjekt(
      valideringKode,
      MKV.KTObjects.begrunnelser.kontroll_begrunnelser
    );
    if (valideringKodeObjekt) {
      feilmelding = {
        tittel: hentFeilmeldingTittel(valideringKodeObjekt.kode),
        innhold: valideringKodeObjekt.term || "",
      };
    }
  }

  if (!feilmelding) {
    return {
      tittel: "Ukjent feil",
      innhold: "",
    };
  }

  return feilmelding;
};

const feilmeldingMap = new Map<string, Feilmelding>([
  [
    MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER,
    {
      tittel: "Overlappende periode",
      innhold:
        "Du kan ikke fatte vedtak fordi det ligger en overlappende periode i MEDL. Du må endre søknadsperioden eller perioden som er registrert i MEDL, slik at de ikke overlapper.",
    },
  ],
  [
    MKV.Koder.begrunnelser.kontroll_begrunnelser.PERIODEN_OVER_24_MD,
    {
      tittel: "Periode over 24 måneder",
      innhold: "Du kan ikke fatte vedtak etter artikkel 12.",
    },
  ],
]);

const hentFeilmeldingTittel = (kontrollKode: string) => {
  switch (kontrollKode) {
    case MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE:
    case MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_OPPL_ARBEIDSSTED:
    case MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_OPPL_ANDRE_ARBEIDSFORHOLD_NO:
    case MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_OPPL_ANDRE_ARBEIDSFORHOLD_UTL:
      return "Manglende utfylling";
    default:
      return "Feil ved kontroll";
  }
};
