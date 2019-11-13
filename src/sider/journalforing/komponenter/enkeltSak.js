import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import PT from 'prop-types';

import * as MKV from 'melosys-kodeverk';
import * as KV from '../../../kodeverk';
import EnkeltDato from '../../../felleskomponenter/datoOmrade/enkeltDato';

import { DatoOmradeDescription } from '../../../felleskomponenter/datoOmrade/datoOmrade';
import './eksisterendeSaker.css';
import KnyttTilSak from './knyttTilSak';
import { fagsakSelectors } from '../../../ducks/fagsaker';
import { formSelectors } from '../../../ducks/form';

const hentAktivBehandling = behandlinger => behandlinger.find(behandling => behandling.behandlingsstatus !== MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET);

/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
const EnkeltSak = props => {
  const {
    opprettetDato, behandlingOversikter, sakstype, saksstatus,
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
  sak: PT.object.isRequired,
};

export default EnkeltSak;
