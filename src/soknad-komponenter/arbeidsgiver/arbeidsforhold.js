import React from 'react';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/index';
import * as Ikoner from '../../resources/images';

import DatoOmrade from '../../komponenter/datoOmrade/datoOmrade';
import EnkeltDato from '../../komponenter/datoOmrade/enkeltDato';
import PanelHeader from '../../komponenter/panelHeader/panelHeader';
import Permisjoner from '../../komponenter/arbeidsgiver/permisjoner';
import TimerTimelonnet from '../../komponenter/arbeidsgiver/timertimelonnet';
import Utenlandsopphold from './utenlandsopphold';
import Arbeidsavtaler from './arbeidsavtaler';
import ForretningsAdresse from '../adresser/forretningsAdresse';

import { boolTilNorsk } from '../../utils/streng';
import { datoDiff } from '../../utils/dato';

import './arbeidsforhold.css';

const uuid = require('uuid/v4');

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
    timerTimelonnet,
    utenlandsopphold,
    permisjonOgPermittering,
  } = props.arbeidsforholdet;

  const { navn: arbeidsgiverNavn } = arbeidsgiver;
  const { forretningsadresse } = arbeidsgiver;

  const varighet = datoDiff(ansettelsesPeriode.fom, ansettelsesPeriode.tom);
  const varighetLabel = `${varighet} mnd`;

  return (
    <div className="panelSeksjon arbeidsforholdet">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader
          ikon={Ikoner.Arbeidsforhold}
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
                    <ForretningsAdresse forretningsadresse={forretningsadresse} />
                    <dt>A-ordning:</dt>
                    <dd>{boolTilNorsk(Aordning)}</dd>
                  </dl>
                </Nav.Column>
                {arbeidsavtaler && <Arbeidsavtaler arbeidsavtaler={arbeidsavtaler} />}
              </Nav.Row>
            </div>
          </Nav.Row>
          <Nav.Row>
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
  arbeidsforholdet: MPT.Arbeidsforholdet.isRequired,
};

const Arbeidsforholdene = props => {
  const { arbeidsforholdene } = props;
  return (
    <div>
      { arbeidsforholdene.map(arbeidsforholdet => <Arbeidsforholdet key={uuid()} arbeidsforholdet={arbeidsforholdet} />)}
    </div>
  );
};

Arbeidsforholdene.propTypes = {
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
};


export default Arbeidsforholdene;
