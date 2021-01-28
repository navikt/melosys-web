import React, { FormEventHandler } from "react";
import { connect, ConnectedProps } from "react-redux";
import { reduxForm, InjectedFormProps } from "redux-form";
import { RootState } from "AppTypes";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from "../../yup";
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
  initialValues: {
    utenlandskIdent: behandlingsgrunnlagSelectors.PersonOpplysningerSelector(state).utenlandskIdent,
    medfolgendeBarn: behandlingsgrunnlagSelectors.MedfolgendeBarnSelector(state),
    inntektNorskIPerioden: behandlingsgrunnlagSelectors.ArbeidsinntektSelector(state).inntektNorskIPerioden,
    inntektUtenlandskIPerioden: behandlingsgrunnlagSelectors.ArbeidsinntektSelector(state).inntektUtenlandskIPerioden,
    inntektNaturalFribolig: behandlingsgrunnlagSelectors.ArbeidsinntektNaturalytelserSelector(state).friBil,
    inntektNaturalFribil: behandlingsgrunnlagSelectors.ArbeidsinntektNaturalytelserSelector(state).friBolig,
    inntektNaturalIAnnet: behandlingsgrunnlagSelectors.ArbeidsinntektNaturalytelserSelector(state).friAnnet,
    inntektErInnrapporteringspliktig: behandlingsgrunnlagSelectors.ArbeidsinntektSelector(state)
      .inntektErInnrapporteringspliktig,
    inntektTrygdeavgiftBlirTrukket: behandlingsgrunnlagSelectors.ArbeidsinntektSelector(state)
      .inntektTrygdeavgiftBlirTrukket,
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
    oppgittAdresseGatenavn: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).gatenavn,
    oppgittAdresseHusnummer: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).husnummer,
    oppgittAdresseRegion: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).region,
    oppgittAdressePostnummer: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).postnummer,
    oppgittAdressePoststed: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).poststed,
    oppgittAdresseLand: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).landkode,
    antallAdmAnsatte:
      Math.trunc(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAdmAnsatte) || null,
    antallAnsatte:
      Math.trunc(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAnsatte) || null,
    andelOmsetningINorge:
      Math.round(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOmsetningINorge) || null,
    andelOppdragINorge:
      Math.round(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOppdragINorge) || null,
    andelKontrakterINorge:
      Math.round(behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelKontrakterINorge) || null,
    ekstraArbeidsgivere: behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
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
    soknadsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
    arbeidsforholdUtland: behandlingsgrunnlagSelectors.ArbeidsforholdUtlandSelector(state),
    selvstendigNaeringsvirksomhetUtland: behandlingsgrunnlagSelectors.SelvstendigNaeringsvirksomhetUtlandSelector(
      state
    ),
    tidligeremedlemskap: behandlingsperioderSelectors.tidligereMedlemskap(state),
    avklartefakta: {
      soknadsland: avklartefaktaSelectors.Soknadsland(state),
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
  lagreSoknad: () => dispatch(behandlingsgrunnlagOperations.lagre()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type SoknadProps = PropsFromRedux & {
  startOgVisOppfriskModal: () => void;
};

const Soknad = ({
  lagreSoknad,
  startOgVisOppfriskModal,
}: SoknadProps & InjectedFormProps<KV.Form.SoknadFormData, SoknadProps>) => {
  const submitHandler: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
  };

  const lagreSoknadOgOppfriskSaksopplysninger = async () => {
    await lagreSoknad();
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
      },
    };

    return lagYupToReduxformErrorMapper(YupSkjemaer.soknad, settings)(values);
  },
})(Soknad);

export default connector(MenypanelForm);
