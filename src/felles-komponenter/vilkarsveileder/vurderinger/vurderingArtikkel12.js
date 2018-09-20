import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as MPT from './../../../proptypes';

const VurderingArtikkel12 = props => {
  const { bekreftOgFortsett, begrunnelser } = props;

  return (
    <div>
      <Nav.Undertittel>Vurdering av artikkel 12.1</Nav.Undertittel>
      <div>
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Fieldset legend="Virksomheten har:">
              <Skjema.Radio feltNavn="vurderingArtikkel" value="ART12_1" label="Ja" />
              <Skjema.Radio feltNavn="vurderingArtikkel" value="ART16_1" label="Nei, jeg vil vurdere artikkel 16.1" />
              <Skjema.Radio feltNavn="vurderingArtikkel" value="AVVIST" label="Nei, jeg vil avslå søknaden etter artikkel 12.1 og 16.1" />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12" md="10" lg="8">
            <Nav.Fieldset legend="Begrunnelse:">
              <Skjema.ListeVelger
                feltNavn="vurderingBegrunnelser"
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

VurderingArtikkel12.propTypes = {
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingArtikkel12.defaultProps = {
  tilstand: {},
};

export default VurderingArtikkel12;
