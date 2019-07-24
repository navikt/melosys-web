import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { FieldArray, change } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';
import * as Skjema from '../komponenter/skjema';
import * as MPT from '../proptypes';
import * as KV from '../kodeverk';

import { formSelectors } from '../ducks/form/';
import { behandlingerSelectors } from '../ducks/behandlinger/';

import LandVelger from '../komponenter/skjema/landvelger';
import PanelHeader from '../komponenter/panelHeader/panelHeader';

import './maritimtArbeid.css';

const MaritimtEnkelt = ({
  redigerbart,
  navn,
  fartsomrader,
  index,
  remove,
  fartsomradeKode,
  settSkjemaVerdi,
}) => {
  const fartsomradeChangeHandler = event => {
    const fartsomrade = event.target.value;

    settSkjemaVerdi('fartsomradeKode', fartsomrade, index);
    if (fartsomrade === MKV.Koder.begrunnelser.fartsomrader.INNENRIKS) {
      return;
    }

    settSkjemaVerdi('territorialfarvann', null, index);
  };

  return (
    <Nav.Fieldset legend="Detaljer om skip eller installasjon fra søknaden:">
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input feltNavn={`${navn}.navn`} label="Navn på enhet:" disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="6">
          <LandVelger bredde="fullbredde" feltNavn={`${navn}.flaggLandkode`} label="Flaggland:" disabled={!redigerbart} />
          <LandVelger bredde="fullbredde" feltNavn={`${navn}.installasjonsLandkode`} label="Sokkelland:" disabled={!redigerbart} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Select feltNavn={`${navn}.fartsomradeKode`} label="Fartsområde:" disabled={!redigerbart} onChange={fartsomradeChangeHandler}>
            {fartsomrader.map(omrade => <option key={omrade.kode} value={omrade.kode}>{omrade.term}</option>)}
          </Skjema.Select>
        </Nav.Column>
        <Nav.Column xs="6">
          {
            fartsomradeKode === MKV.Koder.begrunnelser.fartsomrader.INNENRIKS &&
            <LandVelger bredde="fullbredde" feltNavn={`${navn}.territorialfarvann`} label="Territorialfarvannsland:" disabled={!redigerbart} />
          }
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Knapp mini onClick={() => remove(index)} disabled={!redigerbart}>- Fjern denne oppføringen</Nav.Knapp>
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
  redigerbart: PT.bool.isRequired,
  fartsomradeKode: PT.string,
  settSkjemaVerdi: PT.func.isRequired,
};

MaritimtEnkelt.defaultProps = {
  fartsomradeKode: '',
};

const MaritimtAlle = props => {
  const {
    fields, fartsomrader, redigerbart, fartsomradeKoder, settSkjemaVerdi,
  } = props;
  const { remove, push } = fields;

  return (
    <Fragment>
      <div>
        {fields.map((navn, index) => <MaritimtEnkelt
          key={navn}
          remove={remove}
          navn={navn}
          fartsomrader={fartsomrader}
          redigerbart={redigerbart}
          index={index}
          fartsomradeKode={fartsomradeKoder[index]}
          settSkjemaVerdi={settSkjemaVerdi} />)}
      </div>
      <Nav.Knapp disabled={!redigerbart} onClick={() => push({})} className="leggtil">+ Legg til nytt skip eller sokkel</Nav.Knapp>
    </Fragment>
  );
};

MaritimtAlle.propTypes = {
  fields: PT.object.isRequired,
  fartsomrader: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
  fartsomradeKoder: PT.arrayOf(PT.string),
  settSkjemaVerdi: PT.func.isRequired,
};

MaritimtAlle.defaultProps = {
  fartsomradeKoder: [],
};

const maritimtAlleMapStateToProps = state => ({
  fartsomradeKoder: formSelectors.FartsomradeKodeSelector(state),
});

const maritimtAlleMapDispatchToProps = dispatch => ({
  settSkjemaVerdi: (felt, verdi, index) => dispatch(change('soknad', `maritimtArbeid[${index}]${felt}`, verdi)),
});

const ConnectedMaritimtAlle = connect(maritimtAlleMapStateToProps, maritimtAlleMapDispatchToProps)(MaritimtAlle);

const MaritimtArbeid = props => {
  const { soknadForm, redigerbart } = props;
  const { values: soknadVerdier } = soknadForm;
  const { maritimtArbeid = [] } = soknadVerdier;

  const panelErUtfylt = maritimtArbeid.length > 0;
  const panelIkon = panelErUtfylt ? Ikoner.Ferdig : Ikoner.Ubehandlet;

  return (
    <div className="maritimtArbeid panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel={KV.Paneltitler.maritimtArbeid} undertittel="" />}
        ariaTittel="Maritimt Arbeid">
        <Nav.Container fluid>
          <FieldArray name="maritimtArbeid" component={ConnectedMaritimtAlle} fartsomrader={MKV.KTObjects.begrunnelser.fartsomrader} redigerbart={redigerbart} />
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
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
});

export default connect(mapStateToProps)(MaritimtArbeid);
