import React, { ElementType, useEffect, useState } from "react";

import * as Api from "../../services/api";
import * as Ikon from "../../resources/images";

import KopierbarTekst from "../kopierbarTekst";
import { Separator } from "./informasjonlinje";
import { KjoennType } from "../../graphql";

const Navn = ({ kjoenn, NavnIkon, navn }: { kjoenn?: KjoennType; NavnIkon?: ElementType; navn: string }) => (
  <div className="virksomhetlinje__navn">
    {kjoenn && <Ikon.Kjoenn kjoenn={kjoenn} className="ikon-kjoenn" />}
    {NavnIkon && <NavnIkon className="ikon-kjoenn" />}
    {navn}
  </div>
);

const Orgnr = ({ orgnr }: { orgnr: string }) => (
  <KopierbarTekst hovertekst="Kopier organisasjonsnummer">{orgnr}</KopierbarTekst>
);

const Virksomhetlinje = ({ behandlingID }: { behandlingID: number }) => {
  const [organisasjon, setOrganisasjon] = useState<Api.Organisasjon>();

  useEffect(() => {
    hentOrganisasjon();
  }, []);

  const hentOrganisasjon = async () => {
    const org = await Api.Organisasjoner.hentOrganisasjonTilVirksomhet(behandlingID);
    setOrganisasjon(org);
  };

  return (
    <>
      {organisasjon ? (
        <div className="virksomhetlinje">
          <Navn navn={organisasjon.navn} NavnIkon={Ikon.Building} />
          <Separator />
          <Orgnr orgnr={organisasjon.orgnr} />
        </div>
      ) : (
        <div className="virksomhetlinje">Klarte ikke hente organisasjonsopplysninger</div>
      )}
    </>
  );
};

export default Virksomhetlinje;
