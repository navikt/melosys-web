import React from 'react';

import * as Nav from '../../../../utils/navFrontend';

import SoknadsperiodeEndring from './soknadsperiodeEndring';
import { Soknadsperiode } from './soknadsperiode';

describe('Soknadsperiode', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      oppdaterPeriode: jest.fn(),
      lagreSoknadOgOppfriskSaksopplysninger: jest.fn(),
      soknadsperiodeFom: '12.12.2030',
      soknadsperiodeTom: '12.12.2033',
    };
  });

  it('viser nåværende søknadsperiode', () => {
    const soknadsperiode = shallow(<Soknadsperiode {...props} />);
    const element = soknadsperiode.find(Nav.typo.Element);

    expect(element.children().first()).not.toBeNull();
  });

  it('viser knapp for å vise dialog for endring av periode, og dialog åpnes ved klikk', () => {
    const soknadsperiode = shallow(<Soknadsperiode {...props} />);
    const knapp = soknadsperiode.findWhere(n =>
      n.type() === Nav.Hovedknapp &&
      n.children().text() === 'Endre søknadsperioden');
    const knappProps = knapp.props();

    expect(knapp).toHaveLength(1);
    expect(knappProps.disabled).toBe(!props.redigerbart);

    knapp.simulate('click');

    const soknadsperiodeEndring = soknadsperiode.find(SoknadsperiodeEndring);
    const soknadsperiodeEndringProps = soknadsperiodeEndring.props();

    expect(soknadsperiodeEndring).toHaveLength(1);

    expect(soknadsperiodeEndringProps.soknadsperiodeNyFom).toBe(props.soknadsperiodeFom);
    expect(soknadsperiodeEndringProps.soknadsperiodeNyTom).toBe(props.soknadsperiodeTom);
  });
});
