import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as Ikon from "../../../resources/images";
import * as Utils from "../../../utils";

import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { kontrollOperations, kontrollSelectors } from "../../../ducks/kontroll";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { Feilmeldinger } from "../../feilmeldinger";

import PdfLenkeListe from "../../pdfLenkeListe";
import HtmlEditor from "../../htmlEditor";
import Knapperad from "../../knapperad";

import "./dialogboksAvslagSoknad.css";

interface DialogboksAvslagSoknadProps {
  avslaaSoknadHandle: (data: { fritekst?: string }) => void;
  avbryt: () => void;
  ariaHideApp: boolean;
}

export const DialogboksAvslagSoknad = ({ ariaHideApp, avbryt, avslaaSoknadHandle }: DialogboksAvslagSoknadProps) => {
  const dispatch = useDispatch();

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const kontrollfeil = useSelector(kontrollSelectors.KontrollfeilSelector);

  const [brevFritekst, setBrevFritekst] = useState("");
  const [utførerKontroll, setUtførerKontroll] = useState(true);

  useEffect(() => {
    (async () => {
      await dispatch(
        kontrollOperations.kontrollerFerdigbehandling({
          behandlingID,
          vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
          behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL,
          skalRegisteropplysningerOppdateres: false,
        })
      );
      setUtførerKontroll(false);
    })();
  }, []);

  const pdfDokumenter = [
    {
      navn: "Forhåndsvis vedtaksbrev",
      data: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_MANGLENDE_OPPLYSNINGER,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        begrunnelseKode: MKV.Koder.begrunnelser.folketrygdloven.avslag.MANGLENDE_OPPLYSNINGER,
        fritekst: brevFritekst,
      },
    },
  ];

  const avslaaSoknad = () => {
    const data = {
      fritekst: brevFritekst,
    };
    avslaaSoknadHandle(data);
  };
  const brevFritekstMaxLength = 500;
  const bekreftRedigerbart =
    redigerbart && Utils._isEmpty(kontrollfeil) && brevFritekst.length <= brevFritekstMaxLength && !utførerKontroll;

  return (
    <Nav.Modal
      className="dialogboksAvslagSoknad"
      isOpen
      contentLabel="Avslå søknad"
      onRequestClose={avbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
      ariaHideApp={ariaHideApp}
    >
      <div className="avslagsoknadcontainer">
        <Ikon.VedtakGodkjent className="vedtakIkon" />
        <div>
          <Nav.Typo.Systemtittel className="overskrift">
            Avslå søknaden på grunn av manglende opplysninger
          </Nav.Typo.Systemtittel>
          <Feilmeldinger />
          <HtmlEditor value={brevFritekst} onChange={setBrevFritekst} label="Fritekst til vedtaksbrev" />
          {bekreftRedigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
          <div className="knapperadcontainer">
            <Knapperad
              avbryt={avbryt}
              avbrytTekst="Avbryt"
              bekreft={avslaaSoknad}
              bekreftTekst="Avslå søknad"
              redigerbart={redigerbart}
              bekreftRedigerbart={bekreftRedigerbart}
            />
          </div>
        </div>
      </div>
    </Nav.Modal>
  );
};

export default DialogboksAvslagSoknad;
