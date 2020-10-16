import React, { ComponentProps } from 'react';
import { mock, instance } from 'ts-mockito';
import { shallow } from 'enzyme';
import each from 'jest-each';

import MKV from '../../melosyskodeverk';

import { Menypanel } from './menypanel';
import Sidemeny from '../sidemeny';

const {
  SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS,
  SØKNAD_A1_YRKESAKTIVE_EØS,
} = MKV.Koder.behandlingsgrunnlagtyper;

describe('MenyPanel', () => {
  const mockedProps = mock<ComponentProps<typeof Menypanel>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it('Viser bare oppgitte menypunkter', () => {
    props.menypunkter = [
      'Person',
      'Utenlandsoppdraget',
    ];
    const menypanel = shallow(<Menypanel {...props} />);
    const sidemeny = menypanel.find(Sidemeny);

    const sidemenyLinkGroups = sidemeny.props().linkGroups;
    expect(sidemenyLinkGroups[0].links).toHaveLength(1);
    expect(sidemenyLinkGroups[0].links[0].label).toBe('Person');

    expect(sidemenyLinkGroups[1].links).toHaveLength(1);
    expect(sidemenyLinkGroups[1].links[0].label).toBe('Utenlandsoppdraget');
  });

  it('Viser ikke undertitler med ingen menypunkter', () => {
    props.menypunkter = [];
    const menypanel = shallow(<Menypanel {...props} />);
    const sidemeny = menypanel.find(Sidemeny);

    expect(sidemeny.props().linkGroups).toHaveLength(0);
  });

  each([
    'Lønn og godtgjørelser',
    'Om virksomheten i Norge',
    'Øvrig om arbeidstaker',
  ]).it(`Viser menypunkt %p bare ved behandlingsgrunnlagtype ${SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS}`, menypunkt => {
    props.menypunkter = [menypunkt];
    props.behandlingsgrunnlagtype = SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS;
    let menypanel = shallow(<Menypanel {...props} />);
    let sidemeny = menypanel.find(Sidemeny);

    expect(sidemeny.props().linkGroups[0].links).toHaveLength(1);

    props.behandlingsgrunnlagtype = SØKNAD_A1_YRKESAKTIVE_EØS;
    menypanel = shallow(<Menypanel {...props} />);
    sidemeny = menypanel.find(Sidemeny);

    expect(sidemeny.props().linkGroups).toHaveLength(0);
  });

  it('Viser content for Person-menypunkt', () => {
    props.menypunkter = [
      'Person',
      'Familieforhold',
    ];
    const menypanel = shallow(<Menypanel {...props} />);
    let sidemeny = menypanel.find(Sidemeny);
    const sidemenyOnClick = sidemeny.props().onClick;

    sidemenyOnClick(0, 1);

    sidemeny = menypanel.find(Sidemeny);
    expect(sidemeny.props().linkGroups[0].links[1].active).toBe(true);
    //TODO: expect content to be person-content, må stykke opp menypanel litt for å teste dette
    expect(false).toBe(true);
  });
});
