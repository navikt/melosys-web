import React from 'react';

import * as MKV from 'melosys-kodeverk';
import * as KV from '../../../kodeverk';
import * as MPT from '../../../proptypes/';
import EnkeltDato from '../../../felleskomponenter/datoOmrade/enkeltDato';

import { DatoOmradeDescription } from '../../../felleskomponenter/datoOmrade/datoOmrade';
import './eksisterendeSaker.css';

const hentAktivBehandling = behandlinger => behandlinger.find(behandling => behandling.behandlingsstatus !== MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET);

/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
const EnkeltSak = props => {
  const {
    opprettetDato, behandlingOversikter, sakstype, saksstatus, saksnummer,
  } = props.sak;
  const aktivBehandling = hentAktivBehandling(behandlingOversikter);
  const {
    land, behandlingstype, periode, behandlingsstatus,
  } = aktivBehandling;
  return (
    <div className="enkeltSak__meta">
      <dl>
        <dt>Sakstype: </dt>
        <dd>{KV.objektTilTerm(sakstype)}</dd>
        <dt>Saksstatus: </dt>
        <dd>{KV.objektTilTerm(saksstatus)}</dd>
        <dt>Saksnummer: </dt>
        <dd>{saksnummer}</dd>
        <dt>Behandlingstype: </dt>
        <dd>{KV.objektTilTerm(behandlingstype)}</dd>
        <dt>Behandlingsstatus: </dt>
        <dd>{KV.objektTilTerm(behandlingsstatus)}</dd>
        <dt>Opprettet:</dt>
        <dd><EnkeltDato dato={opprettetDato} /></dd>
        <DatoOmradeDescription label="Søknadsperiode: " periode={periode} />
        <dt>Land:</dt>
        <dd>{land ? land.join(', ') : '(ukjent)'}</dd>
      </dl>
    </div>
  );
};

EnkeltSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
};

export default EnkeltSak;
