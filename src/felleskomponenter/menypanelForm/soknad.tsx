import React, { FormEventHandler, useEffect, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
import { reduxForm, InjectedFormProps, getFormValues } from "redux-form";
import { RootState } from "AppTypes";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

import { lagYupToReduxformErrorMapper } from "../../yup";
import soknadSchema from "../../ducks/form/soknadSchema";
import * as KV from "../../kodeverk";
import * as Utils from "../../utils";

import Menypanel from "../menypanel";

import { behandlingsperioderSelectors } from "../../ducks/behandlingsperioder";
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../ducks/behandlingsgrunnlag";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { avklartefaktaSelectors } from "../../ducks/avklartefakta";
import { vilkarSelectors } from "../../ducks/vilkar";
import { formSelectors } from "../../ducks/form";

const mapStateToProps = (state: RootState) => ({
  oppgittAdresseHarVerdier: formSelectors.SoknadOppgittAdresseHarVerdierSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingsgrunnlagtype: behandlingsgrunnlagSelectors.BehandlingsgrunnlagtypeSelector(state),
  formValues: getFormValues(KV.Form.SOKNAD)(state),
  initialValues: {
    utenlandskIdent: behandlingsgrunnlagSelectors.PersonOpplysningerSelector(state).utenlandskIdent,
    medfolgendeBarn: behandlingsgrunnlagSelectors.MedfolgendeBarnSelector(state),
    medfolgendeEktefelleSamboer: behandlingsgrunnlagSelectors.MedfolgendeEktefelleSamboerSelector(state),
    arbeidsgiverBekrefterUtsendelse: behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state)
      .arbeidsgiverBekrefterUtsendelse,
    arbeidstakerAnsattUnderUtsendelsen: behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state)
      .arbeidstakerAnsattUnderUtsendelsen,
    erstatterArbeidstakerenUtsendte: behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state)
      .erstatterArbeidstakerenUtsendte,
    arbeidstakerTidligereUtsendt24Mnd: behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state)
      .arbeidstakerTidligereUtsendt24Mnd,
    arbeidsgiverBetalerArbeidsgiveravgift: behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state)
      .arbeidsgiverBetalerArbeidsgiveravgift,
    trygdeavgiftTrukketGjennomSkatt: behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state)
      .trygdeavgiftTrukketGjennomSkatt,
    trygdeavgiftTrukketGjennomSkattDato: Utils.dato.formatterDatoTilNorsk(
      behandlingsgrunnlagSelectors.ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkattDato
    ),
    oppgittAdresseTilleggsnavn: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).tilleggsnavn,
    oppgittAdresseGatenavn: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).gatenavn,
    oppgittAdresseRegion: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).region,
    oppgittAdresseHusnummerEtasjeLeilighet: behandlingsgrunnlagSelectors.BostedAdresseSelector(state)
      .husnummerEtasjeLeilighet,
    oppgittAdressePostboks: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).postboks,
    oppgittAdressePostnummer: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).postnummer,
    oppgittAdressePoststed: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).poststed,
    oppgittAdresseLand: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).landkode,
    juridiskArbeidsgiverNorge: {
      antallUtsendte:
        Math.trunc(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallUtsendte).toString() ||
        null,
      antallAdmAnsatte:
        Math.trunc(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAdmAnsatte).toString() ||
        null,
      antallAnsatte:
        Math.trunc(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAnsatte).toString() ||
        null,
      andelOmsetningINorge:
        Math.round(
          behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOmsetningINorge
        ).toString() || null,
      andelOppdragINorge:
        Math.round(
          behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOppdragINorge
        ).toString() || null,
      andelKontrakterINorge:
        Math.round(
          behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelKontrakterINorge
        ).toString() || null,
      andelRekruttertINorge:
        Math.round(
          behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelRekruttertINorge
        ).toString() || null,
      ekstraArbeidsgivere: behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
      erOffentligVirksomhet: behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state)
        .erOffentligVirksomhet,
    },
    loennOgGodtgjoerelse: {
      ...behandlingsgrunnlagSelectors.LonnOgGodtgjorelseSelector(state),
      bruttoLoennPerMnd: Utils.streng.tryParseFloat(
        behandlingsgrunnlagSelectors.LonnOgGodtgjorelseSelector(state).bruttoLoennPerMnd
      ),
      bruttoLoennUtlandPerMnd: Utils.streng.tryParseFloat(
        behandlingsgrunnlagSelectors.LonnOgGodtgjorelseSelector(state).bruttoLoennUtlandPerMnd
      ),
      samletVerdiNaturalytelser: Utils.streng.tryParseFloat(
        behandlingsgrunnlagSelectors.LonnOgGodtgjorelseSelector(state).samletVerdiNaturalytelser
      ),
    },
    arbeidssituasjonOgOevrig: {
      harLoennetArbeidMinstEnMndFoerUtsending: behandlingsgrunnlagSelectors.ArbeidssituasjonOgOevrigSelector(state)
        .harLoennetArbeidMinstEnMndFoerUtsending,
      beskrivelseArbeidSisteMnd: behandlingsgrunnlagSelectors.ArbeidssituasjonOgOevrigSelector(state)
        .beskrivelseArbeidSisteMnd,
      harAndreArbeidsgivereIUtsendingsperioden: behandlingsgrunnlagSelectors.ArbeidssituasjonOgOevrigSelector(state)
        .harAndreArbeidsgivereIUtsendingsperioden,
      beskrivelseAnnetArbeid: behandlingsgrunnlagSelectors.ArbeidssituasjonOgOevrigSelector(state)
        .beskrivelseAnnetArbeid,
      erSkattepliktig: behandlingsgrunnlagSelectors.ArbeidssituasjonOgOevrigSelector(state).erSkattepliktig,
      mottarYtelserNorge: behandlingsgrunnlagSelectors.ArbeidssituasjonOgOevrigSelector(state).mottarYtelserNorge,
      mottarYtelserUtlandet: behandlingsgrunnlagSelectors.ArbeidssituasjonOgOevrigSelector(state).mottarYtelserUtlandet,
    },
    utenlandsoppdraget: {
      erUtsendelseForOppdragIUtlandet: behandlingsgrunnlagSelectors.UtenlandsoppdragetSelector(state)
        .erUtsendelseForOppdragIUtlandet,
      erAnsattForOppdragIUtlandet: behandlingsgrunnlagSelectors.UtenlandsoppdragetSelector(state)
        .erAnsattForOppdragIUtlandet,
      erFortsattAnsattEtterOppdraget: behandlingsgrunnlagSelectors.UtenlandsoppdragetSelector(state)
        .erFortsattAnsattEtterOppdraget,
      erDrattPaaEgetInitiativ: behandlingsgrunnlagSelectors.UtenlandsoppdragetSelector(state).erDrattPaaEgetInitiativ,
      erErstatningTidligereUtsendte: behandlingsgrunnlagSelectors.UtenlandsoppdragetSelector(state)
        .erErstatningTidligereUtsendte,
      samletUtsendingsperiode: {
        fom: Utils.dato.formatterDatoTilNorsk(
          behandlingsgrunnlagSelectors.UtenlandsoppdragetSelector(state).samletUtsendingsperiode.fom
        ),
        tom: Utils.dato.formatterDatoTilNorsk(
          behandlingsgrunnlagSelectors.UtenlandsoppdragetSelector(state).samletUtsendingsperiode.tom
        ),
      },
    },
    oppholdUtlandFom: Utils.dato.formatterDatoTilNorsk(
      behandlingsgrunnlagSelectors.OppholdUtlandPeriodeSelector(state).fom
    ),
    oppholdUtlandTom: Utils.dato.formatterDatoTilNorsk(
      behandlingsgrunnlagSelectors.OppholdUtlandPeriodeSelector(state).tom
    ),
    oppholdsland: behandlingsgrunnlagSelectors.OppholdUtlandSelector(state).oppholdslandkoder,
    arbeidPaaLand: behandlingsgrunnlagSelectors.ArbeidPaaLandSelector(state),
    arbeidsstedOffshore: behandlingsgrunnlagSelectors.OffshoreArbeidSelector(state),
    arbeidsstedSkip: behandlingsgrunnlagSelectors.SkipArbeidSelector(state),
    arbeidsstedFly: behandlingsgrunnlagSelectors.LuftfartBaserSelector(state),
    ektefelleEllerBarnINorge: behandlingsgrunnlagSelectors.OppholdUtlandSelector(state).ektefelleEllerBarnINorge,
    studentSemester: behandlingsgrunnlagSelectors.OppholdUtlandSelector(state).studentSemester,
    erSelvstendig: behandlingsgrunnlagSelectors.SelvstendigArbeidSelector(state).erSelvstendig,
    selvstendigForetak: behandlingsgrunnlagSelectors.SelvstendigArbeidSelector(state).selvstendigForetak,
    antallMaanederINorge: behandlingsgrunnlagSelectors.BostedSelector(state).antallMaanederINorge,
    EOSBarnetrygdFraNAV: behandlingsgrunnlagSelectors.BostedSelector(state).EOSBarnetrygdFraNAV,
    soknadsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).fom),
    soknadsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).tom),
    soknadsland: {
      landkoder: behandlingsgrunnlagSelectors.SoknadslandkoderSelector(state),
      erUkjenteEllerAlleEosLand: behandlingsgrunnlagSelectors.SoknadslandErUkjenteEllerAlleEosLandSelector(state),
    },
    arbeidsforholdUtland: behandlingsgrunnlagSelectors.ArbeidsforholdUtlandSelector(state),
    selvstendigNaeringsvirksomhetUtland: behandlingsgrunnlagSelectors.SelvstendigNaeringsvirksomhetUtlandSelector(
      state
    ),
    tidligeremedlemskap: behandlingsperioderSelectors.tidligereMedlemskap(state),
    avklartefakta: {
      yrkesgruppe: avklartefaktaSelectors.Yrkesgruppe(state),
      yrkesaktivitet: avklartefaktaSelectors.Yrkesaktivitet(state),
      sokkelSkipKonklusjon: avklartefaktaSelectors.ArbeidSokkelSkipSelector(state),
    },
    vilkar: {
      vesentligVirksomhet: vilkarSelectors.vesentligVirksomhetSelector(state).oppfylt,
      vesentligVirksomhetBegrunnelser: vilkarSelectors.vesentligVirksomhetSelector(state).begrunnelseKoder,
      normaltDriverVirksomhet: vilkarSelectors.normaltDriverVirksomhetSelector(state).oppfylt,
      normaltDriverVirksomhetBegrunnelser: vilkarSelectors.normaltDriverVirksomhetSelector(state).begrunnelseKoder,
      forutgaendeMedlemskap: vilkarSelectors.forutgaendeMedlemskap(state).oppfylt,
      forutgaendeMedlemskapBegrunnelser: vilkarSelectors.forutgaendeMedlemskap(state).begrunnelseKoder,
      art11_3A: vilkarSelectors.art11_3A(state).oppfylt,
      art11_4_1: vilkarSelectors.art11_4_1(state).oppfylt,
      art11_4_2: vilkarSelectors.art11_4_2(state).oppfylt,
      nis: vilkarSelectors.nis(state).oppfylt,
      art12_1: vilkarSelectors.art12_1(state).oppfylt,
      art12_1_begrunnelser: vilkarSelectors.art12_1(state).begrunnelseKoder,
      art12_2: vilkarSelectors.art12_2(state).oppfylt,
      art12_2_begrunnelser: vilkarSelectors.art12_2(state).begrunnelseKoder,
      art16_1: vilkarSelectors.art16_1(state).oppfylt,
      art16_1_begrunnelser: vilkarSelectors.art16_1(state).begrunnelseKoder,
    },
  },
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  lagreBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.lagre()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type SoknadProps = PropsFromRedux & {
  startOgVisOppfriskModal: () => void;
};

