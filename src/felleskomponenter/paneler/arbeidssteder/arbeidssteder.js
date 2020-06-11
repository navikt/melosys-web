import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as Mui from '../../../felleskomponenter/ui';
import * as Ikoner from '../../../resources/images';

import { redigerbartSelectors } from '../../../ducks/redigerbart';

import PanelHeader from '../../panelHeader/panelHeader';
import EnkeltArbeidsstedLand from './enkeltArbeidsstedLand';
import EnkeltArbeidsstedOffshore from './enkeltArbeidsstedOffshore';
import EnkeltArbeidsstedSkip from './enkeltArbeidsstedSkip';
import EnkeltArbeidsstedFly from './enkeltArbeidsstedFly';

import PanelListe from '../panelListe';

import './arbeidssteder.css';

const arbeidUtlandDefaultElement = {
  adresse: {
    gatenavn: '',
    husnummer: '',
    landkode: '',
    postnummer: '',
    poststed: '',
    region: '',
  },
  foretakNavn: '',
  foretakOrgnr: '',
  arbeidUtlandHjemmekontor: null,
};

export const Arbeidssteder = ({
  redigerbart,
}) => (
  <div className="arbeidssteder panelSeksjon">
    <Nav.EkspanderbartpanelBase
      heading={<PanelHeader tittel={KV.Paneltitler.arbeidssteder} />}
      ariaTittel="Panel for arbeidssteder"
    >
      <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst="Arbeidssted på land" className="undertittel" />
      <PanelListe
        feltNavn="arbeidUtland"
        elementKomponent={EnkeltArbeidsstedLand}
        leggTilTekst="+ LEGG TIL NYTT ARBEIDSSTED PÅ LAND"
        slettTekst="Slett arbeidssted"
        redigerbart={redigerbart}
        className="arbeidUtland"
        defaultElement={arbeidUtlandDefaultElement}
      />
      <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst="Arbeidssted offshore" className="undertittel" />
      <PanelListe
        feltNavn="arbeidsstedOffshore"
        elementKomponent={EnkeltArbeidsstedOffshore}
        leggTilTekst="+ LEGG TIL NYTT ARBEIDSSTED OFFSHORE"
        slettTekst="Slett arbeidssted"
        redigerbart={redigerbart}
        className="arbeidsstedOffshore"
      />
      <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst="Arbeidssted på skip" className="undertittel" />
      <PanelListe
        feltNavn="arbeidsstedSkip"
        elementKomponent={EnkeltArbeidsstedSkip}
        leggTilTekst="+ LEGG TIL NYTT ARBEIDSSTED PÅ SKIP"
        slettTekst="Slett arbeidssted"
        redigerbart={redigerbart}
        className="arbeidsstedSkip"
      />
      <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst="Arbeidssted ombord på fly" className="undertittel" />
      <PanelListe
        feltNavn="arbeidsstedFly"
        elementKomponent={EnkeltArbeidsstedFly}
        leggTilTekst="+ LEGG TIL NYTT ARBEIDSSTED PÅ FLY"
        slettTekst="Slett arbeidssted"
        redigerbart={false} // TODO: låse opp når behandlingsgrunnlag har felt for arbeidssted for fly (MELOSYS-3784)
        className="arbeidsstedFly"
      />
    </Nav.EkspanderbartpanelBase>
  </div>
);

Arbeidssteder.propTypes = {
  redigerbart: PT.bool.isRequired,
};

Arbeidssteder.defaultProps = {};

const mapStateToProps = state => ({
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

export default connect(mapStateToProps)(Arbeidssteder);
