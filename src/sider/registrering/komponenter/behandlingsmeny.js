import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';

const Behandlingsmeny = props => {
  const {
    redigerbart, lagreOgLukkHandle, tilbakeleggeHandle, oppfriskSaksopplysningerHandle, visHenleggDialogHandle, apneTidligereBehandlinger, avsluttSakSomBortfalt, visHenleggSak,
  } = props;

  return (
    <Nav.EkspanderbartpanelBase ariaTittel="Behandlingsmeny" className="oppsummering__meny" heading={<div className="behandlingsmeny_title">Behandlingsmeny</div>}>
      <div className="meny__innhold">
        { redigerbart && <Nav.Knapp mini className="innhold__element" onClick={lagreOgLukkHandle}>Lagre og lukk</Nav.Knapp> }
        <Nav.Knapp disabled={!redigerbart} mini className="innhold__element" onClick={tilbakeleggeHandle}>Legg tilbake i kø</Nav.Knapp>
        <Nav.Knapp disabled={!redigerbart} mini className="innhold__element" onClick={oppfriskSaksopplysningerHandle}>Oppdater saksopplysninger</Nav.Knapp>
        { redigerbart && visHenleggSak && <Nav.Knapp mini className="innhold__element" onClick={visHenleggDialogHandle}>Henlegg sak</Nav.Knapp> }
        { redigerbart && <Nav.Knapp mini className="innhold__element" onClick={avsluttSakSomBortfalt}>Avslutt sak som bortfalt</Nav.Knapp>}
        { <Nav.Knapp mini className="innhold__element" onClick={apneTidligereBehandlinger}>Vis tidligere behandlinger</Nav.Knapp> }
      </div>
    </Nav.EkspanderbartpanelBase>
  );
};

Behandlingsmeny.propTypes = {
  lagreOgLukkHandle: PT.func.isRequired,
  tilbakeleggeHandle: PT.func.isRequired,
  oppfriskSaksopplysningerHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  avsluttSakSomBortfalt: PT.func.isRequired,
  apneTidligereBehandlinger: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  visHenleggSak: PT.bool.isRequired,
};

export default Behandlingsmeny;
