import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import EnkeltDato from '../felles-komponenter/datoOmrade/enkeltDato';
import './bekreftelser.css';

function boolTilNorsk (value) {
  return value ? 'JA' : 'NEI';
}

function Bekreftelser ({ bekreftelser }) {
  const {
    utsendt,
    ansatt,
    erstatter,
    over24m,
    arbeidsgiveravgift,
    trygdeavgiftTrukket,
    trygdeavgiftTrukketDato,
  } = bekreftelser;

  return (
    <div className="bekreftelser panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Arbeidsgivers bekreftelse">
        <Nav.Row className="bekreftelser__seksjon">
          {/* START DATO RANGE */}
          <Nav.Column xs="12">
            <dl className="bekreftelser__detaljer">
              <dt>Arbeidsgiver bekrefter at abeidstaker er utsendt?</dt>
              <dd>{boolTilNorsk(utsendt)}</dd>
              <dt>Er arbeidstakeren ansatt under utsendingen?</dt>
              <dd>{boolTilNorsk(ansatt)}</dd>
              <dt>Erstatter arbeidstakeren en eller flere utsendte?</dt>
              <dd>{boolTilNorsk(erstatter)}</dd>
              <dt>Er arbeidstaker tidligere utsendt i en periode over 24 mnd?</dt>
              <dd>{boolTilNorsk(over24m)}</dd>
              <dt>Plikter arbeidsgiver å betale arbeidsgiveravgift?</dt>
              <dd>{boolTilNorsk(arbeidsgiveravgift)}</dd>
              <dt>Blir trygdeavgift trukket gjennom skatten under utenlandsoppholdet?</dt>
              <dd>{boolTilNorsk(trygdeavgiftTrukket)} - gjelder t.o.m <EnkeltDato dato={trygdeavgiftTrukketDato} /></dd>
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
