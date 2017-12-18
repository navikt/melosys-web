import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Skjema from './skjema';
import * as Ikoner from '../resources/images';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './utsendendeArbeidsgiver.css';

function UtsendendeArbeidsgiver ({ soknadArbeidNorge }) {
  console.log(soknadArbeidNorge);
  return (
    <div className="utsendendeArbeidsgiver panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={Ikoner.Ferdig} tittel="Utsendende arbeidsgiver" undertittel="" />}
        ariaTittel="Panel for utsendende arbeidsgiver i Norge" >
        <Nav.Container fluid>
          <Nav.Row className="arbeidsgiver__seksjon">
            <Nav.Column xs="6">
              <dl className="arbeidsgiver__detaljer">
                <dt>Orgnr / IDnr</dt>
                <dd>12345678</dd>
                <dt>Opprettet dato</dt>
                <dd>26.04.1979</dd>
                <dt>Organisasjonsform</dt>
                <dd>Allmennaksjeselskap (ASA)</dd>
                <dt>Postadresse</dt>
                <dd>Postboks 7700</dd>
                <dd>5020 Bergen</dd>
                <dd>NORGE</dd>
                <dt>Forretningsadresse</dt>
                <dd>Postboks 7700</dd>
                <dd>5020 Bergen</dd>
                <dd>NORGE</dd>
              </dl>
            </Nav.Column>
            <Nav.Column xs="6">
              <dl className="arbeidsgiver__detaljer">
                <Skjema.Input label="Kontaktperson" feltNavn="kontaktNavn" />
                <Skjema.Input label="Telefon" feltNavn="kontaktTelefon" />
                <Skjema.Input label="E-post" feltNavn="kontaktEpost" />
                <Skjema.Input label="Fullmektig for arbeidsgiver" feltNavn="fullmektigFirma" />
                <Skjema.Textarea label="Fullmektig adresse" maxLength={200} feltNavn="fullmektigAdresse" />
                <Skjema.Input label="Fullmektig telefon" feltNavn="fullmektigTelefon" />
                <Skjema.Input label="Fullmektig e-post" feltNavn="fullmektigEpost" />
              </dl>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

UtsendendeArbeidsgiver.propTypes = {
  organisasjoner: MPT.Organisasjoner,
  soknadArbeidNorge: MPT.ArbeidNorge,
};

UtsendendeArbeidsgiver.defaultProps = {
  organisasjoner: [],
  soknadArbeidNorge: {},
};

export default UtsendendeArbeidsgiver;
