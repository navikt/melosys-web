import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './arbeidUtland.css';

function ArbeidUtland () {
  const panelIkon = Ikoner.Ferdig;

  return (
    <div className="arbeidsgiverUtland panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Opplysninger om arbeid i utlandet" undertittel="" />}
        ariaTittel="Panel for arbeidssted i utlandet">
        <Nav.Container fluid>
          <Nav.Column xs="6">
            <Skjema.Input label="Firmanavn" feltNavn="foretakUtlandNavn" />
            <Skjema.Input label="Orgnr / ID nr" feltNavn="foretakUtlandOrgnr" />
          </Nav.Column>
          <Nav.Column xs="6">
            <Skjema.Textarea bredde="m" label="Adresse" feltNavn="foretakUtlandAdresse" maxLength={100} />
          </Nav.Column>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

ArbeidUtland.propTypes = {
  organisasjoner: MPT.Organisasjoner,
};

ArbeidUtland.defaultProps = {
  organisasjoner: [],
};

export default ArbeidUtland;
