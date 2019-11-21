import React from 'react';

import * as MKV from 'melosys-kodeverk';
import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as MPT from '../../../proptypes/';
import EnkeltDato from '../../../felleskomponenter/datoOmrade/enkeltDato';

import { DatoOmradeDescription } from '../../../felleskomponenter/datoOmrade/datoOmrade';
import './eksisterendeSaker.css';

const hentAktiveBehandlinger = behandlinger => behandlinger.filter(behandling => behandling.behandlingsstatus !== MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET);
/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
const EnkeltSak = props => {
  const {
    opprettetDato, behandlingOversikter, sakstype, saksstatus, saksnummer,
  } = props.sak;

  const aktiveBehandlinger = hentAktiveBehandlinger(behandlingOversikter);
  const aktivBehandling = aktiveBehandlinger.pop(); // Hent siste element i array.
  const {
    land, behandlingstype, periode, behandlingsstatus,
  } = aktivBehandling;
  return (
    <div className="enkeltSak__meta">
      <Nav.typo.Undertittel>{KV.objektTilTerm(sakstype)}</Nav.typo.Undertittel>
      <dl>
        <dt>Behandlingstype: </dt>
        <dd>{KV.objektTilTerm(behandlingstype)}</dd>
        <DatoOmradeDescription label="Søknadsperiode: " periode={periode} />
        <dt>Saksstatus: </dt>
        <dd>{KV.objektTilTerm(saksstatus)}</dd>
        <dt>Saksnummer: </dt>
        <dd>{saksnummer}</dd>
        <dt>Land:</dt>
        <dd>{land ? land.join(', ') : '(ukjent)'}</dd>
        <dt>Behandlingsstatus: </dt>
        <dd>{KV.objektTilTerm(behandlingsstatus)}</dd>
        <dt>Opprettet:</dt>
        <dd><EnkeltDato dato={opprettetDato} /></dd>
      </dl>
    </div>
  );
};

EnkeltSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
};

export default EnkeltSak;
