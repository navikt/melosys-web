import { Fragment, useState } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import { formValueSelector, isValid, reduxForm } from "redux-form";
import * as EKV from "eessi-kodeverk";

import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Hooks from "../../../../hooks";

import Dokumentliste from "../../../../felleskomponenter/dokumentliste";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { formOperations } from "../../../../ducks/form";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import VurderingAvslaaUtpekingSchema from "./vurderingAvslaaUtpekingSchema";

const VurderingAvslaaUtpeking = ({
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
      sedType: EKV.Koder.sedtyper.A004,
      sedData: {
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
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Avvis utpeking — informasjon til SED
      </Nav.Typo.Innholdstittel>
      {redigerbart && (
        <Fragment>
          <Skjema.Textarea
            label="Begrunnelse til utenlandsk myndighet (engelsk)"
            feltNavn="begrunnelseUtenlandskMyndighet"
            readOnly={!redigerbart}
            visTellerFra={500}
            maxLength={500}
          />
          <Skjema.RadioGroup
            legend="Anmodning om mer informasjon vil bli sendt"
            name="vilSendeAnmodningOmMerInformasjon"
            readOnly={!redigerbart}
          >
            <Nav.Radio value>Ja</Nav.Radio>
            <Nav.Radio value={false}>Nei</Nav.Radio>
          </Skjema.RadioGroup>
          <Skjema.LandVelger
            feltNavn="nyttLovvalgsland"
            label="Foreslå nytt lovvalgsland (valgfri)"
            disabled={!redigerbart}
          />
          <Skjema.Textarea
            label="Ytterligere informasjon (valgfri)"
            feltNavn="fritekst"
            readOnly={!redigerbart}
            visTellerFra={500}
            maxLength={500}
          />
          <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} validateOnClick={vedKlikkForhandsvis} />
        </Fragment>
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          loading: avslagPending,
          disabled: !redigerbart,
        }}
        bekreftTekst="Avslutt og send SED"
        tilbakeKnappProps={{
          onClick: (e) => {
            e.preventDefault();
            tilbake();
          },
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
