import { useCallback, useEffect } from "react";
import { connect, useSelector } from "react-redux";
import { getFormValues, isValid, reduxForm } from "redux-form";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import MKV, { MKVUtils } from "../../../../melosyskodeverk";

import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";
import * as MPT from "../../../../proptypes";
import * as Mui from "../../../../felleskomponenter/ui";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { vedtakOperations, vedtakSelectors } from "../../../../ducks/vedtak";
import { formOperations } from "../../../../ducks/form";

import Dokumentliste from "../../../../felleskomponenter/dokumentliste";
import Mottakerinstitusjonvelger, {
  MottakerinstitusjonvelgerFlervalg,
} from "../../../../felleskomponenter/mottakerinstitusjonvelger";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartfakta,
  slettAvklartfakta,
} from "../../../../felleskomponenter/stegvelger";
import { BOOLSK_STRING } from "../../../../constants";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import VurderingArbeidTjenestepersonEllerFlyVedtakSchema from "./vurderingArbeidTjenestepersonEllerFlyVedtakSchema";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_EØS_FAKTURERING_AV_TRYGDEAVGIFT } from "../../../../featuretoggle/toggleNavn";

function InformertMyndighetVelger({ redigerbart, oppdaterData, slettData, informertMyndighetFakta }) {
  useEffect(() => {
    oppdaterData(
      konverterAvklartfaktaTilStegData(MKV.Koder.avklartefaktatyper.INFORMERT_MYNDIGHET, informertMyndighetFakta),
    );

    return () => {
      slettData(slettAvklartfakta(MKV.Koder.avklartefaktatyper.INFORMERT_MYNDIGHET));
    };
  }, []);

  const oppdaterInformertMyndighetFakta = (land) => {
    oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.INFORMERT_MYNDIGHET, land, BOOLSK_STRING.SANN));
  };

  return (
    <Skjema.LandVelger
      label="Hvilket land skal informeres?"
      feltNavn="mottakerLand"
      disabled={!redigerbart}
      onChange={oppdaterInformertMyndighetFakta}
    />
  );
}

InformertMyndighetVelger.propTypes = {
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  informertMyndighetFakta: MPT.Avklartefakta.isRequired,
};

const art11_5_ErValgt = (formValues) =>
  formValues.lovvalgsbestemmelse === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5;

const art11_3B_ErValgt = (formValues) =>
  formValues.lovvalgsbestemmelse === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B;

const skalSendeSed = (formValues, toggleEnabledPensjonistEøs) => {
  const { kreverMottakerinstitusjon } = formValues;

  if (art11_5_ErValgt(formValues)) {
    return kreverMottakerinstitusjon;
  }
  if (toggleEnabledPensjonistEøs && art11_3B_ErValgt(formValues)) {
    return formValues.informerUtenlandskTrygdemyndighet;
  }
  return art11_3B_ErValgt(formValues);
};

const skalSendeOrienteringsbrev = (selvstendigArbeid) => selvstendigArbeid?.erSelvstendig !== true;

const skalViseSendOrienteringsbrev = (sakstype, behandlingstema) =>
  sakstype === MKV.Koder.sakstyper.EU_EOS &&
  [
    MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
  ].includes(behandlingstema);

