import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';

import EnkeltDato from './datoOmrade/enkeltDato';

import './inntekt.css';

const uuid = require('uuid/v4');

function InntektPeriode({ inntekt }) {
  const { beloep, inntektsperiodetype, virksomhet: { orgnummer }, beskrivelse } = inntekt;
  const etterbetalingsperiode = inntekt.tilleggsinformasjon.tilleggsinformasjonDetaljer.etterbetalingsperiode || { startDato: '-', sluttDato: '-' };

  return (
    <tr>
      <td className="detaljer__fom"><EnkeltDato dato={etterbetalingsperiode.startDato} /></td>
      <td className="detaljer__tom"><EnkeltDato dato={etterbetalingsperiode.sluttDato} /></td>
      <td className="detaljer__orgnr">{orgnummer}</td>
      <td className="detaljer__inntekt">{beloep} pr {inntektsperiodetype}</td>
      <td className="detaljer__inntekt">{beskrivelse}</td>
    </tr>
  );
}

InntektPeriode.propTypes = {
  inntekt: MPT.InntektLinje.isRequired,
};

function Inntekt ({ inntekt: { inntekt, soknaden } }) {
  const { inntektListe } = inntekt.arbeidsInntektIdent.arbeidsInntektMaaned.arbeidsInntektInformasjon;
  const { prMaaned: utenlandsNaeringPrMaaned, valuta: utenlandsNaeringValuta } = soknaden.inntekt.naringsinntekt.utenlands;
  const { prMaaned: utenlandsLonnPrMaaned, valuta: utenlandsLonnValuta } = soknaden.inntekt.lonnsinntekt.utenlands;

  return (
    <div className="inntekt panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Inntekt" apen>
        <Nav.Row className="inntekt__seksjon">
          <Nav.Column xs="12">
            <table className="inntekt__detaljer">
              <tbody>
                <tr>
                  <th>Fra dato</th><th>Til dato</th><th>Org.nr</th><th>Inntekt</th><th>Beskrivelse</th>
                </tr>
                {inntektListe.map(inntektLinje => <InntektPeriode key={uuid()} inntekt={inntektLinje} />)}
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
      </Nav.EkspanderbartPanel>
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
