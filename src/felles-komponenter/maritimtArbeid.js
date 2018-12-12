import React, { Fragment } from 'react';
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
  const {
    navn, fartsomrader, index, remove,
  } = props;

  return (
    <Nav.Fieldset legend="Detaljer om skip eller installasjon fra søknaden:">
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input feltNavn={`${navn}navn`} label="Navn på fartøyet:" />
          <Skjema.Select feltNavn={`${navn}fartsomradeKode`} label="Fartsomrade:">
            {fartsomrader.map(omrade => <option key={omrade.kode} value={omrade.kode}>{omrade.term}</option>)}
          </Skjema.Select>
        </Nav.Column>
        <Nav.Column xs="6">
          <LandVelger feltNavn={`${navn}flaggLandKode`} label="Flaggland:" />
          <LandVelger feltNavn={`${navn}installasjonsLandKode`} label="Kontinentalsokkel:" />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Knapp mini onClick={() => remove(index)}>- Fjern denne oppføringen</Nav.Knapp>
        </Nav.Column>
      </Nav.Row>
    </Nav.Fieldset>
  );
};

MaritimtEnkelt.propTypes = {
  navn: PT.string.isRequired,
  fartsomrader: PT.arrayOf(MPT.Kodeverk).isRequired,
  index: PT.number.isRequired,
  remove: PT.func.isRequired,
};

const MaritimtAlle = props => {
  const { fields, fartsomrader } = props;
  const { remove, push } = fields;

  return (
    <Fragment>
      <div>
        { fields.map((navn, index) => <MaritimtEnkelt key={navn} remove={remove} navn={navn} fartsomrader={fartsomrader} index={index} />) }
      </div>
      <Nav.Knapp onClick={() => push({})} className="leggtil">+ Legg til nytt skip eller sokkel</Nav.Knapp>
    </Fragment>
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
