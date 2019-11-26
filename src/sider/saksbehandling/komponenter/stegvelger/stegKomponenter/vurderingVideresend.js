import React, { useState } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as EKV from 'eessi-kodeverk';

import MKV from '../../../../../melosyskodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { avklartefaktaSelectors } from '../../../../../ducks/avklartefakta';

import './vurderingVideresend.css';
import Mottakerinstitusjonvelger from '../../../../../felleskomponenter/mottakerinstitusjonvelger';

export const VurderingVideresend = ({
  redigerbart,
  videresendSoknad,
  behandlingID,
  bostedsland,
}) => {
  const [valgtMottakerinstitusjon, setValgtMottakerinstitusjon] = useState('');
  const [kreverMottakerinstitusjon, setKreverMottakerinstitusjon] = useState(false);

  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis orienteringsbrev',
      type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_VIDERESENDT_SOEKNAD,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Forhåndsvis SED A008',
      type: EKV.Koder.sedtyper.A008,
      erSed: true,
    },
  ];

  const vedKlikkVideresend = () => {
    if (kreverMottakerinstitusjon && !valgtMottakerinstitusjon) return;
    videresendSoknad(valgtMottakerinstitusjon);
  };

  return (
    <div>
      <Nav.typo.Undertittel>Videresending av søknad</Nav.typo.Undertittel>
      <Nav.Row className="mottakerinstitusjoner">
        <Nav.Column xs="7">
          <Mottakerinstitusjonvelger
            redigerbart={redigerbart}
            landkode={bostedsland.kode}
            bucType={EKV.Koder.buctyper.legislation.LA_BUC_03}
            valgtMottakerinstitusjon={valgtMottakerinstitusjon}
            valgtMottakerinstitusjonHandler={setValgtMottakerinstitusjon}
            kreverMottakerinstitusjonHandler={setKreverMottakerinstitusjon}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          {
            redigerbart &&
            <PdfLenkeListe
              dokumenter={pdfDokumenter}
              behandlingID={behandlingID}
            />
          }
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6" className="fane__fot">
          <Nav.Hovedknapp disabled={!redigerbart} onClick={vedKlikkVideresend}>
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
  videresendSoknad: PT.func.isRequired,
  bostedsland: MPT.Kodeverk.isRequired,
};

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  bostedsland: avklartefaktaSelectors.BostedslandSelector(state),
});

export default connect(mapStateToProps)(VurderingVideresend);
