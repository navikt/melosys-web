import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import * as Api from "../../../../../services/api";

import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import MottakerTabell from "../../../../../felleskomponenter/tabell/mottakerTabell";
import PdfLenkeListe from "../../../../../felleskomponenter/pdfLenkeListe";
import MKV from "../../../../../melosyskodeverk";

interface IkkeYrkesaktiveMottakereTabellProps {
  formIsValid: boolean;
}

export const BrevMottakereTabell = ({ formIsValid }: IkkeYrkesaktiveMottakereTabellProps) => {
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);

  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());

  const { IKKE_YRKESAKTIV_VEDTAKSBREV } = MKV.Koder.brev.produserbaredokumenter;

  const hentMuligeMottakere = () => {
    Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: IKKE_YRKESAKTIV_VEDTAKSBREV,
      orgnr: null,
    }).then((res) => {
      setMuligeMottakere(res);
    });
  };

  useEffect(() => {
    hentMuligeMottakere();
  }, []);

  const hentDokumentDataRequest: any = (mottakerrolle: string) => {
    return {
      produserbardokument: IKKE_YRKESAKTIV_VEDTAKSBREV,
      mottaker: mottakerrolle,
      orgNr: null,
    };
  };

  const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return [
      {
        sendesTilDokumenterV2: true,
        navn: muligMottaker.dokumentNavn,
        data: {
          ...hentDokumentDataRequest(muligMottaker.rolle),
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

  return (
    <>
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
    </>
  );
};
