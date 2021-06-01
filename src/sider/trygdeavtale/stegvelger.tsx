import React, { Component } from "react";
import TrackVisibility from "react-on-screen";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import * as Api from "../../services/api";

import StegLinje from "../../felleskomponenter/stegLinje";
import StegFane from "../../felleskomponenter/stegFane";
import { FANE_STATUS } from "../../felleskomponenter/stegvelger/stegMotor/typer";
import VurderingInngang from "../../felleskomponenter/stegvelger/stegKomponenter/trygdeavtale/vurderingInngang";
import VurderingAvklarVirksomhet from "../../felleskomponenter/stegvelger/stegKomponenter/trygdeavtale/vurderingAvklarVirksomhet";
import VurderingBestemmelse from "../../felleskomponenter/stegvelger/stegKomponenter/trygdeavtale/vurderingBestemmelse";

import { StegData, StegDataReqDto } from "../../services/modules/trygdeavtale/flyt";
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
const DummySteg = () => <div>Dummy</div>;

const stegMap = {
  INNGANG: { tittel: "Inngang", komponent: VurderingInngang },
  AVKLAR_VIRKSOMHET: { tittel: "Avklar virksomhet", komponent: VurderingAvklarVirksomhet },
  BESTEMMELSE: { tittel: "Bestemmelse", komponent: VurderingBestemmelse },
  FAMILIE: { tittel: "Familie", komponent: DummySteg },
  VEDTAK: { tittel: "Vedtak", komponent: DummySteg },
};

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const connector = connect(mapStateToProps, {});

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
    Api.Trygdeavtale.hentStegData(this.props.behandlingID).then((response) =>
      this.setState({ aktuelleSteg: this.mapOmTilAktuelleSteg(response) })
    );
  }

  oppdaterStegData = (stegData: StegDataReqDto) => {
    Api.Trygdeavtale.sendStegData(this.props.behandlingID, stegData).then((response) =>
      this.setState({ aktuelleSteg: this.mapOmTilAktuelleSteg(response) })
    );
  };

  mapOmTilAktuelleSteg = (stegData: StegData[]): AktueltSteg[] => {
    return stegData?.map((singelSteg: StegData, index: number) => {
      const stegMapElement = stegMap[singelSteg.steg];
      return {
        id: singelSteg.steg,
        tittel: stegMapElement.tittel,
        stegPosisjon: index,
        aktivtSteg: this.state.aktivtStegIndex === index,
        komponent: stegMapElement.komponent,
        status: singelSteg.status === "FERDIG" ? FANE_STATUS.OK : FANE_STATUS.UBEHANDLET,
        data: { redigerbart: this.props.redigerbart, stegData: stegData },
        handlers: { fortsett: this.fortsett, tilbake: this.tilbake, oppdaterStegData: this.oppdaterStegData },
      };
    });
  };

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
