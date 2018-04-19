import React from 'react';
import PT from 'prop-types';
import EnkeltDato from '../datoOmrade/enkeltDato';
import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';

import './eksisterendeSaker.css';

const EnkeltSak = props => {
  const {
    mottatt, behandling = {}, soknadsperiode = {}, land = [], sakstype = {},
  } = props.sak;
  const { status = {}, type = {} } = behandling;
  const { fom = null, tom = null } = soknadsperiode;

  return (
    <div className="enkeltSak__meta">
      <dl className="enkeltSak__meta">
        <dt className="enkeltSak__meta__term">Type: </dt>
        <dd className="enkeltSak__meta__detalj">{sakstype.term || '(ukjent sakstype)'} - {type.term || '(ukjent behandlingstype)'}</dd>
        <dt className="enkeltSak__meta__term">Status: </dt>
        <dd className="enkeltSak__meta__detalj">{status.term || '(ukjent)'}</dd>
        <dt className="enkeltSak__meta__term">Mottatt:</dt>
        <dd className="enkeltSak__meta__detalj">{<EnkeltDato dato={mottatt} />}</dd>
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

const EksisterendeSaker = props => {
  const { saksListe, knyttTilEksisterendeSak, feil } = props;

  const radioValg = saksListe.reduce((samling, sak) => ([...samling, { value: sak.saksnummer, innhold: <EnkeltSak sak={sak} /> }]), []);

  return (
    <div className="eksisterendeSaker">
      {<Skjema.CustomRadioPanelGruppe
        feltNavn="knyttTilSaksID"
        legend="Knytt til brukers eksisterende sak"
        radios={radioValg}
        feil={feil}
      />}
      { saksListe.length === 0 && 'Ingen eksisterende saker funnet.'}
      { saksListe.length > 0 && <Nav.Knapp className="eksisterendeSaker__knyttTilSak" onClick={knyttTilEksisterendeSak}>Knytt til sak</Nav.Knapp> }
    </div>
  );
};

EksisterendeSaker.propTypes = {
  saksListe: PT.array.isRequired,
  knyttTilEksisterendeSak: PT.func.isRequired,
  feil: PT.object,
};

EksisterendeSaker.defaultProps = {
  feil: undefined,
};

export default EksisterendeSaker;
