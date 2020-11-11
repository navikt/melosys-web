import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from 'AppTypes';

import * as KV from '../../../../kodeverk';
import * as Ikoner from '../../../../resources/images';
import * as Nav from '../../../../utils/navFrontend';
import * as Etiketter from '../etiketter';
import * as Enkel from './enkel';

import EditableElementListe from '../editableElementListe';

import { redigerbartSelectors } from '../../../../ducks/redigerbart';

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

const mapStateToProps = (state: RootState) => ({
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const Arbeidssteder = ({
  redigerbart,
}: PropsFromRedux) => (
  <div className="arbeidssteder">
    <div>
      <Nav.typo.Undertittel style={{ display: 'inline', marginRight: '1em' }}>{KV.Menypunkter.Arbeidssteder.tittel}</Nav.typo.Undertittel>
      <Etiketter.FraSoknad style={{ marginRight: '0.3em' }} />
      <Etiketter.ArbeidsgiversDel />
    </div>
    <EditableElementListe
      redigerbart={redigerbart}
      feltNavn="arbeidUtland"
      redigererKomponent={Enkel.Land.Redigerer}
      redigeringUtfortKomponent={Enkel.Land.RedigeringUtfort}
      leggTilTekst="Legg til ny seksjon"
      hentDefaultElement={() => arbeidUtlandDefaultElement}
      tittelTekst={KV.Panel.arbeidssteder.undertitler.arbeidsstedLand}
      tittelIkon={Ikoner.Kontor}
      tittelUnderstrek
      harData={elementListe => elementListe.length !== 0}
      flereRedigeringsknapper={false}
    />
    <EditableElementListe
      redigerbart={redigerbart}
      feltNavn="arbeidsstedOffshore"
      redigererKomponent={Enkel.Offshore.Redigerer}
      redigeringUtfortKomponent={Enkel.Offshore.RedigeringUtfort}
      leggTilTekst="Legg til ny seksjon"
      hentDefaultElement={() => ({})}
      tittelTekst={KV.Panel.arbeidssteder.undertitler.arbeidsstedOffshore}
      tittelIkon={Ikoner.Helikopter}
      tittelUnderstrek
      harData={elementListe => elementListe.length !== 0}
      flereRedigeringsknapper={false}
    />
    <EditableElementListe
      redigerbart={redigerbart}
      feltNavn="arbeidsstedSkip"
      redigererKomponent={Enkel.Skip.Redigerer}
      redigeringUtfortKomponent={Enkel.Skip.RedigeringUtfort}
      leggTilTekst="Legg til ny seksjon"
      hentDefaultElement={() => ({})}
      tittelTekst={KV.Panel.arbeidssteder.undertitler.arbeidsstedSkip}
      tittelIkon={Ikoner.Skip}
      tittelUnderstrek
      harData={elementListe => elementListe.length !== 0}
      flereRedigeringsknapper={false}
    />
    <EditableElementListe
      redigerbart={redigerbart}
      feltNavn="arbeidsstedFly"
      redigererKomponent={Enkel.Fly.Redigerer}
      redigeringUtfortKomponent={Enkel.Fly.RedigeringUtfort}
      leggTilTekst="Legg til ny seksjon"
      hentDefaultElement={() => ({})}
      tittelTekst={KV.Panel.arbeidssteder.undertitler.arbeidsstedFly}
      tittelIkon={Ikoner.Fly}
      tittelUnderstrek
      harData={elementListe => elementListe.length !== 0}
      flereRedigeringsknapper={false}
    />
  </div>
);

export default connector(Arbeidssteder);
