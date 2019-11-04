import React, { Fragment } from 'react';
import PT from 'prop-types';

import * as Utils from '../utils';
import * as KV from '../kodeverk';
import * as MPT from '../proptypes';

import EnkeltDato from './datoOmrade/enkeltDato';

const Oppsummering = props => {
  const {
    arbeidsland, lovvalgsland, fagsak, oppsummering, person, soknadsperiodeFom, soknadsperiodeTom, lovvalgsperiodeFom, lovvalgsperiodeTom,
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

  const arbeidslandTilSetning = land => (land && land.length > 0 ? Utils.streng.arrayTilKonjunksjon(land.map(enkeltLand => enkeltLand.term)) : 'Ukjent');

  const lovvalgslandTilSetning = landObject => (landObject.term ? Utils.streng.arrayTilKonjunksjon(landObject.term) : 'Ukjent');

  return (
    <dl aria-label="behandlingsinformasjon" className="oppsummering__detaljer--rad">
      <dt>Sakstype:</dt>
      <dd>{KV.objektTilTerm(sakstype)}</dd>
      <dt>Fullt navn:</dt>
      <dd>{sammensattNavn}</dd>
      <dt>F.nr./d-nr.:</dt>
      <dd>{fnr}</dd>
      <dt>Saksnummer:</dt>
      <dd>{saksnummer || '-'}</dd>
      <dt>Saksstatus:</dt>
      <dd>{KV.objektTilTerm(saksstatus)}</dd>
      <dt>Behandlingsstatus:</dt>
      <dd>{KV.objektTilTerm(behandlingsstatus)}</dd>
      { arbeidsland.length > 0 &&
        <Fragment>
          <dt>Arbeidsland:</dt>
          <dd>{arbeidslandTilSetning(arbeidsland)}</dd>
        </Fragment>
      }
      { !Utils._isEmpty(lovvalgsland) &&
        <Fragment>
          <dt>Lovvalgsland:</dt>
          <dd>{lovvalgslandTilSetning(lovvalgsland)}</dd>
        </Fragment>
      }
      { (soknadsperiodeFom || soknadsperiodeTom) &&
        <Fragment>
          <dt>Søknadsperiode:</dt>
          <dd>{soknadsperiodeFom || 'ukjent'} - {soknadsperiodeTom || 'ukjent'}</dd>
        </Fragment>
      }
      { (lovvalgsperiodeFom || lovvalgsperiodeTom) &&
        <Fragment>
          <dt>Lovvalgsperiode:</dt>
          <dd>{lovvalgsperiodeFom || 'ukjent'} - {lovvalgsperiodeTom || 'ukjent'}</dd>
        </Fragment>
      }
      <dt>Behandling sist oppdatert:</dt>
      <dd><EnkeltDato dato={sisteOpplysningerHentetDato} visTidspunkt /></dd>
      <dt>Behandling registrert dato:</dt>
      <dd><EnkeltDato dato={registrertDato} /></dd>
    </dl>
  );
};

Oppsummering.propTypes = {
  arbeidsland: PT.arrayOf(MPT.Kodeverk),
  lovvalgsland: MPT.Kodeverk,
  fagsak: MPT.Fagsak.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering.isRequired,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  soknadsperiodeFom: PT.string,
  soknadsperiodeTom: PT.string,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
};
Oppsummering.defaultProps = {
  arbeidsland: [],
  lovvalgsland: {},
  soknadsperiodeFom: undefined,
  soknadsperiodeTom: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
};

export default Oppsummering;
