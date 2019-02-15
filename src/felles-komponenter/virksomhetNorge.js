import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';
import LandVelger from './skjema/landvelger';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import { fagsakSelectors } from '../ducks/fagsaker/';
import './virksomhetNorge.css';

function VirksomhetNorge (props) {
  const { redigerbart } = props;
  const panelIkon = Ikoner.Ferdig;

  return (
    <div className="virksomhetNorge panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Opplysninger om arbeidsgivers virksomhet i Norge" undertittel="" />}
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
                <LandVelger disabled={!redigerbart} feltNavn="arbeidstakereRekruttert" label="Land:" />
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
};

const mapStateToProps = state => ({
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
});
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(VirksomhetNorge);
