import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';
import * as Skjema from '../komponenter/skjema';
import * as MPT from '../proptypes';
import * as KV from '../kodeverk';

import LandVelger from '../komponenter/skjema/landvelger';
import PanelHeader from '../komponenter/panelHeader/panelHeader';

import { behandlingerSelectors } from '../ducks/behandlinger/';
import { formSelectors } from '../ducks/form';
import './virksomhetNorge.css';

function VirksomhetNorge (props) {
  const { redigerbart, soknadForm: { values } } = props;

  const felter = [
    values.antallAnsatte,
    values.utsendteNeste12Mnd,
    values.antallAdmAnsatte,
    values.andelOmsetningINorge,
    values.andelKontrakterINorge,
    values.andelOppdragINorge,
    values.arbeidstakereRekruttertILand,
    values.oppdragsKontrakterIHovedsakInngaattILand,
  ];
  const minstEttFeltErUtfylt = felter.some(felt => felt !== '' && felt !== null);
  const panelIkon = minstEttFeltErUtfylt ? Ikoner.Ferdig : Ikoner.Ubehandlet;

  return (
    <div className="virksomhetNorge panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel={KV.Paneltitler.arbeidsgiversVirksomhetINorge} undertittel="" />}
        ariaTittel="Opplysninger om arbeidsgivers virksomhet i Norge">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="6">
              <Skjema.Input bredde="XS" type="number" feltNavn="antallAnsatte" label="Antall ansatte:" disabled={!redigerbart} />
              <Skjema.Input bredde="XS" type="number" feltNavn="utsendteNeste12Mnd" label="Antall utsendte de neste 12 mnd:" disabled={!redigerbart} />
              <Skjema.Input bredde="XS" type="number" feltNavn="antallAdmAnsatte" label="Antall administrativt ansatte:" disabled={!redigerbart} />
            </Nav.Column>
            <Nav.Column xs="6">
              <Skjema.Input bredde="XS" type="number" feltNavn="andelOmsetningINorge" label="Andel av omsetning i Norge (prosent):" disabled={!redigerbart} />
              <Skjema.Input bredde="XS" type="number" feltNavn="andelKontrakterINorge" label="Andel av kontrakter i Norge (prosent):" disabled={!redigerbart} />
              <Skjema.Input bredde="XS" type="number" feltNavn="andelOppdragINorge" label="Andel av oppdrag i Norge (prosent):" disabled={!redigerbart} />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Hvor blir arbeidstakerne i hovedsak rekruttert?">
                <LandVelger disabled={!redigerbart} feltNavn="arbeidstakereRekruttertILand" label="Land:" />
              </Nav.Fieldset>
              <Nav.Fieldset legend="Etter hvilket lands rett blir oppdragskontraker i hovedsak inngått?">
                <LandVelger disabled={!redigerbart} feltNavn="oppdragsKontrakterIHovedsakInngaattILand" label="Land:" />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}
VirksomhetNorge.propTypes = {
  redigerbart: PT.bool.isRequired,
  soknadForm: MPT.SoknadForm,
};

VirksomhetNorge.defaultProps = {
  soknadForm: {},
};

const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
});
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(VirksomhetNorge);
