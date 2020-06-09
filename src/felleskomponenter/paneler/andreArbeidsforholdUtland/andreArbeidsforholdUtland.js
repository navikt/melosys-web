import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as Mui from '../../../felleskomponenter/ui';
import * as Ikoner from '../../../resources/images';

import { redigerbartSelectors } from '../../../ducks/redigerbart';

import PanelHeader from '../../panelHeader/panelHeader';
import ArbeidsforholdUtland from './arbeidsforholdUtland';

import './andreArbeidsforholdUtland.css';

export const AndreArbeidsforholdUtland = ({
  redigerbart,
}) => (
  <div className="andreArbeidsforholdUtland panelSeksjon">
    <Nav.EkspanderbartpanelBase
      heading={<PanelHeader tittel={KV.Paneltitler.andreArbeidsforholdUtland} />}
      ariaTittel="Panel for andre arbeidsforhold i utlandet"
    >
      <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst="Arbeidsforhold i utlandet" className="undertittel" />
      <ArbeidsforholdUtland
        redigerbart={redigerbart}
        leggTilTekst="+ LEGG TIL NYTT ARBEIDSFORHOLD I UTLANDET"
        slettTekst="Slett arbeidsforhold"
        feltNavn="arbeidsforholdUtland"
      />
      <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst="Selvstendig næringsvirksomhet i utlandet" className="undertittel selvstendigNaeringsvirksomhetUndertittel" />
      <ArbeidsforholdUtland
        redigerbart={redigerbart}
        leggTilTekst="+ LEGG TIL NY SELVSTENDIG VIRKSOMHET I UTLANDET"
        slettTekst="Slett næringsvirksomhet"
        feltNavn="selvstendigNaeringsvirksomhetUtland"
      />
    </Nav.EkspanderbartpanelBase>
  </div>
);

AndreArbeidsforholdUtland.propTypes = {
  redigerbart: PT.bool.isRequired,
};

const mapStateToProps = state => ({
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

export default connect(mapStateToProps)(AndreArbeidsforholdUtland);
