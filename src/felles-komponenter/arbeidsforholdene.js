import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';

import './arbeidsforholdene.css';
import DatoOmrade from './datoOmrade/datoOmrade';

const uuid = require('uuid/v4');

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
 * @param props.arbeidsforhold Object Et objekt med det aktuelle arbeidsforholdet.
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
    arbeidsgiver,
  } = arbeidsforhold;

  return (
    <div className="panelSeksjon">
      <Nav.EkspanderbartPanel tittel={`Arbeidsforhold: ${arbeidsgiver.navn}`}>
        <Nav.Row className="arbeidsforhold__enkelt">
          <div className="arbeidsforholdene panelSeksjon">
            <Nav.Row className="arbeidsforhold__enkelt">
              <Nav.Column xs="5">
                <Nav.Container fluid>
                  <DatoOmrade periode={ansettelsesPeriode} />
                  <Nav.Row>
                    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>Registrert</Nav.Element>{registrertDato}</Nav.Column>
                    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>Besluttet</Nav.Element>{bekreftetDato}</Nav.Column>
                  </Nav.Row>
                  <dl className="arbeidsforhold__detaljer">
                    <dt>Ordning:</dt>
                    <dd>{ordning}</dd>
                  </dl>
                </Nav.Container>
              </Nav.Column>
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
                  { arbeidsavtale.map(avtalen => <Arbeidsavtalen key={uuid()} avtalen={avtalen} />)}
                </dl>
              </Nav.Column>
            </Nav.Row>
          </div>
        </Nav.Row>
      </Nav.EkspanderbartPanel>
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
    <div className="arbeidsforholdene">
      {arbeidsforholdene.map(arbeidsforhold => <Arbeidsforhold key={uuid()} arbeidsforhold={arbeidsforhold} />)}
    </div>
  );
}

Arbeidsforholdene.propTypes = {
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
};

export default Arbeidsforholdene;
