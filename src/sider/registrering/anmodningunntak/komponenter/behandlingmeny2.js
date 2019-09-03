import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';

const Behandlingsmeny2 = props => {
  const { title, knappeRader } = props;
  return (
    <Nav.EkspanderbartpanelBase ariaTittel="Behandlingsmeny" className="oppsummering__meny" heading={<div className="behandlingsmeny_title">{title}</div>}>
      <div className="meny__innhold">
        {/* {knappeRader && knappeRader.map(knappeRad => <Nav.Knapp mini className="innhold__element" onClick={knappeRad.clickFunc}>{knappeRad.label}</Nav.Knapp>)} */}
        {knappeRader && knappeRader.map(knappeRad => {
          if (knappeRad.redigerbart === true) {
            return (<Nav.Knapp mini className="innhold__element" onClick={knappeRad.clickFunc}>{knappeRad.label}</Nav.Knapp>);
          }
          else if (knappeRad.redigerbart === undefined) {
            if (knappeRad.disabled === true) {
              return (<Nav.Knapp disabled={knappeRad.disabled} mini className="innhold__element" onClick={knappeRad.clickFunc}>{knappeRad.label}</Nav.Knapp>);
            }
            else {
              return (<Nav.Knapp mini className="innhold__element" onClick={knappeRad.clickFunc}>{knappeRad.label}</Nav.Knapp>);
            }
          }
        })}
      </div>
    </Nav.EkspanderbartpanelBase>
  );
};
Behandlingsmeny2.propTypes = {
  title: PT.string.isRequired,
  knappeRader: PT.arrayOf(PT.shape({
    label: PT.string,
    clickFunc: PT.func,
    redigerbart: PT.bool,
  })).isRequired,
};

export default Behandlingsmeny2;
