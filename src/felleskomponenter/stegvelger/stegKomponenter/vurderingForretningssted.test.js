import React from 'react';

import { VurderingForretningssted, Forretningssteder } from './vurderingForretningssted';

describe('VurderingForretningssted', () => {
  const props = {
    bekreftOgFortsett: jest.fn(),
    tilstand: {
      omfattetINorge: {},
      omfattetILand: {},
      lovvalgsbestemmelse: 'lovvalgsbestemmelse',
      avklarteForretningsland: [],
      harAvklaring: false,
    },
    valgteVirksomheter: [
      {
        virksomhetId: '1',
        navn: 'NAV',
      },
    ],
    avklartForretningsland: [],
    omfattetILand: {},
    lovvalgsbestemmelse: 'lovvalgsbestemmelse',
    redigerbart: true,
    oppdaterData: jest.fn(),
    slettData: jest.fn(),
  };

  describe('Forretningssteder', () => {
    const vurderingForretningssted = shallow(<VurderingForretningssted {...props} />);
    const forretningssteder = vurderingForretningssted.find(Forretningssteder);
    const forretningsstederProps = forretningssteder.props();

    it('vises', () => {
      expect(forretningssteder).toHaveLength(1);
    });

    it('får virksomheter', () => {
      expect(forretningsstederProps.valgteVirksomheter).toBe(props.valgteVirksomheter);
    });

    it('får avklarteForretningsland', () => {
      expect(forretningsstederProps.avklarteForretningsland).toEqual(props.tilstand.avklarteForretningsland);
    });

    it('får oppdaterData', () => {
      expect(forretningsstederProps.oppdaterData).toEqual(props.oppdaterData);
    });

    it('får slettData', () => {
      expect(forretningsstederProps.slettData).toEqual(props.slettData);
    });

    it('får redigerbart', () => {
      expect(forretningsstederProps.redigerbart).toEqual(props.redigerbart);
    });
  });
});