const Soknad = ({
  lagreBehandlingsgrunnlag,
  startOgVisOppfriskModal,
  formValues,
}: SoknadProps & InjectedFormProps<KV.Form.SoknadFormData, SoknadProps>) => {
  const debouncedLagreBehandlingsgrunnlag = useCallback(Utils._debounce(lagreBehandlingsgrunnlag, 1000), []);
  useEffect(() => {
    debouncedLagreBehandlingsgrunnlag();
  }, [formValues]);

  const submitHandler: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
  };

  const lagreSoknadOgOppfriskSaksopplysninger = async () => {
    await lagreBehandlingsgrunnlag();
    startOgVisOppfriskModal();
  };

  return (
    <form name="soknad" id="soknad" onSubmit={submitHandler}>
      <Menypanel lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger} />
    </form>
  );
};

const MenypanelForm = reduxForm<KV.Form.SoknadFormData, SoknadProps>({
  form: KV.Form.SOKNAD,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => {
    const settings = {
      context: {
        skalOppgittAdresseValideres: props.oppgittAdresseHarVerdier,
        behandlingstema: props.behandlingstema,
        behandlingsgrunnlagtype: props.behandlingsgrunnlagtype,
      },
    };

    return lagYupToReduxformErrorMapper(soknadSchema, settings)(values);
  },
})(Soknad);

export default connector(MenypanelForm);
