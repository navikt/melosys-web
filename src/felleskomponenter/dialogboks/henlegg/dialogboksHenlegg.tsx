import { ChangeEventHandler, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../hooks/redux";

import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";
import * as Utils from "../../../utils";

import { Feilmeldinger } from "../../feilmeldinger";
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

interface DialogboksHenleggSakProps {
  avbryt: () => void;
}

export function DialogboksHenleggSak({ avbryt }: DialogboksHenleggSakProps) {
  const dispatch = useAppDispatch();
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
      }),
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
    <Nav.Modal onClose={undefined} open header={{ heading: "Henlegg saken", closeButton: false }}>
      <Nav.Modal.Body>
        <Feilmeldinger />
        <Feilmeldinger className={dialogboksHenleggClassName.element("kontrollfeil")} />
        {feil && (
          <Nav.Alert variant="error" className={dialogboksHenleggClassName.element("feilmeldinger")}>
            {feil}
          </Nav.Alert>
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
      </Nav.Modal.Body>
      <Nav.Modal.Footer>
        <Knapperad
          bekreft={handleHenlegg}
          bekreftTekst="Henlegg saken"
          bekreftRedigerbart={erBegrunnelseValgt && harIngenFeilmeldinger}
          avbryt={avbryt}
          avbrytTekst="Avbryt"
          redigerbart
        />
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
}

export default DialogboksHenleggSak;
