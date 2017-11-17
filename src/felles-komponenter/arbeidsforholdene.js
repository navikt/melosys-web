import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import DatoOmrade from './datoOmrade/datoOmrade';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import { boolTilNorsk } from '../utils/utils';

import './arbeidsforholdene.css';

const uuid = require('uuid/v4');

function Arbeidsavtalen({ avtalen }) {
  const {
    arbeidstidsordning,
    avloenningstype,
    yrke,
    beregnetAntallTimerPrUke,
    endringsdatoStillingsprosent,
  } = avtalen;

  return (
    <div className="arbeidsavtale">
      <Nav.Element>Arbeidsavtale</Nav.Element>
      <dt>Ordning</dt>
      <dd>{arbeidstidsordning || '-'}</dd>
      <dt>Timer pr uke</dt>
      <dd>{beregnetAntallTimerPrUke || '-'}</dd>
      <dt>Sist endret</dt>
      <dd>{endringsdatoStillingsprosent || '-'}</dd>
      <dt>Yrke</dt>
      <dd>{yrke || '-'}</dd>
      <dt>Lønnstype</dt>
      <dd>{avloenningstype || '-'}</dd>
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
    arbeidsforholdIDnav,
    ansettelsesPeriode,
    arbeidsforholdstype,
    Aordning,
    arbeidsgiver: { navn: arbeidsgiverNavn },
    arbeidsavtaler,
  } = arbeidsforhold;

  return (
    <div className="panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={Ikoner.Ferdig} tittel={`Arbeidsforhold: ${arbeidsgiverNavn}`} undertittel={`Periode: ${ansettelsesPeriode.fom} - ${ansettelsesPeriode.tom}`} />}
        ariaTittel="Panel for personinformasjon" >
        <Nav.Row className="arbeidsforhold__enkelt">
          <div className="arbeidsforholdene panelSeksjon">
            <Nav.Row className="arbeidsforhold__enkelt">
              <Nav.Column xs="5">
                <Nav.Container fluid>
                  <DatoOmrade periode={ansettelsesPeriode} />
                  <dl className="arbeidsforhold__detaljer">
                    <dt>A-ordning:</dt>
                    <dd>{boolTilNorsk(Aordning)}</dd>
                  </dl>
                </Nav.Container>
              </Nav.Column>
              <Nav.Column xs="7">
                <dl className="arbeidsforhold__detaljer">
                  <dt>NAV-ID:</dt>
                  <dd>{arbeidsforholdIDnav}</dd>
                  <dt>Type:</dt>
                  <dd>{arbeidsforholdstype}</dd>
                </dl>
                <dl className="arbeidsforhold__detaljer">
                  { arbeidsavtaler.map(avtalen => <Arbeidsavtalen key={uuid()} avtalen={avtalen} />) }
                </dl>
              </Nav.Column>
            </Nav.Row>
          </div>
        </Nav.Row>
      </Nav.EkspanderbartpanelBase>
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