export function VurderingArbeidTjenestepersonEllerFlyVedtak({
  redigerbart,
  behandlingID,
  formIsValid,
  formValues = {},
  form,
  handleSubmit,
  touchAll,
  lagreLovvalgsperioder,
  behandlingstype,
  behandlingstema,
  sakstype,
  lovvalgsbestemmelseSomSkalVises = "",
  oppdaterData,
  slettData,
  tilbake,
  mottatteOpplysningerStatus,
  informertMyndighetFakta = {},
  kontrollerFerdigbehandling,
  harFeilmeldinger,
  aktivtSteg = false,
  validerMottatteOpplysninger,
  fattVedtak,
  selvstendigArbeid,
}) {
  const toggleEnabledPensjonistEøs = useFeatureToggle(MELOSYS_EØS_FAKTURERING_AV_TRYGDEAVGIFT);
  const vedtakErPending = useSelector(vedtakSelectors.ErPendingSelector);
  let oppdaterFørKontroll = true;

  const arbeidsland = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector);
  const harFlereSoknadslandEnnTillatt = arbeidsland.length > 1 && !MKVUtils.kanHaFlereSoknadsland(behandlingstema);

  useEffect(() => {
    // Lovvalgsbestemmelse og periode håndteres nå i periode-steget
    // Dette steget mottar kun verdiene via delt form state

    return () => {
      slettData();
    };
  }, []);

  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const vedKlikkForhandsvis = async () => {
    if (!formIsValid) {
      touchAll();
      return false;
    }

    // Periode håndteres allerede i periode-steget
    lagreLovvalgsperioder();
    return formIsValid;
  };

  let pdfDokumenter = [
    {
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        fritekst: formValues.vedtaksbrevFritekst,
      },
    },
  ];

  if (skalSendeSed(formValues, toggleEnabledPensjonistEøs)) {
    pdfDokumenter = [
      ...pdfDokumenter,
      {
        sedType: EKV.Koder.sedtyper.A010,
        sedData: {
          fritekst: formValues.fritekstSed,
        },
      },
    ];
  }
  const { kopiTilArbeidsgiver } = formValues;
  if (skalSendeOrienteringsbrev(selvstendigArbeid) && kopiTilArbeidsgiver) {
    pdfDokumenter.push({
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
        erInnvilgelse: true,
        mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
      },
    });
  }

  const lovvalgsbestemmelseTerm = KV.kodeTilTerm(lovvalgsbestemmelseSomSkalVises, MKV.Kodekombinasjoner.alleLovvalg);
  const overskrift = `Omfattet av norsk lovgivning etter ${lovvalgsbestemmelseTerm || "..."}`;

  // Lovvalgsbestemmelse og periode håndteres nå i eget periode-steg

  const visSendSEDValg = art11_5_ErValgt(formValues);
  const visMottakerinstitusjonvelgerFlervalg = art11_3B_ErValgt(formValues);

  const lagFattVedtakEOSReqDto = () => {
    let mottakerinstitusjoner = null;
    if (art11_5_ErValgt(formValues)) {
      mottakerinstitusjoner = formValues.mottakerLand ? [formValues.mottakerinstitusjon] : [];
    } else if (art11_3B_ErValgt(formValues)) {
      mottakerinstitusjoner = formValues.mottakerinstitusjoner
        .filter((inst) => inst.kreverMottakerinstitusjon)
        .map((inst) => inst.id);
    }
    if (art11_3B_ErValgt(formValues) && !formValues.informerUtenlandskTrygdemyndighet) {
      mottakerinstitusjoner = null;
    }

    return {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekst: formValues.vedtaksbrevFritekst,
      fritekstSed: formValues.fritekstSed,
      kopiTilArbeidsgiver: formValues.kopiTilArbeidsgiver,
      mottakerinstitusjoner,
      vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      nyVurderingBakgrunn: formValues.vedtakstypebegrunnelse,
    };
  };

  async function kontroller(data) {
    if (redigerbart && data.mottatteOpplysningerStatus === "OK" && data.aktivtSteg) {
      const request = {
        behandlingID,
        vedtakstype: data.formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
        kontrollerSomSkalIgnoreres: data.formValues.kopiTilArbeidsgiver
          ? []
          : [MKV.Koder.begrunnelser.kontroll_begrunnelser.OPPHØRT_ARBEIDSGIVER],
        skalRegisteropplysningerOppdateres: oppdaterFørKontroll,
      };
      oppdaterFørKontroll = false;
      await kontrollerFerdigbehandling(request);
    }
  }

  const debouncedKontrollerBehandling = useCallback(Utils._debounce(kontroller, 500), [kontrollerFerdigbehandling]);

  useEffect(() => {
    debouncedKontrollerBehandling({ aktivtSteg, mottatteOpplysningerStatus, formValues });
  }, [aktivtSteg, formValues?.vedtakstype, formValues?.kopiTilArbeidsgiver, mottatteOpplysningerStatus]);

  const onSubmit = async () => {
    debouncedKontrollerBehandling.cancel?.();
    await validerMottatteOpplysninger();
    fattVedtak(behandlingID, lagFattVedtakEOSReqDto());
  };

  const stegErGyldig = redigerbart && formIsValid && !harFeilmeldinger && !harFlereSoknadslandEnnTillatt;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="vurderingArbeidTjenestepersonEllerFlyVedtak">
      <Nav.Heading level="1" className="stegvelgertittel">
        {overskrift}
      </Nav.Heading>
      {/* Lovvalgsbestemmelse og periode håndteres nå i eget periode-steg */}
      {erNyVurdering && <Skjema.Vedtakstype redigerbart={redigerbart} />}
      <Nav.Row className="fritekst">
        <Nav.Column xs="8">
          <Skjema.Textarea
            feltNavn="vedtaksbrevFritekst"
            label="Fritekst til begrunnelse"
            readOnly={!redigerbart}
            maxLength={4000}
          />
        </Nav.Column>
      </Nav.Row>
      {visSendSEDValg && (
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.RadioGroup
              legend="Skal utenlandsk trygdemyndighet informeres?"
              name="informerUtenlandskTrygdemyndighet"
              readOnly={!redigerbart}
            >
              <Nav.HStack gap="16">
                <Nav.Radio value>Ja</Nav.Radio>
                <Nav.Radio value={false}>Nei</Nav.Radio>
              </Nav.HStack>
            </Skjema.RadioGroup>
          </Nav.Column>
        </Nav.Row>
      )}
      {visSendSEDValg && formValues.informerUtenlandskTrygdemyndighet && (
        <Nav.Row>
          <Nav.Column xs="6">
            <InformertMyndighetVelger
              redigerbart={redigerbart}
              oppdaterData={oppdaterData}
              slettData={slettData}
              informertMyndighetFakta={informertMyndighetFakta}
            />
            {formValues.mottakerLand && (
              <Mottakerinstitusjonvelger
                form={form}
                redigerbart={redigerbart}
                landkode={formValues.mottakerLand}
                bucType={EKV.Koder.buctyper.legislation.LA_BUC_05}
              />
            )}
          </Nav.Column>
        </Nav.Row>
      )}

      {visMottakerinstitusjonvelgerFlervalg && toggleEnabledPensjonistEøs && redigerbart && (
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.RadioGroup
              legend="Skal utenlandsk trygdemyndighet informeres med SED A010?"
              name="informerUtenlandskTrygdemyndighet"
              readOnly={!redigerbart}
            >
              <Nav.HStack gap="16">
                <Nav.Radio value>Ja</Nav.Radio>
                <Nav.Radio value={false}>Nei</Nav.Radio>
              </Nav.HStack>
            </Skjema.RadioGroup>
          </Nav.Column>
        </Nav.Row>
      )}
      {visMottakerinstitusjonvelgerFlervalg && formValues.informerUtenlandskTrygdemyndighet && (
        <Nav.Row>
          <Nav.Column xs="8">
            <MottakerinstitusjonvelgerFlervalg
              feltnavn="mottakerinstitusjoner"
              bucType={EKV.Koder.buctyper.legislation.LA_BUC_05}
              redigerbart={redigerbart}
              form={form}
            />
          </Nav.Column>
        </Nav.Row>
      )}
      {redigerbart && skalSendeSed(formValues, toggleEnabledPensjonistEøs) && (
        <Nav.Row className="fritekstSed">
          <Nav.Column xs="8">
            <Skjema.Textarea
              label="Ytterligere informasjon til SED (valgfri)"
              feltNavn="fritekstSed"
              readOnly={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      )}
      {redigerbart && skalViseSendOrienteringsbrev(sakstype, behandlingstema) && (
        <Skjema.Checkbox feltNavn="kopiTilArbeidsgiver" label="Send orienteringsbrev til arbeidsgiver/virksomhet" />
      )}
      <Nav.Row>
        <Nav.Column xs="8">
          {stegErGyldig && (
            <Dokumentliste
              behandlingID={behandlingID}
              dokumenter={pdfDokumenter}
              validateOnClick={vedKlikkForhandsvis}
            />
          )}
        </Nav.Column>
      </Nav.Row>

      {harFlereSoknadslandEnnTillatt && (
        <Nav.Alert variant="error">Det er kun tillatt med ett arbeidsland i vedtaket.</Nav.Alert>
      )}

      {erNyVurdering && redigerbart && (
        <Nav.Alert variant="info">{KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}</Nav.Alert>
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          loading: vedtakErPending,
          disabled: !stegErGyldig || vedtakErPending,
        }}
        bekreftTekst="Fatt vedtak"
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
}

