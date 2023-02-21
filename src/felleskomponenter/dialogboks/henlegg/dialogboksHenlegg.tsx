import React, { ChangeEventHandler, useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";
import * as Api from "../../../services/api";

import MKV from "../../../melosyskodeverk";
import PdfLenkeListe from "../../pdfLenkeListe";
import Knapperad from "../../knapperad";
import HtmlEditor from "../../htmlEditor";
import bem from "../../../bemUtils";

import { kontrollOperations } from "../../../ducks/kontroll";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { feiletResponsSelectors } from "../../../ducks/feiletRespons";
import { Feilmeldinger } from "../../feilmeldinger";

import "./dialogboksHenlegg.css";
import * as StringUtils from "../../../utils/streng";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  redigerbart: redigerbartSelectors.BehandlingsmenyRedigerbartSelector(state),
  feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  kontrollerFerdigbehandling: (data: Api.Kontroll.FerdigbehandlingKontrollData) =>
    dispatch(kontrollOperations.kontrollerFerdigbehandling(data)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type DialogboksHenleggSakProps = PropsFromRedux & {
  henleggHandle: (data: { begrunnelseKode: string; fritekst: string }) => void;
  avbryt: () => void;
  ariaHideApp?: boolean;
};

export const DialogboksHenleggSak = ({
  behandlingID,
  redigerbart,
  feilmeldinger,
  henleggHandle,
  avbryt,
  kontrollerFerdigbehandling,
  ariaHideApp = false,
}: DialogboksHenleggSakProps) => {
  const [begrunnelseKode, setBegrunnelseKode] = useState<string>("");
  const [feilmeldingSelect, setFeilmeldingSelect] = useState<string | null>(null);
  const [feilmeldingFritekst, setFeilmeldingFritekst] = useState<string | null>(null);
  const [fritekst, setFritekst] = useState<string>("");

  useEffect(() => {
    (async () => {
      await kontrollerFerdigbehandling({
        behandlingID,
        vedtakstype: MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.HENLEGGELSE,
        skalRegisteropplysningerOppdateres: false,
      });
    })();
  }, []);

  const erBegrunnelseValgt = begrunnelseKode !== "";
  const erFritekstValgt = begrunnelseKode === MKV.Koder.begrunnelser.henleggelsesgrunner.ANNET;
  const harIngenFeilmeldinger = !(feilmeldinger && feilmeldinger.length > 0);

  const validerBegrunnelse = () => {
    if (!erBegrunnelseValgt) {
      setFeilmeldingSelect("Ingen begrunnelse valgt");
    }
    return erBegrunnelseValgt;
  };

  const validerFritekst = () => {
    const fritekstValideringPassert = !(erFritekstValgt && !StringUtils.harStrengInnhold(fritekst));
    if (!fritekstValideringPassert) {
      setFeilmeldingFritekst("Mangler fritekst");
    }
    return fritekstValideringPassert;
  };

  const fritekstOnchange = (tekst: string) => {
    setFritekst(tekst);
    setFeilmeldingFritekst(null);
  };

  const velgBegrunnelseHandle: ChangeEventHandler<HTMLInputElement> = (event) => {
    setBegrunnelseKode(event.target.value);
    setFeilmeldingSelect(null);
  };

  const handleForhandsvisBrev = async () => {
    const begrunnelsePassertValidering = validerBegrunnelse();
    const fritekstPassertValidering = validerFritekst();
    return begrunnelsePassertValidering && fritekstPassertValidering;
  };

  const handleHenlegg = () => {
    if (!(validerBegrunnelse() && validerFritekst())) return;
    henleggHandle({
      begrunnelseKode,
      fritekst,
    });
  };

  const data = erBegrunnelseValgt
    ? {
        begrunnelseKode,
        fritekst,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
      }
    : {};

  const pdfDokumenter = [
    {
      navn: "Forhåndsvis brev",
      type: MKV.Koder.brev.produserbaredokumenter.MELDING_HENLAGT_SAK,
      data,
    },
  ];

  const dialogboksHenleggClassName = bem("dialogboks-henlegg");

  return (
    <Nav.Modal
      className={dialogboksHenleggClassName.block}
      isOpen
      contentLabel="Henlegg sak"
      onRequestClose={avbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
      // @ts-ignore
      ariaHideApp={ariaHideApp}
    >
      <div>
        <Nav.Typo.Systemtittel className={dialogboksHenleggClassName.element("overskrift")}>
          Henlegg saken
        </Nav.Typo.Systemtittel>
        <Feilmeldinger className={dialogboksHenleggClassName.element("feilmeldinger")} feilmeldinger={feilmeldinger} />
        <Mui.KodeTermSelect
          feil={feilmeldingSelect}
          onChange={velgBegrunnelseHandle}
          label="Begrunnelse"
          value={begrunnelseKode}
          koder={MKV.KTObjects.begrunnelser.henleggelsesgrunner}
          disableForsteValg={erBegrunnelseValgt}
          redigerbart={redigerbart}
        />
        {erFritekstValgt && (
          <HtmlEditor
            className={dialogboksHenleggClassName.element("fritekst")}
            feil={feilmeldingFritekst}
            value={fritekst}
            onChange={fritekstOnchange}
            label="Fritekst"
          />
        )}
        {redigerbart && harIngenFeilmeldinger && (
          <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={handleForhandsvisBrev} />
        )}
        <Knapperad
          bekreft={handleHenlegg}
          bekreftTekst="Henlegg saken"
          bekreftRedigerbart={erBegrunnelseValgt && harIngenFeilmeldinger}
          avbryt={avbryt}
          avbrytTekst="Avbryt"
          redigerbart={redigerbart}
        />
      </div>
    </Nav.Modal>
  );
};

export default connector(DialogboksHenleggSak);
