import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import { fagsakSelectors } from '../../ducks/fagsaker';
import ArbeidUtlandEnkelt from './arbeidUtlandEnkelt';
import * as Nav from '../../utils/navFrontend';
import * as Ikoner from '../../resources/images';

import PanelHeader from '../panelHeader/panelHeader';


import './arbeidUtland.css';

class ArbeidUtlandWrapper extends Component {
  leggTilArbeidHandler = () => {
    this.props.fields.push({});
  };

  slettArbeidHandler = indeks => {
    this.props.fields.remove(indeks);
  };

  render() {
    const { redigerbart } = this.props;
    const { slettArbeidHandler, leggTilArbeidHandler } = this;
    const panelIkon = Ikoner.Ferdig;

    return (
      <div className="arbeidUtland panelSeksjon">
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={panelIkon} tittel="Opplysninger om fysisk arbeidssted i utlandet" undertittel="" />}
          ariaTittel="Panel for arbeidssted i utlandet">
          <Nav.Container fluid>
            {this.props.fields.map((fieldName, indeks) => <ArbeidUtlandEnkelt key={fieldName} indeks={indeks} slettArbeidHandler={slettArbeidHandler} redigerbart={redigerbart} />)}
            <Nav.Knapp disabled={!redigerbart} className="arbeidUtland__leggtil" onClick={leggTilArbeidHandler}>+ Legg til flere arbeidssteder i utlandet</Nav.Knapp>
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

ArbeidUtlandWrapper.propTypes = {
  redigerbart: PT.bool.isRequired,
  fields: PT.object.isRequired,
};

const mapStateToProps = state => ({
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ArbeidUtlandWrapper);
