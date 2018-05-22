import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

import LandVelger from '../../skjema/landvelger/';

export const VurderingBostedslandTyper = {
  NORGE: 'NORGE',
  ANNET: 'ANNET',
};

const VurderingBostedsland = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <div>
        <Nav.Undertittel>Bostedsvurdering</Nav.Undertittel>
        <p>
          Vennligst fyll ut panelet &quot;opplysninger om bosted&quot; med informasjon fra søknaden.
        </p>
        <Nav.Element>Tips for manuell bostedsvurdering:</Nav.Element>
        <ul>
          <li>Sjekk om søker har aktivitet i Norge</li>
          <li>Sjekk bostedsadressen er troverdig</li>
          <li>Sjekk om ektefelle har ekte fødselsnummer eller d-nummer</li>
          <li>Sjekk opplysninger om EØS-barnetrygd i Gosys</li>
        </ul>
      </div>
      <Nav.Fieldset legend="Bostedsland er:">
        <Skjema.Radio feltNavn="faktaavklaringBostedINorge" value={VurderingBostedslandTyper.NORGE} label="Norge" />
        <Skjema.Radio feltNavn="faktaavklaringBostedINorge" value={VurderingBostedslandTyper.ANNET} label="Annet" />
        <LandVelger feltNavn="faktaavklaringBostedsland" multiland={false} />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingBostedsland.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingBostedsland.defaultProps = {
  tilstand: {},
};

export default VurderingBostedsland;
