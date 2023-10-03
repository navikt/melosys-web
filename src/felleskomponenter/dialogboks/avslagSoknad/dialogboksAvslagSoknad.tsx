import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as Ikon from "../../../resources/images";
import * as Utils from "../../../utils";
import * as Api from "../../../services/api";

import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { kontrollOperations, kontrollSelectors } from "../../../ducks/kontroll";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { utpekingsperioderOperations } from "../../../ducks/utpekingsperioder";
import { anmodningsperioderOperations } from "../../../ducks/anmodningsperioder";
import { lovvalgsperioderOperations } from "../../../ducks/lovvalgsperioder";
import { datalastingOperations } from "../../../ducks/datalasting";
import { navigeringOperations } from "../../../ducks/navigering";
import { modalerOperations } from "../../../ducks/modaler";

import { AlertStripeFeil } from "nav-frontend-alertstriper";
import { Feilmeldinger } from "../../feilmeldinger";
import PdfLenkeListe from "../../pdfLenkeListe";
import HtmlEditor from "../../htmlEditor";
import Knapperad from "../../knapperad";

import "./dialogboksAvslagSoknad.css";

interface DialogboksAvslagSoknadProps {
  avbryt: () => void;
  ariaHideApp?: boolean;
}

export const DialogboksAvslagSoknad = ({ ariaHideApp = false, avbryt }: DialogboksAvslagSoknadProps) => {
  const dispatch = useDispatch();
  const [feil, setFeil] = useState<undefined | string>(undefined);

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

  const avslåSøknad = async () => {
    // Hvis perioden er blitt opprettet må den fjernes før avslag.
    await Promise.all([
      dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState()),
      dispatch(anmodningsperioderOperations.resetAnmodningsperioderState()),
      dispatch(utpekingsperioderOperations.resetUtpekingsperioderState()),
    ]);
    await dispatch(datalastingOperations.lagreAllData());

    Api.Saksflyt.Avslag.avslåPgaManglendeOpplysninger(behandlingID, { fritekst: brevFritekst })
      .then(() => {
        dispatch(modalerOperations.skjulAvslagSoknad());
        dispatch(navigeringOperations.tilForsiden());
      })
      .catch((error: any) => setFeil(error.body?.message || error));
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
        <Ikon.VedtakUbehandlet />
        <div>
          <Nav.Typo.Systemtittel className="overskrift">
            Avslå søknaden på grunn av manglende opplysninger
          </Nav.Typo.Systemtittel>
          <Feilmeldinger />
          {feil && <AlertStripeFeil>{feil}</AlertStripeFeil>}
          <HtmlEditor value={brevFritekst} onChange={setBrevFritekst} label="Fritekst til vedtaksbrev" />
          {bekreftRedigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
          <div className="knapperadcontainer">
            <Knapperad
              avbryt={avbryt}
              avbrytTekst="Avbryt"
              bekreft={avslåSøknad}
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
