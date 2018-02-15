import React from 'react';

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

const Arbeidsavtaler = () =>{

}

export default Arbeidsavtaler;
