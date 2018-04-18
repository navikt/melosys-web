import React from 'react';
import PT from 'prop-types';
import { change } from 'redux-form';

import * as Nav from '../../utils/navFrontend';
import EnkeltDato from '../datoOmrade/enkeltDato';
import * as Skjema from '../skjema/';

import './eksisterendeSaker.css';

const uuid = require('uuid/v4');


const EnkeltSak = props => {
  const {
    sakstype = {}, saksnummer, mottatt, behandling = {}, aktivTil, soknadsperiode = {},
  } = props.sak;

  const { status = {} } = behandling;
  const { fom = null, tom = null } = soknadsperiode;

  return (
    <label className="enkeltSak">
      <input type="radio" name="foo" value={uuid} />
      <Nav.Row>
        <Nav.Column xs="1">
          <div className="sakEnkeltLinje__ikon" />
        </Nav.Column>
        <Nav.Column xs="5">
          <dl className="sakEnkeltLinje__meta">
            <dt className="sakEnkeltLinje__meta__term">Mottatt:</dt>
            <dd className="sakEnkeltLinje__meta__detalj">{mottatt || '(ukjent)'}</dd>
            <dt className="sakEnkeltLinje__meta__term">Søknadsperiode: </dt>
            <dd className="sakEnkeltLinje__meta__detalj">{fom && <EnkeltDato dato={fom} />} - {tom && <EnkeltDato dato={tom} />}</dd>
          </dl>
        </Nav.Column>
        <Nav.Column xs="6">
          <dl className="sakEnkeltLinje__meta">
            <dt className="sakEnkeltLinje__meta__term">Status: </dt>
            <dd className="sakEnkeltLinje__meta__detalj">{status.term || '(ukjent)'}</dd>
            <dt className="sakEnkeltLinje__meta__term">Land:</dt>
            <dd className="sakEnkeltLinje__meta__detalj">Norge, Sverige, Bergen</dd>
          </dl>
        </Nav.Column>
      </Nav.Row>
    </label>
  );
};

EnkeltSak.propTypes = {
  sak: PT.object.isRequired,
};

const EksisterendeSaker = props => {
  const { saksListe, vedValgEndret } = props;

  const radioValg = saksListe.reduce((sak, samling) => ([...samling, { foo: 'bar', innhold: <EnkeltSak sak={sak} /> }]), []);

  return (
    <div className="eksisterendeSaker">
      {<Skjema.CustomRadioPanelGruppe
        feltNavn="knyttTilSaksID"
        radios={radioValg}
      />}
    </div>
  );
};

EksisterendeSaker.propTypes = {
  saksListe: PT.array.isRequired,
  vedValgEndret: PT.func.isRequired,
};

export default EksisterendeSaker;
