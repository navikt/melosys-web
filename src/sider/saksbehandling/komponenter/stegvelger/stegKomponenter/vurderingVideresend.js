import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import { reduxForm } from 'redux-form';

import * as Nav from '../../../../../utils/navFrontend';
import * as Skjema from '../../../../../felleskomponenter/skjema';
import * as KV from '../../../../../kodeverk';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';

const VurderingVideresend = ({ redigerbart, videresend, behandlingID }) => {
  const dokumenter = [
    /*
    TODO: avventer koder for Brev om orientering til bruker om videresending og Brev til utenlandske trygdemyndigheter.
    */
    {
      navn: 'Forhåndsvis orienteringsbrev',
      type: '', //TODO: trenger kode her
      data: { mottaker: MKV.Koder.aktoersroller.BRUKER },
    },
    {
      navn: 'Forhåndsvis brev til utenlandske trygdemyndigheter',
      type: '', //TODO: trenger kode her
      data: { mottaker: MKV.Koder.aktoersroller.BRUKER },
    },
  ];

  return (
    <div>
      <Nav.Row>
        <Nav.Column xs="6">
          <form>
            <Nav.Undertittel>Videresending av søknad</Nav.Undertittel>
            <Skjema.Textarea
              disabled={!redigerbart}
              label="Begrunnelse og informasjon til utenlandske myndigheter"
              feltNavn="begrunnelseVidereSending"
            />
            {
              redigerbart &&
              <PdfLenkeListe dokumenter={dokumenter} behandlingID={behandlingID} />
            }
          </form>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6" className="fane__fot">
          <Nav.Hovedknapp disabled={!redigerbart} onClick={videresend}>
            VIDERESEND SØKNAD
          </Nav.Hovedknapp>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

VurderingVideresend.propTypes = {
  videresend: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
};

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const VurderingVideresendForm = reduxForm({
  form: KV.Form.VIDERESENDING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(VurderingVideresend);

export default connect(mapStateToProps)(VurderingVideresendForm);
