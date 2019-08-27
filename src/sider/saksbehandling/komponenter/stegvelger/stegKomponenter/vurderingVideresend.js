import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';

import { konverterTilStegData, lagAvklartefaktaBegrunnelse } from '../../../../../regler/avklartefakta';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';

export const VurderingVideresend = ({
  redigerbart,
  lagreAvklartefakta,
  lagreAvklartefaktaOgVideresendSoknad,
  behandlingID,
  tilstand,
  oppdaterData,
  slettData,
}) => {
  const { bostedslandFakta = {} } = tilstand;
  const { begrunnelseFritekst } = bostedslandFakta;

  useEffect(() => {
    oppdaterData(konverterTilStegData(MKV.Koder.avklartefakta.IKKE_BOSATT_NORGE, bostedslandFakta));

    return function cleanup() {
      slettData();
    };
  }, []);

  const dokumenter = [
    {
      navn: 'Forhåndsvis orienteringsbrev',
      type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_VIDERESENDT_SOEKNAD,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
        fritekst: begrunnelseFritekst,
      },
    },
    {
      navn: 'Forhåndsvis brev til utenlandske trygdemyndigheter:',
      type: MKV.Koder.brev.produserbaredokumenter.VIDERESENDT_SOEKNAD_UTLAND,
      data: {
        mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
        fritekst: begrunnelseFritekst,
      },
    },
  ];

  const fritekstEndret = e => {
    oppdaterData(lagAvklartefaktaBegrunnelse(MKV.Koder.avklartefakta.IKKE_BOSATT_NORGE, null, null, e.target.value));
  };

  return (
    <div>
      <Nav.Row>
        <Nav.Column xs="6">
          <Nav.Undertittel>Videresending av søknad</Nav.Undertittel>
          <Nav.Textarea
            disabled={!redigerbart}
            label="Begrunnelse og informasjon til utenlandske myndigheter"
            value={begrunnelseFritekst || ''}
            onChange={fritekstEndret}
          />
          {
            redigerbart &&
            <PdfLenkeListe
              dokumenter={dokumenter}
              behandlingID={behandlingID}
              vedKlikk={lagreAvklartefakta}
            />
          }
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6" className="fane__fot">
          <Nav.Hovedknapp disabled={!redigerbart} onClick={lagreAvklartefaktaOgVideresendSoknad}>
            VIDERESEND SØKNAD
          </Nav.Hovedknapp>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

VurderingVideresend.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  tilstand: PT.shape({
    bostedslandFakta: MPT.Avklartefakta,
  }).isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  lagreAvklartefaktaOgVideresendSoknad: PT.func.isRequired,
  lagreAvklartefakta: PT.func.isRequired,
};

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

export default connect(mapStateToProps)(VurderingVideresend);
