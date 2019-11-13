import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import * as EKV from 'eessi-kodeverk';

import * as Nav from '../../../../../utils/navFrontend';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';

import useEventTargetValueState from '../../../../../hooks/useEventTargetValueState';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';

export const VurderingVideresend = ({
  redigerbart,
  videresendSoknad,
  behandlingID,
}) => {
  const [fritekst, setFritekst] = useEventTargetValueState('');

  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis orienteringsbrev',
      type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_VIDERESENDT_SOEKNAD,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
        fritekst,
      },
    },
    {
      navn: 'Forhåndsvis brev til utenlandske trygdemyndigheter:',
      type: MKV.Koder.brev.produserbaredokumenter.VIDERESENDT_SOEKNAD_UTLAND,
      data: {
        mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
        fritekst,
      },
    },
    {
      navn: 'Forhåndsvis SED A008',
      type: EKV.Koder.sedtyper.A008,
      erSed: true,
    },
  ];

  const vedKlikkVideresend = () => {
    videresendSoknad(fritekst);
  };

  return (
    <div>
      <Nav.Row>
        <Nav.Column xs="6">
          <Nav.Undertittel>Videresending av søknad</Nav.Undertittel>
          <Nav.Textarea
            disabled={!redigerbart}
            label="Begrunnelse og informasjon til utenlandske myndigheter"
            value={fritekst || ''}
            onChange={setFritekst}
          />
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
};

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

export default connect(mapStateToProps)(VurderingVideresend);
