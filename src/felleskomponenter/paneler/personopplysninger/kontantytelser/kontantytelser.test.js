import React from 'react';

import * as Nav from '../../../../utils/navFrontend';

import { Kontantytelser } from './kontantytelser';

describe('Kontantytelser', () => {
  const props = {
    sakOgBehandling: {
      eosBarnetrygd: true,
    },
  };

  it('viser om søker mottar EOSBarnetrygd', () => {
    let kontantytelser = shallow(<Kontantytelser {...props} />);
    let fieldset = kontantytelser.find(Nav.Fieldset);

    expect(fieldset).toHaveLength(1);
    expect(fieldset.children().text()).toBe('JA');

    props.sakOgBehandling.eosBarnetrygd = false;
    kontantytelser = shallow(<Kontantytelser {...props} />);
    fieldset = kontantytelser.find(Nav.Fieldset);

    expect(fieldset.children().text()).toBe('NEI');
  });
});
