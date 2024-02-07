import { Table } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hentFullmektigHistorikk } from "../../../../ducks/fagsaker/operations";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { Fagsak } from "../../../../services/api";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import { formatterDatoTilNorsk } from "../../../../utils/dato";
import { AdresseOgFeil } from "./types";
import * as Api from "../../../../services/api";
import { HentResDto } from "../../../../services/modules/fagsaker/kontaktopplysninger";
import type { FullmektigHistorikk } from "../../../../services/modules/types/fagsak";

type FullmektigHistorikkInfo = FullmektigHistorikk & {
  brevadresse: AdresseOgFeil | undefined;
  kontaktinfo: HentResDto | undefined;
};

const FullmektigHistorikk = () => {
  const rootState = useSelector((state: any) => fagsakSelectors.FagsakSelector(state));
  const dispatch = useDispatch();
  const [fullmektigeMedAlt, setFullmektigeMedAlt] = useState<FullmektigHistorikkInfo[]>([]);
  const { saksnummer, fullmektigHistorikk } = rootState as Fagsak;

  useEffect(() => {
    dispatch(hentFullmektigHistorikk(saksnummer));
  }, [saksnummer]);

  useEffect(() => {
    const fetchData = async () => {
      const updatedFullmektigeMedAlt = await Promise.all(
        (fullmektigHistorikk || []).map(async (fullmektig) => {
          let brevAdresse: AdresseOgFeil | undefined;
          let kontaktInfo: HentResDto | undefined;

          if (fullmektig.orgnr) {
            const [adresse] = await Promise.all([
              finnOrganisasjonAdresse(fullmektig.orgnr),
              // TODO: Blir ikke brukt i denne tasken. MELOSYS-6350
              // finnKontaktOpplysninger(fullmektig.orgnr),
            ]);
            brevAdresse = adresse;
          }

          if (fullmektig.personIdent) {
            const [adresse] = await Promise.all([finnPersonAdresse(fullmektig.personIdent)]);
            brevAdresse = adresse;
          }

          return {
            ...fullmektig,
            brevadresse: brevAdresse,
            kontaktinfo: kontaktInfo,
          } as FullmektigHistorikkInfo;
        })
      );
      setFullmektigeMedAlt(updatedFullmektigeMedAlt);
    };

    fetchData();
  }, [fullmektigHistorikk]);

  // TODO: Blir ikke brukt i denne tasken. MELOSYS-6350
  // const finnKontaktOpplysninger = (orgnr: string) => {
  //   return Api.Fagsaker.kontaktopplysninger.hent(saksnummer, orgnr).then((res) => res);
  // };

  const finnOrganisasjonAdresse = (orgnr: string): Promise<AdresseOgFeil> => {
    return Api.Adresser.hentOrganisasjonAdresse(orgnr)
      .then((adresse) => {
        if (!adresse.mottakerNavn) {
          return { adresse: undefined, feil: "Kunne ikke finne organisasjonen" };
        }
        if (adresse.ugyldig) {
          return { adresse: undefined, feil: "Kunne ikke finne adresse til organisasjonen" };
        }
        return { adresse, feil: undefined };
      })
      .catch(() => ({ adresse: undefined, feil: "Kunne ikke finne organisasjonen" }));
  };

  const finnPersonAdresse = (personIdent: string): Promise<AdresseOgFeil> => {
    return Api.Adresser.hentPersonAdresse(personIdent)
      .then((adresse) => {
        if (!adresse.mottakerNavn) {
          return { adresse: undefined, feil: "Kunne ikke finne personen" };
        }
        if (adresse.ugyldig) {
          return { adresse: undefined, feil: "Kunne ikke finne adresse til personen" };
        }
        return { adresse, feil: undefined };
      })
      .catch(() => ({ adresse: undefined, feil: "Kunne ikke finne personen" }));
  };

  return (
    <Table>
      <Table.Header>
        <Table.Row shadeOnHover={false}>
          <Table.HeaderCell scope="col">Registrert fra</Table.HeaderCell>
          <Table.HeaderCell scope="col">Registrert til</Table.HeaderCell>
          <Table.HeaderCell scope="col">Fullmakt</Table.HeaderCell>
          <Table.HeaderCell scope="col">Fullmektig Org.nr/F.nr.</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {fullmektigeMedAlt?.map((fullmektig) => (
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
