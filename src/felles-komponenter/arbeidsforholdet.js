import React from 'react';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import DatoOmrade from './datoOmrade/datoOmrade';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import { boolTilNorsk } from '../utils/utils';

import './arbeidsforholdet.css';
import EnkeltDato from './datoOmrade/enkeltDato';

const uuid = require('uuid/v4');

function Arbeidsavtalen({ avtalen }) {
  const {
    avloenningstype,
    yrke,
    beregnetAntallTimerPrUke,
    endringsdatoStillingsprosent,
  } = avtalen;

  return (
    <div className="arbeidsavtale">
      <dt>Timer pr uke</dt>
      <dd>{beregnetAntallTimerPrUke || '-'}</dd>
      <dt>Sist endret</dt>
      <dd><EnkeltDato dato={endringsdatoStillingsprosent} /></dd>
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
 * @param props Et objekt med det aktuelle arbeidsforholdet.
 */
const Arbeidsforholdet = props => {
  const {
    arbeidsforholdIDnav,
    ansettelsesPeriode,
    arbeidsforholdstype,
    Aordning,
    arbeidsgiver: { navn: arbeidsgiverNavn },
    arbeidsavtaler,
  } = props.arbeidsforhold;

  return (
    <div className="panelSeksjon arbeidsforholdet">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader
          ikon={Ikoner.Ferdig}
          tittel={`Arbeidsforhold: ${arbeidsgiverNavn}`}
          undertittel={<div>Periode: <EnkeltDato dato={ansettelsesPeriode.fom} /> - <EnkeltDato dato={ansettelsesPeriode.tom} /> </div>}
        />}
        ariaTittel={`Panel for arbeidsforhold hos ${arbeidsgiverNavn}`} >
        <Nav.Row className="arbeidsforholdet__enkelt">
          <div className="arbeidsforholdene panelSeksjon">
            <Nav.Row className="arbeidsforhold__enkelt">
              <Nav.Column xs="5">
                <Nav.Container fluid>
                  <DatoOmrade periode={ansettelsesPeriode} />
                  <dl className="arbeidsforholdet__detaljer">
                    <dt>A-ordning:</dt>
                    <dd>{boolTilNorsk(Aordning)}</dd>
                  </dl>
                </Nav.Container>
              </Nav.Column>
              <Nav.Column xs="7">
                <dl className="arbeidsforholdet__detaljer">
                  <dt>NAV-ID:</dt>
                  <dd>{arbeidsforholdIDnav}</dd>
                  <dt>Type:</dt>
                  <dd>{arbeidsforholdstype}</dd>
                </dl>
                <dl className="arbeidsforholdet__detaljer">
                  { arbeidsavtaler.map(avtalen => <Arbeidsavtalen key={uuid()} avtalen={avtalen} />) }
                </dl>
              </Nav.Column>
            </Nav.Row>
          </div>
        </Nav.Row>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

Arbeidsforholdet.propTypes = {
  arbeidsforhold: MPT.Arbeidsforhold.isRequired,
  leggtilArbeidsforhold: PT.func.isRequired,
};


export default Arbeidsforholdet;
