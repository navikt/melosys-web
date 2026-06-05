import { FormEventHandler, useCallback, useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, InjectedFormProps, reduxForm } from "redux-form";
import { RootState } from "AppTypes";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

import { lagYupToReduxformErrorMapper } from "../../yup";
import soknadSchema from "../../ducks/form/soknadSchema";
import MKV from "../../melosyskodeverk";
import * as KV from "../../kodeverk";
import * as Utils from "../../utils";

import Menypanel from "../menypanel";

import { behandlingsperioderSelectors } from "../../ducks/behandlingsperioder";
import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { avklartefaktaSelectors } from "../../ducks/avklartefakta";
import { formSelectors } from "../../ducks/form";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { fagsakSelectors } from "../../ducks/fagsaker";
import { flytSelectors } from "../../ducks/flyt";

const mapStateToProps = (state: RootState) => ({
  oppgittAdresseHarVerdier: formSelectors.SoknadOppgittAdresseHarVerdierSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  mottatteOpplysningerType: mottatteOpplysningerSelectors.MottatteOpplysningerTypeSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  harUnntaksregistreringFlyt: flytSelectors.HarUnntaksregistreringFlytSelector(state),
  mottatteOpplysningerFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
  formValues: getFormValues(KV.Form.SOKNAD)(state),
  initialValues: {
    ikkeYrkesaktivSituasjontype: mottatteOpplysningerSelectors.IkkeYrkesaktivSituasjontypeSelector(state),
    medfolgendeBarn: mottatteOpplysningerSelectors.MedfolgendeBarnSelector(state),
    foedestedOgLand: mottatteOpplysningerSelectors.PersonOpplysningerSelector(state).foedestedOgLand,
    medfolgendeEktefelleSamboer: mottatteOpplysningerSelectors.MedfolgendeEktefelleSamboerSelector(state),
    arbeidsgiverBekrefterUtsendelse:
      mottatteOpplysningerSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBekrefterUtsendelse,
    arbeidstakerAnsattUnderUtsendelsen:
      mottatteOpplysningerSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidstakerAnsattUnderUtsendelsen,
    erstatterArbeidstakerenUtsendte:
      mottatteOpplysningerSelectors.ArbeidsgiversBekreftelseSelector(state).erstatterArbeidstakerenUtsendte,
    arbeidstakerTidligereUtsendt24Mnd:
      mottatteOpplysningerSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidstakerTidligereUtsendt24Mnd,
    arbeidsgiverBetalerArbeidsgiveravgift:
      mottatteOpplysningerSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBetalerArbeidsgiveravgift,
    trygdeavgiftTrukketGjennomSkatt:
      mottatteOpplysningerSelectors.ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkatt,
    trygdeavgiftTrukketGjennomSkattDato: Utils.dato.formatterDatoTilNorsk(
      mottatteOpplysningerSelectors.ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkattDato,
    ),
    oppgittAdresseTilleggsnavn: mottatteOpplysningerSelectors.BostedAdresseSelector(state).tilleggsnavn,
    oppgittAdresseGatenavn: mottatteOpplysningerSelectors.BostedAdresseSelector(state).gatenavn,
    oppgittAdresseRegion: mottatteOpplysningerSelectors.BostedAdresseSelector(state).region,
    oppgittAdresseHusnummerEtasjeLeilighet:
      mottatteOpplysningerSelectors.BostedAdresseSelector(state).husnummerEtasjeLeilighet,
    oppgittAdressePostboks: mottatteOpplysningerSelectors.BostedAdresseSelector(state).postboks,
    oppgittAdressePostnummer: mottatteOpplysningerSelectors.BostedAdresseSelector(state).postnummer,
    oppgittAdressePoststed: mottatteOpplysningerSelectors.BostedAdresseSelector(state).poststed,
    oppgittAdresseLand: mottatteOpplysningerSelectors.BostedAdresseSelector(state).landkode,
    juridiskArbeidsgiverNorge: {
      antallUtsendte:
        Math.trunc(mottatteOpplysningerSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallUtsendte).toString() ||
        null,
      antallAdmAnsatte:
        Math.trunc(
          mottatteOpplysningerSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAdmAnsatte,
        ).toString() || null,
      antallAnsatte:
        Math.trunc(mottatteOpplysningerSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAnsatte).toString() ||
        null,
      andelOmsetningINorge:
        Math.round(
          mottatteOpplysningerSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOmsetningINorge,
        ).toString() || null,
      andelOppdragINorge:
        Math.round(
          mottatteOpplysningerSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOppdragINorge,
        ).toString() || null,
      andelKontrakterINorge:
        Math.round(
          mottatteOpplysningerSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelKontrakterINorge,
        ).toString() || null,
      andelRekruttertINorge:
        Math.round(
          mottatteOpplysningerSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelRekruttertINorge,
        ).toString() || null,
      ekstraArbeidsgivere: mottatteOpplysningerSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
      erOffentligVirksomhet:
        mottatteOpplysningerSelectors.JuridiskArbeidsgiverNorgeSelector(state).erOffentligVirksomhet,
    },
    loennOgGodtgjoerelse: {
      ...mottatteOpplysningerSelectors.LonnOgGodtgjorelseSelector(state),
      bruttoLoennPerMnd: Utils.streng.tryParseFloat(
        mottatteOpplysningerSelectors.LonnOgGodtgjorelseSelector(state).bruttoLoennPerMnd,
      ),
      bruttoLoennUtlandPerMnd: Utils.streng.tryParseFloat(
        mottatteOpplysningerSelectors.LonnOgGodtgjorelseSelector(state).bruttoLoennUtlandPerMnd,
      ),
      samletVerdiNaturalytelser: Utils.streng.tryParseFloat(
        mottatteOpplysningerSelectors.LonnOgGodtgjorelseSelector(state).samletVerdiNaturalytelser,
      ),
    },
    arbeidssituasjonOgOevrig: {
      harLoennetArbeidMinstEnMndFoerUtsending:
        mottatteOpplysningerSelectors.ArbeidssituasjonOgOevrigSelector(state).harLoennetArbeidMinstEnMndFoerUtsending,
      beskrivelseArbeidSisteMnd:
        mottatteOpplysningerSelectors.ArbeidssituasjonOgOevrigSelector(state).beskrivelseArbeidSisteMnd,
      harAndreArbeidsgivereIUtsendingsperioden:
        mottatteOpplysningerSelectors.ArbeidssituasjonOgOevrigSelector(state).harAndreArbeidsgivereIUtsendingsperioden,
      beskrivelseAnnetArbeid:
        mottatteOpplysningerSelectors.ArbeidssituasjonOgOevrigSelector(state).beskrivelseAnnetArbeid,
      erSkattepliktig: mottatteOpplysningerSelectors.ArbeidssituasjonOgOevrigSelector(state).erSkattepliktig,
      mottarYtelserNorge: mottatteOpplysningerSelectors.ArbeidssituasjonOgOevrigSelector(state).mottarYtelserNorge,
      mottarYtelserUtlandet:
        mottatteOpplysningerSelectors.ArbeidssituasjonOgOevrigSelector(state).mottarYtelserUtlandet,
    },
    utenlandsoppdraget: {
      erUtsendelseForOppdragIUtlandet:
        mottatteOpplysningerSelectors.UtenlandsoppdragetSelector(state).erUtsendelseForOppdragIUtlandet,
      erAnsattForOppdragIUtlandet:
        mottatteOpplysningerSelectors.UtenlandsoppdragetSelector(state).erAnsattForOppdragIUtlandet,
      erFortsattAnsattEtterOppdraget:
        mottatteOpplysningerSelectors.UtenlandsoppdragetSelector(state).erFortsattAnsattEtterOppdraget,
      erDrattPaaEgetInitiativ: mottatteOpplysningerSelectors.UtenlandsoppdragetSelector(state).erDrattPaaEgetInitiativ,
      erErstatningTidligereUtsendte:
        mottatteOpplysningerSelectors.UtenlandsoppdragetSelector(state).erErstatningTidligereUtsendte,
      samletUtsendingsperiode: {
        fom: Utils.dato.formatterDatoTilNorsk(
          mottatteOpplysningerSelectors.UtenlandsoppdragetSelector(state).samletUtsendingsperiode.fom,
        ),
        tom: Utils.dato.formatterDatoTilNorsk(
          mottatteOpplysningerSelectors.UtenlandsoppdragetSelector(state).samletUtsendingsperiode.tom,
        ),
      },
    },
    oppholdUtlandFom: Utils.dato.formatterDatoTilNorsk(
      mottatteOpplysningerSelectors.OppholdUtlandPeriodeSelector(state).fom,
    ),
    oppholdUtlandTom: Utils.dato.formatterDatoTilNorsk(
      mottatteOpplysningerSelectors.OppholdUtlandPeriodeSelector(state).tom,
    ),
    oppholdsland: mottatteOpplysningerSelectors.OppholdUtlandSelector(state).oppholdslandkoder,
    arbeidPaaLand: mottatteOpplysningerSelectors.ArbeidPaaLandSelector(state),
    arbeidsstedOffshore: mottatteOpplysningerSelectors.OffshoreArbeidSelector(state),
    arbeidsstedSkip: mottatteOpplysningerSelectors.SkipArbeidSelector(state),
    arbeidsstedFly: mottatteOpplysningerSelectors.LuftfartBaserSelector(state),
    representantIUtlandet: mottatteOpplysningerSelectors.RepresentantIUtlandetSelector(state),
    ektefelleEllerBarnINorge: mottatteOpplysningerSelectors.OppholdUtlandSelector(state).ektefelleEllerBarnINorge,
    studentSemester: mottatteOpplysningerSelectors.OppholdUtlandSelector(state).studentSemester,
    erSelvstendig: mottatteOpplysningerSelectors.SelvstendigArbeidSelector(state).erSelvstendig,
    selvstendigForetak: mottatteOpplysningerSelectors.SelvstendigArbeidSelector(state).selvstendigForetak,
    antallMaanederINorge: mottatteOpplysningerSelectors.BostedSelector(state).antallMaanederINorge,
    soknadsperiodeFom: Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerSelectors.PeriodeSelector(state).fom),
    soknadsperiodeTom: Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerSelectors.PeriodeSelector(state).tom),
    soknadsland: {
      landkoder: mottatteOpplysningerSelectors.SoknadslandkoderSelector(state),
      flereLandUkjentHvilke: mottatteOpplysningerSelectors.SoknadslandFlereLandUkjentHvilkeSelector(state),
    },
    avsenderland: mottatteOpplysningerSelectors.AvsenderlandSelector(state),
    lovvalgsland: mottatteOpplysningerSelectors.LovvalgslandSelector(state),
    trygdedekning: mottatteOpplysningerSelectors.TrygdedekningSelector(state),
    arbeidsforholdUtland: mottatteOpplysningerSelectors.ArbeidsforholdUtlandSelector(state),
    selvstendigNaeringsvirksomhetUtland:
      mottatteOpplysningerSelectors.SelvstendigNaeringsvirksomhetUtlandSelector(state),
    tidligeremedlemskap: behandlingsperioderSelectors.tidligereMedlemskap(state),
    avklartefakta: {
      yrkesgruppe: avklartefaktaSelectors.YrkesgruppeSelector(state),
      yrkesaktivitet: avklartefaktaSelectors.YrkesaktivitetSelector(state),
      sokkelSkipKonklusjon: avklartefaktaSelectors.ArbeidSokkelSkipSelector(state),
    },
  },
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  lagreMottatteOpplysninger: () => dispatch(mottatteOpplysningerOperations.lagre()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type SoknadProps = PropsFromRedux & {
  startOgVisOppfriskModal: (inkluderSiste5aar?: boolean) => void;
  visOppdaterRegisteropplysninger?: boolean;
};

function Soknad({
  lagreMottatteOpplysninger,
  startOgVisOppfriskModal,
  formValues,
  redigerbart,
  visOppdaterRegisteropplysninger,
  mottatteOpplysningerFeilmeldinger,
}: SoknadProps & InjectedFormProps<KV.Form.SoknadFormData, SoknadProps>) {
  const debouncedLagreMottatteOpplysninger = useCallback(Utils._debounce(lagreMottatteOpplysninger, 1000), []);
  const validertOk = Utils._isEmpty(mottatteOpplysningerFeilmeldinger);

  useEffect(() => {
    if (redigerbart && validertOk) debouncedLagreMottatteOpplysninger();
    return () => debouncedLagreMottatteOpplysninger.cancel();
  }, [formValues, redigerbart, validertOk]);

  const submitHandler: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
  };

  const lagreSoknadOgOppfriskSaksopplysninger = async (inkluderSiste5aar?: boolean) => {
    await lagreMottatteOpplysninger();
    startOgVisOppfriskModal(inkluderSiste5aar);
  };

  return (
    <form name="soknad" id="soknad" onSubmit={submitHandler}>
      <Menypanel
        lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger}
        visOppdaterRegisteropplysninger={visOppdaterRegisteropplysninger}
      />
    </form>
  );
}

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
        skalOppgittAdresseGateadresseValideres:
          props.oppgittAdresseHarVerdier &&
          props.behandlingstema !== MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
        harUnntaksregistreringFlyt: props.harUnntaksregistreringFlyt,
        behandlingstema: props.behandlingstema,
        mottatteOpplysningerType: props.mottatteOpplysningerType,
        sakstype: props.sakstype,
      },
    };
    return lagYupToReduxformErrorMapper(soknadSchema, settings)(values);
  },
})(Soknad);

export default connector(MenypanelForm);
