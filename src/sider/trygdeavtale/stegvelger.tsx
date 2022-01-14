import React, { Component } from "react";
import TrackVisibility from "react-on-screen";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { get as getValueAtPath } from "lodash";

import MKV from "../../melosyskodeverk";
import * as Api from "../../services/api";
import * as KV from "../../kodeverk";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import StegLinje from "../../felleskomponenter/stegLinje";
import StegFane from "../../felleskomponenter/stegFane";
import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import BehandlingsgrunnlagFeilmeldinger from "../../felleskomponenter/behandlingsgrunnlagFeilmeldinger";
import VurderingInngang from "./stegKomponenter/vurderingInngang";
import VurderingAvklarVirksomhet from "./stegKomponenter/vurderingAvklarVirksomhet";
import VurderingBestemmelse from "./stegKomponenter/vurderingBestemmelse";
import VurderingFamilie from "./stegKomponenter/vurderingFamilie";
import VurderingVedtak from "./stegKomponenter/vurderingVedtak";

import { behandlingsgrunnlagSelectors } from "../../ducks/behandlingsgrunnlag";
import { datalastingOperations } from "../../ducks/datalasting";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { formSelectors } from "../../ducks/form";

import "./stegvelger.css";

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
interface KontrollFeil {
  kode: string;
  felter: string[];
}

const stegMap = {
  INNGANG: { tittel: "Inngang", komponent: VurderingInngang },
  AVKLAR_VIRKSOMHET: { tittel: "Avklar virksomhet", komponent: VurderingAvklarVirksomhet },
  BESTEMMELSE: { tittel: "Bestemmelse", komponent: VurderingBestemmelse },
  FAMILIE: { tittel: "Familie", komponent: VurderingFamilie },
  VEDTAK: { tittel: "Vedtak", komponent: VurderingVedtak },
};

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  behandlingsgrunnlag: behandlingsgrunnlagSelectors.BehandlingsgrunnlagDataSelector(state),
  behandlingsgrunnlagFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props extends PropsFromRedux {
  annenBehandlingOppfriskes: boolean;
  oppfriskOgLastInnSaksopplysninger: () => void;
  tilForsiden: () => void;
  redigerbart: boolean;
}

interface State {
  aktivtStegIndex: number;
  aktuelleSteg: AktueltSteg[];
  valideringFeil: KontrollFeil[];
  visBehandlingsgrunnlagFeilmeldinger: boolean;
}

class Stegvelger extends Component<Props, State> {
  state = {
    aktivtStegIndex: 0,
    aktuelleSteg: [],
    valideringFeil: [],
    visBehandlingsgrunnlagFeilmeldinger: false,
  };

  componentDidMount() {
    this.hentFlytOgOppdaterAktuelleSteg();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const soknadValues = this.props.soknadForm?.values;
    const prevSoknadValues = prevProps.soknadForm?.values;

    if (
      this.harEndringer(soknadValues, prevSoknadValues, "juridiskArbeidsgiverNorge.ekstraArbeidsgivere") ||
      this.harEndringer(soknadValues, prevSoknadValues, "selvstendigForetak") ||
      this.harEndringer(soknadValues, prevSoknadValues, "arbeidsforholdUtland") ||
      this.harEndringer(soknadValues, prevSoknadValues, "selvstendigNaeringsvirksomhetUtland") ||
      this.harEndringer(soknadValues, prevSoknadValues, "medfolgendeBarn") ||
      this.harEndringer(soknadValues, prevSoknadValues, "medfolgendeEktefelleSamboer")
    ) {
      this.debouncedOppdaterSteg();
    }
  }

  hentFlytOgOppdaterAktuelleSteg = () =>
    Api.Trygdeavtale.hentFlyt(this.props.behandlingID).then((response) =>
      this.setState({ aktuelleSteg: this.mapFlytResDtoOmTilAktuelleSteg(response) })
    );

  harEndringer = (propsObject: any, prevPropsObject: any, path: string) => {
    const propsValue = getValueAtPath(propsObject, path);
    const prevPropsValue = getValueAtPath(prevPropsObject, path);
    return propsValue && prevPropsValue && !Utils._isEqual(propsValue, prevPropsValue);
  };

  resetFlyt = () => {
    return Api.Trygdeavtale.resetFlyt(this.props.behandlingID).then((response) =>
      this.setState({ aktuelleSteg: this.mapFlytResDtoOmTilAktuelleSteg(response) })
    );
  };

  oppdaterFlyt = (request: Api.Trygdeavtale.FlytReqDto) => {
    Api.Trygdeavtale.sendFlyt(this.props.behandlingID, request).then((response) =>
      this.setState({ aktuelleSteg: this.mapFlytResDtoOmTilAktuelleSteg(response) })
    );
  };
  debouncedOppdaterFlyt = Utils._debounce(this.oppdaterFlyt, 100);

