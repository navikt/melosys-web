import React, { Component } from "react";
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

interface Props extends PropsFromRedux {
  redigerbart: boolean;
}

interface State {
  aktivtStegIndex: number;
  aktuelleSteg: AktueltSteg[];
}

class Stegvelger extends Component<Props, State> {
  state = {
    aktivtStegIndex: 0,
    aktuelleSteg: [],
  };

  componentDidMount() {
    this.props.hentStegData(this.props.behandlingID);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.stegdata !== this.props.stegdata && !Utils._isEmpty(this.props.stegdata)) {
      this.setState({ aktuelleSteg: this.props.stegdata.map(this.mapOmTilAktuelleSteg) });
    }
  }

  oppdaterAktivtSteg = (nesteStegIndex: number) => {
    this.setState({
      aktivtStegIndex: nesteStegIndex,
      aktuelleSteg: this.state.aktuelleSteg?.map((steg: AktueltSteg) => ({
        ...steg,
        aktivtSteg: steg.stegPosisjon === nesteStegIndex,
      })),
    });
  };

  fortsett = () => {
    this.oppdaterAktivtSteg(this.state.aktivtStegIndex + 1);
  };

  tilbake = () => {
    this.oppdaterAktivtSteg(this.state.aktivtStegIndex - 1);
  };

  mapOmTilAktuelleSteg = (singelSteg: StegData, index: number): AktueltSteg => {
    const stegMapElement = stegMap[singelSteg.steg];
    return {
      id: singelSteg.steg,
      tittel: stegMapElement.tittel,
      stegPosisjon: index,
      aktivtSteg: this.state.aktivtStegIndex === index,
      komponent: stegMapElement.komponent,
      status: singelSteg.status === "FERDIG" ? FANE_STATUS.OK : FANE_STATUS.UBEHANDLET,
      data: { redigerbart: this.props.redigerbart },
      handlers: { fortsett: this.fortsett, tilbake: this.tilbake },
    };
  };

  render() {
    return (
      <TrackVisibility partialVisibility>
        {() => (
          <div className="stegvelger panelSeksjon">
            {this.state.aktuelleSteg && (
              <div>
                <StegLinje steg={this.state.aktuelleSteg} stegKlikk={this.oppdaterAktivtSteg} />
                {this.state.aktuelleSteg?.map((item: AktueltSteg) => (
                  <StegFane key={item.id} faneData={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </TrackVisibility>
    );
  }
}

export default connector(Stegvelger);
