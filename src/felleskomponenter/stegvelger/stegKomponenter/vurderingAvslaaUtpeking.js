import React, { Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import * as EKV from 'eessi-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../../felleskomponenter/skjema';
import * as KV from '../../../kodeverk';
import * as Validering from '../../../felleskomponenter/skjema/validering';
import * as Mui from '../../../felleskomponenter/ui';

import PdfLenkeListe from '../../../felleskomponenter/pdfLenkeListe';
import { behandlingerSelectors } from '../../../ducks/behandlinger';

const VurderingAvslaaUtpeking = ({
  redigerbart,
  behandlingID,
  handleSubmit,
}) => {
  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis SED A004',
      type: EKV.Koder.sedtyper.A004,
      erSed: true,
    },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <Nav.typo.Undertittel className="stegTittel">Avvis utpeking</Nav.typo.Undertittel>
      {
        redigerbart &&
        <Fragment>
          <Skjema.Textarea
            label="Begrunnelse til utenlandsk myndighet (engelsk)"
            feltNavn="begrunnelseUtenlandskMyndighet"
            disabled={!redigerbart}
          />
          <Skjema.RadioGruppe label="Anmodning om mer informasjon vil bli sendt" feltNavn="vilSendeAnmodningOmMerInformasjon">
            <Skjema.Radio disabled={!redigerbart} feltNavn="vilSendeAnmodningOmMerInformasjon" value label="Ja" />
            <Skjema.Radio disabled={!redigerbart} feltNavn="vilSendeAnmodningOmMerInformasjon" value={false} label="Nei" />
          </Skjema.RadioGruppe>
          <Skjema.LandVelger
            feltNavn="nyttLovvalgsland"
            label="Foreslå nytt lovvalgsland (valgfritt)"
            disabled={!redigerbart}
          />
          <Skjema.Textarea
            label="Ytterligere informasjon (valgfritt)"
            feltNavn="fritekst"
            disabled={!redigerbart}
          />
          <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />
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
};

VurderingAvslaaUtpeking.defaultProps = {};

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
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
  validate: Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.avslaa_utpeking),
})(VurderingAvslaaUtpeking);

export default connect(mapStateToProps)(VurderingAvslaaUtpekingForm);
