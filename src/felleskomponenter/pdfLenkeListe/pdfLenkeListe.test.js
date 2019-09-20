import React from 'react';
import PdfLenkeListe from '.';

describe('PdfLenkeListe', () => {
  const vedKlikk = jest.fn();
  let props = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));
    props = {
      behandlingID: 1,
      dokumenter: [],
      vedKlikk,
    };
  });

  it('viser samme antall linker som antall dokumenter passet som props ', () => {
    props.dokumenter = [];
    let liste = shallow(<PdfLenkeListe {...props} />);
    expect(liste.find('button')).toHaveLength(props.dokumenter.length);

    props.dokumenter = [
      { navn: 'test', type: 'type', data: {} },
      { navn: 'test', type: 'type', data: {} },
      { navn: 'test', type: 'type', data: {} },
    ];
    liste = shallow(<PdfLenkeListe {...props} />);
    expect(liste.find('button')).toHaveLength(props.dokumenter.length);
  });
});
