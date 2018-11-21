import React, { Component } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as Skjema from '../../skjema';

import { BOOLSK } from '../../../constants';

class VurderingForutgaendeMedlemskap extends Component {
  componentWillUnmount() {
    const { settSkjemaVerdi } = this.props;
    settSkjemaVerdi('vilkar.forutgaendeMedlemskap', null);
    settSkjemaVerdi('vilkar.forutgaendeMedlemskapBegrunnelser', []);
  }

  render() {
    const {
      bekreftOgFortsett, begrunnelser, tilstand,
    } = this.props;
    const { visBegrunnelser } = tilstand;

    return (
      <div>
        <Nav.Undertittel>Vurdering av forutgående medlemskap</Nav.Undertittel>
        <div>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Søkeren har:">
                <Skjema.Radio feltNavn="vilkar.forutgaendeMedlemskap" value={BOOLSK.SANN} label="Har forutgående medlemskap" />
                <Skjema.Radio feltNavn="vilkar.forutgaendeMedlemskap" value={BOOLSK.USANN} label="Har ikke forutgående medlemskap" />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          { visBegrunnelser && (
            <Nav.Row>
              <Nav.Column xs="12" md="10" lg="8">
                <Nav.Fieldset legend="Begrunnelse:">
                  <Skjema.ListeVelger
                    feltNavn="vilkar.forutgaendeMedlemskapBegrunnelser"
                    muligeValg={begrunnelser}
                    label="Legg til begrunnelse:"
                    gruppe
                    tillatFritekst={false}
                  />
                </Nav.Fieldset>
              </Nav.Column>
            </Nav.Row>
          ) }
        </div>
        <div className="fane__knapplinje">
          <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    );
  }
}

VurderingForutgaendeMedlemskap.ID = 'FORUTGAENDE_MEDLEMSKAP';

VurderingForutgaendeMedlemskap.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  settSkjemaVerdi: PT.func.isRequired,
};

VurderingForutgaendeMedlemskap.defaultProps = {
  tilstand: {},
  begrunnelser: [],
};

export default VurderingForutgaendeMedlemskap;
