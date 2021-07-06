import React, { Component } from "react";
import TrackVisibility from "react-on-screen";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { get as getValueAtPath } from "lodash";

import * as Api from "../../services/api";
import * as Utils from "../../utils";

import StegLinje from "../../felleskomponenter/stegLinje";
import StegFane from "../../felleskomponenter/stegFane";
import { FANE_STATUS } from "../../felleskomponenter/stegvelger/stegMotor/typer";
import { BehandlingsgrunnlagFeilmeldinger } from "../../felleskomponenter/behandlingsgrunnlagFeilmeldinger/behandlingsgrunnlagFeilmeldinger";
import VurderingInngang from "../../felleskomponenter/stegvelger/stegKomponenter/trygdeavtale/vurderingInngang";
import VurderingAvklarVirksomhet from "../../felleskomponenter/stegvelger/stegKomponenter/trygdeavtale/vurderingAvklarVirksomhet";
import VurderingBestemmelse from "../../felleskomponenter/stegvelger/stegKomponenter/trygdeavtale/vurderingBestemmelse";

import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../ducks/behandlingsgrunnlag";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { formSelectors } from "../../ducks/form";

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
  behandlingsgrunnlag: behandlingsgrunnlagSelectors.BehandlingsgrunnlagDataSelector(state),
  behandlingsgrunnlagFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.oppdaterState()),
  lagreBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.lagre()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props extends PropsFromRedux {
  annenBehandlingOppfriskes: boolean;
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger: () => void;
  tilForsiden: () => void;
  redigerbart: boolean;
}

interface State {
  aktivtStegIndex: number;
  aktuelleSteg: AktueltSteg[];
  skalLagreBehandlingsgrunnlag: boolean;
  oppstartErFerdig: boolean;
}

class Stegvelger extends Component<Props, State> {
  state = {
    aktivtStegIndex: 0,
    aktuelleSteg: [],
    skalLagreBehandlingsgrunnlag: false,
    oppstartErFerdig: false,
  };

  componentDidMount() {
    Api.Trygdeavtale.hentStegData(this.props.behandlingID).then((response) =>
      this.setState({ aktuelleSteg: this.mapFlytResDtoOmTilAktuelleSteg(response) })
    );
    setTimeout(() => this.setState({ oppstartErFerdig: true }), 500);
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const soknadValues = this.props.soknadForm?.values;
    const prevSoknadValues = prevProps.soknadForm?.values;

    if (
      this.state.oppstartErFerdig &&
      (this.harEndringer(soknadValues, prevSoknadValues, "juridiskArbeidsgiverNorge.ekstraArbeidsgivere") ||
        this.harEndringer(soknadValues, prevSoknadValues, "selvstendigForetak") ||
        this.harEndringer(soknadValues, prevSoknadValues, "arbeidsforholdUtland") ||
        this.harEndringer(soknadValues, prevSoknadValues, "selvstendigNaeringsvirksomhetUtland") ||
        this.harEndringer(soknadValues, prevSoknadValues, "medfolgendeBarn") ||
        this.harEndringer(soknadValues, prevSoknadValues, "medfolgendeEktefelleSamboer"))
    ) {
      this.behandlingsGrunnlagSkalEndres();
    }
  }

  behandlingsGrunnlagSkalEndres = () => this.setState({ skalLagreBehandlingsgrunnlag: true });

  harEndringer = (propsObject: any, prevPropsObject: any, path: string) =>
    !Utils.isEqual(getValueAtPath(propsObject, path), getValueAtPath(prevPropsObject, path), true);

  slettStegData = () => {
    Api.Trygdeavtale.slettStegData(this.props.behandlingID);
  };

  oppdaterStegData = (request: Api.Trygdeavtale.FlytReqDto) => {
    Api.Trygdeavtale.sendStegData(this.props.behandlingID, request).then((response) =>
      this.setState({ aktuelleSteg: this.mapFlytResDtoOmTilAktuelleSteg(response) })
    );
  };

