import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';
import * as Utils from '../utils';
import * as KV from '../kodeverk';

import PanelHeader from '../komponenter/panelHeader/panelHeader';
import Landvelger from './skjema/landvelger';

import './bosted.css';
import { behandlingerSelectors } from '../ducks/behandlinger';
import { formSelectors } from '../ducks/form';
import { BOOLSK } from '../constants';
import { boolTilNorsk } from '../utils/streng';

const Bosted = props => {
  const { redigerbart, soknadForm: { values } } = props;

  const felter = [
    values.forutgaendeBostedINorge,
    values.familiesBosted,
    values.adresseIUtlandet,
    values.sammeAdresseSomArbeidsgiver,
  ];
  const minstEttFeltErUtfylt = felter.some(felt => felt !== '' && !Utils._isNil(felt));
  const panelIkon = minstEttFeltErUtfylt ? Ikoner.Ferdig : Ikoner.Ubehandlet;

  const { eosBarnetrygd } = props.sakOgBehandling;

  return (
    <div className="bosted panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel={KV.Paneltitler.bosted} undertittel="" />}
        ariaTittel="Panel for opplysninger om bosted, fra søknaden">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="12">
              <Skjema.RadioGruppe feltNavn="forutgaendeBostedINorge" legend="Har forutgående bosted i Norge.">
                <Skjema.Radio disabled={!redigerbart} feltNavn="forutgaendeBostedINorge" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio disabled={!redigerbart} feltNavn="forutgaendeBostedINorge" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
              <Nav.Fieldset legend="Nærmeste families bosted">
                <Landvelger disabled={!redigerbart} feltNavn="familiesBosted" />
              </Nav.Fieldset>
              <Nav.Undertittel>Yrkesaktiv</Nav.Undertittel>
              <Skjema.RadioGruppe feltNavn="adresseIUtlandet" legend="Har søker utenlandsadresse?">
                <Skjema.Radio disabled={!redigerbart} feltNavn="adresseIUtlandet" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio disabled={!redigerbart} feltNavn="adresseIUtlandet" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
              <Skjema.RadioGruppe feltNavn="sammeAdresseSomArbeidsgiver" legend="Er norsk adresse samme som arbeidsgivers?">
                <Skjema.Radio disabled={!redigerbart} feltNavn="sammeAdresseSomArbeidsgiver" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio disabled={!redigerbart} feltNavn="sammeAdresseSomArbeidsgiver" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
              <Skjema.RadioGruppe feltNavn="sammeAdresseSomArbeidsgiver" legend="Mottar EU / EØS barnetrygd fra NAV?">
                {boolTilNorsk(eosBarnetrygd)}
              </Skjema.RadioGruppe>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

Bosted.propTypes = {
  soknadForm: MPT.SoknadForm,
  redigerbart: PT.bool.isRequired,
  sakOgBehandling: PT.object.isRequired,
};

Bosted.defaultProps = {
  soknadForm: {},
};


const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  sakOgBehandling: behandlingerSelectors.SakOgBehandlingSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
});

export default connect(mapStateToProps)(Bosted);
