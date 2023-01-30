import React, { Component } from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { get as getValueAtPath } from "lodash";

import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../../melosyskodeverk";
import * as Api from "../../services/api";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";
import * as Steg from "./stegKomponenter";

import StegLinje from "../../felleskomponenter/stegLinje";
import StegFane from "../../felleskomponenter/stegFane";
import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import MottatteOpplysningerFeilmeldinger from "../../felleskomponenter/mottatteOpplysningerFeilmeldinger";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { datalastingOperations } from "../../ducks/datalasting";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { formSelectors } from "../../ducks/form";

import "./stegvelger.css";
import { Feilmeldinger } from "../../felleskomponenter/feilmeldinger";
import { feiletResponsSelectors } from "../../ducks/feiletRespons";
import { vedtakOperations } from "../../ducks/vedtak";
// import {VurderingBestemmelse, VurderingInngang, VurderingVedtak} from "./stegKomponenter";
import {
  MottatteOpplysningerReqDto,
  MottatteOpplysningerResDto,
} from "../../services/modules/mottatteOpplysninger/types";
import { FlytResDto, Resultat, StegData, EnkeltSteg, StegNavn } from "../../services/modules/ikkeYrkesaktiv/flyt";

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
  BESTEMMELSE: { tittel: "Bestemmelse", komponent: Steg.VurderingBestemmelse },
  VEDTAK: { tittel: "Vedtak", komponent: Steg.VurderingVedtak },
};

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  mottatteOpplysninger: mottatteOpplysningerSelectors.MottatteOpplysningerDataSelector(state),
  mottatteOpplysningerFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
  feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
  fattVedtak: (behandlingID: number, body: Api.Saksflyt.Vedtak.FattVedtakTrygdeavtaleReqDto) =>
    dispatch(vedtakOperations.fatt(behandlingID, body)),
  lagreMottatteOpplysningerHandler: () => dispatch(mottatteOpplysningerOperations.lagre()),
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
  visMottatteOpplysningerFeilmeldinger: boolean;
  endreFokus: boolean;
}

class Stegvelger extends Component<Props, State> {
  state = {
    aktivtStegIndex: 0,
    aktuelleSteg: [],
    visMottatteOpplysningerFeilmeldinger: false,
    endreFokus: false,
  };

  componentDidMount() {
    this.oppdaterStegListe();
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

    if (this.state.endreFokus) {
      // @ts-ignore
      const aktueltStegId = this.state.aktuelleSteg[this.state.aktivtStegIndex].id;
      Utils.navigasjon.flyttFokusTilHtmlElementFraId(aktueltStegId);
      this.setState({ endreFokus: false });
    }
  }

  oppdaterStegListe = () => {
    Api.MottatteOpplysninger.hent(this.props.behandlingID).then((response) =>
      this.setState({ aktuelleSteg: this.mottatteOpplysningerTilStegListe(response) })
    );
  };

  harEndringer = (propsObject: any, prevPropsObject: any, path: string) => {
    const propsValue = getValueAtPath(propsObject, path);
    const prevPropsValue = getValueAtPath(prevPropsObject, path);
    return propsValue && prevPropsValue && !Utils._isEqual(propsValue, prevPropsValue);
  };

  oppdaterFlyt = (resultat: MottatteOpplysningerReqDto, callBack?: () => void) => {
    Api.MottatteOpplysninger.send(this.props.behandlingID, resultat).then((response) => {
      this.setState({ aktuelleSteg: this.mottatteOpplysningerTilStegListe(response) });
      if (callBack) callBack();
    });
  };
  debouncedOppdaterFlyt = Utils._debounce(this.oppdaterFlyt, 200);

