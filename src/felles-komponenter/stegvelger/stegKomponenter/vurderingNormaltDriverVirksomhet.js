import React, { Component } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as Skjema from '../../skjema';

import { arrayTilKonjunksjon } from '../../../utils/streng';

import { BOOLSK } from '../../../constants';

class NormaltDriverVirksomhet extends Component {
  componentWillUnmount() {
    const { settSkjemaVerdi } = this.props;
    settSkjemaVerdi('vilkar.normaltDriverVirksomhet', null);
    settSkjemaVerdi('vilkar.normaltDriverVirksomhetBegrunnelser', []);
  }

  render () {
    const { bekreftOgFortsett, begrunnelser, tilstand } = this.props;
    const { visBegrunnelser } = tilstand;
    const arbeidsgivereTekst = this.props.valgteArbeidsgivere.length > 0 ? `til ${arrayTilKonjunksjon(this.props.valgteArbeidsgivere.map(arbeidsgiver => arbeidsgiver.navn))}` : '';

    return (
      <div>
        <Nav.Undertittel>Vurdering av selvstendig virksomhet til {arbeidsgivereTekst}</Nav.Undertittel>
        <div className="vurderingBostedsland__skjemafelt">
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Virksomheten har:">
                <Skjema.Radio feltNavn="vilkar.normaltDriverVirksomhet" value={BOOLSK.SANN} label="Driver normalt virksomhet i Norge" />
                <Skjema.Radio feltNavn="vilkar.normaltDriverVirksomhet" value={BOOLSK.USANN} label="Driver normalt IKKE virksomhet i Norge" />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          {visBegrunnelser && (
            <Nav.Row>
              <Nav.Column xs="12" md="10" lg="8">
                <Nav.Fieldset legend="Begrunnelse:">
                  <Skjema.ListeVelger
                    feltNavn="vilkar.normaltDriverVirksomhetBegrunnelser"
                    muligeValg={begrunnelser}
                    label="Legg til begrunnelse:"
                    gruppe
                    tillatFritekst={false}
                  />
                </Nav.Fieldset>
              </Nav.Column>
            </Nav.Row>)
          }
        </div>
        <div className="fane__knapplinje">
          <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    );
  }
}

NormaltDriverVirksomhet.ID = 'NORMALT_DRIVER_VIRKSOMHET';

NormaltDriverVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  valgteArbeidsgivere: PT.array,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  settSkjemaVerdi: PT.func.isRequired,
};

NormaltDriverVirksomhet.defaultProps = {
  tilstand: {},
  valgteArbeidsgivere: [],
  begrunnelser: [],
};

export default NormaltDriverVirksomhet;
