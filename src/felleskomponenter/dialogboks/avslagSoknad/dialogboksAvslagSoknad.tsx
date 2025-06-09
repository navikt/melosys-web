import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../hooks/redux";

import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
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
import { Feilmeldinger } from "../../feilmeldinger";
import HtmlEditor from "../../htmlEditor";
import Knapperad from "../../knapperad";

import Dokumentliste from "../../dokumentliste";

interface DialogboksAvslagSoknadProps {
  avbryt: () => void;
}

export function DialogboksAvslagSoknad({ avbryt }: DialogboksAvslagSoknadProps) {
  const dispatch = useAppDispatch();
  const [feil, setFeil] = useState<undefined | string>(undefined);

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const kontrollfeil = useSelector(kontrollSelectors.KontrollFeilSelector);

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
        }),
      );
      setUtførerKontroll(false);
    })();
  }, []);

  const pdfDokumenter = [
    {
      dokumentData: {
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
      onClose={undefined}
      open
      header={{ heading: "Avslå søknaden på grunn av manglende opplysninger", closeButton: false }}
    >
      <Nav.Modal.Body>
        <Feilmeldinger />
        {feil && <Nav.Alert variant="error">{feil}</Nav.Alert>}
        <HtmlEditor value={brevFritekst} onChange={setBrevFritekst} label="Fritekst til vedtaksbrev" />
        {bekreftRedigerbart && <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
      </Nav.Modal.Body>
      <Nav.Modal.Footer>
        <Knapperad
          avbryt={avbryt}
          avbrytTekst="Avbryt"
          bekreft={avslåSøknad}
          bekreftTekst="Avslå søknad"
          redigerbart={redigerbart}
          bekreftRedigerbart={bekreftRedigerbart}
        />
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
}

export default DialogboksAvslagSoknad;
