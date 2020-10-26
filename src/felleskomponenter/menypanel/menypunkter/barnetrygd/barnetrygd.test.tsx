import React, { ComponentProps } from 'react';
import { mock, instance } from 'ts-mockito';
import { shallow } from 'enzyme';

import { Barnetrygd } from './barnetrygd';

describe('Barnetrygd', () => {
  const mockedProps = mock<ComponentProps<typeof Barnetrygd>>();
  const props = instance(mockedProps);

  it('viser om søker mottar EOSBarnetrygd', () => {
    props.sakOgBehandling = {
      eosBarnetrygd: true,
    };
    let barnetrygd = shallow(<Barnetrygd {...props} />);

    expect(barnetrygd.contains('JA')).toBe(true);

    props.sakOgBehandling.eosBarnetrygd = false;
    barnetrygd = shallow(<Barnetrygd {...props} />);

    expect(barnetrygd.contains('NEI')).toBe(true);
  });
});
