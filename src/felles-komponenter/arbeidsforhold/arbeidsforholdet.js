import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/index';
import * as Ikoner from '../../resources/images/index';

import DatoOmrade from '../datoOmrade/datoOmrade';
import EnkeltDato from '../datoOmrade/enkeltDato';
import PanelHeader from '../panelHeader/panelHeader';
import Permisjoner from './permisjoner';
import TimerTimelonnet from './timertimelonnet';
import Utenlandsopphold from './utenlandsopphold';
import Inntekt from './inntekt';

import { boolTilNorsk, datoDiff } from '../../utils/utils';

import './arbeidsforholdet.css';

const uuid = require('uuid/v4');

/** Dette er komponent for iterering av arbeidsavtaler slik den leveres innenfor ett
 * arbeidsforhold
 * @param { props.avtalen } Den enkelte avtale.
 */
function Arbeidsavtalen({ avtalen }) {
  const {
    arbeidstidsordning,
    yrke,
    beregnetAntallTimerPrUke,
    antallTimerFraGammeltRegister,
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
            {antallTimerFraGammeltRegister && <div><dt>Antall timer fra gammelt register</dt><dd>37,5</dd></div> }
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
    arbeidsforholdID,
    arbeidsavtaler,
    timerTimelonnet,
    utenlandsopphold,
    permisjonOgPermittering,
    inntekt,
  } = props.arbeidsforhold;

  const { navn: arbeidsgiverNavn } = arbeidsgiver;
  const { forretningsadresse = { gateadresse: { gatenavn: '' }, postnr: '', land: '' } } = arbeidsgiver;

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
              <Nav.Row>
                <Nav.Knapp className="arbeidsforholdet__relevantknapp" onClick={e => props.leggtilArbeidsforhold(e, arbeidsforholdID)}>Sett som utsendende</Nav.Knapp>
              </Nav.Row>
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
                    <dd>{forretningsadresse.gateadresse.gatenavn}</dd>
                    <dd>{forretningsadresse.postnr}</dd>
                    <dd>{forretningsadresse.land}</dd>
                    <dt>A-ordning:</dt>
                    <dd>{boolTilNorsk(Aordning)}</dd>
                  </dl>
                </Nav.Column>
              </Nav.Row>
              { arbeidsavtaler.map(avtalen => <Arbeidsavtalen key={uuid()} avtalen={avtalen} />) }
            </div>
          </Nav.Row>
          <Nav.Row>
            {inntekt && <Inntekt inntekt={inntekt} /> }
            {timerTimelonnet && <TimerTimelonnet timerTimelonnet={timerTimelonnet} /> }
            {permisjonOgPermittering && <Permisjoner permisjoner={permisjonOgPermittering} /> }
            {utenlandsopphold && <Utenlandsopphold utenlandsopphold={utenlandsopphold} /> }
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
