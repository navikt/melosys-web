import React from 'react';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import EnkeltDato from './datoOmrade/enkeltDato';
import { kodeverkObjektTilTerm } from '../utils/kodeverk';

import './sideOppsummering.css';

function SideOppsummering(props) {
  const { oppsummering } = props;
  if (!oppsummering) return <div />;
  const {
    saksnummer,
    sakstype,
    status,
    registrertDato,
    sisteOpplysningerHentetDato,
  } = oppsummering;

  const {
    lagreOgLukkHandle,
    oppfriskSaksopplysningerHandle,
    tilbakeleggeHandle,
  } = props;

  return (
    <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
      <Nav.Panel className="saksbehandling__soknadSammendrag">
        {/* START BEHANDLINGSMENY */}
        <Nav.Row>
          <Nav.Column xs="12" md="12">
            <div className="oppsummering__menylinje">
              <Nav.EkspanderbartpanelBase ariaTittel="Behandlingsmeny" className="oppsummering__meny" heading={<div className="behandlingsmeny_title">Behandlingsmeny</div>}>
                <div className="meny__innhold">
                  <Nav.Knapp type="hoved" mini className="innhold__element" onClick={lagreOgLukkHandle}>Lagre og lukk</Nav.Knapp>
                  <Nav.Knapp type="hoved" mini className="innhold__element" onClick={tilbakeleggeHandle}>Legg tilbake i kø</Nav.Knapp>
                  <Nav.Knapp type="hoved" mini className="innhold__element" onClick={oppfriskSaksopplysningerHandle}>Oppfrisk saksopplysninger</Nav.Knapp>
                </div>
              </Nav.EkspanderbartpanelBase>
            </div>
          </Nav.Column>
        </Nav.Row>
        {/* END BEHANDLINGSMENY */}
        <Nav.Row>
          <Nav.Column xs="12" md="6">
            <Nav.Undertittel className="soknadSammendrag__header">Søknad om {kodeverkObjektTilTerm(sakstype)}</Nav.Undertittel>
          </Nav.Column>
        </Nav.Row>
        {/* START BEHANDLINGSSTATUS */}
        <Nav.Row>
          <Nav.Column xs="12">
            <dl aria-label="behandlingsinformasjon" className="oppsummering__detaljer--rad">
              <dt>Saksnummer:</dt>
              <dd>{saksnummer || '-'}</dd>
              <dt>Behandlingsstatus:</dt>
              <dd>{kodeverkObjektTilTerm(status)}</dd>
              <dt>Oppholdsland:</dt>
              <dd>-</dd>
              <dt>Sist oppdatert:</dt>
              <dd><EnkeltDato dato={sisteOpplysningerHentetDato} visTidspunkt /></dd>
              <dt>Registrert dato:</dt>
              <dd><EnkeltDato dato={registrertDato} /></dd>
            </dl>
          </Nav.Column>
        </Nav.Row>
        {/* SLUTT BEHANDLINGSSTATUS */}
      </Nav.Panel>
    </section>
  );
}

SideOppsummering.propTypes = {
  oppsummering: MPT.Oppsummering.isRequired,
  oppfriskSaksopplysningerHandle: PT.func.isRequired,
  lagreOgLukkHandle: PT.func.isRequired,
  tilbakeleggeHandle: PT.func.isRequired,
};

export default SideOppsummering;
