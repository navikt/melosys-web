import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import { formatterDatoTilNorsk } from "../../../../utils/dato";
import { AdresseOgFeil } from "./types";
import { HentKontaktopplysningerResponse } from "../../../../services/modules/fagsaker/kontaktopplysninger";
import { FullmektigHistorikk as FullmektigHistorikkType } from "../../../../services/modules/types/fagsak";
import { hentFullmektigHistorikk } from "../../../../services/modules/fagsaker/fagsak";

type FullmektigHistorikkInfo = FullmektigHistorikkType & {
  brevadresse: AdresseOgFeil | undefined;
  kontaktinfo: HentKontaktopplysningerResponse | undefined;
};

type FullmektigHistorikkProps = {
  finnOrganisasjonAdresse: (orgnr: string) => Promise<AdresseOgFeil>;
  finnPersonAdresse: (personIdent: string) => Promise<AdresseOgFeil>;
};

const FullmektigHistorikk = ({ finnOrganisasjonAdresse, finnPersonAdresse }: FullmektigHistorikkProps) => {
  const [fullmektigHistorikk, setFullmektigHistorikk] = useState<FullmektigHistorikkType[]>([]);
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector);
  const [fullmektige, setFullmektige] = useState<FullmektigHistorikkInfo[]>([]);

  useEffect(() => {
    hentFullmektigHistorikk(saksnummer).then(setFullmektigHistorikk);
  }, [saksnummer]);

  useEffect(() => {
    const fetchData = async () => {
      const updatedFullmektige = await Promise.all(
        (fullmektigHistorikk || []).map(async (fullmektig) => {
          let brevAdresse: AdresseOgFeil | undefined;
          let kontaktInfo: HentKontaktopplysningerResponse | undefined;

          if (fullmektig.orgnr) {
            const [adresse] = await Promise.all([
              finnOrganisasjonAdresse(fullmektig.orgnr),
              // TODO: Blir ikke brukt i denne tasken. MELOSYS-6350
              // finnKontaktOpplysninger(fullmektig.orgnr),
            ]);
            brevAdresse = adresse;
          }

          if (fullmektig.personIdent) {
            const adresse = await finnPersonAdresse(fullmektig.personIdent);
            brevAdresse = adresse;
          }

          return {
            ...fullmektig,
            brevadresse: brevAdresse,
            kontaktinfo: kontaktInfo,
          } as FullmektigHistorikkInfo;
        }),
      );
      setFullmektige(updatedFullmektige);
    };

    fetchData();
  }, [fullmektigHistorikk]);

  // TODO: Blir ikke brukt i denne tasken. MELOSYS-6350
  // const finnKontaktOpplysninger = (orgnr: string) => {
  //   return Api.Fagsaker.kontaktopplysninger.hent(saksnummer, orgnr).then((res) => res);
  // };

  return (
    <Nav.Table>
      <Nav.Table.Header>
        <Nav.Table.Row shadeOnHover={false}>
          <Nav.Table.HeaderCell scope="col">Registrert fra</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Registrert til</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Fullmakt</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Fullmektig Org.nr./F.nr.</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {fullmektige?.map((fullmektig) => (
          <Nav.Table.Row>
            <Nav.Table.DataCell>{formatterDatoTilNorsk(fullmektig.registrertFra)}</Nav.Table.DataCell>
            <Nav.Table.DataCell>{formatterDatoTilNorsk(fullmektig.registrertTil)}</Nav.Table.DataCell>
            <Nav.Table.DataCell>
              {fullmektig.fullmakter.map((kode: string) => (
                <>
                  {KV.kodeTilTerm(kode, MKV.KTObjects.fullmaktstype)}
                  <br />
                </>
              ))}
            </Nav.Table.DataCell>
            <Nav.Table.DataCell>
              <>{fullmektig.brevadresse?.adresse?.mottakerNavn || ""}</>
              <br />
              <>{fullmektig.orgnr || fullmektig.personIdent}</>
            </Nav.Table.DataCell>
          </Nav.Table.Row>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
};

export default FullmektigHistorikk;
