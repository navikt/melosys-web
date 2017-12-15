import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './utsendendeArbeidsgiver.css';

function UtsendendeArbeidsgiver () {
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
              <dl className="juridisk__detaljer">
                <dt>Antall ansatte:</dt>
                <dd>350</dd>
                <dt>Antall adm. ansatte:</dt>
                <dd>250</dd>
                <dt>Andel omsetning i Norge:</dt>
                <dd>78.5</dd>
                <dt>Kontrakter i Norge:</dt>
                <dd>50.5</dd>
                <dt>Er bemanningsbyrå:</dt>
                <dd>NEI</dd>
                <dt>Drift siste 24 mnd:</dt>
                <dd>JA</dd>
                <dt>Antall utsendte:</dt>
                <dd>30</dd>
              </dl>
            </Nav.Column>
            <Nav.Column xs="6">
              <dl className="arbeidsgiver__detaljer">
                <dt>Kontaktperson</dt>
                <dd>Ola Nordmann</dd>
                <dt>Telefon</dt>
                <dd><a href="tel:22232425">22 23 24 25</a></dd>
                <dt>E-post</dt>
                <dd>ola.nordmann@firmadomenet.no</dd>
                <dt>Fullmektig for arbeidsgiver:</dt>
                <dd>Deloitte</dd>
                <dt>Fullmektiges postadresse:</dt>
                <dd>Postboks 7700</dd>
                <dd>5020 Bergen</dd>
                <dd>NORGE</dd>
                <dt>Fullmektiges telefon:</dt>
                <dd><a href="tel:22232425">22 23 24 25</a></dd>
                <dt>Fullmektiges e-post:</dt>
                <dd><a href="mailto:post@deloitte.no">post@deloitte.no</a></dd>
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
};

UtsendendeArbeidsgiver.defaultProps = {
  organisasjoner: [],
};

export default UtsendendeArbeidsgiver;
