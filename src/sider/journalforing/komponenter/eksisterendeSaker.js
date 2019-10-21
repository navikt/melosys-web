import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../kodeverk';
import EnkeltDato from '../../../felleskomponenter/datoOmrade/enkeltDato';
import { DatoOmradeDescription } from '../../../felleskomponenter/datoOmrade/datoOmrade';
import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';

import './eksisterendeSaker.css';

const hentAktivBehandling = behandlinger => behandlinger.find(behandling => behandling.behandlingsstatus !== MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET);

/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
const EnkeltSak = props => {
  const {
    opprettetDato, behandlingOversikter, sakstype, saksstatus,
  } = props.sak;

  const aktivBehandling = hentAktivBehandling(behandlingOversikter);
  const {
    land, behandlingstype, soknadsperiode, behandlingsstatus,
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
        <DatoOmradeDescription label="Søknadsperiode: " periode={soknadsperiode} />
        <dt>Land:</dt>
        <dd>{land ? land.join(', ') : '(ukjent)'}</dd>
      </dl>
    </div>
  );
};

EnkeltSak.propTypes = {
  sak: PT.object.isRequired,
};

/** Eksisterende saker hentes fra endpointet /fagsaker/sok og merges inn i store via reduceren for journalforing under
 * keyen saksListe. Denne komponenten får saksListe via props fra parent komponent Journalforing, med mål om å
 * sentralisere ansvarsområder i større grad.
 */
const EksisterendeSaker = props => {
  const {
    behandlingstyper, fagsakListe, knyttTilEksisterendeSak,
  } = props;

  const radioValg = fagsakListe.reduce((samling, sak) =>
    ([...samling, { value: sak.saksnummer, innhold: <EnkeltSak sak={sak} /> }]), []);

  return (
    <div className="eksisterendeSaker">
      <Nav.Systemtittel>Knytt til brukers eksisterende sak</Nav.Systemtittel>
      {<Skjema.CustomRadioPanelGruppe
        feltNavn="saksnummer"
        legend="Velg fra listen over saker:"
        radios={radioValg}
      />}
      { fagsakListe.length === 0 && 'Ingen eksisterende saker funnet.'}

      <Skjema.Select feltNavn="behandlingstype" bredde="fullbredde" label="Behandlingstype" emptyFieldDisabled={false} >
        {
          behandlingstyper &&
          behandlingstyper
            .filter(elem => elem.kode !== MKV.Koder.behandlinger.behandlingstyper.SOEKNAD
              && elem.kode !== MKV.Koder.behandlinger.behandlingstyper.ANMODNING_OM_UNNTAK_HOVEDREGEL
              && elem.kode !== MKV.Koder.behandlinger.behandlingstyper.ØVRIGE_SED)
            .map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)
        }
      </Skjema.Select>
      <Skjema.Checkbox feltNavn="ingenVurdering" label="Dokumentet trenger ingen vurdering" />
      <Skjema.Checkbox feltNavn="skalTilordnes" label="Legg til behandlingen i mine oppgaver" />
      {
        fagsakListe.length > 0 &&
        <Nav.Knapp className="eksisterendeSaker__knyttTilSak" onClick={knyttTilEksisterendeSak}>Knytt til sak</Nav.Knapp>
      }
    </div>
  );
};

EksisterendeSaker.propTypes = {
  behandlingstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  fagsakListe: PT.array.isRequired,
  knyttTilEksisterendeSak: PT.func.isRequired,
};

export default EksisterendeSaker;
