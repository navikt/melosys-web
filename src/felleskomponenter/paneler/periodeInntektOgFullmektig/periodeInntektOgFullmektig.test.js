import React from 'react';

import * as Nav from '../../../utils/navFrontend';

import Soknadsperiode from './soknadsperiode';
import Inntektutland from './inntektutland';
import Fullmektige from './fullmektige';
import PeriodeInntektOgFullmektig from './periodeInntektOgFullmektig';

describe('PeriodeInntektOgFullmektig', () => {
  const props = {
    lagreSoknadOgOppfriskSaksopplysninger: jest.fn(),
  };

  const periodeInntektOgFullmektig = shallow(<PeriodeInntektOgFullmektig {...props} />);

  it('viser et panel', () => {
    const panel = periodeInntektOgFullmektig.find(Nav.EkspanderbartpanelBase);

    expect(panel).toHaveLength(1);
  });

  it('viser søknadsperiode', () => {
    const soknadsperiode = periodeInntektOgFullmektig.find(Soknadsperiode);
    const soknadsperiodeProps = soknadsperiode.props();

    expect(soknadsperiode).toHaveLength(1);
    expect(soknadsperiodeProps.lagreSoknadOgOppfriskSaksopplysninger).toBe(props.lagreSoknadOgOppfriskSaksopplysninger);
  });

  it('Viser fullmektige', () => {
    const fullmektige = periodeInntektOgFullmektig.find(Fullmektige);

    expect(fullmektige).toHaveLength(1);
  });

  it('Viser inntekt utland', () => {
    const inntektUtland = periodeInntektOgFullmektig.find(Inntektutland);

    expect(inntektUtland).toHaveLength(1);
  });
});
