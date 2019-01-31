import React from 'react';

import { VurderingEndrePeriode } from './vurderingEndrePeriode';

describe('vurderingEndrePeriode', () => {
  const props = {
    oppsummering: { behandlingID: 1 },
  };

  it('viser en pdfLenkeListe', () => {
    const component = shallow(<VurderingEndrePeriode {...props} />);
    expect(component.find('PdfLenkeListe')).toHaveLength(1);
  });

  it('viser en nav hovedknapp', () => {
    const component = shallow(<VurderingEndrePeriode {...props} />);
    expect(component.find('Hovedknapp')).toHaveLength(1);
  });

  it('viser to datepickere', () => {
    const component = shallow(<VurderingEndrePeriode {...props} />);
    expect(component.find('Datepicker')).toHaveLength(2);
  })
});
