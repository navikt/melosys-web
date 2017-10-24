import React from 'react';
import PT from 'prop-types';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';

import './arbeidsforholdene.css';

const uuid = require('uuid/v4');

/** Dato-område
 * Todo: se datoområde i Medlemmer. Mulig denne løftes ut i egen fil for gjenbruk.
 *
 * @param tittel
 * @param dato
 * @constructor
 */
const DatoOmrade = ({ tittel1, tittel2, dato1, dato2 }) => (
  <Nav.Row>
    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>{tittel1}</Nav.Element>{dato1}</Nav.Column>
    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>{tittel2}</Nav.Element>{dato2}</Nav.Column>
  </Nav.Row>
);

DatoOmrade.propTypes = {
  tittel1: PT.string.isRequired,
  tittel2: PT.string.isRequired,
  dato1: PT.string.isRequired,
  dato2: PT.string.isRequired,
};

function Arbeidsavtalen({ avtalen }) {
  const { yrke, beregnetAntallTimerPrUke, endringsdatoStillingsprosent } = avtalen;

  return (
    <div className="arbeidsavtale">
      <Nav.Element>Arbeidsavtale</Nav.Element>
      <dt>Yrke</dt>
      <dd>{yrke}</dd>
      <dt>Timer pr uke</dt>
      <dd>{beregnetAntallTimerPrUke}</dd>
      <dt>Sist endret</dt>
      <dd>{endringsdatoStillingsprosent}</dd>
    </div>
  );
}

Arbeidsavtalen.propTypes = {
  avtalen: MPT.Arbeidsavtale.isRequired,
};


/** Dette er komponenten for ett enkelt Arbeidsforhold. Denne eksporteres ikke til omverden, men brukes
 * kun av komponenten Arbeidsforholdene.
 *
 * @param props.arbeidsforhld Object Et objekt med det aktuelle arbeidsforholdet.
 * @returns {XML}
 */
function Arbeidsforhold({ arbeidsforhold }) {
  const {
    ansettelsesPeriode,
    registrertDato,
    bekreftetDato,
    ordning,
    yrkeskode,
    yrke,
    arbeidstidsordning,
    arbeidsforholdstype,
    arbeidsavtale,
  } = arbeidsforhold;

  return (
    <div className="arbeidsforholdene panelSeksjon">
      <Nav.Row className="arbeidsforhold__enkelt">
        {/* START DATO RANGE */}
        <Nav.Column xs="5">
          <Nav.Container fluid>
            <DatoOmrade tittel1="Fra" dato1={ansettelsesPeriode.fom} tittel2="Til" dato2={ansettelsesPeriode.tom || '-'} />
            <DatoOmrade tittel1="Registrert" dato1={registrertDato} tittel2="Besluttet" dato2={bekreftetDato} />
            <dl className="arbeidsforhold__detaljer">
              <dt>Ordning:</dt>
              <dd>{ordning}</dd>
            </dl>
          </Nav.Container>
        </Nav.Column>
        {/* SLUTT DATO RANGE */}

        {/* START DETALJER */}
        <Nav.Column xs="7">
          <dl className="arbeidsforhold__detaljer">
            <dt>Yrkeskode:</dt>
            <dd>{yrkeskode}</dd>
            <dt>Yrke:</dt>
            <dd>{yrke}</dd>
            <dt>Arbeidstidsordning:</dt>
            <dd>{arbeidstidsordning}</dd>
            <dt>Type:</dt>
            <dd>{arbeidsforholdstype}</dd>
          </dl>
          <dl className="arbeidsforhold__detaljer">
            { arbeidsavtale.map(avtalen => <Arbeidsavtalen avtalen={avtalen} />)}
          </dl>
        </Nav.Column>
        {/* SLUTT DETALJER */}
      </Nav.Row>
    </div>
  );
}

Arbeidsforhold.propTypes = {
  arbeidsforhold: MPT.Arbeidsforhold.isRequired,
};

/** Dette er grunnkomponenten som eksporteres til omverden.
 * Flertall: Arbeidsforholdene - en array med alle arbeidsforhold, hver som ett objekt.
 * Entall: Arbeidsforhold - et objekt med ett enkelt arbeidsforhold.
 *
 * @param props.arbeidsforholdene Array En liste over alle arbeidforhold, hvert som et objekt
 * @returns {XML}
 */
function Arbeidsforholdene ({ arbeidsforholdene }) {
  return (
    <div className="arbeidsforholdene panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Arbeidsforhold" apen>
        <Nav.Row className="arbeidsforhold__enkelt">
          {arbeidsforholdene.map(arbeidsforhold => <Arbeidsforhold key={uuid()} arbeidsforhold={arbeidsforhold} />)}
        </Nav.Row>
      </Nav.EkspanderbartPanel>
    </div>
  );
}

Arbeidsforholdene.propTypes = {
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
};

export default Arbeidsforholdene;
