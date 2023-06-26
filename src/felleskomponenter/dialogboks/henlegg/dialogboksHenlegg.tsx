import React, { ChangeEventHandler, useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";
import * as Api from "../../../services/api";
import * as StringUtils from "../../../utils/streng";

import { MELOSYS_DOKUMENT_V2 } from "../../../featuretoggle/toggleNavn";
import { useFeatureToggle } from "../../../featuretoggle";
import PdfLenkeListe from "../../pdfLenkeListe";
import Knapperad from "../../knapperad";
import HtmlEditor from "../../htmlEditor";
import bem from "../../../bemUtils";

import { kontrollOperations } from "../../../ducks/kontroll";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { feiletResponsSelectors } from "../../../ducks/feiletRespons";
import { Feilmeldinger } from "../../feilmeldinger";

import "./dialogboksHenlegg.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
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
  const brukDokumentV2 = useFeatureToggle(MELOSYS_DOKUMENT_V2);

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

  const pdfDokumenter = brukDokumentV2
    ? [
        {
          sendesTilDokumenterV2: true,
          navn: "Forhåndsvis brev",
          data: {
            produserbardokument: MKV.Koder.brev.produserbaredokumenter.MELDING_HENLAGT_SAK,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
            begrunnelseKode,
            fritekst,
          },
        },
      ]
    : [
        {
          navn: "Forhåndsvis brev",
          type: MKV.Koder.brev.produserbaredokumenter.MELDING_HENLAGT_SAK,
          data: {
            begrunnelseKode,
            fritekst,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
          },
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
      ariaHideApp={ariaHideApp}
    >
      <div>
        <Nav.Typo.Systemtittel className={dialogboksHenleggClassName.element("overskrift")}>
          Henlegg saken
        </Nav.Typo.Systemtittel>
        <Feilmeldinger className={dialogboksHenleggClassName.element("feilmeldinger")} />
        <Mui.KodeTermSelect
          feil={feilmeldingSelect}
          onChange={velgBegrunnelseHandle}
          label="Begrunnelse"
          value={begrunnelseKode}
          koder={MKV.KTObjects.begrunnelser.henleggelsesgrunner}
          disableForsteValg={erBegrunnelseValgt}
          redigerbart
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
        {harIngenFeilmeldinger && (
          <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={handleForhandsvisBrev} />
        )}
        <Knapperad
          bekreft={handleHenlegg}
          bekreftTekst="Henlegg saken"
          bekreftRedigerbart={erBegrunnelseValgt && harIngenFeilmeldinger}
          avbryt={avbryt}
          avbrytTekst="Avbryt"
          redigerbart
        />
      </div>
    </Nav.Modal>
  );
};

export default connector(DialogboksHenleggSak);
