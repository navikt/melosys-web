import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as Skjema from '../../skjema';

export const VurderingVesentligVirksomhetTyper = {
  TRUE: 'true',
  FALSE: 'false',
};

const VurderingVesentligVirksomhet = props => {
  const { bekreftOgFortsett, begrunnelser } = props;

  return (
    <div>
      <Nav.Undertittel>Vurdering av vesentlig virksomhet</Nav.Undertittel>
      <div className="vurderingBostedsland__skjemafelt">
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Fieldset legend="Virksomheten har:">
              <Skjema.Radio feltNavn="faktaavklaringVesentligVirksomhetINorge" value={VurderingVesentligVirksomhetTyper.TRUE} label="Vesentlig virksomhet" />
              <Skjema.Radio feltNavn="faktaavklaringVesentligVirksomhetINorge" value={VurderingVesentligVirksomhetTyper.FALSE} label="Ikke vesentlig virksomhet" />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12" md="10" lg="8">
            <Nav.Fieldset legend="Begrunnelse:">
              <Skjema.ListeVelger
                feltNavn="faktaavklaringVesentligVirksomhetBegrunnelser"
                muligeValg={begrunnelser}
                label="Legg til begrunnelse:"
                gruppe
                tillatFritekst={false}
              />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
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
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
};

VurderingVesentligVirksomhet.defaultProps = {
  tilstand: {},
  begrunnelser: [],
};

export default VurderingVesentligVirksomhet;
