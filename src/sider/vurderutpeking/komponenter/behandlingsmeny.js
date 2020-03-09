import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';

import './behandlingsmeny.css';

const Behandlingsmeny = ({
  redigerbart,
  lagreOgLukkHandle,
  tilbakeleggeHandle,
  oppfriskSaksopplysningerHandle,
  visHenleggDialogHandle,
  apneTidligereBehandlinger,
  visAvsluttSakSomBortfaltDialogHandle,
  visHenleggSak,
  visAvslagSoknadDialogHandle,
  visAvslagManglendeOpplysninger,
  visOppfriskSaksopplysninger,
  visRevurderVedtakDialogHandle,
  visRevurderVedtak,
}) => (
  <Nav.EkspanderbartpanelBase ariaTittel="Behandlingsmeny" className="oppsummering__meny" heading={<div className="behandlingsmeny_title">Behandlingsmeny</div>}>
    <div className="meny__innhold">
      { redigerbart && <Nav.Knapp mini className="innhold__element" onClick={lagreOgLukkHandle}>Lagre og lukk</Nav.Knapp> }
      <Nav.Knapp disabled={!redigerbart} mini className="innhold__element" onClick={tilbakeleggeHandle}>Legg tilbake i kø</Nav.Knapp>
      { visOppfriskSaksopplysninger &&
      <Nav.Knapp disabled={!redigerbart} mini className="innhold__element" onClick={oppfriskSaksopplysningerHandle}>Oppdater registeropplysninger</Nav.Knapp>}
      { redigerbart && visHenleggSak && <Nav.Knapp mini className="innhold__element" onClick={visHenleggDialogHandle}>Henlegg sak</Nav.Knapp> }
      { redigerbart && <Nav.Knapp mini className="innhold__element" onClick={visAvsluttSakSomBortfaltDialogHandle}>Avslutt sak som bortfalt</Nav.Knapp>}
      { redigerbart && visAvslagManglendeOpplysninger && <Nav.Knapp mini className="innhold__element" onClick={visAvslagSoknadDialogHandle}>Avslå søknad pga. manglende opplysninger</Nav.Knapp> }
      { <Nav.Knapp mini className="innhold__element" onClick={apneTidligereBehandlinger}>Vis alle behandlinger</Nav.Knapp> }
      { !redigerbart && visRevurderVedtak && <Nav.Knapp mini className="innhold__element" onClick={visRevurderVedtakDialogHandle} >Vurder vedtak på nytt</Nav.Knapp> }
    </div>
  </Nav.EkspanderbartpanelBase>
);

Behandlingsmeny.propTypes = {
  lagreOgLukkHandle: PT.func.isRequired,
  tilbakeleggeHandle: PT.func.isRequired,
  oppfriskSaksopplysningerHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  visAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  apneTidligereBehandlinger: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  visHenleggSak: PT.bool.isRequired,
  visOppfriskSaksopplysninger: PT.bool,
  visRevurderVedtakDialogHandle: PT.func.isRequired,
  visAvslagManglendeOpplysninger: PT.bool.isRequired,
  visRevurderVedtak: PT.bool.isRequired,
};

Behandlingsmeny.defaultProps = {
  visOppfriskSaksopplysninger: true,
};

export default Behandlingsmeny;
