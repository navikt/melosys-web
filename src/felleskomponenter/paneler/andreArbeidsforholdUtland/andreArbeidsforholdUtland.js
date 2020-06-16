import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as Mui from '../../../felleskomponenter/ui';
import * as Ikoner from '../../../resources/images';
import * as Utils from '../../../utils';

import { redigerbartSelectors } from '../../../ducks/redigerbart';

import PanelHeader from '../../panelHeader/panelHeader';
import EnkeltArbeidsforholdUtland from './enkeltArbeidsforholdUtland';
import PanelListe from '../panelListe';

import './andreArbeidsforholdUtland.css';

export const AndreArbeidsforholdUtland = ({
  redigerbart,
}) => (
  <div className="andreArbeidsforholdUtland panelSeksjon">
    <Nav.EkspanderbartpanelBase
      heading={<PanelHeader tittel={KV.Panel.andreArbeidsforholdUtland.tittel} />}
      ariaTittel="Panel for andre arbeidsforhold i utlandet"
    >
      <Mui.Undertittel
        ikon={Ikoner.Arbeidsgiver}
        tekst={KV.Panel.andreArbeidsforholdUtland.undertitler.arbeidsforholdIUtlandet}
        className="undertittel"
      />
      <PanelListe
        redigerbart={redigerbart}
        feltNavn="arbeidsforholdUtland"
        leggTilTekst="+ LEGG TIL NYTT ARBEIDSFORHOLD I UTLANDET"
        slettTekst="Slett arbeidsforhold"
        elementKomponent={EnkeltArbeidsforholdUtland}
        defaultElement={{ uuid: Utils._uuid() }}
      />
      <Mui.Undertittel
        ikon={Ikoner.Arbeidsgiver}
        tekst={KV.Panel.andreArbeidsforholdUtland.undertitler.selvstendigNaeringsdrivendeIUtlandet}
        className="undertittel selvstendigNaeringsvirksomhetUndertittel"
      />
      <PanelListe
        redigerbart={redigerbart}
        leggTilTekst="+ LEGG TIL NY SELVSTENDIG VIRKSOMHET I UTLANDET"
        slettTekst="Slett næringsvirksomhet"
        feltNavn="selvstendigNaeringsvirksomhetUtland"
        elementKomponent={EnkeltArbeidsforholdUtland}
        defaultElement={{ uuid: Utils._uuid() }}
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
