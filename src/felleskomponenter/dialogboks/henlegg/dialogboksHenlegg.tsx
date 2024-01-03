import { ChangeEventHandler, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";
import * as Utils from "../../../utils";

import { Feilmeldinger } from "../../feilmeldinger";
import { AlertStripeFeil } from "nav-frontend-alertstriper";
import Knapperad from "../../knapperad";
import HtmlEditor from "../../htmlEditor";
import bem from "../../../bemUtils";

import { kontrollOperations, kontrollSelectors } from "../../../ducks/kontroll";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { navigeringOperations } from "../../../ducks/navigering";
import { datalastingOperations } from "../../../ducks/datalasting";
import { modalerOperations } from "../../../ducks/modaler";
import { fagsakSelectors } from "../../../ducks/fagsaker";

import "./dialogboksHenlegg.css";
import Dokumentliste from "../../dokumentliste";

type DialogboksHenleggSakProps = {
  avbryt: () => void;
  ariaHideApp?: boolean;
};

export const DialogboksHenleggSak = ({ avbryt, ariaHideApp = false }: DialogboksHenleggSakProps) => {
  const dispatch = useDispatch();
  const [feil, setFeil] = useState<undefined | string>(undefined);

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector);
  const kontrollfeil = useSelector(kontrollSelectors.KontrollFeilSelector);

  const [begrunnelseKode, setBegrunnelseKode] = useState<string>("");
  const [feilmeldingSelect, setFeilmeldingSelect] = useState<string | null>(null);
  const [feilmeldingFritekst, setFeilmeldingFritekst] = useState<string | null>(null);
  const [fritekst, setFritekst] = useState<string>("");

  useEffect(() => {
    dispatch(
      kontrollOperations.kontrollerFerdigbehandling({
        behandlingID,
        vedtakstype: MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.HENLEGGELSE,
        skalRegisteropplysningerOppdateres: false,
      })
    );
  }, []);

  const erBegrunnelseValgt = begrunnelseKode !== "";
  const erFritekstValgt = begrunnelseKode === MKV.Koder.begrunnelser.henleggelsesgrunner.ANNET;
  const harIngenFeilmeldinger = Utils._isEmpty(kontrollfeil);

  const validerBegrunnelse = () => {
    if (!erBegrunnelseValgt) {
      setFeilmeldingSelect("Ingen begrunnelse valgt");
    }
    return erBegrunnelseValgt;
  };

  const validerFritekst = () => {
    const fritekstValideringPassert = !(erFritekstValgt && !Utils.streng.harStrengInnhold(fritekst));
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

  const erValgGyldig = () => {
    const begrunnelsePassertValidering = validerBegrunnelse();
    const fritekstPassertValidering = validerFritekst();
    return begrunnelsePassertValidering && fritekstPassertValidering;
  };

  const henleggHandle = async (data: Api.Fagsaker.fagsak.HenleggReqDto) => {
    await dispatch(datalastingOperations.lagreAllData());

    Api.Fagsaker.fagsak
      .henlegg(saksnummer, data)
      .then(() => {
        dispatch(modalerOperations.skjulHenlegg());
        dispatch(navigeringOperations.tilForsiden());
      })
      .catch((error) => setFeil(error.body?.message || error));
  };

  const handleHenlegg = () => {
    if (!erValgGyldig()) return;
    henleggHandle({ begrunnelseKode, fritekst });
  };

  const pdfDokumenter = [
    {
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.MELDING_HENLAGT_SAK,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        begrunnelseKode,
        fritekst,
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
        <Feilmeldinger className={dialogboksHenleggClassName.element("kontrollfeil")} />
        {feil && (
          <AlertStripeFeil className={dialogboksHenleggClassName.element("feilmeldinger")}>{feil}</AlertStripeFeil>
        )}
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
          <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} validateOnClick={erValgGyldig} />
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

export default DialogboksHenleggSak;
