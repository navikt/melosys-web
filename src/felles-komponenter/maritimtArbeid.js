import React from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';
import { connect } from 'react-redux';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';
import * as MPT from '../proptypes';
import LandVelger from './skjema/landvelger';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import { formSelectors } from '../ducks/form/';
import { KodeverkSelectors } from '../ducks/kodeverk';


import './maritimtArbeid.css';

const MaritimtEnkelt = props => {
  const { navn, fartsomrader } = props;

  return (
    <Nav.Fieldset legend="Detaljer om skip eller installasjon fra søknaden:">
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input feltNavn={`${navn}skipsNavn`} label="Navn på fartøyet:" />
          <Skjema.ListeVelger feltNavn={`${navn}fartsomradeKode`} muligeValg={fartsomrader} label="Fartsomrade:" />
        </Nav.Column>
        <Nav.Column xs="6">
          <LandVelger feltNavn={`${navn}flaggLandKode`} label="Flaggland:" />
          <LandVelger feltNavn={`${navn}installasjonsLandKode`} label="Installasjonsland:" />
        </Nav.Column>
      </Nav.Row>
    </Nav.Fieldset>
  );
};

MaritimtEnkelt.propTypes = {
  navn: PT.string.isRequired,
  fartsomrader: PT.arrayOf(MPT.Kodeverk).isRequired,
};

const MaritimtAlle = props => {
  const { fields, fartsomrader } = props;

  return (
    <div>
      { fields.map(navn => <MaritimtEnkelt key={navn} navn={navn} fartsomrader={fartsomrader} />) }
    </div>
  );
};

MaritimtAlle.propTypes = {
  fields: PT.object.isRequired,
  fartsomrader: PT.arrayOf(MPT.Kodeverk).isRequired,
};


const MaritimtArbeid = props => {
  const { soknadForm, fartsomrader } = props;
  const { values: soknadVerdier } = soknadForm;
  const { maritimtArbeid = [] } = soknadVerdier;

  const panelErRelevant = maritimtArbeid.length > 0;

  const panelIkon = panelErRelevant ? Ikoner.Ferdig : Ikoner.Ubehandlet;

  return (
    <div className="maritimtArbeid panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Maritimt Arbeid" undertittel="" />}
        ariaTittel="Maritimt Arbeid">
        <Nav.Container fluid>
          <FieldArray name="maritimtArbeid" component={MaritimtAlle} fartsomrader={fartsomrader} />
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

MaritimtArbeid.propTypes = {
  soknadForm: PT.object,
  fartsomrader: PT.arrayOf(MPT.Kodeverk).isRequired,
};

MaritimtArbeid.defaultProps = {
  soknadForm: {},
};

const mapStateToProps = state => ({
  soknadForm: formSelectors.SoknadenFormSelector(state),
  fartsomrader: KodeverkSelectors.fartsomraderSelector(state),
});

export default connect(mapStateToProps)(MaritimtArbeid);