  mapFlytResDtoOmTilAktuelleSteg = (response: Api.Trygdeavtale.FlytResDto): AktueltSteg[] => {
    const data = {
      data: response.data,
      resultat: response.resultat,
      redigerbart: this.props.redigerbart,
      annenBehandlingOppfriskes: this.props.annenBehandlingOppfriskes,
    };

    const handlers = {
      fortsett: this.fortsett,
      tilbake: this.tilbake,
      oppdaterFlyt: this.debouncedOppdaterFlyt,
      resetFlyt: this.resetFlyt,
      tilForsiden: this.props.tilForsiden,
      oppfriskOgLastInnSaksopplysninger: this.props.oppfriskOgLastInnSaksopplysninger,
      hentFlytOgOppdaterAktuelleSteg: this.hentFlytOgOppdaterAktuelleSteg,
      lagreOgFatteVedtak: this.lagreOgFatteVedtak,
      oppdaterValideringFeil: this.oppdaterValideringFeil,
    };

    return response.steg?.map((enkeltSteg: Api.Trygdeavtale.Steg) => {
      const stegMapElement = stegMap[enkeltSteg.navn];
      return {
        id: enkeltSteg.navn,
        tittel: stegMapElement.tittel,
        stegPosisjon: enkeltSteg.nummer,
        aktivtSteg: this.state.aktivtStegIndex === enkeltSteg.nummer,
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
      props: { behandlingsgrunnlagFeilmeldinger },
      hentFlytOgOppdaterAktuelleSteg,
    } = this;

    if (Utils._isEmpty(behandlingsgrunnlagFeilmeldinger)) {
      hentFlytOgOppdaterAktuelleSteg();
    }
  };
  debouncedOppdaterSteg = Utils._debounce(this.oppdaterSteg, 1250);

  harBehandlingsgrunnlagFeilmeldinger = () => {
    const harFeilmeldinger = !Utils._isEmpty(this.props.behandlingsgrunnlagFeilmeldinger);
    this.setState({ visBehandlingsgrunnlagFeilmeldinger: harFeilmeldinger });
    return harFeilmeldinger;
  };

  oppdaterValideringFeil = (data: Api.Saksflyt.Vedtak.FattVedtakReqDto, oppdaterRegisteropplysninger: boolean) => {
    Api.Saksflyt.Vedtak.kontroller(this.props.behandlingID, oppdaterRegisteropplysninger, data)
      .then(() => this.setState({ valideringFeil: [] }))
      .catch((response) => this.setState({ valideringFeil: response?.body?.feilkoder }));
  };

  oppdaterAktivtSteg = async (nesteStegIndex: number) => {
    const {
      state: { aktuelleSteg },
      harBehandlingsgrunnlagFeilmeldinger,
    } = this;

    if (!harBehandlingsgrunnlagFeilmeldinger()) {
      this.setState({
        aktivtStegIndex: nesteStegIndex,
        aktuelleSteg: aktuelleSteg.map((steg: AktueltSteg) => ({
          ...steg,
          aktivtSteg: steg.stegPosisjon === nesteStegIndex,
        })),
      });
    }
  };

  lagreOgFatteVedtak = async (data: Api.Saksflyt.Vedtak.FattVedtakTrygdeavtaleReqDto) => {
    const {
      props: { behandlingID, lagreAllData, tilForsiden },
      harBehandlingsgrunnlagFeilmeldinger,
    } = this;

    if (!harBehandlingsgrunnlagFeilmeldinger()) {
      await lagreAllData();
      return Api.Saksflyt.Vedtak.fatt(behandlingID, data)
        .then(() => tilForsiden())
        .catch((response) => this.setState({ valideringFeil: response?.body?.feilkoder }));
    }
    return Promise.resolve();
  };

  fortsett = () => {
    this.oppdaterAktivtSteg(this.state.aktivtStegIndex + 1);
  };

  tilbake = () => {
    this.oppdaterAktivtSteg(this.state.aktivtStegIndex - 1);
  };

  mapFeilmeldinger = (valideringsfeil: KontrollFeil[]) => (
    <>
      {valideringsfeil.length === 1 ? (
        KV.kodeTilTerm(valideringsfeil[0].kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser)
      ) : (
        <ul className="valideringsfeil__liste">
          {valideringsfeil.map((feil) => (
            <li key={feil.kode}>{KV.kodeTilTerm(feil.kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser)}</li>
          ))}
        </ul>
      )}
    </>
  );

  render() {
    const {
      state: { aktuelleSteg, visBehandlingsgrunnlagFeilmeldinger, valideringFeil },
      props: { behandlingstype },
      oppdaterAktivtSteg,
      mapFeilmeldinger,
    } = this;

    const vedtakStegErAktivt = aktuelleSteg?.find((steg: AktueltSteg) => steg.vedtakSteg && steg.aktivtSteg);
    const inngangStegErAktivt = aktuelleSteg?.find((steg: AktueltSteg) => steg.id === "INNGANG" && steg.aktivtSteg);
    const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

    return (
      <TrackVisibility partialVisibility>
        {() => (
          <div className="stegvelger panelSeksjon">
            {aktuelleSteg && (
              <div>
                <StegLinje steg={aktuelleSteg} stegKlikk={oppdaterAktivtSteg} />
                {!Utils._isEmpty(valideringFeil) && vedtakStegErAktivt && (
                  <Nav.AlertStripeFeil className="varselstripe">{mapFeilmeldinger(valideringFeil)}</Nav.AlertStripeFeil>
                )}
                {erNyVurdering && inngangStegErAktivt && (
                  <Nav.AlertStripeAdvarsel className="varselstripe">
                    <Nav.Typo.Normaltekst className="varselstripe__overskrift">
                      Ny behandling av sak
                    </Nav.Typo.Normaltekst>
                    <Nav.Typo.Normaltekst>
                      Du har startet en ny behandling av en sak der tidligere behandling er avsluttet. Sjekk sakens
                      opplysninger og vurder videre behandling.
                    </Nav.Typo.Normaltekst>
                  </Nav.AlertStripeAdvarsel>
                )}
                {aktuelleSteg.map((item: AktueltSteg) => (
                  <StegFane key={item.id} faneData={item} />
                ))}
              </div>
            )}
            {visBehandlingsgrunnlagFeilmeldinger && <BehandlingsgrunnlagFeilmeldinger />}
          </div>
        )}
      </TrackVisibility>
    );
  }
}

export default connector(Stegvelger);
