import React from 'react';

import * as Nav from '../../../utils/navFrontend';

import Medlemskap, { MedlemskapGruppe, MedlemskapEnkeltPeriode } from './medlemskap';

describe('Medlemskap', () => {
  let props = null;

  beforeEach(() => {
    props = {
      medlemskap: {
        perioderMed: [],
        perioderUten: [],
        perioderUavklart: [],
        perioderAvvist: [],
      },
    };
  });

  it('Viser tre medlemskapsgrupper', () => {
    const medlemskap = shallow(<Medlemskap {...props} />);
    const medlemskapsgrupper = medlemskap.find(MedlemskapGruppe);

    expect(medlemskapsgrupper).toHaveLength(3);
    expect(medlemskapsgrupper.first().props().perioder).toBe(props.medlemskap.perioderMed);
    expect(medlemskapsgrupper.at(1).props().perioder).toBe(props.medlemskap.perioderUten);
    expect(medlemskapsgrupper.last().props().perioder).toBe(props.medlemskap.perioderUavklart);
  });
});

describe('MedlemskapGruppe', () => {
  let props = null;

  beforeEach(() => {
    props = {
      perioder: [],
      overskrift: 'overskrift',
    };
  });

  it('viser overskrift', () => {
    const medlemskapGruppe = shallow(<MedlemskapGruppe {...props} />);
    const overskrift = medlemskapGruppe.find(Nav.typo.Undertittel);

    expect(overskrift).toHaveLength(1);
    expect(overskrift.children().text()).toBe(props.overskrift);
  });

  it('lister ut gitte perioder', () => {
    props.perioder = [
      {
        periodeID: 1,
      },
      {
        periodeID: 2,
      },
    ];
    const medlemskapGruppe = shallow(<MedlemskapGruppe {...props} />);
    const enkeltPerioder = medlemskapGruppe.find(MedlemskapEnkeltPeriode);

    expect(enkeltPerioder).toHaveLength(2);
    expect(enkeltPerioder.first().props().enkeltPeriode).toBe(props.perioder[0]);
    expect(enkeltPerioder.last().props().enkeltPeriode).toBe(props.perioder[1]);
  });

  it('viser infomelding dersom ingen perioder oppgitt', () => {
    const medlemskapGruppe = shallow(<MedlemskapGruppe {...props} />);
    const section = medlemskapGruppe.find('section');

    expect(section.children().text()).toBe('(ingen data funnet)');
  });
});

describe('MedlemskapEnkeltPeriode', () => {
  let props = null;

  beforeEach(() => {
    props = {
      enkeltPeriode: {
        periodeID: 1,
        periode: {
          fom: '13.12.13',
          tom: '14.12.13',
        },
      },
    };
  });

  it('vises uten å krasje', () => {
    shallow(<MedlemskapEnkeltPeriode {...props} />);
  });
});
