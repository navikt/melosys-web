import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

function OppretteSak(props) {
  const { bekreftOgFortsett, avbrytOpprettSak } = props;

  return (
    <div>
      <Nav.Undertittel>Opprette sak:</Nav.Undertittel>
      <Nav.Normaltekst>Velg type søknad og legg inn periode</Nav.Normaltekst>
      <Nav.Row>
        <Nav.Fieldset legend="">
          <Nav.Column xs="4">
            <Nav.Select label="Type søknad" bredde="s">
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="annen">Annen</option>
            </Nav.Select>
          </Nav.Column>
          <Nav.Column xs="4">
            <Nav.Input label="Fra dato" bredde="s" />
          </Nav.Column>
          <Nav.Column xs="4">
            <Nav.Input label="Til dato" bredde="s" />
          </Nav.Column>
        </Nav.Fieldset>
        <div className="fane__knapplinje">
          <Nav.Knapp className="fane__navigasjonsknapp" onClick={avbrytOpprettSak}>Avbryt</Nav.Knapp>
          <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </Nav.Row>
    </div>
  );
}

OppretteSak.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  avbrytOpprettSak: PT.func.isRequired,
};

export default OppretteSak;
