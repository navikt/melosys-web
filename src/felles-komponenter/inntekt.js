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
  // TODO (17. nov): Neste 2 linjer må kobles mot informasjon fra søknaden når denne er klar
  const { prMaaned: utenlandsNaeringPrMaaned, valuta: utenlandsNaeringValuta } = { prMaaned: '2000', valuta: 'EUR' };
  const { prMaaned: utenlandsLonnPrMaaned, valuta: utenlandsLonnValuta } = { prMaaned: '1150', valuta: 'GBP' };

  const panelUndertittel = inntekt[0] ? `Nyeste inntekt: ${inntekt[0].beloep} i perioden ${inntekt[0].utbetaltIPeriode}` : '';

  return (
    <div className="inntekt panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={Ikoner.Ferdig} tittel="Inntekt" undertittel={panelUndertittel} />}
        ariaTittel="Panel for personinformasjon" >
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
            <dl className="inntekt__soknad">
              <dt>Inntekt fra utenlandsk arbeidsgiver: Der Investition Ghmb</dt>
              <dd>{utenlandsLonnPrMaaned} {utenlandsLonnValuta} pr måned</dd>
              <dt>Inntekt fra næringsvirksomhet fra utenlandsk oppdragsgiver</dt>
              <dd>{utenlandsNaeringPrMaaned} {utenlandsNaeringValuta} pr måned</dd>
            </dl>
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
