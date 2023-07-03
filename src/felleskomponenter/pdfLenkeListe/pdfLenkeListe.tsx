import React, { ReactNode, useState } from "react";
import uuid from "uuid";
import classNames from "classnames";

import { SedPdfData } from "Domene";
import * as Api from "../../services/api";

import * as Nav from "../../navFrontend";
import { dokumenterOperations } from "../../ducks/dokumenter";

import { apnePdfINyFane } from "../../services/utils";

import "./pdfLenkeListe.css";

interface DokumentMetadataProps {
  navn: ReactNode | string;
  data: Api.DokumenterV2.OpprettBrevReqDto | SedPdfData;
  type?: string;
  erSed?: boolean;
}

interface PdfLenkeListeProps {
  behandlingID: number;
  dokumenter: DokumentMetadataProps[];
  vedKlikk?: () => Promise<unknown> | {};
  className?: string;
}

const PdfLenkeListe = ({ behandlingID, dokumenter, vedKlikk, className }: PdfLenkeListeProps) => {
  const [feilmelding, setFeilmelding] = useState<string | undefined>(undefined);

  const setGeneriskFeil = (erSed?: boolean) => {
    setFeilmelding(`Det oppstod en feil da ${erSed ? "SED" : "brevet"} skulle forhåndsvises!`);
  };

  const klikk = async (dokument: DokumentMetadataProps) => {
    // Avbryt forespørsel hvis validator er oppgitt og returnerer false
    if (vedKlikk) {
      const validert = await vedKlikk();
      if (!validert) {
        return;
      }
    }

    let fileURL;

    try {
      if (dokument.erSed) {
        fileURL = await dokumenterOperations.forhandsvisSed(behandlingID, dokument.type!!, dokument.data as SedPdfData);
      } else {
        const data = dokument.data as Api.DokumenterV2.OpprettBrevReqDto;
        fileURL = await dokumenterOperations.forhandsvisBrevV2(behandlingID, data);
      }
    } catch (error: any) {
      if (error?.status >= 500) {
        setGeneriskFeil(dokument.erSed);
      } else if (error?.status >= 400) {
        setFeilmelding(error?.body?.message);
      }
    }

    if (fileURL) {
      await apnePdfINyFane(fileURL);
      setFeilmelding(undefined);
    }
  };

  const lagDokumentLenke = (dokument: DokumentMetadataProps) => {
    return (
      <button onClick={() => klikk(dokument)} key={uuid.v4()} type="button">
        {dokument.navn}
      </button>
    );
  };

  const cl = classNames("pdfLenkeListe", className);

  return (
    <div className={cl}>
      {dokumenter?.map((dokument) => lagDokumentLenke(dokument))}
      {feilmelding && (
        <Nav.AlertStripe type="advarsel" className="varsel">
          {feilmelding}
        </Nav.AlertStripe>
      )}
    </div>
  );
};

export default PdfLenkeListe;
