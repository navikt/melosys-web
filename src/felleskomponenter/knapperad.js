import React from 'react';
import PT from 'prop-types';

import * as Mui from '../felleskomponenter/ui';

import './knapperad.css';

const Knapperad = ({
  bekreft,
  bekreftTekst,
  avbryt,
  avbrytTekst,
  redigerbart,
  bekreftRedigerbart,
  spinner,
  bekreftHtmlType,
  avbrytHtmlType,
}) => (
  <div className="container__knapperad">
    <Mui.Knapp htmlType={bekreftHtmlType} type="hoved" onClick={bekreft} disabled={!redigerbart || !bekreftRedigerbart} spinner={spinner}>{ bekreftTekst }</Mui.Knapp>
    <Mui.Knapp htmlType={avbrytHtmlType} onClick={avbryt} disabled={!redigerbart}>{avbrytTekst}</Mui.Knapp>
  </div>
);

Knapperad.propTypes = {
  bekreft: PT.func,
  bekreftTekst: PT.string.isRequired,
  avbryt: PT.func.isRequired,
  avbrytTekst: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  bekreftRedigerbart: PT.bool,
  spinner: PT.bool,
  bekreftHtmlType: PT.string,
  avbrytHtmlType: PT.string,
};

Knapperad.defaultProps = {
  bekreft: undefined,
  bekreftRedigerbart: true,
  spinner: false,
  bekreftHtmlType: undefined,
  avbrytHtmlType: undefined,
};

export default Knapperad;
