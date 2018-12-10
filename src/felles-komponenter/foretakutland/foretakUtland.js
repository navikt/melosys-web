import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Ikoner from '../../resources/images';

import EnkeltForetak from './enkeltforetak';

import PanelHeader from '../panelHeader/panelHeader';

import { fagsakSelectors } from '../../ducks/fagsaker';
import './foretakUtland.css';

class ForetakUtlandWrapper extends Component {
  leggTilForetakHandler = () => {
    this.props.fields.push({});
  };

  slettForetakHandler = indeks => {
    this.props.fields.remove(indeks);
  };

  render() {
    const panelIkon = Ikoner.Ferdig;
    const { redigerbart, fields } = this.props;
    const { slettForetakHandler } = this;

    return (
      <div className="foretakUtland panelSeksjon">
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={panelIkon} tittel="Arbeidsforholdene i utlandet" undertittel="" />}
          ariaTittel="Panel for arbeidsforholdene i utlandet">
          <Nav.Container fluid>
            { fields.map((fieldName, indeks) => (<EnkeltForetak key={fieldName} indeks={indeks} slettForetakHandler={slettForetakHandler} redigerbart={redigerbart} />))}
            <Nav.Knapp disabled={!redigerbart} className="foretakUtland__leggtil" onClick={this.leggTilForetakHandler}>+ Legg til flere arbeidsforhold i utlandet</Nav.Knapp>
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

ForetakUtlandWrapper.propTypes = {
  redigerbart: PT.bool.isRequired,
  fields: PT.object.isRequired,
};

const mapStateToProps = state => ({
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
});

const mapDispatchToProps = () => ({});

connect(mapStateToProps, mapDispatchToProps)(ForetakUtlandWrapper);

const ForetakUtland = props => (
  <FieldArray
    name="foretakUtland"
    component={ForetakUtlandWrapper}
    props={props}
  />
);

export default ForetakUtland;
