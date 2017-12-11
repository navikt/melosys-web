import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/index';
import * as Ikoner from '../../resources/images/index';

import DatoOmrade from '../datoOmrade/datoOmrade';
import PanelHeader from '../panelHeader/panelHeader';
import { boolTilNorsk, datoDiff } from '../../utils/utils';

import './arbeidsforholdet.css';
import EnkeltDato from '../datoOmrade/enkeltDato';

const uuid = require('uuid/v4');

function Arbeidsavtalen({ avtalen }) {
  const {
    arbeidstidsordning,
    yrke,
    beregnetAntallTimerPrUke,
  } = avtalen;

  return (
    <Nav.Row>
      <div className="arbeidsavtale">
        <Nav.Column xs="6">
          <dl className="arbeidsforholdet__detaljer">
            <dt>Yrke</dt>
            <dd>{yrke || '-'}</dd>
            <dt>Arbeidstidsordning</dt>
            <dd>{arbeidstidsordning}</dd>
          </dl>
        </Nav.Column>
        <Nav.Column xs="6">
          <dl className="arbeidsforholdet__detaljer">
            <dt>Stillingsprosent</dt>
            <dd>{beregnetAntallTimerPrUke || '-'}</dd>
            <dt>Antall timer pr uke</dt>
            <dd>{beregnetAntallTimerPrUke || '-'}</dd>
            <dt>Antall timer fra gammelt register</dt>
            <dd>37,5</dd>
          </dl>
        </Nav.Column>
      </div>
    </Nav.Row>
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
    ansettelsesPeriode,
    sistBekreftet,
    arbeidsforholdstype,
    Aordning,
    arbeidsgiver,
    arbeidsavtaler,
  } = props.arbeidsforhold;

  const { navn: arbeidsgiverNavn } = arbeidsgiver;

  const varighet = datoDiff(ansettelsesPeriode.fom, ansettelsesPeriode.tom);
  const varighetLabel = `${varighet} mnd`;

  return (
    <div className="panelSeksjon arbeidsforholdet">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader
          ikon={Ikoner.Ferdig}
          tittel={`Arbeidsforhold: ${arbeidsgiverNavn}`}
          undertittel={<div>Periode: <EnkeltDato dato={ansettelsesPeriode.fom} /> - <EnkeltDato dato={ansettelsesPeriode.tom} /> </div>}
        />}
        ariaTittel={`Panel for arbeidsforhold hos ${arbeidsgiverNavn}`} >
        <Nav.Container fluid>
          <Nav.Row className="arbeidsforholdet__enkelt">
            <div className="arbeidsforholdene panelSeksjon">
              <Nav.Row className="arbeidsforhold__enkelt">
                <Nav.Column xs="6">
                  <DatoOmrade periode={ansettelsesPeriode} />
                  Varighet: {ansettelsesPeriode.tom ? varighetLabel : '(ikke avsluttet)'}
                  <dl className="arbeidsforholdet__detaljer">
                    <dt>Bekreftet</dt>
                    <dd><EnkeltDato dato={sistBekreftet} /></dd>
                    <dt>Type arbeidsforhold:</dt>
                    <dd>{arbeidsforholdstype}</dd>
                  </dl>
                </Nav.Column>
                <Nav.Column xs="6">
                  <dl className="arbeidsforholdet__detaljer">
                    <dt>Org. nr</dt>
                    <dd>{arbeidsgiver.orgnr}</dd>
                    <dt>Forretningsadresse:</dt>
                    <dd>{arbeidsgiver.forretningsadresse.gateadresse.gatenavn}</dd>
                    <dd>{arbeidsgiver.forretningsadresse.postnr}</dd>
                    <dd>{arbeidsgiver.forretningsadresse.land}</dd>
                    <dt>A-ordning:</dt>
                    <dd>{boolTilNorsk(Aordning)}</dd>
                  </dl>
                </Nav.Column>
              </Nav.Row>
              { arbeidsavtaler.map(avtalen => <Arbeidsavtalen key={uuid()} avtalen={avtalen} />) }
            </div>
          </Nav.Row>
          <Nav.Row>
            <Nav.Undertittel>Timer timelønnet</Nav.Undertittel>
            <Nav.Undertittel>Utenlandsopphold</Nav.Undertittel>
            <Nav.Undertittel>Permisjoner</Nav.Undertittel>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

Arbeidsforholdet.propTypes = {
  arbeidsforhold: MPT.Arbeidsforhold.isRequired,
  leggtilArbeidsforhold: PT.func.isRequired,
};


export default Arbeidsforholdet;
