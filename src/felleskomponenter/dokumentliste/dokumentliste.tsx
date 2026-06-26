import { useState } from "react";

import * as Nav from "../../navFrontend";
import { dokumenterOperations } from "../../ducks/dokumenter";

import { apnePdfINyFane } from "../../services/utils";

import "./dokumentliste.less";
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
import * as Ikoner from "../../resources/images";

function Dokumentliste({ behandlingID, dokumenter, validateOnClick, label, className }: DokumentlisteType) {
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
          },
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
      await apnePdfINyFane(
        fileURL,
        dokument.dokumentData.produserbardokument
          .toLowerCase()
          .replace(/_/g, " ")
          .replace(/^./, (c: any) => c.toUpperCase()),
      );
      setFeilmelding(null);
    }
  };

  const mapBrev = (dokument: BrevDokumentMetadataType) => (
    <Nav.Table.Row key={Utils._uuid()}>
      <Nav.Table.DataCell>
        <Nav.Link
          href="#"
          title="Åpnes i ny fane"
          aria-label="Åpnes i ny fane"
          onClick={(e) => e.preventDefault()}
          onMouseDown={() => klikk(dokument)}
        >
          {`${
            dokument.dokumentNavn ??
            KV.kodeTilTerm(dokument.dokumentData?.produserbardokument, MKV.KTObjects.brev.produserbaredokumenter)
          }`}
          <Ikoner.ExternalLink />
        </Nav.Link>
      </Nav.Table.DataCell>
      <Nav.Table.DataCell>{dokument.mottakerNavn ?? dokument.dokumentData?.mottaker}</Nav.Table.DataCell>
    </Nav.Table.Row>
  );

  const mapSED = (dokument: SedDokumentMetadataType) => (
    <Nav.Table.Row key={Utils._uuid()}>
      <Nav.Table.DataCell>
        <Nav.Link
          href="#"
          title="Åpnes i ny fane"
          aria-label="Åpnes i ny fane"
          onClick={(e) => e.preventDefault()}
          onMouseDown={() => klikk(dokument)}
        >
          {dokument.dokumentNavn ?? `SED ${dokument.sedType}`}
          <Ikoner.ExternalLink />
        </Nav.Link>
      </Nav.Table.DataCell>
      <Nav.Table.DataCell>{dokument.mottakerNavn}</Nav.Table.DataCell>
    </Nav.Table.Row>
  );

  const mapDokument = (dokument: BrevDokumentMetadataType | SedDokumentMetadataType) => {
    if (isSed(dokument)) return mapSED(dokument);
    if (isBrev(dokument)) return mapBrev(dokument);
    return null;
  };

  return (
    <div className={`dokumentliste ${className || ""}`}>
      <Nav.Table size="small">
        <Nav.Table.Header>
          <Nav.Table.Row>
            <Nav.Table.HeaderCell>{label ? label : "Forhåndsvisning av brev"}</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell>Mottaker</Nav.Table.HeaderCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>{dokumenter.map(mapDokument)}</Nav.Table.Body>
      </Nav.Table>
      {feilmelding && (
        <Nav.Alert variant="error" className="varsel">
          {feilmelding}
        </Nav.Alert>
      )}
    </div>
  );
}

export default Dokumentliste;
