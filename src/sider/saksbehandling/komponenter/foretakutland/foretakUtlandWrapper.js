import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as KV from '../../../../kodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Ikoner from '../../../../resources/images';

import EnkeltForetak from './enkeltforetak';

import PanelHeader from '../../../../felleskomponenter/panelHeader/panelHeader';

import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import './foretakUtland.css';

class ForetakUtlandWrapper extends Component {
  leggTilForetakHandler = () => {
    this.props.fields.push({});
  };

  slettForetakHandler = indeks => {
    this.props.fields.remove(indeks);
  };

  render() {
    const { redigerbart, fields } = this.props;
    const { slettForetakHandler } = this;

    const panelErUtfylt = fields.length > 0;
    const panelIkon = panelErUtfylt ? Ikoner.Ferdig : Ikoner.Ubehandlet;

    return (
      <div className="foretakUtland panelSeksjon">
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={panelIkon} tittel={KV.Paneltitler.foretakUtland} undertittel="" />}
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
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ForetakUtlandWrapper);