  mapFlytResDtoOmTilAktuelleSteg = (response: Api.Trygdeavtale.FlytResDto): AktueltSteg[] => {
    const data = {
      data: response.data,
      resultat: response.resultat,
      redigerbart: this.props.redigerbart,
      annenBehandlingOppfriskes: this.props.annenBehandlingOppfriskes,
      lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger: this.props.lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger,
    };

    const handlers = {
      fortsett: this.fortsett,
      tilbake: this.tilbake,
      oppdaterStegData: this.oppdaterStegData,
      slettStegData: this.slettStegData,
      tilForsiden: this.props.tilForsiden,
    };

    return response.steg?.map((singelSteg: Api.Trygdeavtale.Steg) => {
      const stegMapElement = stegMap[singelSteg.navn];
      return {
        id: singelSteg.navn,
        tittel: stegMapElement.tittel,
        stegPosisjon: singelSteg.nummer,
        aktivtSteg: this.state.aktivtStegIndex === singelSteg.nummer,
        komponent: stegMapElement.komponent,
        status: singelSteg.status === "FERDIG" ? FANE_STATUS.OK : FANE_STATUS.UBEHANDLET,
        data: { ...data, steg: singelSteg },
        handlers,
      };
    });
  };

  lagreBehandlingsgrunnlagOgOppdaterStegData = async () => {
    const {
      props: { lagreBehandlingsgrunnlag, behandlingID },
      mapFlytResDtoOmTilAktuelleSteg,
    } = this;

    await lagreBehandlingsgrunnlag();
    Api.Trygdeavtale.hentStegData(behandlingID).then((response) =>
      this.setState({ aktuelleSteg: mapFlytResDtoOmTilAktuelleSteg(response), skalLagreBehandlingsgrunnlag: false })
    );
  };

  harBehandlingsgrunnlagFeilmeldinger = () => !Utils._isEmpty(this.props.behandlingsgrunnlagFeilmeldinger);

  oppdaterAktivtSteg = async (nesteStegIndex: number) => {
    const {
      state: { skalLagreBehandlingsgrunnlag, aktuelleSteg },
      props: { oppdaterBehandlingsgrunnlag },
      harBehandlingsgrunnlagFeilmeldinger,
      lagreBehandlingsgrunnlagOgOppdaterStegData,
    } = this;

    if (!harBehandlingsgrunnlagFeilmeldinger()) {
      if (skalLagreBehandlingsgrunnlag) {
        this.setState({ aktivtStegIndex: nesteStegIndex });
        await lagreBehandlingsgrunnlagOgOppdaterStegData();
      } else {
        await oppdaterBehandlingsgrunnlag();
        this.setState({
          aktivtStegIndex: nesteStegIndex,
          skalLagreBehandlingsgrunnlag: false,
          aktuelleSteg: aktuelleSteg.map((steg: AktueltSteg) => ({
            ...steg,
            aktivtSteg: steg.stegPosisjon === nesteStegIndex,
          })),
        });
      }
    }
  };

  fortsett = () => {
    this.oppdaterAktivtSteg(this.state.aktivtStegIndex + 1);
  };

  tilbake = () => {
    this.oppdaterAktivtSteg(this.state.aktivtStegIndex - 1);
  };

  render() {
    const {
      state: { aktuelleSteg },
      harBehandlingsgrunnlagFeilmeldinger,
      oppdaterAktivtSteg,
    } = this;

    return (
      <TrackVisibility partialVisibility>
        {() => (
          <div className="stegvelger panelSeksjon">
            {aktuelleSteg && (
              <div>
                <StegLinje steg={aktuelleSteg} stegKlikk={oppdaterAktivtSteg} />
                {aktuelleSteg.map((item: AktueltSteg) => (
                  <StegFane key={item.id} faneData={item} />
                ))}
              </div>
            )}
            {harBehandlingsgrunnlagFeilmeldinger() && <BehandlingsgrunnlagFeilmeldinger />}
          </div>
        )}
      </TrackVisibility>
    );
  }
}

export default connector(Stegvelger);
