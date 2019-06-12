import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as KV from '../../../kodeverk';

import { DatoOmradeMedVarighet } from '../../../komponenter/datoOmrade/datoOmrade';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta/';
import { soknadSelectors } from '../../../ducks/soknad';

import './vurderingArtikkel16MottaSvar.css';

const VurderingArtikkel16MottaSvar = props => {
  const {
    gyldigeSoknadsland, soknadsperiode, redigerbart, bekreftOgFortsett,
  } = props;

  const [visLovvalgsperiode, setVisLovvalgsperiode] = useState(false);
  const [begrunnelse, setBegrunnelse] = useState('');

  const handleSvarChange = e => {
    setVisLovvalgsperiode(e.target.value === KV.Koder.DELVIS_INNVILGET);
  };

  const handleBegrunnelseChange = e => {
    setBegrunnelse(e.target.value);
  };

  return (
    <Fragment>
      <Nav.Undertittel>Svar på anmodning om unntak, etter artikkel 16, nr. 1</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="4">
          <Nav.Element>Land:</Nav.Element>
          <Nav.Normaltekst>{gyldigeSoknadsland.map(enkeltLandObjekt => enkeltLandObjekt.term).join(', ')}</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          <DatoOmradeMedVarighet periode={soknadsperiode} tekst="Søknadsperiode" />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          <Nav.Fieldset disabled={!redigerbart} onChange={handleSvarChange} legend="Svar fra myndighetene">
            <Nav.Radio name="svarFraMyndighetene" label="Innvilgelse" value={KV.Koder.INNVILGET} />
            <Nav.Radio name="svarFraMyndighetene" label="Delvis innvilgelse" value={KV.Koder.DELVIS_INNVILGET} />
            {
              visLovvalgsperiode &&
              <Nav.Row>
                <Nav.Column xs="6">
                  <Nav.Input
                    bredde="fullbredde"
                    label="Startdato"
                  />
                </Nav.Column>
                <Nav.Column xs="6">
                  <Nav.Input
                    bredde="fullbredde"
                    label="Sluttdato"
                  />
                </Nav.Column>
              </Nav.Row>
            }
            <Nav.Radio name="svarFraMyndighetene" label="Avslag" value={KV.Koder.AVSLAATT} />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Textarea disabled={!redigerbart} label="Begrunnelse" value={begrunnelse} onChange={handleBegrunnelseChange} tellerTekst={() => {}} />
        </Nav.Column>
      </Nav.Row>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!redigerbart} type="hoved" onClick={bekreftOgFortsett} className="fane__navigasjonsknapp">BEKREFT OG FORTSETT</Nav.Knapp>
      </div>
    </Fragment>
  );
};

VurderingArtikkel16MottaSvar.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  gyldigeSoknadsland: MPT.Soknadsland.isRequired,
  soknadsperiode: MPT.Soknadsperiode.isRequired,
  redigerbart: PT.bool.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
};

VurderingArtikkel16MottaSvar.defaultProps = {
  lovvalgsperiodeFom: '',
  lovvalgsperiodeTom: '',
};

const mapStateToProps = state => ({
  gyldigeSoknadsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  soknadsperiode: soknadSelectors.SoknadsperiodeSelector(state),
});

export default connect(mapStateToProps)(VurderingArtikkel16MottaSvar);
