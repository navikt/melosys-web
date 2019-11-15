import React from 'react';

import * as Nav from '../../../../utils/navFrontend';
import StegerstatterBase from './stegerstatterBase';

describe('StegerstatterBase', () => {
  let props = null;

  beforeEach(() => {
    props = {
      tittel: 'Tittel',
      beskrivelse: 'Beskrivelse',
    };
  });

  it('viser tittel-prop', () => {
    const stegerstatterBase = shallow(<StegerstatterBase {...props} />);

    expect(stegerstatterBase.find(Nav.typo.Systemtittel).childAt(0).text()).toBe(props.tittel);
  });

  it('Viser beskrivelse-prop', () => {
    const stegerstatterBase = shallow(<StegerstatterBase {...props} />);

    expect(stegerstatterBase.find('p').text()).toBe(props.beskrivelse);
  });
});
