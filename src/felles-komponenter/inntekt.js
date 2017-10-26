import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';

import './inntekt.css';

// const uuid = require('uuid/v4');


function Inntekt () {
  return (
    <div className="inntekt panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Inntekt" apen>
        <Nav.Row className="inntekt__seksjon">
          {/* START DATO RANGE */}
          <Nav.Column xs="12">
            <Nav.Element>Arbeidsforholdsperioder med inntekt</Nav.Element>
            <table className="inntekt__detaljer">
              <tbody>
                <tr>
                  <th>Fra dato</th><th>Til dato</th><th>Arbeidsgiver</th><th>Org.nr</th><th>Inntekt</th>
                </tr>
                <tr>
                  <td className="detaljer__fom">2010-10-01</td>
                  <td className="detaljer__tom">-</td>
                  <td className="detaljer__firma">Bergensfinans A</td>
                  <td className="detaljer__orgnr">123456789</td>
                  <td className="detaljer__inntekt">65.000 pr mnd</td>
                </tr>
                <tr>
                  <td className="detaljer__fom">2000-10-01</td>
                  <td className="detaljer__tom">2009-10-01</td>
                  <td className="detaljer__firma">Bergen Finans & Forsikring AS</td>
                  <td className="detaljer__orgnr">372251637</td>
                  <td className="detaljer__inntekt">55.000 pr mnd</td>
                </tr>
                <tr>
                  <td className="detaljer__fom">2000-10-01</td>
                  <td className="detaljer__tom">2009-10-01</td>
                  <td className="detaljer__firma">Oslo Risikoinvestering AS</td>
                  <td className="detaljer__orgnr">745236019</td>
                  <td className="detaljer__inntekt">43.000 pr mnd</td>
                </tr>
                <tr>
                  <td className="detaljer__fom">2000-10-01</td>
                  <td className="detaljer__tom">2009-10-01</td>
                  <td className="detaljer__firma">UIO FINANS- OG INVESTERINGSFORENING</td>
                  <td className="detaljer__orgnr">445234643</td>
                  <td className="detaljer__inntekt">40.000 pr mnd</td>
                </tr>
              </tbody>
            </table>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="inntekt__seksjon">
          <Nav.Column xs="12">
            <Nav.Element>Periode med lønn fra arbeidsgiver, under utdanning</Nav.Element>
            <table className="inntekt__detaljer">
              <tbody>
                <tr>
                  <th>Fra dato</th><th>Til dato</th><th>Arbeidsgiver</th><th>Org.nr</th><th>Inntekt</th>
                </tr>
                <tr>
                  <td className="detaljer__fom">2003-10-01</td>
                  <td className="detaljer__tom">2004-04-01</td>
                  <td className="detaljer__firma">Bergensfinans AS</td>
                  <td className="detaljer__orgnr">123456789</td>
                  <td className="detaljer__inntekt">10.000 pr mnd</td>
                </tr>
              </tbody>
            </table>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="inntekt__seksjon">
          <Nav.Column xs="12">
            <Nav.Element>Periode med frilandsvirksomhet</Nav.Element>
            <table className="inntekt__detaljer">
              <tbody>
                <tr>
                  <th>Fra dato</th><th>Til dato</th><th>Arbeidsgiver</th><th>Org.nr</th><th>Inntekt</th>
                </tr>
                <tr>
                  <td className="detaljer__fom">2003-10-01</td>
                  <td className="detaljer__tom">2005-09-10</td>
                  <td className="detaljer__firma">Unni Finans</td>
                  <td className="detaljer__orgnr">762637108</td>
                  <td className="detaljer__inntekt">34.000 pr mnd</td>
                </tr>
              </tbody>
            </table>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="inntekt__seksjon">
          <Nav.Column xs="12">
            <dl className="inntekt__soknad">
              <dt>Inntekt fra utenlandsk arbeidsgiver: Der Investition Ghmb</dt>
              <dd>65.000 pr mnd</dd>
              <dt>Inntekt fra næringsvirksomhet fra utenlandsk oppdragsgiver</dt>
              <dd>ingen</dd>
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
