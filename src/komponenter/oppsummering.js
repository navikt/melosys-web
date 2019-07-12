import React from 'react';
import PT from 'prop-types';

import * as Utils from '../utils';
import * as KV from '../kodeverk';
import * as MPT from '../proptypes';

import EnkeltDato from './datoOmrade/enkeltDato';

const Oppsummering = props => {
  const {
    arbeidsland, fagsak, oppsummering, person, soknadsperiodeFom, soknadsperiodeTom,
  } = props;
  if (!oppsummering) return <div />;

  const {
    saksnummer,
    sakstype,
    saksstatus,
    registrertDato,
  } = fagsak;

  const {
    behandlingsstatus,
    sisteOpplysningerHentetDato,
  } = oppsummering;

  const {
    fnr,
    sammensattNavn,
  } = person;

  const arbeidslandSetning = Utils.streng.arrayTilKonjunksjon(arbeidsland.map(land => land.term));

  return (
    <dl aria-label="behandlingsinformasjon" className="oppsummering__detaljer--rad">
      <dt>Søknadstype:</dt>
      <dd>{KV.objektTilTerm(sakstype)}</dd>
      <dt>Fullt navn:</dt>
      <dd>{sammensattNavn}</dd>
      <dt>Fnr / dnr:</dt>
      <dd>{fnr}</dd>
      <dt>Saksnummer:</dt>
      <dd>{saksnummer || '-'}</dd>
      <dt>Saksstatus:</dt>
      <dd>{KV.objektTilTerm(saksstatus)}</dd>
      <dt>Behandlingsstatus:</dt>
      <dd>{KV.objektTilTerm(behandlingsstatus)}</dd>
      <dt>Arbeidsland:</dt>
      <dd>{arbeidslandSetning}</dd>
      <dt>Søknadsperiode:</dt>
      <dd>{soknadsperiodeFom} - {soknadsperiodeTom}</dd>
      <dt>Behandling sist oppdatert:</dt>
      <dd><EnkeltDato dato={sisteOpplysningerHentetDato} visTidspunkt /></dd>
      <dt>Behandling registrert dato:</dt>
      <dd><EnkeltDato dato={registrertDato} /></dd>
    </dl>
  );
};

Oppsummering.propTypes = {
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  fagsak: MPT.Fagsak.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering.isRequired,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  soknadsperiodeFom: PT.string.isRequired,
  soknadsperiodeTom: PT.string.isRequired,
};


export default Oppsummering;
