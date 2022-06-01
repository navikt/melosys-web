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

import PdfLenkeListe from "../../pdfLenkeListe";
import Knapperad from "../../knapperad";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import "./dialogboksAvslagSoknad.css";
import HtmlEditor from "../../htmlEditor";
import { feiletResponsSelectors } from "../../../ducks/feiletRespons";
import { Feilmeldinger } from "../../feilmeldinger";
import { kontrollOperations } from "../../../ducks/kontroll";

const mapStateToProps = (state: RootState) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
  feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  kontrollerFerdigbehandling: (data: Api.Kontroll.FerdigbehandlingKontrollData) =>
    dispatch(kontrollOperations.kontroller(data)),
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

  const {
    ariaHideApp,
    avbryt,
    behandlingID,
    redigerbart,
    avslaaSoknadHandle,
    vedtakstype,
    kontrollerFerdigbehandling,
    feilmeldinger,
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

  const pdfDokumenter = [
    {
      navn: "Forhåndsvis vedtaksbrev",
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_MANGLENDE_OPPLYSNINGER,
      data: {
        begrunnelseKode: MKV.Koder.begrunnelser.folketrygdloven.avslag.MANGLENDE_OPPLYSNINGER,
        fritekst: brevFritekst,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
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
      // @ts-ignore
      ariaHideApp={ariaHideApp}
    >
      <div className="avslagsoknadcontainer">
        <Ikon.VedtakGodkjent className="vedtakIkon" />
        <div>
          <Nav.Typo.Systemtittel className="overskrift">
            Avslå søknaden på grunn av manglende opplysninger
          </Nav.Typo.Systemtittel>
          <Feilmeldinger feilmeldinger={feilmeldinger} />
          <HtmlEditor value={brevFritekst} onChange={setBrevFritekst} label="Fritekst til vedtaksbrev" />
          {bekreftRedigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
          <div className="knapperadcontainer">
            <Knapperad
              avbryt={avbryt}
              avbrytTekst="AVBRYT"
              bekreft={avslaaSoknad}
              bekreftTekst="AVSLÅ SØKNAD"
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
