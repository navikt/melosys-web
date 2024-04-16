import { Component } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import * as UfiltrertMKV from "@navikt/melosys-kodeverk";

import * as EKV from "eessi-kodeverk";

import MKV from "../../../../melosyskodeverk";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";
import * as MPT from "../../../../proptypes";

import * as KV from "../../../../kodeverk";
import { hentFaktaVerdi } from "../../../../domeneUtils";
import { konverterAvklartfaktaTilStegData } from "../../../../felleskomponenter/stegvelger";
import Dokumentliste from "../../../../felleskomponenter/dokumentliste";
import Datovelger from "../../../../felleskomponenter/datovelger";

import * as Mui from "../../../../felleskomponenter/ui";
import { lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";

import { mottatteOpplysningerOperations } from "../../../../ducks/mottatteOpplysninger";
import "./vurderingEndrePeriode.css";

class VurderingEndrePeriode extends Component {
  state = {
    nyTomDato: "",
    nyTomDatoFeilmelding: undefined,
    begrunnelse: "",
    begrunnelseFeilmelding: undefined,
    opprinneligLovvalgsperiode: { fom: undefined, tom: undefined },
    fritekstSed: "",
    vedtakFeilmelding: null,
    endringPending: false,
  };

  componentDidMount() {
    const {
      behandlingID,
      redigerbart,
      lovvalgsPeriode,
      oppdaterData,
      tilstand: { aarsakEndringPeriodeAvklartfakta },
    } = this.props;

    oppdaterData(
      konverterAvklartfaktaTilStegData(
        MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE,
        aarsakEndringPeriodeAvklartfakta
      )
    );

    this.hentOpprinneligPeriode(behandlingID);

    if (!redigerbart) this.settSluttDato(lovvalgsPeriode.tomDato);

    this.initialiserBegrunnelseState();

    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  settSluttDato = (nyTomDato) => this.setState({ nyTomDato: Utils.dato.formatterDatoTilNorsk(nyTomDato) });

  initialiserBegrunnelseState = () => {
    let begrunnelse = hentFaktaVerdi(this.props.tilstand.aarsakEndringPeriodeAvklartfakta) || "";

    if (begrunnelse === UfiltrertMKV.Koder.begrunnelser.endretperiode.ENDRINGER_ARBEIDSSITUASJON) {
      begrunnelse = KV.kodeTilTerm(begrunnelse, UfiltrertMKV.KTObjects.begrunnelser.endretperiode);
    }

    this.setState({ begrunnelse });
  };

  hentOpprinneligPeriode = async (behandlingID) => {
    const opprinneligLovvalgsperiode = await Api.Lovvalgsperioder.hentOpprinnelig(behandlingID);
    this.setState(opprinneligLovvalgsperiode);
  };

  vedTomDatoEndring = (dato) => {
    this.setState({ nyTomDato: dato, nyTomDatoFeilmelding: undefined });
  };

  lagrePeriodeForForhandsvisning = () => {
    if (this.validerTomDatoOgPeriode()) {
      this.oppdaterPeriodeOgSendEndretLovvalgsperiode();
    }
  };

  validerTomDatoOgPeriode = () => this.validerTomDato() && this.validerPeriode();

  erTomDatoGyldig = () => Utils.dato.vaskInputDato(this.state.nyTomDato);

  validerTomDato = () => {
    const tomDatoGyldig = this.erTomDatoGyldig();
    if (!tomDatoGyldig) this.setState({ nyTomDatoFeilmelding: "Ugyldig dato" });
    return tomDatoGyldig;
  };

  erBegrunnelseGyldig = () => this.state.begrunnelse;

  validerBegrunnelse = () => {
    const begrunnelseGyldig = this.erBegrunnelseGyldig();
    if (!begrunnelseGyldig) this.setState({ begrunnelseFeilmelding: "Ugyldig begrunnelse" });
    return begrunnelseGyldig;
  };

  erPeriodeGyldig = () => {
    const { nyTomDato } = this.state;
    const { fom, tom } = this.state.opprinneligLovvalgsperiode;
    const nyTomDatoISO = Utils.dato.formatterDatoTilISO(nyTomDato);
    return Utils.dato.erIPeriode(fom, tom, nyTomDatoISO);
  };

  validerPeriode = () => {
    const periodeGyldig = this.erPeriodeGyldig();
    if (!periodeGyldig) this.setState({ nyTomDatoFeilmelding: "Ugyldig periode" });
    return periodeGyldig;
  };

  vedBegrunnelseEndring = (event) => {
    this.setState({ begrunnelse: event.target.value, begrunnelseFeilmelding: undefined });
  };

  vedKlikkEndrePeriode = async () => {
    this.setState({ vedtakFeilmelding: null });

    const { endreVedtak } = this.props;
    const { oppdaterPeriodeOgSendEndretLovvalgsperiode, validerAlt } = this;
    const { begrunnelse, fritekstSed } = this.state;

    if (validerAlt()) {
      this.setState({ endringPending: true });

      await oppdaterPeriodeOgSendEndretLovvalgsperiode();

      const data = {
        begrunnelseKode: begrunnelse,
        fritekst: null,
        fritekstSed,
      };

      const endreVedtakRes = await endreVedtak(data);

      if (endreVedtakRes?.data?.data?.status >= 400) {
        this.setState({ vedtakFeilmelding: endreVedtakRes?.data?.data?.message });
      }

      if (this._isMounted) {
        this.setState({ endringPending: false });
      }
    }
  };

  oppdaterPeriodeOgSendEndretLovvalgsperiode = async () => {
    const {
      nyTomDato,
      opprinneligLovvalgsperiode: { fom },
    } = this.state;

    this.props.oppdaterPeriode({ fom, tom: nyTomDato });
    this.props.endreLovvalgsperioderHandler(fom, Utils.dato.formatterDatoTilISO(nyTomDato));
  };

  validerAlt = () => {
    const validPeriode = this.validerPeriode();
    const validDato = this.validerTomDato();
    const validBegrunnelse = this.validerBegrunnelse();

    return validPeriode && validDato && validBegrunnelse;
  };

  vedKlikkPdf = async () => this.validerAlt();

  render() {
    const { behandlingID, redigerbart } = this.props;

    const {
      vedTomDatoEndring,
      vedBegrunnelseEndring,
      vedKlikkEndrePeriode,
      vedKlikkPdf,
      lagrePeriodeForForhandsvisning,
    } = this;

    const {
      nyTomDato,
      nyTomDatoFeilmelding,
      begrunnelse,
      begrunnelseFeilmelding,
      opprinneligLovvalgsperiode: { fom, tom },
      fritekstSed,
      vedtakFeilmelding,
      endringPending,
    } = this.state;

    const pdfDokumenter = [
      {
        dokumentData: {
          produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
          mottaker: MKV.Koder.mottakerroller.BRUKER,
          fritekst: null,
          begrunnelseKode: begrunnelse,
        },
      },
      {
        sedType: EKV.Koder.sedtyper.A009,
        sedData: {
          fritekst: fritekstSed,
        },
      },
    ];

    const formattertOpprinneligFom = Utils.dato.formatterDatoTilNorsk(fom);
    const formattertOpprinneligTom = Utils.dato.formatterDatoTilNorsk(tom);

    return (
      <div className="vurderingEndrePeriode">
        <Nav.Typo.Innholdstittel className="stegvelgertittel">Endre lovvalgsperiode</Nav.Typo.Innholdstittel>
        <Nav.Typo.Element className="mindreTittel">Opprinnelig lovvalgsperiode</Nav.Typo.Element>
        <Nav.Row>
          <Nav.Column xs="3">
            <Nav.Typo.Normaltekst>Fra {formattertOpprinneligFom}</Nav.Typo.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="3">
            <Nav.Typo.Normaltekst>Til {formattertOpprinneligTom}</Nav.Typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>
        <Nav.Typo.Element className="mindreTittel">Ny lovvalgsperiode</Nav.Typo.Element>
        <Nav.Row>
          <Nav.Column xs="3">
            <Datovelger
              label="Startdato"
              value={Utils.dato.norskStringTilDate(formattertOpprinneligFom)}
              disabled
              onChange={null}
            />
          </Nav.Column>
          <Nav.Column xs="3">
            <Datovelger
              label="Sluttdato"
              value={Utils.dato.norskStringTilDate(nyTomDato)}
              onChange={vedTomDatoEndring}
              onBlur={lagrePeriodeForForhandsvisning}
              onCalendarClose={lagrePeriodeForForhandsvisning}
              feil={nyTomDatoFeilmelding}
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6">
            <Mui.KodeTermSelect
              feil={begrunnelseFeilmelding}
              koder={MKV.KTObjects.begrunnelser.endretperiode}
              label="Begrunnelse"
              value={begrunnelse}
              onChange={vedBegrunnelseEndring}
              redigerbart={redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
        {redigerbart && (
          <Nav.Row className="fritekstSed">
            <Nav.Column xs="6">
              <Nav.Textarea
                label="Ytterligere informasjon til SED (valgfri)"
                value={fritekstSed}
                onChange={(e) => this.setState({ fritekstSed: e.target.value })}
                disabled={!redigerbart}
                maxLength={500}
              />
            </Nav.Column>
          </Nav.Row>
        )}
        {redigerbart && (
          <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} validateOnClick={vedKlikkPdf} />
        )}
        {vedtakFeilmelding && (
          <Nav.Alert className="vedtakfeilmelding" variant="error">
            {vedtakFeilmelding}
          </Nav.Alert>
        )}
        {redigerbart && <Nav.Alert variant="info">{KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}</Nav.Alert>}
        <Mui.StegKnapper
          bekreftKnappProps={{
            spinner: endringPending,
            autoDisableVedSpinner: true,
            disabled: !redigerbart,
            onClick: vedKlikkEndrePeriode,
          }}
          bekreftTekst="Fatt vedtak"
        />
      </div>
    );
  }
}

VurderingEndrePeriode.propTypes = {
  behandlingID: PT.number.isRequired,
  lovvalgsPeriode: PT.object.isRequired,
  endreLovvalgsperioderHandler: PT.func.isRequired,
  fomDato: PT.string,
  endreVedtak: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  oppdaterPeriode: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilstand: PT.shape({
    aarsakEndringPeriodeAvklartfakta: MPT.Avklartefakta.isRequired,
  }).isRequired,
};

VurderingEndrePeriode.defaultProps = {
  fomDato: "",
};

const mapStateToProps = (state) => ({
  lovvalgsPeriode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  redigerbart: redigerbartSelectors.EndreLovvalgsPeriodeRedigerbartSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  oppdaterPeriode: (periode) => dispatch(mottatteOpplysningerOperations.oppdaterPeriode(periode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingEndrePeriode);
