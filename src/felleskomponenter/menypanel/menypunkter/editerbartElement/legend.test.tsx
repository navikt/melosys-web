import React, { ComponentProps } from 'react';
import { mock, instance } from 'ts-mockito';
import { shallow } from 'enzyme';

import * as Symboler from '../symboler';

import { Status } from './types';

import Legend from './legend';

describe('Legend', () => {
  const mockedProps = mock<ComponentProps<typeof Legend>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it('Hvis status er redigering utført, vis Pencil og Bin symbol', () => {
    props.redigerbart = true;
    props.status = Status.RedigeringUtfort;
    const legend = shallow(<Legend {...props} />);

    expect(legend.find(Symboler.Rediger)).toHaveLength(1);
    expect(legend.find(Symboler.Slett)).toHaveLength(1);
  });

  it('Viser alltid bin hvis prop visAlltidBin er true', () => {
    props.redigerbart = true;
    props.status = Status.IngenData;
    props.visAlltidBin = true;
    const legend = shallow(<Legend {...props} />);

    expect(legend.find(Symboler.Slett)).toHaveLength(1);
  });
});
