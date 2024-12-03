import { useEffect, useState } from "react";

import MKV from "../../melosyskodeverk";
import * as Api from "../../services/api";
import * as Ikon from "../../resources/images";

import KopierbarTekst from "../kopierbarTekst";

function Virksomhetlinje({ saksnummer }: { saksnummer: string }) {
  const [organisasjon, setOrganisasjon] = useState<Api.Organisasjon>();

  useEffect(() => {
    hentOrganisasjon();
  }, []);

  const hentOrganisasjon = async () => {
    const org = await Api.Fagsaker.aktoer
      .hent(saksnummer, MKV.Koder.aktoersroller.VIRKSOMHET)
      .then((response: Api.Fagsaker.aktoer.Aktoer[]) => {
        if (response?.length !== 1 || !response[0].orgnr) {
          return undefined;
        }
        return Api.Organisasjoner.hentOrganisasjon(response[0].orgnr);
      });
    setOrganisasjon(org);
  };

  return (
    <>
      {organisasjon ? (
        <div className="virksomhetlinje">
          <div className="virksomhetlinje__navn">
            <Ikon.Building className="ikon-navn" />
            {organisasjon.navn}
          </div>
          <div className="virksomhetlinje__separator">/</div>
          <KopierbarTekst hovertekst="Kopier organisasjonsnummer">{organisasjon.orgnr}</KopierbarTekst>
        </div>
      ) : (
        <div className="virksomhetlinje">Klarte ikke hente organisasjonsopplysninger</div>
      )}
    </>
  );
}

export default Virksomhetlinje;
