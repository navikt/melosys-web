import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from 'AppTypes';

import * as Nav from '../../../../utils/navFrontend';
import * as Etiketter from '../etiketter';
import * as KV from '../../../../kodeverk';
import * as Utils from '../../../../utils';

import MKV from '../../../../melosyskodeverk';

import { behandlingsgrunnlagSelectors } from '../../../../ducks/behandlingsgrunnlag';

import Soknadsperiode from './soknadsperiode';

const mapStateToProps = (state: RootState) => ({
  soknadsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type PeriodeOgLandProps = PropsFromRedux & {
  visArbeidsforholdRolleEtiketter: boolean,
  redigerbart: boolean,
  lagreSoknadOgOppfriskSaksopplysninger: () => void,
};

const PeriodeOgLand = ({
  visArbeidsforholdRolleEtiketter,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
  soknadsland,
}: PeriodeOgLandProps) => {
  const soknadslandTerms = soknadsland.map((land: string) => KV.kodeTilTerm(land, MKV.KTObjects.landkoder));

  return (
    <div>
      <div style={{ marginBottom: '1em' }}>
        <Nav.typo.Undertittel style={{ display: 'inline', marginRight: '1em' }}>{KV.Menypunkter.PeriodeOgLand.tittel}</Nav.typo.Undertittel>
        <Etiketter.FraSoknad style={{ marginRight: '0.3em' }} />
        {
          visArbeidsforholdRolleEtiketter &&
          <Etiketter.ArbeidsgiversDel />
        }
      </div>
      <Nav.Row>
        <Nav.Column xs="6">
          <Soknadsperiode
            redigerbart={redigerbart}
            lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger}
          />
        </Nav.Column>
        <Nav.Column xs="6">
          <Nav.typo.EtikettLiten>Land</Nav.typo.EtikettLiten>
          { Utils.streng.arrayTilKonjunksjon(soknadslandTerms) || 'Ingen søknadsland' }
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

export default connector(PeriodeOgLand);
