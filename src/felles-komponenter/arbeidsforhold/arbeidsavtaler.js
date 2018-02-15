import React from 'react';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';
import Tabell from '../tabell/tabell';

import EnkeltDato from '../datoOmrade/enkeltDato';

import './arbeidsforholdet.css';

const Arbeidsavtaler = props => {
  const { arbeidsavtaler = [] } = props;
  const grafArbeidsavtale = arbeidsavtaler.reduce((samling, arbeidsavtale) => {
    const {
      yrke, arbeidstidsordning, avtaltArbeidstimerPerUke, stillingsprosent, antallTimerFraGammeltRegister = '-', endringsdatoStillingsprosent,
    } = arbeidsavtale;
    return [...samling, [yrke, arbeidstidsordning, avtaltArbeidstimerPerUke, antallTimerFraGammeltRegister, stillingsprosent, EnkeltDato(endringsdatoStillingsprosent)]];
  }, []);

  return (
    <div>
      <Nav.Undertittel>Arbeidsavtaler</Nav.Undertittel>
      <Tabell
        tabellData={grafArbeidsavtale}
        kolonneNavn={['Yrke', 'Arbeidsordning', 'Timer pr uke', 'Timer gammelt reg.', 'Stillingsprosent', 'Sist endret']}
        linjerPerSide={5}
      />
    </div>
  );
};

Arbeidsavtaler.propTypes = {
  arbeidsavtaler: MPT.Arbeidsavtaler,
};

Arbeidsavtaler.defaultProps = {
  arbeidsavtaler: [],
};

export default Arbeidsavtaler;
