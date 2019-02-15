import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import Landvelger from './skjema/landvelger';
import { kodeverkObjektTilTerm, kodeverkObjektTilKode } from '../utils/kodeverk';

import './bosted.css';
import { fagsakSelectors } from '../ducks/fagsaker';
import { formSelectors } from '../ducks/form';
import { BOOLSK } from '../constants';
import { boolTilNorsk } from '../utils/streng';

const uuid = require('uuid/v4');

const Bosted = props => {
  const { redigerbart, erValidert } = props;

  const panelIkon = erValidert ? Ikoner.Ferdig : Ikoner.Varsel;

  const { eosBarnetrygd } = props.sakOgBehandling;

  return (
    <div className="bosted panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Opplysninger for vurdering av bosted" undertittel="" />}
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
              <Nav.Undertittel>Pensjonist</Nav.Undertittel>
              <Nav.Fieldset legend="Opphold i Norge (måneder pr kalenderår)">
                <Skjema.Select disabled={!redigerbart} feltNavn="antallMaanederINorge" label="Velg antall måneder:" bredde="xs">
                  {new Array(12).fill(undefined).map((element, index) => <option value={index + 1} key={uuid()}>{index + 1}</option>)}
                </Skjema.Select>
              </Nav.Fieldset>
              <Skjema.RadioGruppe feltNavn="ektefelleEllerBarnINorge" legend="Har ektefelle / mindreårige barn i Norge">
                <Skjema.Radio disabled={!redigerbart} feltNavn="ektefelleEllerBarnINorge" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio disabled={!redigerbart} feltNavn="ektefelleEllerBarnINorge" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
              <Nav.Undertittel>Student i EØS-land</Nav.Undertittel>
              <Landvelger disabled={!redigerbart} label="Velg studieland:" feltNavn="studieLand" />
              <Skjema.Select
                label="Finansiering"
                feltNavn="studentFinansiering"
                bredde="xl"
                disabled={!redigerbart}
              >
                {MKV.KTObjects.finansiering.map(valg => <option key={uuid()} value={kodeverkObjektTilKode(valg)}>{kodeverkObjektTilTerm(valg)}</option>)}
              </Skjema.Select>
              <Skjema.RadioGruppe feltNavn="intensjonOmRetur" legend="Har intensjon om å returnere til Norge">
                <Skjema.Radio disabled={!redigerbart} feltNavn="intensjonOmRetur" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio disabled={!redigerbart} feltNavn="intensjonOmRetur" value={BOOLSK.USANN} label="Nei" />
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
  erValidert: PT.bool,
  redigerbart: PT.bool.isRequired,
  sakOgBehandling: PT.object.isRequired,
};

Bosted.defaultProps = {
  soknadForm: {},
  erValidert: true,
};


const mapStateToProps = state => ({
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
  sakOgBehandling: fagsakSelectors.SakOgBehandlingSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
});

export default connect(mapStateToProps)(Bosted);
