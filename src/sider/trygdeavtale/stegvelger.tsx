import { Component } from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import MKV from "../../melosyskodeverk";
import * as Api from "../../services/api";
import * as Utils from "../../utils";
import * as Steg from "./stegKomponenter";

import StegLinje from "../../felleskomponenter/stegLinje";
import StegFane from "../../felleskomponenter/stegFane";
import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import MottatteOpplysningerFeilmeldinger from "../../felleskomponenter/mottatteOpplysningerFeilmeldinger";
import { Innsynsmelding, NyVurderingMelding } from "../../felleskomponenter/alertmeldinger";
import { Feilmeldinger } from "../../felleskomponenter/feilmeldinger";

import { mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { datalastingOperations } from "../../ducks/datalasting";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { vedtakOperations } from "../../ducks/vedtak";
import { formSelectors } from "../../ducks/form";
import { redigerbartSelectors } from "../../ducks/redigerbart";

import "./stegvelger.css";
import { modalerSelectors } from "../../ducks/modaler";
import { get as getValueAtPath } from "lodash";

export enum StegStatus {
  FERDIG = "FERDIG",
  IKKE_FERDIG = "IKKE_FERDIG",
}

interface AktueltSteg {
  id: any;
  tittel: string;
  stegPosisjon: number;
  aktivtSteg?: boolean;
  vedtakSteg?: boolean;
  komponent: any;
  status: string;
  data?: object;
  handlers?: object;
}

const stegMap = {
  INNGANG: { tittel: "Inngang", komponent: Steg.VurderingInngang },
  AVKLAR_VIRKSOMHET: { tittel: "Virksomhet", komponent: Steg.VurderingAvklarVirksomhet },
  BESTEMMELSE: { tittel: "Bestemmelse", komponent: Steg.VurderingBestemmelse },
  FAMILIE: { tittel: "Familie", komponent: Steg.VurderingFamilie },
  VEDTAK: { tittel: "Vedtak", komponent: Steg.VurderingVedtak },
};

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  mottatteOpplysninger: mottatteOpplysningerSelectors.MottatteOpplysningerDataSelector(state),
  mottatteOpplysningerFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
  soknadFormValues: formSelectors.SoknadFormValuesSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingUnderOppfriskning: modalerSelectors.BehandlingUnderOppfriskningSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
  fattVedtak: (behandlingID: number, body: Api.Saksflyt.Vedtak.FattVedtakTrygdeavtaleReqDto) =>
    dispatch(vedtakOperations.fatt(behandlingID, body)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface State {
  aktivtStegIndex: number;
  aktuelleSteg: AktueltSteg[];
  visMottatteOpplysningerFeilmeldinger: boolean;
  endreFokus: boolean;
}

class Stegvelger extends Component<PropsFromRedux, State> {
  static harEndringer = (propsObject: any, prevPropsObject: any, path: string) => {
    const propsValue = getValueAtPath(propsObject, path);
    const prevPropsValue = getValueAtPath(prevPropsObject, path);
    return propsValue && prevPropsValue && !Utils._isEqual(propsValue, prevPropsValue);
  };

  constructor(props: PropsFromRedux) {
    super(props);
    this.state = {
      aktivtStegIndex: 0,
      aktuelleSteg: [],
      visMottatteOpplysningerFeilmeldinger: false,
      endreFokus: false,
    };
  }

  componentDidMount() {
    this.hentFlytOgOppdaterAktuelleSteg();
  }

  componentDidUpdate(prevProps: Readonly<PropsFromRedux>) {
    const { behandlingUnderOppfriskning, soknadFormValues } = this.props;
    const soknadValues = soknadFormValues;
    const prevSoknadValues = prevProps.soknadFormValues;

    if (
      Stegvelger.harEndringer(soknadValues, prevSoknadValues, "juridiskArbeidsgiverNorge.ekstraArbeidsgivere") ||
      Stegvelger.harEndringer(soknadValues, prevSoknadValues, "selvstendigForetak") ||
      Stegvelger.harEndringer(soknadValues, prevSoknadValues, "arbeidsforholdUtland") ||
      Stegvelger.harEndringer(soknadValues, prevSoknadValues, "selvstendigNaeringsvirksomhetUtland") ||
      Stegvelger.harEndringer(soknadValues, prevSoknadValues, "medfolgendeBarn") ||
      Stegvelger.harEndringer(soknadValues, prevSoknadValues, "medfolgendeEktefelleSamboer")
    ) {
      this.debouncedOppdaterSteg();
    }

    if (prevProps.behandlingUnderOppfriskning && !behandlingUnderOppfriskning) {
      this.oppfriskFlyt();
    }

    const { endreFokus, aktuelleSteg, aktivtStegIndex } = this.state;
    if (endreFokus) {
      const aktueltStegId = aktuelleSteg[aktivtStegIndex].id;
      Utils.navigasjon.flyttFokusTilHtmlElementFraId(aktueltStegId);
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ endreFokus: false });
      /* eslint-enable-next-line react/no-did-update-set-state */
    }
  }

  hentFlytOgOppdaterAktuelleSteg = () => {
    const { behandlingID } = this.props;
    Api.Trygdeavtale.hentFlyt(behandlingID).then((response) =>
      this.setState({ aktuelleSteg: this.mapFlytResDtoOmTilAktuelleSteg(response) }),
    );
  };

  oppfriskFlyt = () => {
    const { behandlingID } = this.props;
    Api.Trygdeavtale.oppfriskFlyt(behandlingID).then((response) => {
      const nyeSteg = this.mapFlytResDtoOmTilAktuelleSteg(response);
      this.setState({ aktuelleSteg: nyeSteg });
      this.oppdaterAktivtSteg(nyeSteg.length - 1);
    });
  };

  oppdaterFlyt = (resultat: Api.Trygdeavtale.Resultat, callBack?: () => void) => {
    const { behandlingID } = this.props;
    Api.Trygdeavtale.sendFlyt(behandlingID, resultat).then((response) => {
      this.setState({ aktuelleSteg: this.mapFlytResDtoOmTilAktuelleSteg(response) });
      if (callBack) callBack();
    });
  };

  /* eslint-disable-next-line react/sort-comp */
  debouncedOppdaterFlyt = Utils._debounce(this.oppdaterFlyt, 200);

  mapFlytResDtoOmTilAktuelleSteg = (response: Api.Trygdeavtale.FlytResDto): AktueltSteg[] => {
    const { redigerbart } = this.props;
    const data = {
      data: response.data,
      resultat: response.resultat,
      redigerbart,
    };

    const handlers = {
      fortsett: this.fortsett,
      tilbake: this.tilbake,
      oppdaterFlyt: this.debouncedOppdaterFlyt,
      oppfriskFlyt: this.oppfriskFlyt,
      hentFlytOgOppdaterAktuelleSteg: this.hentFlytOgOppdaterAktuelleSteg,
      lagreOgFatteVedtak: this.lagreOgFatteVedtak,
    };

    return response.steg?.map((enkeltSteg: Api.Trygdeavtale.Steg) => {
      const stegMapElement = stegMap[enkeltSteg.navn];
      const { aktivtStegIndex } = this.state;
      return {
        id: enkeltSteg.navn,
        tittel: stegMapElement.tittel,
        stegPosisjon: enkeltSteg.nummer,
        aktivtSteg: aktivtStegIndex === enkeltSteg.nummer,
        komponent: stegMapElement.komponent,
        status: enkeltSteg.status === StegStatus.FERDIG ? FANE_STATUS.OK : FANE_STATUS.UBEHANDLET,
        data: { ...data, steg: enkeltSteg },
        handlers,
        vedtakSteg: enkeltSteg.navn === "VEDTAK",
      };
    });
  };

  oppdaterSteg = () => {
    const {
      props: { mottatteOpplysningerFeilmeldinger },
      hentFlytOgOppdaterAktuelleSteg,
    } = this;

    if (Utils._isEmpty(mottatteOpplysningerFeilmeldinger)) {
      hentFlytOgOppdaterAktuelleSteg();
    }
  };

  debouncedOppdaterSteg = Utils._debounce(this.oppdaterSteg, 1250);

  harMottatteOpplysningerFeilmeldinger = () => {
    const { mottatteOpplysningerFeilmeldinger } = this.props;
    const harFeilmeldinger = !Utils._isEmpty(mottatteOpplysningerFeilmeldinger);
    this.setState({ visMottatteOpplysningerFeilmeldinger: harFeilmeldinger });
    return harFeilmeldinger;
  };

  oppdaterAktivtSteg = (nesteStegIndex: number) => {
    const {
      state: { aktuelleSteg },
      harMottatteOpplysningerFeilmeldinger,
    } = this;

    if (!harMottatteOpplysningerFeilmeldinger()) {
      this.setState({
        aktivtStegIndex: nesteStegIndex,
        aktuelleSteg: aktuelleSteg.map((steg: AktueltSteg) => ({
          ...steg,
          aktivtSteg: steg.stegPosisjon === nesteStegIndex,
        })),
        endreFokus: true,
      });
    }
  };

  lagreOgFatteVedtak = async (data: Api.Saksflyt.Vedtak.FattVedtakTrygdeavtaleReqDto) => {
    const {
      props: { behandlingID, lagreAllData, fattVedtak },
      harMottatteOpplysningerFeilmeldinger,
    } = this;

    if (!harMottatteOpplysningerFeilmeldinger()) {
      await lagreAllData();
      return fattVedtak(behandlingID, data);
    }
    return Promise.resolve();
  };

  fortsett = () => {
    const { aktivtStegIndex } = this.state;
    this.oppdaterAktivtSteg(aktivtStegIndex + 1);
  };

  tilbake = () => {
    const { aktivtStegIndex } = this.state;
    this.oppdaterAktivtSteg(aktivtStegIndex - 1);
  };

  render() {
    const {
      state: { aktuelleSteg, visMottatteOpplysningerFeilmeldinger },
      props: { behandlingstype, redigerbart },
      oppdaterAktivtSteg,
    } = this;

    const vedtakStegErAktivt = aktuelleSteg?.find((steg: AktueltSteg) => steg.vedtakSteg && steg.aktivtSteg);
    const inngangStegErAktivt = aktuelleSteg?.find((steg: AktueltSteg) => steg.id === "INNGANG" && steg.aktivtSteg);
    const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

    return (
      <div className="stegvelger panelSeksjon">
        {aktuelleSteg && (
          <div>
            <StegLinje steg={aktuelleSteg} stegKlikk={oppdaterAktivtSteg} />
            {!redigerbart && <Innsynsmelding />}
            {vedtakStegErAktivt && <Feilmeldinger />}
            {erNyVurdering && redigerbart && inngangStegErAktivt && <NyVurderingMelding />}
            {aktuelleSteg.map((item: AktueltSteg) => (
              <StegFane id={item.id} key={item.id} faneData={item} />
            ))}
          </div>
        )}
        {visMottatteOpplysningerFeilmeldinger && <MottatteOpplysningerFeilmeldinger />}
      </div>
    );
  }
}

export default connector(Stegvelger);
