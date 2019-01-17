import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import { BOOLSK } from '../constants';

import './virksomhetNorge.css';

function VirksomhetNorge () {
  const panelIkon = Ikoner.Ferdig;

  return (
    <div className="virksomhetNorge panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Opplysninger om virksomhet i Norge" undertittel="" />}
        ariaTittel="Opplysninger om virksomhet i Norge">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="12">
              <Skjema.RadioGruppe label="Er organiasjonen et bemanningsbyrå?" feltNavn="erBemanningsbyra">
                <Skjema.Radio feltNavn="erBemanningsbyra" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio feltNavn="erBemanningsbyra" value={BOOLSK.USANN} label="Nei" />
              </Skjema.RadioGruppe>
            </Nav.Column>
            <Nav.Column xs="6">
              <Skjema.Input bredde="XS" type="number" feltNavn="utsendteNeste12Mnd" label="Antall utsendte de neste 12 mnd:" />
              <Skjema.Input bredde="XS" type="number" feltNavn="antallAdmAnsatte" label="Antall administrativt ansatte:" />
              <Skjema.Input bredde="XS" type="number" feltNavn="antallAdminAnsatteEOS" label="Antall administrativt ansatte EØS:" />
            </Nav.Column>
            <Nav.Column xs="6">
              <Skjema.Input bredde="XS" type="number" feltNavn="andelOmsetningINorge" label="Andel av omsetning i Norge:" />
              <Skjema.Input bredde="XS" type="number" feltNavn="andelKontrakterINorge" label="Andel av kontrakter i Norge:" />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Skal den ansatte fortsette sitt norske arbeidsforhold i selskapet?">
                <Skjema.Radio feltNavn="utsendtFortsetterArbeidsforholdIUtlandet" value={BOOLSK.SANN} label="Ja" />
                <Skjema.Radio feltNavn="utsendtFortsetterArbeidsforholdIUtlandet" value={BOOLSK.USANN} label="Nei" />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

export default VirksomhetNorge;
