import { Table } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
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
  const saksnummer = useSelector((state: any) => fagsakSelectors.SaksnummerSelector(state)) as string;
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
        })
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
    <Table>
      <Table.Header>
        <Table.Row shadeOnHover={false}>
          <Table.HeaderCell scope="col">Registrert fra</Table.HeaderCell>
          <Table.HeaderCell scope="col">Registrert til</Table.HeaderCell>
          <Table.HeaderCell scope="col">Fullmakt</Table.HeaderCell>
          <Table.HeaderCell scope="col">Fullmektig Org.nr./F.nr.</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {fullmektige?.map((fullmektig) => (
          <Table.Row>
            <Table.DataCell>{formatterDatoTilNorsk(fullmektig.registrertFra)}</Table.DataCell>
            <Table.DataCell>{formatterDatoTilNorsk(fullmektig.registrertTil)}</Table.DataCell>
            <Table.DataCell>
              {fullmektig.fullmakter.map((kode: string) => (
                <>
                  {KV.kodeTilTerm(kode, MKV.KTObjects.fullmaktstype)}
                  <br />
                </>
              ))}
            </Table.DataCell>
            <Table.DataCell>
              <>{fullmektig.brevadresse?.adresse?.mottakerNavn || ""}</>
              <br />
              <>{fullmektig.orgnr || fullmektig.personIdent}</>
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default FullmektigHistorikk;
