import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as KV from '../../../kodeverk';

import { DatoOmradeMedVarighet } from '../../../komponenter/datoOmrade/datoOmrade';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta/';
import { soknadSelectors } from '../../../ducks/soknad';

import { lagAvklartefaktaBegrunnelse, slettAvklartfakta, konverterTilStegData } from '../../../regler/avklartefakta';

import './vurderingArtikkel16MottaSvar.css';

export const VurderingArtikkel16MottaSvar = props => {
  const {
    gyldigeSoknadsland, soknadsperiode, redigerbart, bekreftOgFortsett, oppdaterData, slettData, tilstand: { svarAnmodningUnntakAvklartfakta },
  } = props;

  const [visLovvalgsperiode, setVisLovvalgsperiode] = useState(false);

  useEffect(() => {
    oppdaterData(konverterTilStegData(MKV.Koder.avklartefakta.SVAR_ANMODNING_UNNTAK, svarAnmodningUnntakAvklartfakta));
    return function cleanup() {
      slettData(slettAvklartfakta(MKV.Koder.avklartefakta.SVAR_ANMODNING_UNNTAK));
    };
  }, []);

  const handleSvarChange = e => {
    setVisLovvalgsperiode(e.target.value === KV.Koder.DELVIS_INNVILGET);
  };

  const handleBegrunnelseChange = e => {
    oppdaterData(lagAvklartefaktaBegrunnelse(MKV.Koder.avklartefakta.SVAR_ANMODNING_UNNTAK, null, null, e.target.value));
  };

  const { begrunnelseFritekst = '' } = svarAnmodningUnntakAvklartfakta;

  return (
    <Fragment>
      <Nav.Undertittel>Svar på anmodning om unntak, etter artikkel 16, nr. 1</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="4">
          <Nav.Element>Land:</Nav.Element>
          <Nav.Normaltekst>{gyldigeSoknadsland.map(enkeltLandObjekt => enkeltLandObjekt.term).join(', ')}</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="soknadsperiodeRow">
        <Nav.Column xs="6">
          <DatoOmradeMedVarighet periode={soknadsperiode} tekst="Søknadsperiode" />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="svarFraMyndighetRow">
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
          <Nav.Textarea disabled={!redigerbart} label="Begrunnelse" value={begrunnelseFritekst} onChange={handleBegrunnelseChange} tellerTekst={() => {}} />
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
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilstand: PT.shape({
    svarAnmodningUnntakAvklartfakta: MPT.Avklartefakta,
  }).isRequired,
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
