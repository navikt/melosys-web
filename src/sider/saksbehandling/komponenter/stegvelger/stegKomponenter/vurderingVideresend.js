import React from 'react';
import { change, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as EKV from 'eessi-kodeverk';

import MKV from '../../../../../melosyskodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';
import * as KV from '../../../../../kodeverk';
import * as Validering from '../../../../../felleskomponenter/skjema/validering';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { avklartefaktaSelectors } from '../../../../../ducks/avklartefakta';

import './vurderingVideresend.css';
import Mottakerinstitusjonvelger from '../../../../../felleskomponenter/mottakerinstitusjonvelger';

export const VurderingVideresend = ({
  redigerbart,
  behandlingID,
  bostedsland,
  handleSubmit,
  oppdaterMottakerinstitusjon,
  oppdaterKreverMottakerinstitusjon,
}) => {
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

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Nav.typo.Undertittel>Videresending av søknad</Nav.typo.Undertittel>
        <Nav.Row className="mottakerinstitusjoner">
          <Nav.Column xs="7">
            <Mottakerinstitusjonvelger
              feltNavn="mottakerinstitusjon"
              redigerbart={redigerbart}
              landkode={bostedsland.kode}
              bucType={EKV.Koder.buctyper.legislation.LA_BUC_03}
              mottakerinstitusjonHandler={oppdaterMottakerinstitusjon}
              kreverMottakerinstitusjonHandler={oppdaterKreverMottakerinstitusjon}
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
            <Nav.Hovedknapp disabled={!redigerbart} htmlType="submit">
              VIDERESEND SØKNAD
            </Nav.Hovedknapp>
          </Nav.Column>
        </Nav.Row>
      </form>
    </div>
  );
};

VurderingVideresend.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  videresendSoknad: PT.func.isRequired,
  bostedsland: MPT.Kodeverk.isRequired,
  handleSubmit: PT.func.isRequired,
  oppdaterMottakerinstitusjon: PT.func.isRequired,
  oppdaterKreverMottakerinstitusjon: PT.func.isRequired,
};

const videresendSoknad = (values, dispatch, props) => props.videresendSoknad(values.mottakerinstitusjon);

const VurderingVideresendForm = reduxForm({
  onSubmit: videresendSoknad,
  form: KV.Form.VURDERING_VIDERESEND,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: values => Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.vurdering_videresend)(values),
})(VurderingVideresend);

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  bostedsland: avklartefaktaSelectors.BostedslandSelector(state),
  initialValues: {
    mottakerinstitusjon: '',
    kreverMottakerinstitusjon: false,
  },
});

const mapDispatchToProps = dispatch => ({
  oppdaterMottakerinstitusjon: mottakerinstitusjon => dispatch(change(KV.Form.VURDERING_VIDERESEND, 'mottakerinstitusjon', mottakerinstitusjon)),
  oppdaterKreverMottakerinstitusjon: mottakerinstitusjon => dispatch(change(KV.Form.VURDERING_VIDERESEND, 'kreverMottakerinstitusjon', mottakerinstitusjon)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingVideresendForm);
