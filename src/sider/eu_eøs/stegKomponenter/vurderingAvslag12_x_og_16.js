import React, { useState } from "react";
import { connect } from "react-redux";
import { reduxForm, isValid, getFormValues } from "redux-form";
import PT from "prop-types";
import MKV from "../../../melosyskodeverk";

import * as KV from "../../../kodeverk";
import * as Nav from "../../../utils/navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Hooks from "../../../hooks";
import * as VilkarSelectors from "../../../ducks/vilkar/selectors";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";

import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";
import Begrunnelser from "../../../felleskomponenter/begrunnelser";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import VurderingAvslagArtikkel12Og16Schema from "./vurderingAvslag12_x_og_16Schema";

const VurderingAvslag12_x_og_16 = ({
  valgte_art_12_1_begrunnelser,
  valgte_art_12_2_begrunnelser,
  valgte_art_16_1_begrunnelser,
  art16_1_fritekst,
  vilkarBegrunnelser,
  behandlingID,
  lagreOgFatteVedtak,
  redigerbart,
  behandlingstype,
  touch,
  formIsValid,
  formValues,
}) => {
  const [vedtakPending, setVedtakPending] = useState(false);
  const isMounted = Hooks.useIsMounted();

  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const pdfDokumenter = [
    {
      navn: "Forhåndsvis vedtaksbrev",
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
        fritekst: formValues.vedtaksbrevFritekst,
      },
    },
  ];

  if (!erNyVurdering) {
    pdfDokumenter.push({
      navn: "Orientering til arbeidsgiver om avslag",
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_ARBEIDSGIVER,
      data: {
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
      },
    });
  }

  const muligeVirksomhetBegrunnelser = [
    ...MKV.KTObjects.begrunnelser.art12_2_normalt_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_vesentlig_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_forutgaaende_medl,
    ...MKV.KTObjects.begrunnelser.bosted,
  ];

  const validerForm = () => {
    touch("vedtakstype");
    touch("vedtakstypebegrunnelse");
    return formIsValid;
  };

  const avslaa = async () => {
    if (!validerForm()) return;

    setVedtakPending(true);

    await lagreOgFatteVedtak({
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekst: formValues.vedtaksbrevFritekst,
      fritekstSed: null,
      mottakerinstitusjoner: null,
      vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      revurderBegrunnelse: formValues.vedtakstypebegrunnelse,
    });

    // Vedtak-operation navigerer til forside, og komponenten kan derfor være unmountet.
    if (isMounted.current) {
      setVedtakPending(false);
    }
  };

  return (
    <div>
      <Nav.Typo.Undertittel>Avslag</Nav.Typo.Undertittel>
      {valgte_art_12_1_begrunnelser.length > 0 && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12. nr. 1:"
          valgteBegrunnelser={[...valgte_art_12_1_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[...MKV.KTObjects.begrunnelser.art12_1_begrunnelser, ...muligeVirksomhetBegrunnelser]}
        />
      )}
      {valgte_art_12_2_begrunnelser.length > 0 && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12, nr. 2:"
          valgteBegrunnelser={[...valgte_art_12_2_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[...MKV.KTObjects.begrunnelser.art12_2_begrunnelser, ...muligeVirksomhetBegrunnelser]}
        />
      )}
      {(valgte_art_16_1_begrunnelser.length > 0 || art16_1_fritekst) && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 16, nr. 1:"
          valgteBegrunnelser={valgte_art_16_1_begrunnelser}
          muligeBegrunnelser={MKV.KTObjects.begrunnelser.art16_1_avslag}
          fritekst={art16_1_fritekst}
        />
      )}
      <Nav.Row>
        <Nav.Column xs="8">
          <Skjema.Textarea
            feltNavn="vedtaksbrevFritekst"
            label="Fritekst til vedtaksbrev"
            placeholder="Skriv inn tekst til vedtaksbrevet..."
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      {erNyVurdering && <Skjema.Vedtakstype redigerbart={redigerbart} />}
      {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
      <Nav.Hovedknapp spinner={vedtakPending} autoDisableVedSpinner disabled={!redigerbart} onClick={avslaa}>
        Fatt vedtak
      </Nav.Hovedknapp>
    </div>
  );
};

VurderingAvslag12_x_og_16.propTypes = {
  valgte_art_12_1_begrunnelser: PT.array.isRequired,
  valgte_art_12_2_begrunnelser: PT.array.isRequired,
  valgte_art_16_1_begrunnelser: PT.array.isRequired,
  art16_1_fritekst: PT.string,
  vilkarBegrunnelser: PT.array.isRequired,
  behandlingID: PT.number.isRequired,
  lagreOgFatteVedtak: PT.func.isRequired,
  redigerbart: PT.bool,
  behandlingstype: PT.string.isRequired,
  formIsValid: PT.bool.isRequired,
  touch: PT.func.isRequired,
  formValues: PT.object,
};

VurderingAvslag12_x_og_16.defaultProps = {
  art16_1_fritekst: "",
  redigerbart: true,
  formValues: {},
};

const VurderingAvslagArtikkel12Og16Form = reduxForm({
  form: KV.Form.AVSLAG_ARTIKKEL_12_OG_16,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(VurderingAvslagArtikkel12Og16Schema, {
      context: {
        behandlingstype: props.behandlingstype,
      },
    })(values),
})(VurderingAvslag12_x_og_16);

const mapStateToProps = (state) => ({
  valgte_art_12_1_begrunnelser: VilkarSelectors.art12_1_begrunnelserSelector(state),
  valgte_art_12_2_begrunnelser: VilkarSelectors.art12_2_begrunnelserSelector(state),
  valgte_art_16_1_begrunnelser: VilkarSelectors.art16_1_begrunnelserSelector(state),
  art16_1_fritekst: VilkarSelectors.art16_1_fritekstSelector(state),
  vilkarBegrunnelser: VilkarSelectors.vilkarBegrunnelserSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  formIsValid: isValid(KV.Form.AVSLAG_ARTIKKEL_12_OG_16)(state),
  formValues: getFormValues(KV.Form.AVSLAG_ARTIKKEL_12_OG_16)(state),
  initialValues: {
    vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
    vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
    vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
  },
});

export default connect(mapStateToProps)(VurderingAvslagArtikkel12Og16Form);
