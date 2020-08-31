import React from 'react';

import SokFullmektigOrg from './sokFullmektigOrg';

describe('SokFullmektigOrg', () => {
  let props = null;

  beforeEach(() => {
    props = {
      lagreNyFullmektigOgOppdaterLokalt: jest.fn(),
      hentOrg: jest.fn(),
    };
  });

  it('viser en input', () => {
    const komponent = shallow(<SokFullmektigOrg {...props} />);
    expect(komponent.find('Input')).toHaveLength(1);
  });

  it('viser en knapp', () => {
    const komponent = shallow(<SokFullmektigOrg {...props} />);
    expect(komponent.find('Knapp')).toHaveLength(1);
  });

  it.skip('ved klikk på knapp kalles lagreFullmektigOgOppdaterLokalt-prop', () => {
    const komponent = shallow(<SokFullmektigOrg {...props} />);
    komponent.find('Input').simulate('change', { target: { value: 810072512 } });
    komponent.find('Knapp').simulate('click');
    expect(props.lagreNyFullmektigOgOppdaterLokalt).toHaveBeenCalled();
  });
});
