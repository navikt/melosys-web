import React from "react";
import { useSelector } from "react-redux";

import * as Api from "../../../../../services/api";

import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import MottakerTabell from "../../../../../felleskomponenter/tabell/mottakerTabell";
import PdfLenkeListe from "../../../../../felleskomponenter/pdfLenkeListe";
import MKV from "../../../../../melosyskodeverk";
import { useAsyncCallbackState } from "../../../../../hooks";
import * as Utils from "../../../../../utils";

const { IKKE_YRKESAKTIV_VEDTAKSBREV } = MKV.Koder.brev.produserbaredokumenter;

export const BrevMottakereTabell = () => {
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);

  const [muligeMottakere] = useAsyncCallbackState(
    () =>
      Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
        produserbartdokument: IKKE_YRKESAKTIV_VEDTAKSBREV,
        orgnr: null,
      }),
    Api.DokumenterV2.tomHentMuligeMottakereResDto(),
    []
  );

  const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return [
      {
        sendesTilDokumenterV2: true,
        navn: muligMottaker.dokumentNavn,
        data: {
          produserbardokument: IKKE_YRKESAKTIV_VEDTAKSBREV,
          mottaker: muligMottaker.rolle,
          orgNr: null,
        },
      },
    ];
  };

  const mapRad = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return [
      {
        verdi: (
          <PdfLenkeListe
            behandlingID={behandlingID}
            dokumenter={lagDokumenterData(muligMottaker)}
            className="forhåndsvisning"
          />
        ),
      },
      { verdi: muligMottaker.mottakerNavn },
    ];
  };

  const mapMottakerRader = (muligeBrevMottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return [mapRad(muligeBrevMottakere.hovedMottaker)];
  };

  return (
    <>
      {Utils._isEmpty(muligeMottakere) && (
        <MottakerTabell
          className="tabell"
          rader={mapMottakerRader(muligeMottakere)}
          kolonner={[
            { verdi: "Forhåndsvisning av brev", bredde: "60%" },
            { verdi: "Mottaker", bredde: "40%" },
          ]}
        />
      )}
    </>
  );
};
