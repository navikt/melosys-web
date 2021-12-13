import React, { Fragment, useState } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import { reduxForm, formValueSelector, isValid } from "redux-form";
import * as EKV from "eessi-kodeverk";

import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as KV from "../../../kodeverk";
import * as Mui from "../../../felleskomponenter/ui";
import * as Hooks from "../../../hooks";

import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { formOperations } from "../../../ducks/form";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import VurderingAvslaaUtpekingSchema from "./vurderingAvslaaUtpekingSchema";

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
  tilbake,
}) => {
  const [avslagPending, setAvslagPending] = useState(false);
  const isMounted = Hooks.useIsMounted();

  const pdfDokumenter = [
    {
      navn: "Forhåndsvis SED A004",
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

  const avsluttOgSendSed = async (values, dispatch, props) => {
    setAvslagPending(true);

    const body = {
      fritekst: values.fritekst || null,
      nyttLovvalgsland: values.nyttLovvalgsland || null,
      begrunnelseUtenlandskMyndighet: values.begrunnelseUtenlandskMyndighet,
      vilSendeAnmodningOmMerInformasjon: values.vilSendeAnmodningOmMerInformasjon,
    };

    await props.avvisUtpeking(body);

    // avvis-operation navigerer til forside, og komponenten kan derfor være unmountet.
    if (isMounted.current) {
      setAvslagPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(avsluttOgSendSed)}>
      <Nav.Typo.Undertittel className="stegTittel">Avvis utpeking — informasjon til SED</Nav.Typo.Undertittel>
      {redigerbart && (
        <Fragment>
          <Skjema.Textarea
            label="Begrunnelse til utenlandsk myndighet (engelsk)"
            feltNavn="begrunnelseUtenlandskMyndighet"
            disabled={!redigerbart}
            visTellerFra={500}
            maxLength={500}
          />
          <Skjema.RadioGruppe
            label="Anmodning om mer informasjon vil bli sendt"
            feltNavn="vilSendeAnmodningOmMerInformasjon"
          >
            <Skjema.Radio disabled={!redigerbart} feltNavn="vilSendeAnmodningOmMerInformasjon" value label="Ja" />
            <Skjema.Radio
              disabled={!redigerbart}
              feltNavn="vilSendeAnmodningOmMerInformasjon"
              value={false}
              label="Nei"
            />
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
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          spinner: avslagPending,
          autoDisableVedSpinner: true,
          disabled: !redigerbart,
          htmlType: "submit",
          type: "hoved",
        }}
        bekreftTekst="AVSLUTT OG SEND SED"
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </form>
  );
};

VurderingAvslaaUtpeking.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  handleSubmit: PT.func.isRequired,
  avvisUtpeking: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  fritekst: PT.string,
  nyttLovvalgsland: PT.string,
  begrunnelseUtenlandskMyndighet: PT.string,
  vilSendeAnmodningOmMerInformasjon: PT.bool,
  touchAll: PT.func.isRequired,
  formIsValid: PT.bool.isRequired,
};

VurderingAvslaaUtpeking.defaultProps = {
  fritekst: "",
  nyttLovvalgsland: "",
  begrunnelseUtenlandskMyndighet: "",
  vilSendeAnmodningOmMerInformasjon: false,
};

const avslaaUtpekingFormValueSelector = formValueSelector(KV.Form.AVSLAA_UTPEKING);

const mapStateToProps = (state) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  fritekst: avslaaUtpekingFormValueSelector(state, "fritekst"),
  nyttLovvalgsland: avslaaUtpekingFormValueSelector(state, "nyttLovvalgsland"),
  begrunnelseUtenlandskMyndighet: avslaaUtpekingFormValueSelector(state, "begrunnelseUtenlandskMyndighet"),
  vilSendeAnmodningOmMerInformasjon: avslaaUtpekingFormValueSelector(state, "vilSendeAnmodningOmMerInformasjon"),
  formIsValid: isValid(KV.Form.AVSLAA_UTPEKING)(state),
});

const mapDispatchToProps = (dispatch) => ({
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.AVSLAA_UTPEKING)),
});

const VurderingAvslaaUtpekingForm = reduxForm({
  form: KV.Form.AVSLAA_UTPEKING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(VurderingAvslaaUtpekingSchema),
})(VurderingAvslaaUtpeking);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingAvslaaUtpekingForm);
