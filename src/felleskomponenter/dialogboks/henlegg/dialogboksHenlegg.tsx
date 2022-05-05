import React, { ChangeEventHandler, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";

import MKV from "../../../melosyskodeverk";
import PdfLenkeListe from "../../pdfLenkeListe";
import Knapperad from "../../knapperad";
import HtmlEditor from "../../htmlEditor";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";

import "./dialogboksHenlegg.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  redigerbart: redigerbartSelectors.BehandlingsmenyRedigerbartSelector(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type DialogboksHenleggSakProps = PropsFromRedux & {
  henleggHandle: (data: { begrunnelseKode: string; fritekst: string }) => void;
  avbryt: () => void;
  ariaHideApp?: boolean;
};

export const DialogboksHenleggSak = ({
  henleggHandle,
  avbryt,
  behandlingID,
  redigerbart,
  ariaHideApp = false,
}: DialogboksHenleggSakProps) => {
  const [begrunnelseKode, setBegrunnelseKode] = useState<string>("");
  const [feilmeldingSelect, setFeilmeldingSelect] = useState<string | null>(null);
  const [feilmeldingFritekst, setFeilmeldingFritekst] = useState<string | null>(null);
  const [fritekst, setFritekst] = useState<string>("");

  const velgBegrunnelseHandle: ChangeEventHandler<HTMLInputElement> = (event) => {
    setBegrunnelseKode(event.target.value);
    setFeilmeldingSelect(null);
  };

  const erBegrunnelseValgt = begrunnelseKode !== "";
  const erFritekstValgt = begrunnelseKode === MKV.Koder.begrunnelser.henleggelsesgrunner.ANNET;
  const erFritekstTom = fritekst.replace("<p></p>", "").trim() === "";

  const handleForhandsvisBrev = async () => {
    const begrunnelsePassertValidering = validerBegrunnelse();
    const fritekstPassertValidering = validerFritekst();
    return begrunnelsePassertValidering && fritekstPassertValidering;
  };

  const validerBegrunnelse = () => {
    if (!erBegrunnelseValgt) {
      setFeilmeldingSelect("Ingen begrunnelse valgt");
    }
    return erBegrunnelseValgt;
  };

  const validerFritekst = () => {
    const fritekstValideringPassert = !(erFritekstValgt && erFritekstTom);
    if (!fritekstValideringPassert) {
      setFeilmeldingFritekst("Mangler fritekst");
    }
    return fritekstValideringPassert;
  };

  const fritekstOnchange = (tekst: string) => {
    setFritekst(tekst);
    setFeilmeldingFritekst(null);
  };

  const vedKlikkHenlegg = () => {
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
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      }
    : {};

  const pdfDokumenter = [
    {
      navn: "Forhåndsvis brev",
      type: MKV.Koder.brev.produserbaredokumenter.MELDING_HENLAGT_SAK,
      data,
    },
  ];

  return (
    <Nav.Modal
      className="dialogboksHenlegg"
      isOpen
      contentLabel="Henlegg sak"
      onRequestClose={avbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
      // @ts-ignore
      ariaHideApp={ariaHideApp}
    >
      <div>
        <Nav.Typo.Systemtittel className="overskrift">Henlegg saken</Nav.Typo.Systemtittel>
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
          <HtmlEditor feil={feilmeldingFritekst} value={fritekst} onChange={fritekstOnchange} label="Fritekst" />
        )}
        {redigerbart && (
          <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={handleForhandsvisBrev} />
        )}
        <Knapperad
          bekreft={vedKlikkHenlegg}
          bekreftTekst="HENLEGG SAKEN"
          bekreftRedigerbart={erBegrunnelseValgt}
          avbryt={avbryt}
          avbrytTekst="AVBRYT"
          redigerbart={redigerbart}
        />
      </div>
    </Nav.Modal>
  );
};

export default connector(DialogboksHenleggSak);
