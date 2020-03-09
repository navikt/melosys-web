import React from 'react';
import * as EKV from 'eessi-kodeverk';

import * as Nav from '../../utils/navFrontend';
import * as Utils from '../../utils';

import PdfLenkeListe from '.';
import MKV from '../../melosyskodeverk';

describe('PdfLenkeListe', () => {
  const vedKlikk = jest.fn(() => true);
  let props = null;

  const setup = () => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));
    props = {
      behandlingID: 1,
      dokumenter: [
        {
          navn: 'Forhåndsvis vedtaksbrev',
          type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_MANGLENDE_OPPLYSNINGER,
          data: {
            begrunnelseKode: MKV.Koder.begrunnelser.folketrygdloven.avslag.MANGLENDE_OPPLYSNINGER,
            fritekst: null,
            mottaker: MKV.Koder.aktoersroller.BRUKER,
          },
        },
        {
          navn: 'Forhåndsvis SED A003',
          type: EKV.Koder.sedtyper.A003,
          erSed: true,
        },
      ],
      vedKlikk,
    };
  };

  beforeEach(() => {
    setup();
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

  describe('forhåndsvisning av brev', () => {
    it('viser feilmelding ved 400-feil fra backend', async () => {
      const liste = shallow(<PdfLenkeListe {...props} />);

      const responseBody = {
        error: null,
        status: 400,
        message: 'feilmelding',
      };
      fetch.mockResponse(JSON.stringify(responseBody), { status: 400 });

      const lenke = liste.find('button').first();
      lenke.simulate('click');
      await Utils.delay(0);

      const alertstripe = liste.find(Nav.AlertStripe);
      expect(alertstripe.props().children).toBe(responseBody.message);
    });

    it('viser feilmelding ved 500-feil fra backend', async () => {
      const liste = shallow(<PdfLenkeListe {...props} />);

      const responseBody = {
        error: null,
        status: 500,
        message: 'feilmelding',
      };
      fetch.mockResponse(JSON.stringify(responseBody), { status: 500 });

      const lenke = liste.find('button').first();
      lenke.simulate('click');
      await Utils.delay(0);

      const alertstripe = liste.find(Nav.AlertStripe);
      expect(alertstripe.props().children).toBe('Det oppstod en feil da brevet skulle forhåndsvises!');
    });
  });

  describe('forhåndsvisning av sed', () => {
    it('viser feilmelding ved 400-feil fra backend', async () => {
      const liste = shallow(<PdfLenkeListe {...props} />);

      const responseBody = {
        error: null,
        status: 400,
        message: 'feilmelding',
      };
      fetch.mockResponse(JSON.stringify(responseBody), { status: 400 });

      const lenke = liste.find('button').last();
      lenke.simulate('click');
      await Utils.delay(0);

      const alertstripe = liste.find(Nav.AlertStripe);
      expect(alertstripe.props().children).toBe(responseBody.message);
    });

    it('viser feilmelding ved 500-feil fra backend', async () => {
      const liste = shallow(<PdfLenkeListe {...props} />);

      const boresponseBody = {
        error: null,
        status: 500,
        message: 'feilmelding',
      };
      fetch.mockResponse(JSON.stringify(boresponseBody), { status: 500 });

      const lenke = liste.find('button').last();
      lenke.simulate('click');
      await Utils.delay(0);

      const alertstripe = liste.find(Nav.AlertStripe);
      expect(alertstripe.props().children).toBe('Det oppstod en feil da SED skulle forhåndsvises!');
    });
  });
});
