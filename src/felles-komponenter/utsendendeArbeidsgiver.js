import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './utsendendeArbeidsgiver.css';

function UtsendendeArbeidsgiver () {
  return (
    <div className="organisasjonerNorge panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={Ikoner.Ferdig} tittel="Utsendende arbeidsgiver" undertittel="" />}
        ariaTittel="Panel for utsendende arbeidsgiver i Norge" >
        <Nav.Container fluid>
          <Nav.Row className="enkeltorganisasjon__seksjon">
            arbeidsgiver placeholder
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