  mottatteOpplysningerTilStegListe = (response: MottatteOpplysningerResDto): AktueltSteg[] => {
    const data = {
      data: response.data,
      redigerbart: this.props.redigerbart,
      annenBehandlingOppfriskes: this.props.annenBehandlingOppfriskes,
    };

    const handlers = {
      fortsett: this.fortsett,
      tilbake: this.tilbake,
      oppdaterFlyt: this.debouncedOppdaterFlyt,
      tilForsiden: this.props.tilForsiden,
      oppfriskOgLastInnSaksopplysninger: this.props.oppfriskOgLastInnSaksopplysninger,
      oppdaterStegListe: this.oppdaterStegListe,
      lagreOgFatteVedtak: this.lagreOgFatteVedtak,
    };

    const resultat: Resultat = {};

    const obj1: KTObject = { kode: "001", term: "Value 1" };
    const obj2: KTObject = { kode: "002", term: null };

    const stegData: StegData = {
      landValg: [obj1],
      landValgUtenStøtte: [obj2],
    };

    const steg1: EnkeltSteg = {
      navn: StegNavn.INNGANG,
      nummer: 0,
      status: StegStatus.IKKE_FERDIG,
    };

    const steg2: EnkeltSteg = {
      navn: StegNavn.BESTEMMELSE,
      nummer: 1,
      status: StegStatus.IKKE_FERDIG,
    };

    const steg3: EnkeltSteg = {
      navn: StegNavn.VEDTAK,
      nummer: 2,
      status: StegStatus.IKKE_FERDIG,
    };

    const res: FlytResDto = {
      data: stegData,
      resultat,
      steg: [steg1, steg2, steg3],
    };

    return res.steg?.map((enkeltSteg: EnkeltSteg) => {
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

    /* return response.steg?.map((enkeltSteg: Api.IkkeYrkesaktiv.Steg) => {
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
    });*/
  };

  oppdaterSteg = () => {
    const {
      props: { mottatteOpplysningerFeilmeldinger },
      oppdaterStegListe,
    } = this;

    if (Utils._isEmpty(mottatteOpplysningerFeilmeldinger)) {
      oppdaterStegListe();
    }
  };
  debouncedOppdaterSteg = Utils._debounce(this.oppdaterSteg, 1250);

  harMottatteOpplysningerFeilmeldinger = () => {
    const harFeilmeldinger = !Utils._isEmpty(this.props.mottatteOpplysningerFeilmeldinger);
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
      });
    }
  };

  stegKlikkHandler = (nesteStegIndex: number) => {
    this.oppdaterAktivtSteg(nesteStegIndex);
    this.setState({ endreFokus: true });
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
    this.oppdaterAktivtSteg(this.state.aktivtStegIndex + 1);
  };

  tilbake = () => {
    this.oppdaterAktivtSteg(this.state.aktivtStegIndex - 1);
  };

  render() {
    const {
      state: { aktuelleSteg, visMottatteOpplysningerFeilmeldinger },
      props: { behandlingstype, redigerbart, feilmeldinger },
      stegKlikkHandler,
    } = this;

    const vedtakStegErAktivt = aktuelleSteg?.find((steg: AktueltSteg) => steg.vedtakSteg && steg.aktivtSteg);
    const inngangStegErAktivt = aktuelleSteg?.find((steg: AktueltSteg) => steg.id === "INNGANG" && steg.aktivtSteg);
    const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

    return (
      <div className="stegvelger panelSeksjon">
        {aktuelleSteg && (
          <div>
            <StegLinje steg={aktuelleSteg} stegKlikk={stegKlikkHandler} />
            {vedtakStegErAktivt && <Feilmeldinger feilmeldinger={feilmeldinger} />}
            {erNyVurdering && redigerbart && inngangStegErAktivt && (
              <Nav.AlertStripeAdvarsel className="varselstripe">
                <Nav.Typo.Normaltekst className="varselstripe__overskrift">Ny behandling av sak</Nav.Typo.Normaltekst>
                <Nav.Typo.Normaltekst>
                  Du har startet en ny behandling av en sak der tidligere behandling er avsluttet. Sjekk sakens
                  opplysninger og vurder videre behandling.
                </Nav.Typo.Normaltekst>
              </Nav.AlertStripeAdvarsel>
            )}
            {aktuelleSteg.map((item: AktueltSteg) => (
              <StegFane id={item.id} key={item.id} faneData={item} />
            ))}
            {vedtakStegErAktivt}
          </div>
        )}
        {visMottatteOpplysningerFeilmeldinger && <MottatteOpplysningerFeilmeldinger />}
      </div>
    );
  }
}

export default connector(Stegvelger);
