import React from 'react';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';
import LandVelger from './skjema/landvelger';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './maritimtArbeid.css';

const MaritimtArbeidTyper = {
  SKIP: 'SKIP',
  SOKKEL: 'SOKKEL',
  INGEN: 'INGEN',
};

const MaritimtArbeid = props => {
  const { maritimType } = props.soknadVerdier;
  const panelErRelevant = maritimType !== MaritimtArbeidTyper.INGEN;

  const panelIkon = panelErRelevant ? Ikoner.Ferdig : Ikoner.Ubehandlet;

  const detaljer = maritimType !== MaritimtArbeidTyper.INGEN ?
    <Nav.Fieldset legend="Detaljer om skip eller installasjon fra søknaden:">
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input feltNavn="skipsNavn" label="Navn på fartøyet:" />
          <Skjema.Input feltNavn="fartsomrade" label="Fartsomrade:" />
        </Nav.Column>
        <Nav.Column xs="6">
          <LandVelger feltNavn="flaggLand" label="Flaggland:" />
          <LandVelger feltNavn="installasjonsLand" label="Installasjonsland:" />
        </Nav.Column>
      </Nav.Row>
    </Nav.Fieldset> : null;

  return (
    <div className="maritimtArbeid panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Maritimt Arbeid" undertittel="" />}
        ariaTittel="Maritimt Arbeid">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="12">
              <Skjema.RadioGruppe feltNavn="maritimType" label="Oppgir søker at han eller hun jobber på:">
                <Skjema.Radio feltNavn="maritimType" value={MaritimtArbeidTyper.SKIP} label="Skip" />
                <Skjema.Radio feltNavn="maritimType" value={MaritimtArbeidTyper.SOKKEL} label="Sokkel" />
                <Skjema.Radio feltNavn="maritimType" value={MaritimtArbeidTyper.INGEN} label="Ikke relevant" />
              </Skjema.RadioGruppe>
            </Nav.Column>
          </Nav.Row>
          { detaljer }
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

MaritimtArbeid.propTypes = {
  soknadVerdier: PT.object,
};

MaritimtArbeid.defaultProps = {
  soknadVerdier: {},
};

export default MaritimtArbeid;
