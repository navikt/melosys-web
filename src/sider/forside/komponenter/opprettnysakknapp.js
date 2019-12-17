import React from 'react';
import PT from 'prop-types';

import * as Mui from '../../../felleskomponenter/ui';
import * as Ikoner from '../../../resources/images';

import './opprettnysakknapp.css';

const OpprettNySakKnapp = ({
  onClick,
}) => (
  <div className="opprettNySak">
    <Mui.Knapp onClick={onClick} type="flat" ikon={Ikoner.AddOne}>OPPRETT SAK</Mui.Knapp>
  </div>
);

OpprettNySakKnapp.propTypes = {
  onClick: PT.func.isRequired,
};

export default OpprettNySakKnapp;
