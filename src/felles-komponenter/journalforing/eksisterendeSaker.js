import React from 'react';
import PT from 'prop-types';
import EnkeltDato from '../datoOmrade/enkeltDato';
import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';

import { kodeverkObjektTilTerm } from '../../utils/kodeverk';

import './eksisterendeSaker.css';

/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
const EnkeltSak = props => {
  const {
    opprettetDato, behandlingstype, soknadsperiode, behandlingsstatus, land, sakstype,
  } = props.sak;

  const { fom, tom } = soknadsperiode;

  return (
    <div className="enkeltSak__meta">
      <dl className="enkeltSak__meta">
        <dt className="enkeltSak__meta__term">Sakstype: </dt>
        <dd className="enkeltSak__meta__detalj">{kodeverkObjektTilTerm(sakstype)}</dd>
        <dt className="enkeltSak__meta__term">Behandlingstype: </dt>
        <dd className="enkeltSak__meta__detalj">{kodeverkObjektTilTerm(behandlingstype)}</dd>
        <dt className="enkeltSak__meta__term">Behandlingsstatus: </dt>
        <dd className="enkeltSak__meta__detalj">{kodeverkObjektTilTerm(behandlingsstatus)}</dd>
        <dt className="enkeltSak__meta__term">Opprettet:</dt>
        <dd className="enkeltSak__meta__detalj">{<EnkeltDato dato={opprettetDato} />}</dd>
        <dt className="enkeltSak__meta__term">Søknadsperiode: </dt>
        <dd className="enkeltSak__meta__detalj">{fom && <EnkeltDato dato={fom} />} - {tom && <EnkeltDato dato={tom} />}</dd>
        <dt className="enkeltSak__meta__term">Land:</dt>
        <dd className="enkeltSak__meta__detalj">{land.join(', ')}</dd>
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
  const { fagsakListe, knyttTilEksisterendeSak, feil } = props;

  const radioValg = fagsakListe.reduce((samling, sak) => ([...samling, { value: sak.saksnummer, innhold: <EnkeltSak sak={sak} /> }]), []);

  return (
    <div className="eksisterendeSaker">
      <Nav.Systemtittel>Knytt til brukers eksisterende sak</Nav.Systemtittel>
      {<Skjema.CustomRadioPanelGruppe
        feltNavn="saksnummer"
        legend="Velg fra listen over saker:"
        radios={radioValg}
        feil={feil}
      />}
      { fagsakListe.length === 0 && 'Ingen eksisterende saker funnet.'}
      { fagsakListe.length > 0 && <Nav.Knapp className="eksisterendeSaker__knyttTilSak" onClick={knyttTilEksisterendeSak}>Knytt til sak</Nav.Knapp> }
    </div>
  );
};

EksisterendeSaker.propTypes = {
  fagsakListe: PT.array.isRequired,
  knyttTilEksisterendeSak: PT.func.isRequired,
  feil: PT.object,
};

EksisterendeSaker.defaultProps = {
  feil: undefined,
};

export default EksisterendeSaker;
