import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";

import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as Ikon from "../../../resources/images";
import * as Utils from "../../../utils";
import * as Api from "../../../services/api";

import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { feiletResponsSelectors } from "../../../ducks/feiletRespons";
import { Feilmeldinger } from "../../feilmeldinger";
import { kontrollOperations, kontrollSelectors } from "../../../ducks/kontroll";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";

import { MELOSYS_DOKUMENT_V2 } from "../../../featuretoggle/toggleNavn";
import { useFeatureToggle } from "../../../featuretoggle";
import PdfLenkeListe from "../../pdfLenkeListe";
import HtmlEditor from "../../htmlEditor";
import Knapperad from "../../knapperad";

import "./dialogboksAvslagSoknad.css";

const mapStateToProps = (state: RootState) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
  feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
  kontrollfeil: kontrollSelectors.KontrollfeilSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  kontrollerFerdigbehandling: (data: Api.Kontroll.FerdigbehandlingKontrollData) =>
    dispatch(kontrollOperations.kontrollerFerdigbehandling(data)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

interface DialogboksAvslagSoknadProps {
  avslaaSoknadHandle: (data: { fritekst?: string }) => void;
  avbryt: () => void;
  ariaHideApp: boolean;
}

type PropsFromRedux = ConnectedProps<typeof connector>;

export const DialogboksAvslagSoknad = (props: DialogboksAvslagSoknadProps & PropsFromRedux) => {
  const [brevFritekst, setBrevFritekst] = useState("");
  const [vedtakPending, setVedtakPending] = useState(true);
  const brukDokumentV2 = useFeatureToggle(MELOSYS_DOKUMENT_V2);

  const {
    ariaHideApp,
    avbryt,
    behandlingID,
    redigerbart,
    avslaaSoknadHandle,
    vedtakstype,
    kontrollerFerdigbehandling,
    feilmeldinger,
    kontrollfeil,
  } = props;

  useEffect(() => {
    (async () => {
      await kontrollerFerdigbehandling({
        behandlingID,
        vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL,
        skalRegisteropplysningerOppdateres: false,
      });
      setVedtakPending(false);
    })();
  }, []);

  const pdfDokumenter = brukDokumentV2
    ? [
        {
          sendesTilDokumenterV2: true,
          navn: "Forhåndsvis vedtaksbrev",
          data: {
            produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_MANGLENDE_OPPLYSNINGER,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
            begrunnelseKode: MKV.Koder.begrunnelser.folketrygdloven.avslag.MANGLENDE_OPPLYSNINGER,
            fritekst: brevFritekst,
          },
        },
      ]
    : [
        {
          navn: "Forhåndsvis vedtaksbrev",
          type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_MANGLENDE_OPPLYSNINGER,
          data: {
            begrunnelseKode: MKV.Koder.begrunnelser.folketrygdloven.avslag.MANGLENDE_OPPLYSNINGER,
            fritekst: brevFritekst,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
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
    redigerbart && Utils._isEmpty(feilmeldinger) && brevFritekst.length <= brevFritekstMaxLength && !vedtakPending;

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
          <Feilmeldinger feilmeldinger={feilmeldinger} kontrollfeil={kontrollfeil} />
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

export default connector(DialogboksAvslagSoknad);
