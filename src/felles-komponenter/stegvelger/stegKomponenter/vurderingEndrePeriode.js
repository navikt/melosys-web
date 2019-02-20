import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import * as MKV from 'melosys-kodeverk';

import PdfLenkeListe from '../../pdfLenkeListe';
import { KodeTermSelect } from '../../kodeTermSelect';
import * as Nav from '../../../utils/navFrontend';

import { fagsakSelectors } from '../../../ducks/fagsaker';
import { lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder';

import { formatterDatoTilNorsk, erIPeriode, vaskInputDato, formatterDatoTilISO } from '../../../utils/dato';

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

  validerTomDato = () => {
    const { nyTomDato } = this.state;
    const vasketTomDato = vaskInputDato(nyTomDato);
    if (vasketTomDato) {
      return true;
    }
    this.setState({ nyTomDatoFeilmelding: { feilmelding: 'Ugyldig dato' } });
    return false;
  };

  validerBegrunnelse = () => {
    const begrunnelseValid = this.state.begrunnelsekode !== '';
    if (begrunnelseValid) {
      return true;
    }
    this.setState({ begrunnelseFeilmelding: { feilmelding: 'Ugyldig begrunnelse' } });
    return false;
  };

  validerPeriode = () => {
    const { nyTomDato } = this.state;
    const { fomDato, tomDato } = this.props.lovvalgsPeriode;
    const periodeValid = erIPeriode(fomDato, tomDato, formatterDatoTilISO(nyTomDato));
    if (periodeValid) {
      return true;
    }
    this.setState({ nyTomDatoFeilmelding: { feilmelding: 'Ugyldig periode' } });
    return false;
  };

  vedBegrunnelseEndret = event => {
    this.setState({ begrunnelsekode: event.target.value, begrunnelseFeilmelding: undefined });
  };

  vedKlikkEndrePeriode = () => {
    if (this.validerAlt()) {
      const { lovvalgsPeriode: { fomDato } } = this.props;
      const { begrunnelsekode, nyTomDato } = this.state;
      this.props.endrePeriode({
        periode: {
          fomdato: fomDato,
          tomdato: formatterDatoTilISO(nyTomDato),
        },
        begrunnelsekode,
      });
    }
  };

  validerAlt = () => this.validerTomDato() && this.validerPeriode() && this.validerBegrunnelse();

  vedKlikkPdf = async () => this.validerAlt();

  render() {
    const { oppsummering, lovvalgsPeriode: { fomDato, tomDato } } = this.props;

    const {
      vedTomDatoEndring,
      vedBegrunnelseEndret,
      vedKlikkEndrePeriode,
      vedKlikkPdf,
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

    const formattertFomDato = formatterDatoTilNorsk(fomDato);
    const formattertTomDato = formatterDatoTilNorsk(tomDato);

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
              onChange={vedBegrunnelseEndret}
            />
          </Nav.Column>
        </Nav.Row>
        <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} vedKlikk={vedKlikkPdf} />
        <Nav.Hovedknapp onClick={vedKlikkEndrePeriode} >Endre periode</Nav.Hovedknapp>
      </div>
    );
  }
}

VurderingEndrePeriode.propTypes = {
  oppsummering: MPT.Oppsummering.isRequired,
  lovvalgsPeriode: PT.object.isRequired,
  endrePeriode: PT.func.isRequired,
  fomDato: PT.string,
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
