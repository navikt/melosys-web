import React from 'react';

import { AndreArbeidsforholdUtland } from './andreArbeidsforholdUtland';
import ArbeidsforholdUtland from './arbeidsforholdUtland';

describe('AndreArbeidsforholdUtland', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
    };
  });

  it('viser alle ArbeidsforholdUtland', () => {
    const andreArbeidsforholdUtland = shallow(<AndreArbeidsforholdUtland {...props} />);
    const arbeidsforholdUtland = andreArbeidsforholdUtland.find(ArbeidsforholdUtland);

    expect(arbeidsforholdUtland).toHaveLength(2);
    arbeidsforholdUtland.forEach(n => {
      expect(n.props().redigerbart).toBe(props.redigerbart);
    });
  });
});
