import React from 'react';

import * as Nav from '../../../utils/navFrontend';

import VedtakstypeBegrunnelseSkjema from './vedtakstypebegrunnelseskjema';
import VedtakstypeSkjema from './vedtakstypeskjema';
import Vedtakstype from './index';

describe('Vedtakstype', () => {
  let props = null;

  beforeEach(() => {
    props = {
      className: 'artikkel',
      redigerbart: true,
      vedtakstypeFeltNavn: 'vedtakstypeFeltNavn',
      vedtakstypebegrunnelseFeltNavn: 'vedtakstypebegrunnelseFeltNavn',
      vedtakstypeLabel: 'vedtakstypeLabel',
      vedtakstypebegrunnelseLabel: 'vedtakstypebegrunnelseLabel',
    };
  });

  it('viser et Nav.Row med korrekte props', () => {
    const vedtakstype = shallow(<Vedtakstype {...props} />);
    const row = vedtakstype.find(Nav.Row);

    expect(row).toHaveLength(1);
    expect(row.props().className).toBe(props.className);
  });

  it('viser en VedtakstypebegrunnelseSkjema med korrekte props', () => {
    const vedtakstype = shallow(<Vedtakstype {...props} />);
    const vedtakstypeBegrunnelseSkjema = vedtakstype.find(VedtakstypeBegrunnelseSkjema);
    const vedtakstypeBegrunnelseSkjemaProps = vedtakstypeBegrunnelseSkjema.props();

    expect(vedtakstypeBegrunnelseSkjema).toHaveLength(1);
    expect(vedtakstypeBegrunnelseSkjemaProps.redigerbart).toBe(props.redigerbart);
    expect(vedtakstypeBegrunnelseSkjemaProps.feltNavn).toBe(props.vedtakstypebegrunnelseFeltNavn);
    expect(vedtakstypeBegrunnelseSkjemaProps.label).toBe(props.vedtakstypebegrunnelseLabel);
  });

  it('viser en VedtakstypeSkjema med korrekte props', () => {
    const vedtakstype = shallow(<Vedtakstype {...props} />);
    const vedtakstypeSkjema = vedtakstype.find(VedtakstypeSkjema);
    const vedtakstypeSkjemaProps = vedtakstypeSkjema.props();

    expect(vedtakstypeSkjema).toHaveLength(1);
    expect(vedtakstypeSkjemaProps.redigerbart).toBe(props.redigerbart);
    expect(vedtakstypeSkjemaProps.feltNavn).toBe(props.vedtakstypeFeltNavn);
    expect(vedtakstypeSkjemaProps.label).toBe(props.vedtakstypeLabel);
  });
});
