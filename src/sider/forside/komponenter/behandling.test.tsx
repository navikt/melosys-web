import React, { ComponentProps } from 'react';
import { shallow } from 'enzyme';
import { mock, instance } from 'ts-mockito';

import MKV from '../../../melosyskodeverk';

import * as Skjema from '../../../felleskomponenter/skjema';

import { Behandling } from './behandling';

describe('Behandling', () => {
  const mockedProps = mock<ComponentProps<typeof Behandling>>();
  const props = instance(mockedProps);

  it(`viser ikke behandlingstema ${MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND}`, () => {
    const behandling = shallow(<Behandling {...props} />);
    const select = behandling.find(Skjema.Select);
    const options = select.find('option');

    options.forEach(option => {
      expect(option.props().value).not.toBe(MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND);
    });
  });
});
