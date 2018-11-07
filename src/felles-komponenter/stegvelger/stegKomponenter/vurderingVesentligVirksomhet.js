import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as Skjema from '../../skjema';

import { arrayTilKonjunksjon } from '../../../utils/streng';

import { BOOLSK } from '../../../constants';

const VurderingVesentligVirksomhet = props => {
  const { bekreftOgFortsett, begrunnelser, tilstand } = props;
  const { visBegrunnelser } = tilstand;

  const arbeidsgivereTekst = props.valgteArbeidsgivere.length > 0 ? `til ${arrayTilKonjunksjon(props.valgteArbeidsgivere.map(arbeidsgiver => arbeidsgiver.navn))}` : '';
  return (
    <div>
      <Nav.Undertittel>Vurdering av vesentlig virksomhet {arbeidsgivereTekst}</Nav.Undertittel>
      <div className="vurderingBostedsland__skjemafelt">
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Fieldset legend="Virksomheten har:">
              <Skjema.Radio feltNavn="vilkar.vesentligVirksomhet" value={BOOLSK.SANN} label="Vesentlig virksomhet" />
              <Skjema.Radio feltNavn="vilkar.vesentligVirksomhet" value={BOOLSK.USANN} label="Ikke vesentlig virksomhet" />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
        {visBegrunnelser && (
          <Nav.Row>
            <Nav.Column xs="12" md="10" lg="8">
              <Nav.Fieldset legend="Begrunnelse:">
                <Skjema.ListeVelger
                  feltNavn="vilkar.vesentligVirksomhetBegrunnelser"
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
};

VurderingVesentligVirksomhet.ID = 'VESENTLIG_VIRKSOMHET';

VurderingVesentligVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  valgteArbeidsgivere: PT.array,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
};

VurderingVesentligVirksomhet.defaultProps = {
  tilstand: {},
  valgteArbeidsgivere: [],
  begrunnelser: [],
};

export default VurderingVesentligVirksomhet;
