import React from "react";

import * as StringUtils from "../../utils/streng";
import * as Ikon from "../../resources/images";

import useHentPersonopplysninger from "./useHentpersonopplysninger";
import KopierbarTekst from "../kopierbarTekst";
import { Separator } from "./informasjonlinje";
import { KjoennType } from "../../graphql";

const Navn = ({ kjoenn, navn }: { kjoenn: KjoennType; navn: string }) => (
  <div className="personlinje__navn">
    <Ikon.Kjoenn kjoenn={kjoenn} className="ikon-kjoenn" />
    {navn}
  </div>
);

const Fnr = ({ fnr }: { fnr: string }) => <KopierbarTekst hovertekst="Kopier fødselsnummer">{fnr}</KopierbarTekst>;

const Doed = ({ erDoed }: { erDoed: boolean }) =>
  erDoed ? (
    <div className="personlinje_dod">
      <span>(Død)</span> <Ikon.Kors className="ikon-doed" />
    </div>
  ) : null;

const Statsborgerskap = ({ statsborgerskap }: { statsborgerskap: string[] }) => (
  <div>{StringUtils.separerListeMedBindestrek([...new Set(statsborgerskap)])}</div>
);

const Sivilstand = ({ sivilstand }: { sivilstand: string }) => <div>{sivilstand}</div>;

const Personlinje = ({ behandlingID }: { behandlingID: number }) => {
  const skipHentPersonopplysninger = behandlingID < 0;
  const personopplysninger = useHentPersonopplysninger(behandlingID, skipHentPersonopplysninger);

  if (!personopplysninger) return null;

  return (
    <>
      {personopplysninger ? (
        <div className="personlinje">
          <Navn navn={personopplysninger.navn} kjoenn={personopplysninger.kjoenn} />
          <Doed erDoed={personopplysninger.erDoed} />
          <Separator />
          <Fnr fnr={personopplysninger.fnr} />
          <Separator />
          <Statsborgerskap statsborgerskap={personopplysninger.statsborgerskap} />
          <Separator />
          <Sivilstand sivilstand={personopplysninger.sivilstand} />
        </div>
      ) : (
        <div className="personlinje">Klarte ikke hente personopplysninger</div>
      )}
    </>
  );
};

export default Personlinje;
