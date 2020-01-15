import React, { Fragment } from 'react';

import * as MKV from 'melosys-kodeverk';
import * as KV from '../../../kodeverk';
import * as MPT from '../../../proptypes/';
import * as Skjema from '../../../felleskomponenter/skjema';
import EnkeltDato from '../../../felleskomponenter/datoOmrade/enkeltDato';

const hentAktivBehandling = behandlinger => behandlinger.find(behandling => behandling.behandlingsstatus !== MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET);
/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
const EnkeltSak = props => {
  const {
    opprettetDato, behandlingOversikter, sakstype, saksstatus, saksnummer,
  } = props.sak;

  const {
    land, behandlingstype, periode, behandlingsstatus,
  } = hentAktivBehandling(behandlingOversikter);
  return (
    <Skjema.CustomRadioPanelElement
      tittel={KV.objektTilTerm(sakstype)}
      data={[
        { term: 'Behandlingstype:', description: KV.objektTilTerm(behandlingstype) },
        { term: 'Søknadsperiode:', description: periode ? <Fragment><EnkeltDato dato={periode.fom} /> - <EnkeltDato dato={periode.tom} /></Fragment> : null },
        { term: 'Saksstatus:', description: KV.objektTilTerm(saksstatus) },
        { term: 'Saksnummer:', description: saksnummer },
        { term: 'Land:', description: land ? land.join(', ') : '(ukjent)' },
        { term: 'Behandlingsstatus:', description: KV.objektTilTerm(behandlingsstatus) },
        { term: 'Opprettet:', description: <EnkeltDato dato={opprettetDato} /> },
      ]}
    />
  );
};

EnkeltSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
};

export default EnkeltSak;
