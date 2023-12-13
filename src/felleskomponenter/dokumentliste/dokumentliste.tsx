import { useState } from "react";
import { v4 as uuid } from "uuid";

import { SedPdfData } from "Domene";
import * as Api from "../../services/api";

import * as Nav from "../../navFrontend";
import { dokumenterOperations } from "../../ducks/dokumenter";

import { apnePdfINyFane } from "../../services/utils";

import "./dokumentliste.css";
import { Table } from "@navikt/ds-react";
import * as KV from "../../kodeverk";
import MKV from "../../melosyskodeverk";

export interface DokumentMetadataType {
  dokumentNavn?: string;
  mottakerNavn?: string;
  dokumentData?: Api.DokumenterV2.OpprettBrevReqDto;
  sedData?: SedPdfData;
  sedType?: string;
}

export interface DokumentlisteType {
  behandlingID: number;
  dokumenter: DokumentMetadataType[];
  validateOnClick?: () => Promise<unknown> | {};
}

const Dokumentliste = ({ behandlingID, dokumenter, validateOnClick }: DokumentlisteType) => {
  const [feilmelding, setFeilmelding] = useState<string | null>(null);

  const klikk = async (dokument: DokumentMetadataType) => {
    if (validateOnClick) {
      // Avbryt forespørsel hvis validator er oppgitt og returnerer false
      const validert = await validateOnClick();
      if (!validert) return;
    }

    let fileURL;
    try {
      if (dokument.sedType) {
        fileURL = await dokumenterOperations.forhandsvisSed(
          behandlingID,
          dokument.sedType,
          dokument.sedData || {
            begrunnelseUtenlandskMyndighet: null,
            fritekst: null,
            nyttLovvalgsland: null,
            vilSendeAnmodningOmMerInformasjon: null,
          }
        );
      } else if (dokument.dokumentData) {
        fileURL = await dokumenterOperations.forhandsvisBrevV2(behandlingID, dokument.dokumentData);
      } else {
        setFeilmelding("Det oppsto en feil i forhåndsvisning av brev. Mangler data");
      }
    } catch (error: any) {
      if (error?.status >= 500) {
        setFeilmelding(`Det oppstod en feil da ${dokument.sedType ? "SED" : "brevet"} skulle forhåndsvises!`);
      } else if (error?.status >= 400) {
        setFeilmelding(error?.body?.message);
      }
    }

    if (fileURL) {
      await apnePdfINyFane(fileURL);
      setFeilmelding(null);
    }
  };

  const mapDokument = (dokument: DokumentMetadataType) => {
    if (dokument.sedType) return mapSED(dokument);
    return (
      <Table.Row>
        <Table.DataCell>
          <button
            className="dokumentliste__vis_dokument_knapp"
            onClick={() => klikk(dokument)}
            key={uuid()}
            type="button"
          >
            {dokument.dokumentNavn ||
              KV.kodeTilTerm(dokument.dokumentData?.produserbardokument, MKV.KTObjects.brev.produserbaredokumenter)}
          </button>
        </Table.DataCell>
        <Table.DataCell>{dokument.mottakerNavn || dokument.dokumentData?.mottaker}</Table.DataCell>
      </Table.Row>
    );
  };

  const mapSED = (dokument: DokumentMetadataType) => (
    <Table.Row>
      <Table.DataCell>
        <button
          className="dokumentliste__vis_dokument_knapp"
          onClick={() => klikk(dokument)}
          key={uuid()}
          type="button"
        >
          {dokument.dokumentNavn || `SED ${dokument.sedType}`}
        </button>
      </Table.DataCell>
      <Table.DataCell>{dokument.mottakerNavn}</Table.DataCell>
    </Table.Row>
  );

  return (
    <div>
      <Table>
        <Table.Header>
          <Table.HeaderCell>Forhåndsvisning av brev</Table.HeaderCell>
          <Table.HeaderCell>Mottaker</Table.HeaderCell>
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
