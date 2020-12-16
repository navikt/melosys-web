import React from 'react';
import PT from 'prop-types';
import classNames from 'classnames';
import { KTObject } from '@navikt/melosys-kodeverk';
import { Fagsak, Oppsummering as OppsummeringType, Person } from 'Domene';

import * as Utils from '../utils';
import * as KV from '../kodeverk';
import * as MPT from '../proptypes';
import * as Nav from '../utils/navFrontend';


import EnkeltDato from './datoOmrade/enkeltDato';

import './oppsummering.css';

interface OppsummeringProps {
  arbeidsland?: KTObject[],
  oppholdsland?: KTObject[],
  lovvalgsland?: KTObject,
  fagsak: Fagsak,
  oppsummering: OppsummeringType,
  person: Person,
  behandlingsgrunnlagPeriodeFom?: string,
  behandlingsgrunnlagPeriodeTom?: string,
  lovvalgsperiodeFom?: string,
  lovvalgsperiodeTom?: string,
  periodeLabel: string,
  className?: string,
}

const Oppsummering = (props: OppsummeringProps) => {
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
    periodeLabel,
    className,
  } = props;
  if (!oppsummering) return <div />;

  const {
    saksnummer,
    sakstype,
    saksstatus,
    registrertDato,
  } = fagsak;

  const {
    behandlingstype,
    behandlingsstatus,
    endretDato,
    endretAvNavn,
    sisteOpplysningerHentetDato,
  } = oppsummering;

  const {
    fnr,
    sammensattNavn,
  } = person;

  const arbeidslandTilSetning = (land: KTObject[]) => (land && land.length > 0 ? Utils.streng.arrayTilKonjunksjon(land.map(enkeltLand => Utils.streng.storeForbokstaver(enkeltLand.term))) : 'Ukjent');

  const lovvalgslandTilSetning = (landObject: KTObject) => (landObject.term ? Utils.streng.arrayTilKonjunksjon(landObject.term) : 'Ukjent');

  const cl = classNames(className, 'oppsummering');

  const kolonneBredder = ['5', '6'] as const;

  return (
    <div aria-label="behandlingsinformasjon" className={cl}>
      <dl>
        <Nav.Row>
          <Nav.Column xs={kolonneBredder[0]}>
            <dt>Navn:</dt>
          </Nav.Column>
          <Nav.Column xs={kolonneBredder[1]}>
            <dd>{sammensattNavn}</dd>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs={kolonneBredder[0]}>
            <dt>F.nr./d-nr.:</dt>
          </Nav.Column>
          <Nav.Column xs={kolonneBredder[1]}>
            <dd>{fnr}</dd>
          </Nav.Column>
        </Nav.Row>
      </dl>

      <dl>
        { arbeidsland && arbeidsland.length > 0 &&
          <Nav.Row>
            <Nav.Column xs={kolonneBredder[0]}>
              <dt>Arbeidsland:</dt>
            </Nav.Column>
            <Nav.Column xs={kolonneBredder[1]}>
              <dd>{arbeidslandTilSetning(arbeidsland)}</dd>
            </Nav.Column>
          </Nav.Row>
        }
        { lovvalgsland && !Utils._isEmpty(lovvalgsland) &&
          <Nav.Row>
            <Nav.Column xs={kolonneBredder[0]}>
              <dt>Lovvalgsland:</dt>
            </Nav.Column>
            <Nav.Column xs={kolonneBredder[1]}>
              <dd>{lovvalgslandTilSetning(lovvalgsland)}</dd>
            </Nav.Column>
          </Nav.Row>
        }
        { oppholdsland && oppholdsland.length > 0 &&
          <Nav.Row>
            <Nav.Column xs={kolonneBredder[0]}>
              <dt>Oppholdsland:</dt>
            </Nav.Column>
            <Nav.Column xs={kolonneBredder[1]}>
              <dd>{arbeidslandTilSetning(oppholdsland)}</dd>
            </Nav.Column>
          </Nav.Row>
        }
        { (behandlingsgrunnlagPeriodeFom || behandlingsgrunnlagPeriodeTom) &&
          <Nav.Row>
            <Nav.Column xs={kolonneBredder[0]}>
              <dt>{periodeLabel}</dt>
            </Nav.Column>
            <Nav.Column xs={kolonneBredder[1]}>
              <dd>{behandlingsgrunnlagPeriodeFom || 'ukjent'} - {behandlingsgrunnlagPeriodeTom}</dd>
            </Nav.Column>
          </Nav.Row>
        }
        { (lovvalgsperiodeFom || lovvalgsperiodeTom) &&
          <Nav.Row>
            <Nav.Column xs={kolonneBredder[0]}>
              <dt>Lovvalgsperiode:</dt>
            </Nav.Column>
            <Nav.Column xs={kolonneBredder[1]}>
              <dd>{lovvalgsperiodeFom || 'ukjent'} - {lovvalgsperiodeTom}</dd>
            </Nav.Column>
          </Nav.Row>
        }
      </dl>

      <dl>
        <Nav.Row>
          <Nav.Column xs={kolonneBredder[0]}>
            <dt>Sakstype:</dt>
          </Nav.Column>
          <Nav.Column xs={kolonneBredder[1]}>
            <dd>{KV.objektTilTerm(sakstype)}</dd>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs={kolonneBredder[0]}>
            <dt>Saksnummer:</dt>
          </Nav.Column>
          <Nav.Column xs={kolonneBredder[1]}>
            <dd>{saksnummer || '-'}</dd>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs={kolonneBredder[0]}>
            <dt>Saksstatus:</dt>
          </Nav.Column>
          <Nav.Column xs={kolonneBredder[1]}>
            <dd>{KV.objektTilTerm(saksstatus)}</dd>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs={kolonneBredder[0]}>
            <dt>Behandlingstype</dt>
          </Nav.Column>
          <Nav.Column xs={kolonneBredder[1]}>
            <dd>{KV.objektTilTerm(behandlingstype)}</dd>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs={kolonneBredder[0]}>
            <dt>Behandlingsstatus:</dt>
          </Nav.Column>
          <Nav.Column xs={kolonneBredder[1]}>
            <dd>{KV.objektTilTerm(behandlingsstatus)}</dd>
          </Nav.Column>
        </Nav.Row>
      </dl>

      <dl>
        <Nav.Row>
          <Nav.Column xs={kolonneBredder[0]}>
            <dt>Behandling opprettet:</dt>
          </Nav.Column>
          <Nav.Column xs={kolonneBredder[1]}>
            <dd><EnkeltDato dato={registrertDato} /></dd>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs={kolonneBredder[0]}>
            <dt>Behandling sist oppdatert:</dt>
          </Nav.Column>
          <Nav.Column xs={kolonneBredder[1]}>
            <dd><EnkeltDato dato={endretDato} visTidspunkt /></dd>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs={kolonneBredder[0]}>
            <dt>Sist oppdatert av:</dt>
          </Nav.Column>
          <Nav.Column xs={kolonneBredder[1]}>
            <dd>{endretAvNavn}</dd>
          </Nav.Column>
        </Nav.Row>
      </dl>

      <dl>
        <Nav.Row>
          <Nav.Column xs={kolonneBredder[0]}>
            <dt>Registeropplysninger oppdatert:</dt>
          </Nav.Column>
          <Nav.Column xs={kolonneBredder[1]}>
            <dd><EnkeltDato dato={sisteOpplysningerHentetDato} visTidspunkt /></dd>
          </Nav.Column>
        </Nav.Row>
      </dl>
    </div>
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
  periodeLabel: PT.string.isRequired,
  className: PT.string,
};
Oppsummering.defaultProps = {
  arbeidsland: [],
  oppholdsland: [],
  lovvalgsland: {},
  behandlingsgrunnlagPeriodeFom: undefined,
  behandlingsgrunnlagPeriodeTom: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
  className: undefined,
};

export default Oppsummering;
