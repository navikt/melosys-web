import React, { ComponentProps } from 'react';
import { mock, instance } from 'ts-mockito';
import { shallow } from 'enzyme';

import { Barnetrygd } from './barnetrygd';

describe('Barnetrygd', () => {
  const mockedProps = mock<ComponentProps<typeof Barnetrygd>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it('viser "JA" om sakOgBehandling.eosBarnetrygd er true', () => {
    props.sakOgBehandling = {
      eosBarnetrygd: true,
    };
    const barnetrygd = shallow(<Barnetrygd {...props} />);

    expect(barnetrygd.contains('Ja')).toBe(true);
  });

  it('viser "NEI" om sakOgBehandling.eosBarnetrygd er false', () => {
    props.sakOgBehandling = {
      eosBarnetrygd: false,
    };
    const barnetrygd = shallow(<Barnetrygd {...props} />);

    expect(barnetrygd.contains('Nei')).toBe(true);
  });
});
