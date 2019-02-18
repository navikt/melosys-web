import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';
import * as MPT from '../proptypes';

import { formSelectors } from '../ducks/form/';
import { fagsakSelectors } from '../ducks/fagsaker/';

import LandVelger from './skjema/landvelger';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './maritimtArbeid.css';

class MaritimtEnkelt extends React.Component {
  state = {
    fartsomrade: '',
  };

  vedFartsomradeEndret = event => {
    const { value } = event.target;
    this.setState({ fartsomrade: value });
  };

  render() {
    const {
      redigerbart, navn, fartsomrader, index, remove,
    } = this.props;

    const { fartsomrade } = this.state;

    const { vedFartsomradeEndret } = this;

    return (
      <Nav.Fieldset legend="Detaljer om skip eller installasjon fra søknaden:">
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.Input feltNavn={`${navn}navn`} label="Navn på fartøyet:" disabled={!redigerbart} />
            <Skjema.Select feltNavn={`${navn}fartsomradeKode`} label="Fartsomrade:" disabled={!redigerbart} onChange={vedFartsomradeEndret} value={fartsomrade}>
              {fartsomrader.map(omrade => <option key={omrade.kode} value={omrade.kode}>{omrade.term}</option>)}
            </Skjema.Select>
            {
              fartsomrade === MKV.Koder.begrunnelser.fartsomrader.INNENRIKS &&
              <LandVelger feltNavn={`${navn}territorialfarvann`} label="Territorialfarvann" disabled={!redigerbart} />
            }
          </Nav.Column>
          <Nav.Column xs="6">
            <LandVelger feltNavn={`${navn}flaggLandKode`} label="Flaggland:" disabled={!redigerbart} />
            <LandVelger feltNavn={`${navn}installasjonsLandKode`} label="Kontinentalsokkel:" disabled={!redigerbart} />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Knapp mini onClick={() => remove(index)} disabled={!redigerbart}>- Fjern denne oppføringen</Nav.Knapp>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
    );
  }
}

MaritimtEnkelt.propTypes = {
  navn: PT.string.isRequired,
  fartsomrader: PT.arrayOf(MPT.Kodeverk).isRequired,
  index: PT.number.isRequired,
  remove: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

const MaritimtAlle = props => {
  const { fields, fartsomrader, redigerbart } = props;
  const { remove, push } = fields;

  return (
    <Fragment>
      <div>
        { fields.map((navn, index) => <MaritimtEnkelt key={navn} remove={remove} navn={navn} fartsomrader={fartsomrader} redigerbart={redigerbart} index={index} />) }
      </div>
      <Nav.Knapp onClick={() => push({})} className="leggtil">+ Legg til nytt skip eller sokkel</Nav.Knapp>
    </Fragment>
  );
};

MaritimtAlle.propTypes = {
  fields: PT.object.isRequired,
  fartsomrader: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
};


const MaritimtArbeid = props => {
  const { soknadForm, redigerbart } = props;
  const { values: soknadVerdier } = soknadForm;
  const { maritimtArbeid = [] } = soknadVerdier;

  const panelErUtfylt = maritimtArbeid.length > 0;
  const panelIkon = panelErUtfylt ? Ikoner.Ferdig : Ikoner.Ubehandlet;

  return (
    <div className="maritimtArbeid panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Maritimt Arbeid" undertittel="" />}
        ariaTittel="Maritimt Arbeid">
        <Nav.Container fluid>
          <FieldArray name="maritimtArbeid" component={MaritimtAlle} fartsomrader={MKV.KTObjects.begrunnelser.fartsomrader} redigerbart={redigerbart} />
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

MaritimtArbeid.propTypes = {
  redigerbart: PT.bool.isRequired,
  soknadForm: PT.object,
};

MaritimtArbeid.defaultProps = {
  soknadForm: {},
};

const mapStateToProps = state => ({
  soknadForm: formSelectors.SoknadenFormSelector(state),
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
});

export default connect(mapStateToProps)(MaritimtArbeid);
