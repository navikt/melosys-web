import React, { ChangeEvent, useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

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
import { FeatureToggle } from "../../../featuretoggle";
import HtmlEditor from "../../htmlEditor";
import { vedtakOperations } from "../../../ducks/vedtak";
import { feiletResponsSelectors } from "../../../ducks/feiletRespons";
import { Feilmeldinger } from "../../feilmeldinger";

const mapStateToProps = (state: RootState) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
  feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
});
const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  kontrollerVedtak: (
    behandlingID: number,
    skalRegisteropplysningerOppdateres: boolean,
    body: Api.Saksflyt.Vedtak.FattVedtakReqDto
  ) => dispatch(vedtakOperations.kontroller(behandlingID, skalRegisteropplysningerOppdateres, body)),
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
    kontrollerVedtak,
    feilmeldinger,
  } = props;

  useEffect(() => {
    (async () => {
      await kontrollerVedtak(behandlingID, false, {
        behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL,
        vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        fritekst: null,
        fritekstSed: null,
        mottakerinstitusjoner: [],
        nyVurderingBakgrunn: null,
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
          <FeatureToggle togglename="melosys.brev.AVSLAG_MANGLENDE_OPPLYSNINGER">
            {(toggleStatus) =>
              toggleStatus === "enabled" ? (
                <HtmlEditor value={brevFritekst} onChange={setBrevFritekst} label="Fritekst til vedtaksbrev" />
              ) : (
                <Nav.Textarea
                  value={brevFritekst}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setBrevFritekst(event.target.value)}
                  label="Fritekst til vedtaksbrev"
                  maxLength={brevFritekstMaxLength}
                />
              )
            }
          </FeatureToggle>
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
