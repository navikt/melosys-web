import React from 'react';

import * as Nav from '../../../utils/navFrontend';

import { Arbeidssteder } from './arbeidssteder';
import PanelListe from '../panelListe';

describe('Arbeidssteder', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
    };
  });

  it('viser panel', () => {
    const arbeidssteder = shallow(<Arbeidssteder {...props} />);

    expect(arbeidssteder.find(Nav.EkspanderbartpanelBase)).toHaveLength(1);
  });

  describe('panellister for arbeidssteder', () => {
    it('vises 4 ganger', () => {
      const arbeidssteder = shallow(<Arbeidssteder {...props} />);
      const panelLister = arbeidssteder.find(PanelListe);

      expect(panelLister).toHaveLength(4);
    });
  });
});
