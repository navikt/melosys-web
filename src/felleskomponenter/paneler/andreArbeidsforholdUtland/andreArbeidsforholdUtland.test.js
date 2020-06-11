import React from 'react';

import { AndreArbeidsforholdUtland } from './andreArbeidsforholdUtland';
import PanelListe from '../panelListe';

describe('AndreArbeidsforholdUtland', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
    };
  });

  it('viser 2 panellister', () => {
    const andreArbeidsforholdUtland = shallow(<AndreArbeidsforholdUtland {...props} />);
    const panelLister = andreArbeidsforholdUtland.find(PanelListe);

    expect(panelLister).toHaveLength(2);
  });
});
