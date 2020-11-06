import React, { useState } from 'react';
import classNames from 'classnames';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from 'AppTypes';

import * as KV from '../../../../../kodeverk';
import * as Mui from '../../../../ui';
import * as Nav from '../../../../../utils/navFrontend';
import * as Ikoner from '../../../../../resources/images';

import UtfyltAdresse from './utfyltadresse';
import Felter from './felter';

import { formSelectors, formOperations } from '../../../../../ducks/form';

const mapStateToProps = (state: RootState) => ({
  oppgittAdresse: formSelectors.SoknadOppgittAdresseSelector(state),
  oppgittAdresseHarVerdier: formSelectors.SoknadOppgittAdresseHarVerdierSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  resetOppgittAdresse: () => dispatch(formOperations.reset(KV.Form.SOKNAD, [
    'oppgittAdresseGatenavn',
    'oppgittAdresseHusnummer',
    'oppgittAdressePostnummer',
    'oppgittAdressePoststed',
    'oppgittAdresseRegion',
    'oppgittAdresseLand',
  ])),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type AnnenAdresseProps = PropsFromRedux & {
  redigerbart: boolean,
  className?: string,
}

const AnnenAdresse = ({
  redigerbart,
  className,
  oppgittAdresse,
  oppgittAdresseHarVerdier,
  resetOppgittAdresse,
}: AnnenAdresseProps) => {
  const [redigerer, setRedigerer] = useState(false);
  const tittel = KV.Menypunkter.Person.undertitler.annenAdresse;

  const resetFelter = () => {
    resetOppgittAdresse();
  };
  const apneRedigering = () => {
    setRedigerer(true);
  };
  const lukkRedigering = () => {
    setRedigerer(false);
  };

  const leggTilAdresse = (
    <Nav.Fieldset legend={tittel}>
      <Nav.typo.Normaltekst style={{ marginBottom: '1em' }}>
        Her kan du legge til en adresse som vil bli brukt som bostedsadresse i A1 og SED. I brev benyttes adresse fra register.
      </Nav.typo.Normaltekst>
      {
        redigerbart &&
        <Mui.Knappelenke
          onClick={apneRedigering}
          ikon={Ikoner.Add}
        >
          Legg til adresse
        </Mui.Knappelenke>
      }
    </Nav.Fieldset>
  );

  const hentInnhold = () => {
    if (redigerer) {
      return <Felter
        tittel={tittel}
        redigerbart={redigerbart}
        bekreft={lukkRedigering}
      />;
    } else if (oppgittAdresseHarVerdier) {
      return <UtfyltAdresse
        onPencilClick={apneRedigering}
        onBinClick={resetFelter}
        tittel={tittel}
        adresse={oppgittAdresse}
        redigerbart={redigerbart}
      />;
    }

    return leggTilAdresse;
  };

  const cls = classNames(className);

  return (
    <div className={cls}>
      { hentInnhold() }
    </div>
  );
};

export default connector(AnnenAdresse);
