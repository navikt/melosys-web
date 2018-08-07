import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import Landvelger from './skjema/landvelger';

import './bosted.css';
import { KodeverkSelectors } from '../ducks/kodeverk';
import { formSelectors } from '../ducks/form';
import { BOOLSK } from '../constants';

const uuid = require('uuid/v4');

const Bosted = props => {
  const { erValidert, studieFinansiering } = props;
  const panelIkon = erValidert ? Ikoner.Ferdig : Ikoner.Varsel;

  return (
    <div className="bosted panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Opplysninger for vurdering av bosted" undertittel="" />}
        ariaTittel="Panel for opplysninger om bosted, fra søknaden">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="12">
              <Skjema.RadioGruppe feltNavn="forutgaendeBostedINorge" legend="Har forutgående bosted i Norge.">
                <Skjema.Radio feltNavn="forutgaendeBostedINorge" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio feltNavn="forutgaendeBostedINorge" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
              <Nav.Fieldset legend="Nærmeste families bosted">
                <Landvelger feltNavn="familiesBosted" />
              </Nav.Fieldset>
              <Nav.Undertittel>Yrkesaktiv</Nav.Undertittel>
              <Skjema.RadioGruppe feltNavn="adresseIUtlandet" legend="Har søker utenlandsadresse?">
                <Skjema.Radio feltNavn="adresseIUtlandet" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio feltNavn="adresseIUtlandet" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
              <Skjema.RadioGruppe feltNavn="sammeAdresseSomArbeidsgiver" legend="Er norsk adresse samme som arbeidsgivers?">
                <Skjema.Radio feltNavn="sammeAdresseSomArbeidsgiver" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio feltNavn="sammeAdresseSomArbeidsgiver" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
              <Skjema.RadioGruppe feltNavn="EOSBarnetrygdFraNAV" legend="Mottar EU/EØS barnetrygd fra NAV?">
                <Skjema.Radio feltNavn="EOSBarnetrygdFraNAV" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio feltNavn="EOSBarnetrygdFraNAV" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
              <Nav.Undertittel>Pensjonist</Nav.Undertittel>
              <Nav.Fieldset legend="Opphold i Norge (måneder pr kalenderår)">
                <Skjema.Select feltNavn="antallMaanederINorge" label="Velg antall måneder:" bredde="xs">
                  {new Array(12).fill(undefined).map((element, index) => <option value={index + 1} key={uuid()}>{index + 1}</option>)}
                </Skjema.Select>
              </Nav.Fieldset>
              <Skjema.RadioGruppe feltNavn="ektefelleEllerBarnINorge" legend="Har ektefelle / mindreårige barn i Norge">
                <Skjema.Radio feltNavn="ektefelleEllerBarnINorge" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio feltNavn="ektefelleEllerBarnINorge" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
              <Nav.Undertittel>Student i EØS-land</Nav.Undertittel>
              <Landvelger label="Velg studieland:" feltNavn="studieLand" />
              <Skjema.Select
                label="Finansiering"
                feltNavn="studentFinansiering"
                bredde="xl"
              >
                {studieFinansiering.map(valg => <option key={uuid()} value={valg.kode}>{valg.term}</option>)}
              </Skjema.Select>
              <Skjema.RadioGruppe feltNavn="intensjonOmRetur" legend="Har intensjon om å returnere til Norge">
                <Skjema.Radio feltNavn="intensjonOmRetur" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio feltNavn="intensjonOmRetur" value={BOOLSK.USANN} label="Nei" />
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
  studieFinansiering: PT.arrayOf(MPT.Kodeverk),
};

Bosted.defaultProps = {
  soknadForm: {},
  erValidert: true,
  studieFinansiering: [],
};

const mapStateToProps = state => ({
  studieFinansiering: KodeverkSelectors.studieFinansieringSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
});

export default connect(mapStateToProps)(Bosted);
