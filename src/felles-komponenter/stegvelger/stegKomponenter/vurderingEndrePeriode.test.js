import React from 'react';

import { VurderingEndrePeriode } from './vurderingEndrePeriode';

describe('vurderingEndrePeriode', () => {
  const endrePeriode = jest.fn();

  const props = {
    oppsummering: { behandlingID: 1 },
    lovvalgsPeriode: {},
    endrePeriode,
  };

  it('viser en pdfLenkeListe', () => {
    const component = shallow(<VurderingEndrePeriode {...props} />);
    expect(component.find('PdfLenkeListe')).toHaveLength(1);
  });

  it('viser en nav hovedknapp', () => {
    const component = shallow(<VurderingEndrePeriode {...props} />);
    expect(component.find('Hovedknapp')).toHaveLength(1);
  });

  describe('knappen', () => {
    it('endrer periode når den trykkes', () => {
      const component = shallow(<VurderingEndrePeriode {...props} />);
      const knapp = component.find('Hovedknapp');
      component.instance().validerAlt = jest.fn(() => true);
      knapp.simulate('click');
      expect(endrePeriode).toHaveBeenCalled();
    });
  });

  it('viser to inputs for fradato og tildato', () => {
    const component = shallow(<VurderingEndrePeriode {...props} />);
    expect(component.find('Input')).toHaveLength(2);
  });
});
