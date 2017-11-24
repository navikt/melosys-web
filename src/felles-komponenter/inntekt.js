import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './inntekt.css';

const uuid = require('uuid/v4');


function InntektLinje({ inntektLinje }) {
  const { beloep, inntektsperiodetype, virksomhetID, beskrivelse, utbetaltIPeriode } = inntektLinje;
  return (
    <tr>
      <td className="detaljer__periode">{ utbetaltIPeriode }</td>
      <td className="detaljer__orgnr">{virksomhetID}</td>
      <td className="detaljer__inntekt">{beloep} pr {inntektsperiodetype}</td>
      <td className="detaljer__beskrivelse">{beskrivelse}</td>
    </tr>
  );
}

InntektLinje.propTypes = {
  inntektLinje: MPT.InntektLinje.isRequired,
};

function Inntekt ({ inntekt: { inntekt } }) {
  const panelUndertittel = inntekt[0] ? `Nyeste inntekt: ${inntekt[0].beloep} i perioden ${inntekt[0].utbetaltIPeriode}` : '';

  return (
    <div className="inntekt panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={Ikoner.Ferdig} tittel="Inntekt" undertittel={panelUndertittel} />}
        ariaTittel="Panel for inntekt" >
        <Nav.Row className="inntekt__seksjon">
          <Nav.Column xs="12">
            <table className="tabellutlisting inntekt__detaljer">
              <tbody>
                <tr>
                  <th>Utbetalt</th><th>Organisasjon</th><th>Inntekt</th><th>Beskrivelse</th>
                </tr>
                {inntekt.map(inntektLinje => <InntektLinje key={uuid()} inntektLinje={inntektLinje} />)}
              </tbody>
            </table>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="inntekt__seksjon">
          <Nav.Column xs="12">
            <Nav.Input bredde="m" label="Inntekt fra norsk arbeidsgiver opp gitt i søknaden" />
            <Nav.Input bredde="m" label="Inntekt fra utenlandsk arbeidsgiver opp gitt i søknaden" />
            <Nav.Input bredde="m" label="Inntekt fra næringsvirksomhet fra utenlandsk arbeidsgiver oppgitt i søknaden" />
          </Nav.Column>
        </Nav.Row>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

Inntekt.propTypes = {
  inntekt: MPT.Inntekt,
};

Inntekt.defaultProps = {
  inntekt: {},
};

export default Inntekt;
