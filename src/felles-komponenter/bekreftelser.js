import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';

import './bekreftelser.css';

// const uuid = require('uuid/v4');

function boolTilNorsk (value) {
  return value ? 'JA' : 'NEI';
}

function Bekreftelser ({ bekreftelser }) {
  const utsendt = boolTilNorsk(bekreftelser.utsendt);
  const ansatt = boolTilNorsk(bekreftelser.utsendt);
  const erstatter = boolTilNorsk(bekreftelser.utsendt);
  const over24m = boolTilNorsk(bekreftelser.over24m);
  const arbeidsgiveravgift = boolTilNorsk(bekreftelser.arbeidsgiveravgift);
  const trygdeavgiftTrukket = boolTilNorsk(bekreftelser.trygdeavgift.trukket);
  const trygdeavgiftTrukketDato = bekreftelser.trygdeavgift.tom;

  return (
    <div className="bekreftelser panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Arbeidsgivers bekreftelse">
        <Nav.Row className="bekreftelser__seksjon">
          {/* START DATO RANGE */}
          <Nav.Column xs="12">
            <dl className="bekreftelser__detaljer">
              <dt>Arbeidsgiver bekrefter at abeidstaker er utsendt?</dt>
              <dd>{utsendt}</dd>
              <dt>Er arbeidstakeren ansatt under utsendingen?</dt>
              <dd>{ansatt}</dd>
              <dt>Erstatter arbeidstakeren en eller flere utsendte?</dt>
              <dd>{erstatter}</dd>
              <dt>Er arbeidstaker tidligere utsendt i en periode over 24 mnd?</dt>
              <dd>{over24m}</dd>
              <dt>Plikter arbeidsgiver å betale arbeidsgiveravgift?</dt>
              <dd>{arbeidsgiveravgift}</dd>
              <dt>Blir trygdeavgift trukket gjennom skatten under utenlandsoppholdet?</dt>
              <dd>{trygdeavgiftTrukket} - gjelder t.o.m {trygdeavgiftTrukketDato}</dd>
            </dl>
          </Nav.Column>
        </Nav.Row>
      </Nav.EkspanderbartPanel>
    </div>
  );
}

Bekreftelser.propTypes = {
  bekreftelser: MPT.Bekreftelser,
};

Bekreftelser.defaultProps = {
  bekreftelser: {},
};

export default Bekreftelser;
