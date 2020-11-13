import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from 'AppTypes';
import { Aktoer } from 'Domene';

import MKV from '../../../../melosyskodeverk';

import * as Nav from '../../../../utils/navFrontend';
import * as Api from '../../../../services/api';
import * as Utils from '../../../../utils';
import * as Hooks from '../../../../hooks';

import { fagsakSelectors } from '../../../../ducks/fagsaker';
import { redigerbartSelectors } from '../../../../ducks/redigerbart';

import Fullmektig from './fullmektig';

const aktoerTemplate: Aktoer = {
  aktoerID: null,
  databaseID: -1,
  institusjonsID: null,
  orgnr: null,
  representererKode: null,
  rolleKode: '',
  utenlandskPersonID: null,
};

const mapStateToProps = (state: RootState) => ({
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const Fullmektige = ({
  redigerbart,
  saksnummer,
}: PropsFromRedux) => {
  const [fullmektige, setFullmektige] = Hooks.useAsyncCallbackState(() => Api.Fagsaker.aktoer.hent(saksnummer, MKV.Koder.aktoersroller.REPRESENTANT), [], Utils.logger.error);
  const [disableLeggTilFullmektig, setDisableLeggTilFullmektig] = useState(false);

  const hentFullmektige = async () => {
    try {
      const fullmektigAktoerer: Aktoer[] = await Api.Fagsaker.aktoer.hent(saksnummer, MKV.Koder.aktoersroller.REPRESENTANT);
      setFullmektige(fullmektigAktoerer);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  useEffect(() => {
    hentFullmektige();
  }, []);

  const settRepresentant = (endretIndex: number, representererKode: string) => {
    setFullmektige(prevFullmektige => (
      prevFullmektige.map((fullmektig, index) => (
        index === endretIndex ? { ...fullmektig, representererKode } : fullmektig
      ))));
  };

  const lagreFullmektig = (representererKode: string | null, orgnr: string, databaseID?: number) => Api.Fagsaker.aktoer.send(saksnummer, {
    databaseID: databaseID || null,
    aktoerID: null,
    orgnr,
    utenlandskPersonID: null,
    institusjonsID: null,
    rolleKode: MKV.Koder.aktoersroller.REPRESENTANT,
    representererKode: representererKode || null,
  });

  const byttUtTemplateMedLagretFullmektig = (aktoerer: Aktoer[], lagretFullmektig: Aktoer) => aktoerer.map(fullmektig => {
    if (fullmektig.databaseID === aktoerTemplate.databaseID) return { ...lagretFullmektig };
    return { ...fullmektig };
  });

  const lagreNyFullmektigOgOppdaterLokalt = async (orgnr: string, representererKode: string | null) => {
    try {
      const lagretFullmektig = await lagreFullmektig(representererKode, orgnr);

      setFullmektige(prevFullmektige => byttUtTemplateMedLagretFullmektig(prevFullmektige, lagretFullmektig));
      setDisableLeggTilFullmektig(false);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const apneLeggTilFullmektigDialog = () => {
    setFullmektige(prevFullmektige => [...prevFullmektige, { ...aktoerTemplate }]);
    setDisableLeggTilFullmektig(true);
  };

  const slettFullmektigLokalt = (databaseID: number) => {
    const nyFullmektige = fullmektige.filter(fullmektig => fullmektig.databaseID !== databaseID);
    setFullmektige(nyFullmektige);
    setDisableLeggTilFullmektig(false);
  };

  return (
    <Nav.Container fluid>
      {
        fullmektige.map((fullmektig, index) => {
          const slettFullmektig = async () => {
            try {
              if (fullmektig.databaseID !== aktoerTemplate.databaseID) {
                await Api.Fagsaker.aktoer.slett(fullmektig.databaseID);
              }
              slettFullmektigLokalt(fullmektig.databaseID);
            } catch (e) {
              Utils.logger.error(e);
            }
          };

          const onRollechange = async (representererKode: string, orgnr?: string) => {
            try {
              if (orgnr) await lagreFullmektig(representererKode, orgnr, fullmektig.databaseID);
              settRepresentant(index, representererKode);
            } catch (e) {
              Utils.logger.error(e);
            }
          };

          return (
            <Fullmektig
              key={fullmektig.databaseID}
              databaseID={fullmektig.databaseID}
              representererKode={fullmektig.representererKode}
              orgnr={fullmektig.orgnr}
              redigerbart={redigerbart}
              onClickSlett={slettFullmektig}
              onOrgFunnet={orgnr => lagreNyFullmektigOgOppdaterLokalt(orgnr, fullmektig.representererKode)}
              settRepresentant={representererKode => settRepresentant(index, representererKode)}
              onRolleChange={onRollechange}
            />
          );
        })
      }
      <Nav.Knapp disabled={disableLeggTilFullmektig || !redigerbart} onClick={apneLeggTilFullmektigDialog} type="standard">+ LEGG TIL FULLMEKTIG</Nav.Knapp>
    </Nav.Container>
  );
};

export default connector(Fullmektige);
