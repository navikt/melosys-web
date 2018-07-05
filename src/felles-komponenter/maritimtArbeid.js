import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';
import LandVelger from './skjema/landvelger';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './maritimtArbeid.css';

function MaritimtArbeid () {
  const panelIkon = Ikoner.Ferdig;

  return (
    <div className="maritimtArbeid panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Maritimt Arbeid" undertittel="" />}
        ariaTittel="Maritimt Arbeid">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="12">
              <Skjema.RadioGruppe label="Oppgir søker at han eller hun jobber på:">
                <Skjema.Radio feltNavn="maritimType" value="SKIP" label="Skip" />
                <Skjema.Radio feltNavn="maritimType" value="SOKKEL" label="Sokkel" />
                <Skjema.Radio feltNavn="maritimType" value="INGEN" label="Ikke relevant" />
              </Skjema.RadioGruppe>
            </Nav.Column>
          </Nav.Row>
          <Nav.Fieldset legend="Detaljer om skip eller installasjon fra søknaden:">
            <Nav.Row>
              <Nav.Column xs="6">
                <Skjema.Input feltNavn="skipsNavn" label="Skipsnavn" />
                <Skjema.Input feltNavn="fartsomrade" label="Fartsomrade" />
              </Nav.Column>
              <Nav.Column xs="6">
                <LandVelger feltNavn="flaggLand" label="Flaggland" />
                <LandVelger feltNavn="installasjonsLand" label="Installasjonsnavn" />
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

MaritimtArbeid.propTypes = {
  soknadForm: MPT.SoknadForm,
};

MaritimtArbeid.defaultProps = {
  soknadForm: {},
};

export default MaritimtArbeid;
