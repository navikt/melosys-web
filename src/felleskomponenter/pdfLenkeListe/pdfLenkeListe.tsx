import React, { ReactNode, useState } from "react";
import classNames from "classnames";
import { BrevPdfData, SedPdfData } from "Domene";

import * as Api from "../../services/api";
import * as Nav from "../../navFrontend";

import { dokumenterOperations } from "../../ducks/dokumenter";
import { apnePdfINyFane } from "../../services/utils";
import { MELOSYS_DOKUMENT_V2 } from "../../featuretoggle/toggleNavn";
import { useFeatureToggle } from "../../featuretoggle";

import "./pdfLenkeListe.css";

const uuid = require("uuid/v4");

interface DokumentMetadataProps {
  navn: ReactNode | string;
  type?: string;
  data: Api.DokumenterV2.OpprettBrevReqDto | SedPdfData | BrevPdfData;
  erSed?: boolean;
  sendesTilDokumenterV2?: boolean;
}

interface PdfLenkeListeProps {
  behandlingID: number;
  dokumenter: DokumentMetadataProps[];
  vedKlikk?: () => Promise<unknown> | {};
  className?: string;
}

const PdfLenkeListe = ({ behandlingID, dokumenter, vedKlikk, className }: PdfLenkeListeProps) => {
  const brukDokumenterV2 = useFeatureToggle(MELOSYS_DOKUMENT_V2);
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
      } else if (dokument.sendesTilDokumenterV2 || brukDokumenterV2) {
        const data = dokument.data as Api.DokumenterV2.OpprettBrevReqDto;
        data.produserbardokument = data.produserbardokument || dokument.type!!;
        fileURL = await dokumenterOperations.forhandsvisBrevV2(behandlingID, data);
      } else {
        const data = dokument.data as BrevPdfData;
        fileURL = await dokumenterOperations.forhandsvisBrev(behandlingID, dokument.type!!, data);
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
      <button onClick={() => klikk(dokument)} key={uuid()} type="button">
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
