import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import Landvelger from './skjema/landvelger';

import './arbeidsgiverUtland.css';
import { KodeverkSelectors } from '../ducks/kodeverk';
import { formSelectors } from '../ducks/form';

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
                <Skjema.Radio feltNavn="forutgaendeBostedINorge" value="true" label="Ja" />
                <Skjema.Radio feltNavn="forutgaendeBostedINorge" value="false" label="Nei" />
              </Skjema.RadioGruppe>
              <Nav.Fieldset legend="Nærmeste families bosted">
                <Landvelger feltNavn="familiesBosted" />
              </Nav.Fieldset>
              <Nav.SkjemaGruppe title="Yrkesaktiv">
                <Skjema.RadioGruppe feltNavn="sammeAdresseSomArbeidsgiver" legend="Er norsk adresse samme som arbeidsgivers?">
                  <Skjema.Radio feltNavn="sammeAdresseSomArbeidsgiver" value="true" label="Ja" />
                  <Skjema.Radio feltNavn="sammeAdresseSomArbeidsgiver" value="false" label="Nei" />
                </Skjema.RadioGruppe>
              </Nav.SkjemaGruppe>
              <Nav.SkjemaGruppe title="Pensjonsist">
                <Nav.Fieldset legend="Opphold i Norge (måneder pr kalenderår)">
                  <Skjema.Select feltNavn="antallMaanederINorge" label="Velg antall måneder:" bredde="xs">
                    {new Array(12).fill(undefined).map((element, index) => <option value={index + 1} key={uuid()}>{index + 1}</option>)}
                  </Skjema.Select>
                </Nav.Fieldset>
                <Skjema.RadioGruppe feltNavn="ektefelleEllerBarn" legend="Har ektefelle / mindreårige barn i Norge">
                  <Skjema.Radio feltNavn="ektefelleEllerBarn" value="true" label="Ja" />
                  <Skjema.Radio feltNavn="ektefelleEllerBarn" value="false" label="Nei" />
                </Skjema.RadioGruppe>
              </Nav.SkjemaGruppe>
              <Nav.SkjemaGruppe title="Student i EØS-land">
                <Landvelger label="Velg studieland:" feltNavn="studieLand" />
                <Skjema.Select
                  label="Finansiering"
                  feltNavn="studentFinansiering"
                  bredde="xl"
                >
                  {studieFinansiering.map(valg => <option key={uuid()} value={valg.kode}>{valg.term}</option>)}
                </Skjema.Select>
                <Skjema.RadioGruppe feltNavn="intensjonOmRetur" legend="Har intensjon om å returnere til Norge">
                  <Skjema.Radio feltNavn="intensjonOmRetur" value="true" label="Ja" />
                  <Skjema.Radio feltNavn="intensjonOmRetur" value="false" label="Nei" />
                </Skjema.RadioGruppe>
              </Nav.SkjemaGruppe>
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
