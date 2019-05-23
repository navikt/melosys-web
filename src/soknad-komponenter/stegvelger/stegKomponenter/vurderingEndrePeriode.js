import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import * as MKV from 'melosys-kodeverk';

import * as Utils from '../../../utils';
import * as Nav from '../../../utils/navFrontend';
import PdfLenkeListe from '../../pdfLenkeListe';
import { KodeTermSelect } from '../../kodeTermSelect';

import { lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder';
import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { soknadOperations } from '../../../ducks/soknad';

import * as API from '../../../services/api';

import './vurderingEndrePeriode.css';

export class VurderingEndrePeriode extends React.Component {
  state = {
    nyTomDato: '',
    nyTomDatoFeilmelding: undefined,
    begrunnelsekode: '',
    begrunnelseFeilmelding: undefined,
    fritekst: null,
    opprinneligLovvalgsperiode: { fom: undefined, tom: undefined },
  };

  componentDidMount() {
    const { behandlingID } = this.props;
    this.hentOpprinneligPeriode(behandlingID);
  }

  hentOpprinneligPeriode = async behandlingID => {
    const opprinneligLovvalgsperiode = await API.OpprinneligLovvalgsperiode.hent(behandlingID);
    this.setState(opprinneligLovvalgsperiode);
  };
  vedTomDatoEndring = event => {
    this.setState({ nyTomDato: event.target.value, nyTomDatoFeilmelding: undefined });
  };

  lagrePeriodeForForhandsvisning = () => {
    if (this.validerTomDatoOgPeriode()) {
      const { lovvalgsPeriode: { fomDato } } = this.props;
      const { nyTomDato } = this.state;

      this.props.endreDatoOgSendLovvalgsperioderHandler(fomDato, Utils.dato.formatterDatoTilISO(nyTomDato));
    }
  };

  validerTomDatoOgPeriode = () => this.validerTomDato() && this.validerPeriode();

  erTomDatoGyldig = () => Utils.dato.vaskInputDato(this.state.nyTomDato);

  validerTomDato = () => {
    const tomDatoGyldig = this.erTomDatoGyldig();
    if (!tomDatoGyldig) this.setState({ nyTomDatoFeilmelding: { feilmelding: 'Ugyldig dato' } });
    return tomDatoGyldig;
  };

  erBegrunnelseGyldig = () => this.state.begrunnelsekode !== '';

  validerBegrunnelse = () => {
    const begrunnelseGyldig = this.erBegrunnelseGyldig();
    if (!begrunnelseGyldig) this.setState({ begrunnelseFeilmelding: { feilmelding: 'Ugyldig begrunnelse' } });
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
    if (!periodeGyldig) this.setState({ nyTomDatoFeilmelding: { feilmelding: 'Ugyldig periode' } });
    return periodeGyldig;
  };

  vedBegrunnelseEndring = event => {
    this.setState({ begrunnelsekode: event.target.value, begrunnelseFeilmelding: undefined });
  };

  vedKlikkEndrePeriode = async () => {
    if (this.validerAlt()) {
      await this.sendEndretLovvalgsPeriode();
      await this.props.vedtaEndretPeriode(this.state.begrunnelsekode);
      this.props.tilForsiden();
    }
  };

  sendEndretLovvalgsPeriode = async () => {
    const { lovvalgsPeriode: { fomDato } } = this.props;
    const { nyTomDato } = this.state;

    this.props.endreDatoOgSendLovvalgsperioderHandler(fomDato, Utils.dato.formatterDatoTilISO(nyTomDato));
  };

  validerAlt = () => this.validerTomDato() && this.validerPeriode() && this.validerBegrunnelse();

  vedKlikkPdf = async () => this.validerAlt();

  render() {
    const { behandlingID, lovvalgsPeriode: { fomDato }, redigerbart } = this.props;

    const {
      vedTomDatoEndring,
      vedBegrunnelseEndring,
      vedKlikkEndrePeriode,
      vedKlikkPdf,
      lagrePeriodeForForhandsvisning,
    } = this;

    const {
      nyTomDato,
      begrunnelsekode,
      nyTomDatoFeilmelding,
      begrunnelseFeilmelding,
      fritekst,
      opprinneligLovvalgsperiode: { fom, tom },
    } = this.state;

    const dokumenter = [
      {
        navn: 'Forhåndsvis vedtaksbrev',
        type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
        data: {
          mottaker: MKV.Koder.aktoersroller.BRUKER,
          fritekst,
          begrunnelseKode: begrunnelsekode,
        },
      },
      {
        navn: 'Forhåndsvis A1',
        type: MKV.Koder.brev.produserbaredokumenter.ATTEST_A1,
        data: {
          mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
          fritekst,
          begrunnelseKode: begrunnelsekode,
        },
      },
    ];

    const formattertFomDato = Utils.dato.formatterDatoTilNorsk(fomDato);

    const formattertOpprinneligFom = Utils.dato.formatterDatoTilNorsk(fom);
    const formattertOpprinneligTom = Utils.dato.formatterDatoTilNorsk(tom);

    return (
      <div className="vurderingEndrePeriode">
        <Nav.Undertittel>Endre lovvalgsperiode</Nav.Undertittel>
        <Nav.Element className="mindreTittel">Opprinnelig lovvalgsperiode</Nav.Element>
        <Nav.Row>
          <Nav.Column xs="3">
            <Nav.Normaltekst>Fra {formattertOpprinneligFom}</Nav.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="3">
            <Nav.Normaltekst>Til {formattertOpprinneligTom}</Nav.Normaltekst>
          </Nav.Column>
        </Nav.Row>
        <Nav.Element className="mindreTittel">Ny lovvalgsperiode</Nav.Element>
        <Nav.Row>
          <Nav.Column xs="3">
            <Nav.Input
              bredde="fullbredde"
              label="Startdato"
              value={formattertFomDato}
              disabled
            />
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
            <KodeTermSelect
              feil={begrunnelseFeilmelding}
              koder={MKV.KTObjects.begrunnelser.endretperiode}
              label="Begrunnelse"
              value={begrunnelsekode}
              onChange={vedBegrunnelseEndring}
              redigerbart={redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
        {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} vedKlikk={vedKlikkPdf} />}
        <Nav.Hovedknapp disabled={!redigerbart} onClick={vedKlikkEndrePeriode} >Fatt vedtak</Nav.Hovedknapp>
      </div>
    );
  }
}

VurderingEndrePeriode.propTypes = {
  behandlingID: PT.number.isRequired,
  lovvalgsPeriode: PT.object.isRequired,
  endreDatoOgSendLovvalgsperioderHandler: PT.func.isRequired,
  fomDato: PT.string,
  tilForsiden: PT.func.isRequired,
  vedtaEndretPeriode: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingEndrePeriode.defaultProps = {
  fomDato: '',
};

const mapStateToProps = state => ({
  lovvalgsPeriode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  redigerbart: behandlingerSelectors.EndreLovvalgsPeriodeRedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterPeriode: periode => dispatch(soknadOperations.oppdaterPeriode(periode)),

});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingEndrePeriode);
