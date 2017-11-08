import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

const VurderingLand = props => {
  const { bekreftOgFortsett } = props;
  const land = [
    'Belgia',
    'Bulgaria',
    'Danmark',
    'Estland',
    'Finland',
    'Frankrike',
    'Hellas',
    'Irland',
    'Island',
    'Italia',
    'Kroatia',
    'Kypros',
    'Latvia',
    'Liechtenstein',
    'Litauen',
    'Luxembourg',
    'Malta',
    'Nederland',
    'Norge',
    'Polen',
    'Portugal',
    'Romania',
    'Slovakia',
    'Slovenia',
    'Spania',
    'Storbritannia og Nord-Irland',
    'Sverige',
    'Tsjekkia',
    'Tyskland',
    'Ungarn',
    'Østerrike',
  ];

  return (
    <div>
      <Nav.Undertittel>Utenlandsoppholdet:</Nav.Undertittel>
      <Nav.Fieldset legend="Når er søker i utlandet?">
        <Nav.Column xs="4">
          <Nav.Input label="Fra" bredde="s" />
        </Nav.Column>
        <Nav.Column xs="4">
          <Nav.Input label="Til" bredde="s" />
        </Nav.Column>
      </Nav.Fieldset>
      <Nav.Fieldset legend="Hvilke land skal søker arbeide i?">
        <Nav.Column xs="12">
          <Nav.Input list="land" label="Tast inn land" bredde="s" />
          <datalist id="land">
            { land.map(item => <option key={item} value={item} />) }
          </datalist>
        </Nav.Column>
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingLand.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};


export default VurderingLand;