VurderingArbeidTjenestepersonEllerFlyVedtak.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  touchAll: PT.func.isRequired,
  lagreLovvalgsperioder: PT.func.isRequired,
  behandlingstype: PT.string.isRequired,
  behandlingstema: PT.string.isRequired,
  sakstype: PT.string.isRequired,
  form: PT.string.isRequired,
  handleSubmit: PT.func.isRequired,
  lovvalgsbestemmelseSomSkalVises: PT.string,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  informertMyndighetFakta: MPT.Avklartefakta,
  kontrollerFerdigbehandling: PT.func.isRequired,
  harFeilmeldinger: PT.bool.isRequired,
  aktivtSteg: PT.bool,
  validerMottatteOpplysninger: PT.func.isRequired,
  fattVedtak: PT.func.isRequired,
  selvstendigArbeid: PT.object.isRequired,
  mottatteOpplysningerStatus: PT.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  const forkortLovvalgsperiode = ownProps.redigerbart
    ? false
    : Utils.dato.datoDiffPure(
        mottatteOpplysningerSelectors.PeriodeSelector(state).tom,
        lovvalgsperioderSelectors.TomDatoSelector(state),
        "days",
      ) !== 0;

  const erArt11_3B =
    ownProps.lovvalgsbestemmelseSomSkalVises ===
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B;

  const informerUtenlandskTrygdemyndighet =
    !Utils._isEmpty(ownProps.informertMyndighetFakta) || erArt11_3B ? true : null;
  const mottakerLand = ownProps.informertMyndighetFakta.subjektID;

  return {
    mottatteOpplysningerFom: mottatteOpplysningerSelectors.PeriodeFomSelector(state),
    mottatteOpplysningerTom: mottatteOpplysningerSelectors.PeriodeTomSelector(state),
    mottatteOpplysningerStatus: mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector(state),
    behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
    behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
    sakstype: fagsakSelectors.SakstypeKodeSelector(state),
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    soknadsperiode: mottatteOpplysningerSelectors.PeriodeSelector(state),
    selvstendigArbeid: mottatteOpplysningerSelectors.SelvstendigArbeidSelector(state),
    formIsValid: isValid(KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK)(state),
    formValues: getFormValues(KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK)(state),
    initialValues: {
      forkortLovvalgsperiode,
      tomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state)),
      fomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.FomDatoSelector(state)),
      vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
      vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
      vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
      mottakerinstitusjoner: avklartefaktaSelectors.IkkeMarginaleArbeidslandKTSelector(state) || [],
      lovvalgsbestemmelse: ownProps.lovvalgsbestemmelseSomSkalVises,
      fritekstSed: "",
      kopiTilArbeidsgiver: true,
      informerUtenlandskTrygdemyndighet,
      mottakerLand,
    },
  };
};

const mapDispatchToProps = (dispatch) => ({
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK)),
  fattVedtak: (behandlingID, body) => dispatch(vedtakOperations.fatt(behandlingID, body)),
});

const VurderingArbeidTjenestepersonEllerFlyVedtakForm = reduxForm({
  form: KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(VurderingArbeidTjenestepersonEllerFlyVedtakSchema, {
      context: {
        soknadsperiode: props.soknadsperiode,
        behandlingstype: props.behandlingstype,
      },
    })(values),
})(VurderingArbeidTjenestepersonEllerFlyVedtak);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArbeidTjenestepersonEllerFlyVedtakForm);
