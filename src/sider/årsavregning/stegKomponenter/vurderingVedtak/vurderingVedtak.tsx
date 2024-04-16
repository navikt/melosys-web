import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MKV from "../../../../melosyskodeverk";
import * as Utils from "../../../../utils";

import * as Mui from "../../../../felleskomponenter/ui";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { kontrollOperations, kontrollSelectors } from "../../../../ducks/kontroll";
import { feiletResponsSelectors } from "../../../../ducks/feiletRespons";

import { vedtakOperations } from "../../../../ducks/vedtak";

import "./vurderingVedtak.css";

interface Props {
  tilbake: () => void;
  aktivtSteg: boolean;
}

export const VurderingVedtak = ({ aktivtSteg, tilbake }: Props) => {
  const dispatch = useDispatch();

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const kontrollfeil = useSelector(kontrollSelectors.KontrollFeilSelector);

  const [kontrollEllerVedtakPending, setKontrollEllerVedtakPending] = useState(false);
  const harIngenFeilmeldinger = Utils._isEmpty(feilmeldinger) && Utils._isEmpty(kontrollfeil);
  const stegErGyldig: boolean = redigerbart && harIngenFeilmeldinger;

  const kontrollerFerdigbehandling = async () => {
    setKontrollEllerVedtakPending(true);
    await dispatch(
      kontrollOperations.kontrollerFerdigbehandling({
        behandlingID,
        vedtakstype: MKV.Koder.vedtakstyper.ÅRSAVREGNING,
        skalRegisteropplysningerOppdateres: false,
      })
    );
    setKontrollEllerVedtakPending(false);
  };

  useEffect(() => {
    if (aktivtSteg) {
      kontrollerFerdigbehandling();
    }
  }, [aktivtSteg]);

  const fattVedtak = async () =>
    dispatch(
      vedtakOperations.fatt(behandlingID, {
        vedtakstype: MKV.Koder.vedtakstyper.ÅRSAVREGNING,
      })
    );

  const handleBekreft = async () => {
    setKontrollEllerVedtakPending(true);
    fattVedtak().then(() => {
      if (!Utils._isEmpty(feilmeldinger) || !Utils._isEmpty(kontrollfeil)) {
        setKontrollEllerVedtakPending(false);
      }
    });
  };

  return (
    <div className="vurderingVedtakÅrsavregning">
      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: handleBekreft,
          disabled: !stegErGyldig,
          autoDisableVedSpinner: true,
          spinner: kontrollEllerVedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
