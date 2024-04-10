/* eslint-disable */

import { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { getFormValues, isValid, reduxForm } from "redux-form";
import PT from "prop-types";
import MKV from "../../../melosyskodeverk";

import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Mui from "../../../felleskomponenter/ui";
import * as VilkarSelectors from "../../../ducks/vilkar/selectors";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { kontrollerFerdigbehandling } from "../../../ducks/kontroll/operations";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { vedtakOperations } from "../../../ducks/vedtak";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import Begrunnelser from "../../../felleskomponenter/begrunnelser";
import Dokumentliste from "../../../felleskomponenter/dokumentliste";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import VurderingAvslagArtikkel12Og16Schema from "./vurderingAvslag12_x_og_16Schema";

const skalViseSendOrienteringsbrev = (sakstype, behandlingstema) =>
  sakstype === MKV.Koder.sakstyper.EU_EOS &&
  [
    MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
  ].includes(behandlingstema);

const VurderingAvslag12_x_og_16 = ({
  valgte_art_12_1_begrunnelser,
  valgte_art_12_2_begrunnelser,
  valgte_art_16_1_begrunnelser,
  art16_1_fritekst,
  vilkarBegrunnelser,
  behandlingID,
  redigerbart,
  harFeilmeldinger,
  behandlingstype,
  behandlingstema,
  touch,
  sakstype,
  formIsValid,
  formValues,
  tilbake,
  validerMottatteOpplysninger,
  mottatteOpplysningerStatus,
  aktivtSteg,
}) => {
  const [vedtakPending, setVedtakPending] = useState(false);
  const dispatch = useDispatch();

  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const pdfDokumenter = [
    {
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        fritekst: formValues.vedtaksbrevFritekst,
      },
    },
  ];

  const { kopiTilArbeidsgiver, vedtakstype } = formValues;

  if (!erNyVurdering && kopiTilArbeidsgiver) {
    pdfDokumenter.push({
      navn: "Orientering til arbeidsgiver om avslag",
      data: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_ARBEIDSGIVER,
        mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
      },
    });
  }

  const muligeVirksomhetBegrunnelser = [
    ...MKV.KTObjects.begrunnelser.art12_2_normalt_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_vesentlig_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_forutgaaende_medl,
    ...MKV.KTObjects.begrunnelser.bosted,
  ];

  useEffect(() => {
    if (redigerbart && aktivtSteg && mottatteOpplysningerStatus === "OK") {
      dispatch(
        kontrollerFerdigbehandling({
          behandlingID,
          vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
          behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
          kontrollerSomSkalIgnoreres: kopiTilArbeidsgiver
            ? []
            : [MKV.Koder.begrunnelser.kontroll_begrunnelser.OPPHØRT_ARBEIDSGIVER],
          skalRegisteropplysningerOppdateres: false,
        })
      );
    }
  }, [kopiTilArbeidsgiver, mottatteOpplysningerStatus, aktivtSteg]);

  const validerForm = () => {
    touch("vedtakstype");
    touch("vedtakstypebegrunnelse");
    return formIsValid;
  };

  const avslaa = async () => {
    const { UTSENDT_ARBEIDSTAKER, UTSENDT_SELVSTENDIG } = MKV.Koder.behandlinger.behandlingstema;

    const { FASTSATT_LOVVALGSLAND, AVSLAG_SØKNAD } = MKV.Koder.behandlinger.behandlingsresultattyper;
    const behandlingsresultatTypeKode =
      behandlingstema === UTSENDT_ARBEIDSTAKER || behandlingstema === UTSENDT_SELVSTENDIG
        ? AVSLAG_SØKNAD
        : FASTSATT_LOVVALGSLAND;

    if (!validerForm()) return;

    setVedtakPending(true);

    validerMottatteOpplysninger()
      .then(() => {
        dispatch(
          vedtakOperations.fatt(behandlingID, {
            behandlingsresultatTypeKode,
            fritekst: formValues.vedtaksbrevFritekst,
            fritekstSed: null,
            kopiTilArbeidsgiver: formValues.kopiTilArbeidsgiver,
            mottakerinstitusjoner: null,
            vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
            nyVurderingBakgrunn: formValues.vedtakstypebegrunnelse,
          })
        ).then((res) => {
          if (res.data?.data?.error) {
            setVedtakPending(false);
          }
        });
      })
      .catch(() => setVedtakPending(false));
  };
  const stegErGyldig = redigerbart && formIsValid && !harFeilmeldinger;

  return (
    <div>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Avslag</Nav.Typo.Innholdstittel>
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
      {redigerbart && skalViseSendOrienteringsbrev(sakstype, behandlingstema) && (
        <Skjema.Checkbox feltNavn="kopiTilArbeidsgiver" label="Send orienteringsbrev til arbeidsgiver/virksomhet" />
      )}
      {erNyVurdering && <Skjema.Vedtakstype redigerbart={redigerbart} />}
      {stegErGyldig && <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
      {erNyVurdering && redigerbart && (
        <Nav.Alert variant="info">{KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}</Nav.Alert>
      )}
      <Mui.StegKnapper
        bekreftTekst="Fatt vedtak"
        bekreftKnappProps={{
          spinner: vedtakPending,
          autoDisableVedSpinner: true,
          disabled: !stegErGyldig,
          onClick: avslaa,
        }}
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
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
  tilbake: PT.func.isRequired,
  redigerbart: PT.bool,
  sakstype: PT.string.isRequired,
  behandlingstype: PT.string.isRequired,
  behandlingstema: PT.string.isRequired,
  harFeilmeldinger: PT.bool.isRequired,
  formIsValid: PT.bool.isRequired,
  touch: PT.func.isRequired,
  formValues: PT.object,
  validerMottatteOpplysninger: PT.func.isRequired,
  mottatteOpplysningerStatus: PT.string.isRequired,
  aktivtSteg: PT.bool,
};

VurderingAvslag12_x_og_16.defaultProps = {
  art16_1_fritekst: "",
  redigerbart: true,
  formValues: {},
  aktivtSteg: false,
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
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  formIsValid: isValid(KV.Form.AVSLAG_ARTIKKEL_12_OG_16)(state),
  formValues: getFormValues(KV.Form.AVSLAG_ARTIKKEL_12_OG_16)(state),
  initialValues: {
    vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
    vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
    vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
  },
  mottatteOpplysningerStatus: mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector(state),
});

export default connect(mapStateToProps)(VurderingAvslagArtikkel12Og16Form);
