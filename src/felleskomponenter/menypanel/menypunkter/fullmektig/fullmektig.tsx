import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from 'AppTypes';

import * as KV from '../../../../kodeverk';
import * as Ikoner from '../../../../resources/images';
import * as Nav from '../../../../utils/navFrontend';
import * as Etiketter from '../etiketter';

import EditableElementListe from '../editableElementListe';

import { redigerbartSelectors } from '../../../../ducks/redigerbart';

import './fullmektig.css';

const mapStateToProps = (state: RootState) => ({
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const Fullmektig = ({
  redigerbart,
}: PropsFromRedux) => (
  <div className="fullmektig">
    <div>
      <Nav.typo.Undertittel style={{ display: 'inline', marginRight: '1em' }}>{KV.Menypunkter.Fullmektig.tittel}</Nav.typo.Undertittel>
      <Etiketter.FraSoknad style={{ marginRight: '0.3em' }} />
      <Etiketter.ArbeidsgiversDel />
    </div>
    {/* <EditableElementListe
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
    /> */}
  </div>
);

export default connector(Fullmektig);
