import React, { Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector, isValid } from 'redux-form';
import * as EKV from 'eessi-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../../felleskomponenter/skjema';
import * as KV from '../../../kodeverk';
import * as Mui from '../../../felleskomponenter/ui';

import PdfLenkeListe from '../../../felleskomponenter/pdfLenkeListe';

import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { formOperations } from '../../../ducks/form';

import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from '../../../yup';

export const VurderingAvslaaUtpeking = ({
  redigerbart,
  behandlingID,
  handleSubmit,
  fritekst,
  nyttLovvalgsland,
  begrunnelseUtenlandskMyndighet,
  vilSendeAnmodningOmMerInformasjon,
  touchAll,
  formIsValid,
}) => {
  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis SED A004',
      type: EKV.Koder.sedtyper.A004,
      erSed: true,
      data: {
        fritekst,
        nyttLovvalgsland,
        begrunnelseUtenlandskMyndighet,
        vilSendeAnmodningOmMerInformasjon,
      },
    },
  ];

  const vedKlikkForhandsvis = () => {
    if (!formIsValid) {
      touchAll();
      return false;
    }

    return formIsValid;
  };

  return (
    <form onSubmit={handleSubmit}>
      <Nav.typo.Undertittel className="stegTittel">Avvis utpeking — informasjon til SED</Nav.typo.Undertittel>
      {
        redigerbart &&
        <Fragment>
          <Skjema.Textarea
            label="Begrunnelse til utenlandsk myndighet (engelsk)"
            feltNavn="begrunnelseUtenlandskMyndighet"
            disabled={!redigerbart}
            visTellerFra={500}
            maxLength={500}
          />
          <Skjema.RadioGruppe label="Anmodning om mer informasjon vil bli sendt" feltNavn="vilSendeAnmodningOmMerInformasjon">
            <Skjema.Radio disabled={!redigerbart} feltNavn="vilSendeAnmodningOmMerInformasjon" value label="Ja" />
            <Skjema.Radio disabled={!redigerbart} feltNavn="vilSendeAnmodningOmMerInformasjon" value={false} label="Nei" />
          </Skjema.RadioGruppe>
          <Skjema.LandVelger
            feltNavn="nyttLovvalgsland"
            label="Foreslå nytt lovvalgsland (valgfri)"
            disabled={!redigerbart}
          />
          <Skjema.Textarea
            label="Ytterligere informasjon (valgfri)"
            feltNavn="fritekst"
            disabled={!redigerbart}
            visTellerFra={500}
            maxLength={500}
          />
          <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkForhandsvis} />
        </Fragment>
      }
      <Mui.Knapp mini disabled={!redigerbart} htmlType="submit" type="hoved">AVSLUTT OG SEND SED</Mui.Knapp>
    </form>
  );
};

VurderingAvslaaUtpeking.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  handleSubmit: PT.func.isRequired,
  avvisUtpeking: PT.func.isRequired,
  fritekst: PT.string,
  nyttLovvalgsland: PT.string,
  begrunnelseUtenlandskMyndighet: PT.string,
  vilSendeAnmodningOmMerInformasjon: PT.bool,
  touchAll: PT.func.isRequired,
  formIsValid: PT.bool.isRequired,
};

VurderingAvslaaUtpeking.defaultProps = {
  fritekst: '',
  nyttLovvalgsland: '',
  begrunnelseUtenlandskMyndighet: '',
  vilSendeAnmodningOmMerInformasjon: false,
};

const avslaaUtpekingFormValueSelector = formValueSelector(KV.Form.AVSLAA_UTPEKING);

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  fritekst: avslaaUtpekingFormValueSelector(state, 'fritekst'),
  nyttLovvalgsland: avslaaUtpekingFormValueSelector(state, 'nyttLovvalgsland'),
  begrunnelseUtenlandskMyndighet: avslaaUtpekingFormValueSelector(state, 'begrunnelseUtenlandskMyndighet'),
  vilSendeAnmodningOmMerInformasjon: avslaaUtpekingFormValueSelector(state, 'vilSendeAnmodningOmMerInformasjon'),
  formIsValid: isValid(KV.Form.AVSLAA_UTPEKING)(state),
});

const mapDispatchToProps = dispatch => ({
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.AVSLAA_UTPEKING)),
});

const avsluttOgSendSed = (values, dispatch, props) => {
  const body = {
    fritekst: values.fritekst || null,
    nyttLovvalgsland: values.nyttLovvalgsland || null,
    begrunnelseUtenlandskMyndighet: values.begrunnelseUtenlandskMyndighet,
    vilSendeAnmodningOmMerInformasjon: values.vilSendeAnmodningOmMerInformasjon,
  };

  props.avvisUtpeking(body);
};

const VurderingAvslaaUtpekingForm = reduxForm({
  onSubmit: avsluttOgSendSed,
  form: KV.Form.AVSLAA_UTPEKING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(YupSkjemaer.avslaa_utpeking),
})(VurderingAvslaaUtpeking);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingAvslaaUtpekingForm);
