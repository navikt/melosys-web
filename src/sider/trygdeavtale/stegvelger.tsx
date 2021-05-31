import React, { useEffect, useState } from "react";
import TrackVisibility from "react-on-screen";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";

import * as Utils from "../../utils";

import StegLinje from "../../felleskomponenter/stegvelger/felles/stegLinje";
import StegFane from "../../felleskomponenter/stegvelger/felles/stegFane";
import { FANE_STATUS } from "../../felleskomponenter/stegvelger/stegMotor/typer";
import VurderingInngang from "../../felleskomponenter/stegvelger/stegKomponenter/trygdeavtale/vurderingInngang";
import VurderingAvklarVirksomhet from "../../felleskomponenter/stegvelger/stegKomponenter/trygdeavtale/vurderingAvklarVirksomhet";
import VurderingBestemmelse from "../../felleskomponenter/stegvelger/stegKomponenter/trygdeavtale/vurderingBestemmelse";

import { StegData } from "../../services/modules/trygdeavtale/flyt";
import { trygdeavtaleOperations, trygdeavtaleSelectors } from "../../ducks/trygdeavtale";
import { behandlingerSelectors } from "../../ducks/behandlinger";

import "./stegvelger.css";

interface AktueltSteg {
  id: any;
  tittel: string;
  stegPosisjon: number;
  aktivtSteg?: boolean;
  komponent: any;
  status: string;
  data?: object;
  handlers?: object;
}

const stegMap = {
  INNGANG: { tittel: "Inngang", komponent: VurderingInngang },
  AVKLAR_VIRKSOMHET: { tittel: "Avklar virksomhet", komponent: VurderingAvklarVirksomhet },
  BESTEMMELSE: { tittel: "Bestemmelse", komponent: VurderingBestemmelse },
  FAMILIE: { tittel: "Familie", komponent: VurderingInngang },
  VEDTAK: { tittel: "Vedtak", komponent: VurderingInngang },
};

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  stegdata: trygdeavtaleSelectors.TrygdeavtaleDataSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentStegData: (behandllingID: number) => dispatch(trygdeavtaleOperations.hentStegData(behandllingID)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  redigerbart: boolean;
}

const Stegvelger = ({ behandlingID, hentStegData, redigerbart, stegdata }: PropsFromRedux & Props) => {
  const [aktivtStegIndex, setAktivtStegIndex] = useState(0);
  const [aktuelleSteg, setAktuelleSteg] = useState<AktueltSteg[]>();

  useEffect(() => {
    hentStegData(behandlingID);
  }, []);

  const oppdaterAktivtSteg = (nesteStegIndex: number) => {
    setAktivtStegIndex(nesteStegIndex);
    setAktuelleSteg(aktuelleSteg?.map((steg) => ({ ...steg, aktivtSteg: steg.stegPosisjon === nesteStegIndex })));
  };

  const fortsett = () => {
    oppdaterAktivtSteg(aktivtStegIndex + 1);
  };

  const tilbake = () => {
    oppdaterAktivtSteg(aktivtStegIndex - 1);
  };

  const mapOmTilAktuelleSteg = (singelSteg: StegData, index: number): AktueltSteg => {
    const stegMapElement = stegMap[singelSteg.steg];
    return {
      id: singelSteg.steg,
      tittel: stegMapElement.tittel,
      stegPosisjon: index,
      aktivtSteg: aktivtStegIndex === index,
      komponent: stegMapElement.komponent,
      status: singelSteg.status === "FERDIG" ? FANE_STATUS.OK : FANE_STATUS.UBEHANDLET,
      data: { redigerbart },
      handlers: { fortsett, tilbake },
    };
  };

  useEffect(() => {
    if (!Utils._isEmpty(stegdata)) setAktuelleSteg(stegdata.map(mapOmTilAktuelleSteg));
  }, [stegdata]);

  return (
    <TrackVisibility partialVisibility>
      {() => (
        <div className="stegvelger panelSeksjon">
          {aktuelleSteg && (
            <div>
              <StegLinje steg={aktuelleSteg} stegKlikk={oppdaterAktivtSteg} />
              {aktuelleSteg?.map((item) => (
                <StegFane key={item.id} faneData={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </TrackVisibility>
  );
};

export default connector(Stegvelger);
