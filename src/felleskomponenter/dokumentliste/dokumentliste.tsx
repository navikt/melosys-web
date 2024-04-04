import { useState } from "react";

import * as Nav from "../../navFrontend";
import { dokumenterOperations } from "../../ducks/dokumenter";

import { apnePdfINyFane } from "../../services/utils";

import "./dokumentliste.css";
import { Table } from "@navikt/ds-react";
import * as KV from "../../kodeverk";
import * as Utils from "../../utils";
import MKV from "../../melosyskodeverk";
import {
  BrevDokumentMetadataType,
  DokumentlisteType,
  isBrev,
  isSed,
  SedDokumentMetadataType,
} from "./dokumentlisteTyper";

const Dokumentliste = ({ behandlingID, dokumenter, validateOnClick }: DokumentlisteType) => {
  const [feilmelding, setFeilmelding] = useState<string | null>(null);

  const klikk = async (dokument: BrevDokumentMetadataType | SedDokumentMetadataType) => {
    if (validateOnClick) {
      // Avbryt forespørsel hvis validator er oppgitt og returnerer false
      const validert = await validateOnClick();
      if (!validert) return;
    }

    let fileURL;
    try {
      if (isSed(dokument)) {
        fileURL = await dokumenterOperations.forhandsvisSed(
          behandlingID,
          dokument.sedType,
          dokument.sedData ?? {
            begrunnelseUtenlandskMyndighet: null,
            fritekst: null,
            nyttLovvalgsland: null,
            vilSendeAnmodningOmMerInformasjon: null,
          }
        );
      } else if (isBrev(dokument)) {
        fileURL = await dokumenterOperations.forhandsvisBrevV2(behandlingID, dokument.dokumentData);
      } else {
        setFeilmelding("Det oppsto en feil i forhåndsvisning av brev. Mangler data");
      }
    } catch (error: any) {
      if (error?.status >= 500) {
        if (isSed(dokument)) {
          setFeilmelding("Det oppstod en feil da SED skulle forhåndsvises!");
        } else {
          setFeilmelding("Det oppstod en feil da brevet skulle forhåndsvises!");
        }
      } else if (error?.status >= 400) {
        setFeilmelding(error?.body?.message);
      }
    }

    if (fileURL) {
      await apnePdfINyFane(fileURL);
      setFeilmelding(null);
    }
  };

  const tittel = (dokumentnavn: string) => `${dokumentnavn} (åpnes i ny fane)`;

  const mapBrev = (dokument: BrevDokumentMetadataType) => (
    <Table.Row key={Utils._uuid()}>
      <Table.DataCell>
        <Nav.Lenker href="#" onClick={(e) => e.preventDefault()} onMouseDown={() => klikk(dokument)}>
          {tittel(
            dokument.dokumentNavn ??
              KV.kodeTilTerm(dokument.dokumentData?.produserbardokument, MKV.KTObjects.brev.produserbaredokumenter)
          )}
        </Nav.Lenker>
      </Table.DataCell>
      <Table.DataCell>{dokument.mottakerNavn ?? dokument.dokumentData?.mottaker}</Table.DataCell>
    </Table.Row>
  );

  const mapSED = (dokument: SedDokumentMetadataType) => (
    <Table.Row key={Utils._uuid()}>
      <Table.DataCell>
        <Nav.Lenker href="#" onClick={(e) => e.preventDefault()} onMouseDown={() => klikk(dokument)}>
          {tittel(dokument.dokumentNavn ?? `SED ${dokument.sedType}`)}
        </Nav.Lenker>
      </Table.DataCell>
      <Table.DataCell>{dokument.mottakerNavn}</Table.DataCell>
    </Table.Row>
  );

  const mapDokument = (dokument: BrevDokumentMetadataType | SedDokumentMetadataType) => {
    if (isSed(dokument)) return mapSED(dokument);
    if (isBrev(dokument)) return mapBrev(dokument);
    return null;
  };

  return (
    <div className="dokumentliste">
      <Table size="small">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Forhåndsvisning av brev</Table.HeaderCell>
            <Table.HeaderCell>Mottaker</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>{dokumenter.map(mapDokument)}</Table.Body>
      </Table>
      {feilmelding && (
        <Nav.AlertStripe type="advarsel" className="varsel">
          {feilmelding}
        </Nav.AlertStripe>
      )}
    </div>
  );
};

export default Dokumentliste;
