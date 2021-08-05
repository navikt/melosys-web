import React from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import * as UfiltrertMKV from "@navikt/melosys-kodeverk";
import * as EKV from "eessi-kodeverk";

import MKV from "../../../melosyskodeverk";

import * as Utils from "../../../utils";
import * as Nav from "../../../utils/navFrontend";
import * as MPT from "../../../proptypes";
import * as KV from "../../../kodeverk";

import { konverterTilStegData, hentFaktaVerdi } from "../../../regler/avklartefakta";

import PdfLenkeListe from "../../pdfLenkeListe";
import * as Mui from "../../ui";

import { lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { behandlingsgrunnlagOperations } from "../../../ducks/behandlingsgrunnlag";

import * as Api from "../../../services/api";

import "./vurderingEndrePeriode.css";

export class VurderingEndrePeriode extends React.Component {
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
      konverterTilStegData(MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE, aarsakEndringPeriodeAvklartfakta)
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

  vedTomDatoEndring = (event) => {
    this.setState({ nyTomDato: event.target.value, nyTomDatoFeilmelding: undefined });
  };

  lagrePeriodeForForhandsvisning = () => {
    if (this.validerTomDatoOgPeriode()) {
      const {
        nyTomDato,
        opprinneligLovvalgsperiode: { fom },
      } = this.state;

      this.props.endreDatoOgSendLovvalgsperioderHandler(fom, Utils.dato.formatterDatoTilISO(nyTomDato));
    }
  };

  validerTomDatoOgPeriode = () => this.validerTomDato() && this.validerPeriode();

  erTomDatoGyldig = () => Utils.dato.vaskInputDato(this.state.nyTomDato);

  validerTomDato = () => {
    const tomDatoGyldig = this.erTomDatoGyldig();
    if (!tomDatoGyldig) this.setState({ nyTomDatoFeilmelding: { feilmelding: "Ugyldig dato" } });
    return tomDatoGyldig;
  };

  erBegrunnelseGyldig = () => this.state.begrunnelse;

  validerBegrunnelse = () => {
    const begrunnelseGyldig = this.erBegrunnelseGyldig();
    if (!begrunnelseGyldig) this.setState({ begrunnelseFeilmelding: { feilmelding: "Ugyldig begrunnelse" } });
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
    if (!periodeGyldig) this.setState({ nyTomDatoFeilmelding: { feilmelding: "Ugyldig periode" } });
    return periodeGyldig;
  };

  vedBegrunnelseEndring = (event) => {
    this.setState({ begrunnelse: event.target.value, begrunnelseFeilmelding: undefined });
  };

  vedKlikkEndrePeriode = async () => {
    this.setState({ vedtakFeilmelding: null });

    const { endreVedtak } = this.props;
    const { sendEndretLovvalgsPeriode, validerAlt } = this;
    const { begrunnelse, fritekstSed } = this.state;

    if (validerAlt()) {
      this.setState({ endringPending: true });

      await sendEndretLovvalgsPeriode();

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

  sendEndretLovvalgsPeriode = async () => {
    const {
      nyTomDato,
      opprinneligLovvalgsperiode: { fom },
    } = this.state;

    this.props.endreDatoOgSendLovvalgsperioderHandler(fom, Utils.dato.formatterDatoTilISO(nyTomDato));
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
        navn: "Forhåndsvis vedtaksbrev og A1",
        type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
        data: {
          mottaker: MKV.Koder.aktoersroller.BRUKER,
          fritekst: null,
          begrunnelseKode: begrunnelse,
        },
      },
      {
        navn: "Forhåndsvis SED A009 ",
        type: EKV.Koder.sedtyper.A009,
        erSed: true,
        data: {
          fritekst: fritekstSed,
        },
      },
    ];

    const formattertOpprinneligFom = Utils.dato.formatterDatoTilNorsk(fom);
    const formattertOpprinneligTom = Utils.dato.formatterDatoTilNorsk(tom);

    return (
      <div className="vurderingEndrePeriode">
        <Nav.Typo.Undertittel>Endre lovvalgsperiode</Nav.Typo.Undertittel>
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
            <Nav.Input bredde="fullbredde" label="Startdato" value={formattertOpprinneligFom} disabled />
          </Nav.Column>
          <Nav.Column xs="3">
            <Nav.Input
              bredde="fullbredde"
              label="Sluttdato"
              onChange={vedTomDatoEndring}
              onBlur={lagrePeriodeForForhandsvisning}
              value={nyTomDato}
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
        {/**
         * Skjuler fritekstfelt inntil fritekst for endret periode støttes i brev.
         * TODO: Vise når brev er klar.
         */
        /* <Nav.Row>
          <Nav.Column xs="6">
            <Nav.Textarea
              label="Fritekst til vedtaksbrev"
              placeholder="Skriv inn tekst til vedtaksbrevet..."
              value={vedtaksbrevFritekst}
              onChange={settVedtaksbrevFritekst}
              maxLength={500}
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row> */}
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
        {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkPdf} />}
        {vedtakFeilmelding && (
          <Nav.AlertStripe className="vedtakfeilmelding" type="feil">
            {vedtakFeilmelding}
          </Nav.AlertStripe>
        )}
        <Nav.Hovedknapp
          spinner={endringPending}
          autoDisableVedSpinner
          disabled={!redigerbart}
          onClick={vedKlikkEndrePeriode}
        >
          Fatt vedtak
        </Nav.Hovedknapp>
      </div>
    );
  }
}

VurderingEndrePeriode.propTypes = {
  behandlingID: PT.number.isRequired,
  lovvalgsPeriode: PT.object.isRequired,
  endreDatoOgSendLovvalgsperioderHandler: PT.func.isRequired,
  fomDato: PT.string,
  endreVedtak: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
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
  oppdaterPeriode: (periode) => dispatch(behandlingsgrunnlagOperations.oppdaterPeriode(periode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingEndrePeriode);
