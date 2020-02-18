import React, { Fragment } from 'react';
import PT from 'prop-types';

import * as Utils from '../utils';
import * as KV from '../kodeverk';
import * as MPT from '../proptypes';

import EnkeltDato from './datoOmrade/enkeltDato';

const Oppsummering = props => {
  const {
    arbeidsland,
    oppholdsland,
    lovvalgsland,
    fagsak,
    oppsummering,
    person,
    behandlingsgrunnlagPeriodeFom,
    behandlingsgrunnlagPeriodeTom,
    lovvalgsperiodeFom,
    lovvalgsperiodeTom,
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
    endretDato,
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
      { oppholdsland.length > 0 &&
        <Fragment>
          <dt>Oppholdsland:</dt>
          <dd>{arbeidslandTilSetning(oppholdsland)}</dd>
        </Fragment>
      }
      { (behandlingsgrunnlagPeriodeFom || behandlingsgrunnlagPeriodeTom) &&
        <Fragment>
          <dt>Søknadsperiode:</dt>
          <dd>{behandlingsgrunnlagPeriodeFom || 'ukjent'} - {behandlingsgrunnlagPeriodeTom || 'ukjent'}</dd>
        </Fragment>
      }
      { (lovvalgsperiodeFom || lovvalgsperiodeTom) &&
        <Fragment>
          <dt>Lovvalgsperiode:</dt>
          <dd>{lovvalgsperiodeFom || 'ukjent'} - {lovvalgsperiodeTom || 'ukjent'}</dd>
        </Fragment>
      }
      <dt>Behandling sist oppdatert:</dt>
      <dd><EnkeltDato dato={endretDato} visTidspunkt /></dd>
      <dt>Registeropplysninger oppdatert:</dt>
      <dd><EnkeltDato dato={sisteOpplysningerHentetDato} visTidspunkt /></dd>
      <dt>Behandling opprettet:</dt>
      <dd><EnkeltDato dato={registrertDato} /></dd>
    </dl>
  );
};

Oppsummering.propTypes = {
  arbeidsland: PT.arrayOf(MPT.Kodeverk),
  oppholdsland: PT.arrayOf(MPT.Kodeverk),
  lovvalgsland: MPT.Kodeverk,
  fagsak: MPT.Fagsak.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering.isRequired,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  behandlingsgrunnlagPeriodeFom: PT.string,
  behandlingsgrunnlagPeriodeTom: PT.string,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
};
Oppsummering.defaultProps = {
  arbeidsland: [],
  oppholdsland: [],
  lovvalgsland: {},
  behandlingsgrunnlagPeriodeFom: undefined,
  behandlingsgrunnlagPeriodeTom: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
};

export default Oppsummering;
