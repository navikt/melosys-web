import React from "react";
import { useSelector } from "react-redux";

import * as Api from "../../../../../services/api";
import * as Skjema from "../../../../../felleskomponenter/skjema";
import * as Utils from "../../../../../utils";

import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import MottakerTabell from "../../../../../felleskomponenter/tabell/mottakerTabell";
import PdfLenkeListe from "../../../../../felleskomponenter/pdfLenkeListe";

interface BrevMottakereTabellProps {
  muligeMottakere?: Api.DokumenterV2.HentMuligeMottakereResDto;
  muligeMottakereNorskMyndighet?: Api.DokumenterV2.MuligMottaker[];
  formIsValid: boolean;
  hentBrevRequest: any;
}

export const BrevMottakereTabell = ({
  muligeMottakere,
  muligeMottakereNorskMyndighet,
  formIsValid,
  hentBrevRequest,
}: BrevMottakereTabellProps) => {
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);

  const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return [
      {
        sendesTilDokumenterV2: true,
        navn: muligMottaker.dokumentNavn,
        data: {
          ...hentBrevRequest(muligMottaker.rolle),
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
            vedKlikk={() => formIsValid}
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

  const mapMottakerRaderNorskeMyndigheter = (muligeBrevMottakere: Api.DokumenterV2.MuligMottaker[]) => {
    return muligeBrevMottakere.map((mottaker) => mapRad(mottaker));
  };

  return (
    <>
      {!Utils._isEmpty(muligeMottakere?.kopiMottakere) && (
        <Skjema.Checkbox
          className="kopiTilBrukerSjekkboks"
          feltNavn="kopiTilBruker"
          label="Send kopi til bruker/brukers fullmektig"
        />
      )}

      {muligeMottakere && (
        <MottakerTabell
          className="tabell"
          rader={mapMottakerRader(muligeMottakere)}
          kolonner={[
            { verdi: "Forhåndsvisning av brev", bredde: "60%" },
            { verdi: "Mottaker", bredde: "40%" },
          ]}
        />
      )}
      {muligeMottakereNorskMyndighet && (
        <MottakerTabell
          className="tabell"
          rader={mapMottakerRaderNorskeMyndigheter(muligeMottakereNorskMyndighet)}
          kolonner={[
            { verdi: "Forhåndsvisning av brev", bredde: "60%" },
            { verdi: "Mottaker", bredde: "40%" },
          ]}
        />
      )}
    </>
  );
};
