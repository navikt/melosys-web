import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import * as MKV from 'melosys-kodeverk';

import * as Utils from '../../../utils';
import PdfLenkeListe from '../../pdfLenkeListe';
import { KodeTermSelect } from '../../kodeTermSelect';

import * as Nav from '../../../utils/navFrontend';
import { fagsakSelectors } from '../../../ducks/fagsaker';

import { lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder';

import * as MPT from '../../../proptypes';

import './vurderingEndrePeriode.css';
import { soknadOperations } from '../../../ducks/soknad';

export class VurderingEndrePeriode extends React.Component {
  state = {
    nyTomDato: '',
    nyTomDatoFeilmelding: undefined,
    begrunnelsekode: '',
    begrunnelseFeilmelding: undefined,
    fritekst: null,
  };

  vedTomDatoEndring = event => {
    this.setState({ nyTomDato: event.target.value, nyTomDatoFeilmelding: undefined });
  };

  lagrePeriodeForForhandsvisning = () => {
    if (this.erTomDatoOgPeriodeGyldige()) {
      const { lovvalgsPeriode: { fomDato } } = this.props;
      const { nyTomDato } = this.state;

      this.props.endreDatoOgSendLovvalgsperioderHandler(fomDato, Utils.dato.formatterDatoTilISO(nyTomDato));
    }
  };

  erTomDatoOgPeriodeGyldige = () => this.erTomDatoGyldig() && this.erPeriodeGyldig();

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
    const { fomDato, tomDato } = this.props.lovvalgsPeriode;
    return Utils.dato.erIPeriode(fomDato, tomDato, Utils.dato.formatterDatoTilISO(nyTomDato));
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
    const { oppsummering, lovvalgsPeriode: { fomDato, tomDato } } = this.props;

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

    const { behandlingID } = oppsummering;

    const formattertFomDato = Utils.dato.formatterDatoTilNorsk(fomDato);
    const formattertTomDato = Utils.dato.formatterDatoTilNorsk(tomDato);

    return (
      <div className="vurderingEndrePeriode">
        <Nav.Undertittel>Endre lovvalgsperiode</Nav.Undertittel>
        <Nav.Element className="mindreTittel">Opprinnelig lovvalgsperiode</Nav.Element>
        <Nav.Row>
          <Nav.Column xs="3">
            <Nav.Normaltekst>Fra {formattertFomDato}</Nav.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="3">
            <Nav.Normaltekst>Til {formattertTomDato}</Nav.Normaltekst>
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
            />
          </Nav.Column>
        </Nav.Row>
        <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} vedKlikk={vedKlikkPdf} />
        <Nav.Hovedknapp onClick={vedKlikkEndrePeriode} >Fatt vedtak</Nav.Hovedknapp>
      </div>
    );
  }
}

VurderingEndrePeriode.propTypes = {
  oppsummering: MPT.Oppsummering.isRequired,
  lovvalgsPeriode: PT.object.isRequired,
  endreDatoOgSendLovvalgsperioderHandler: PT.func.isRequired,
  fomDato: PT.string,
  tilForsiden: PT.func.isRequired,
  vedtaEndretPeriode: PT.func.isRequired,
};

VurderingEndrePeriode.defaultProps = {
  fomDato: '',
};

const mapStateToProps = state => ({
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  lovvalgsPeriode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterPeriode: periode => dispatch(soknadOperations.oppdaterPeriode(periode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingEndrePeriode);
