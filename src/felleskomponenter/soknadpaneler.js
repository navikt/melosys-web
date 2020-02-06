import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import * as MPT from '../proptypes';
import * as KV from '../kodeverk';
import * as Validering from '../felleskomponenter/skjema/validering';

import ArbeidsgivereNorge from './paneler/arbeidsgivereNorge';
import ArbeidUtland from './paneler/arbeidutland';
import ForetakUtland from './paneler/foretakutland';
import Inntekt from './paneler/inntektUtland';
import MaritimtArbeid from './paneler/maritimtArbeid';
import Medlemskap from './paneler/medlemskap';
import Soknadsperiode from './paneler/soknadsperiode';
import Personopplysninger from './paneler/personopplysninger';
import SelvstendigArbeid from './paneler/selvstendigarbeid';
import VirksomhetNorge from './paneler/virksomhetNorge';
import FullmektigPanel from './paneler/fullmektig';
import Kontantytelser from './paneler/kontantytelser';

import { fagsakSelectors } from '../ducks/fagsaker';
import { behandlingerSelectors } from '../ducks/behandlinger';
import { behandlingsperioderSelectors } from '../ducks/behandlingsperioder';
import { saksopplysningerOperations } from '../ducks/saksopplysninger';
import {
  soknadOperations,
  soknadSelectors,
} from '../ducks/soknad';
import { avklartefaktaSelectors } from '../ducks/avklartefakta';
import { vilkarSelectors } from '../ducks/vilkar';
import { formSelectors } from '../ducks/form';
import { formatterDatoTilNorsk } from '../utils/dato';

const Soknadpaneler = ({
  blokkerInnholdMedOppfriskSpinner,
  oppfriskSaksopplysninger,
  sendSoknad,
  fagsaker,
  medlemskap,
  soknadArbeidsinntekt,
  soknadForm,
  behandlingID,
  soknad,
}) => {
  const overstyrSubmit = event => {
    event.preventDefault();
  };

  const lagreSoknadOgOppfriskSaksopplysninger = async () => {
    await sendSoknad(behandlingID, soknad);
    await oppfriskSaksopplysninger(behandlingID);
    blokkerInnholdMedOppfriskSpinner();
  };

  const { values: soknadVerdier } = soknadForm;

  return (
    <form name="soknad" id="soknad" onSubmit={overstyrSubmit}>
      <Personopplysninger />
      <Soknadsperiode lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger} />
      <ArbeidsgivereNorge />
      <ForetakUtland />
      <SelvstendigArbeid soknadVerdier={soknadVerdier} />
      {fagsaker && fagsaker.saksnummer && <FullmektigPanel />}
      <ArbeidUtland />
      <VirksomhetNorge />
      <MaritimtArbeid />
      {medlemskap && <Medlemskap medlemskap={medlemskap} />}
      <Inntekt soknadArbeidsinntekt={soknadArbeidsinntekt} />
      <Kontantytelser />
    </form>
  );
};

Soknadpaneler.propTypes = {
  soknadForm: PT.object,
  fagsaker: MPT.Fagsak.isRequired,
  sendSoknad: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  blokkerInnholdMedOppfriskSpinner: PT.func.isRequired,
  medlemskap: MPT.Medlemskap,
  soknadArbeidsinntekt: PT.object,
  behandlingID: PT.number.isRequired,
  soknad: MPT.Soknad,
};

Soknadpaneler.defaultProps = {
  soknadForm: {},
  medlemskap: {},
  soknadArbeidsinntekt: {},
  soknad: {},
};

const mapStateToProps = state => ({
  soknadForm: formSelectors.SoknadenFormSelector(state),
  fagsaker: fagsakSelectors.FagsakSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  soknadArbeidsinntekt: soknadSelectors.ArbeidsinntektSelector(state),
  soknad: soknadSelectors.SoknadSelector(state),
  initialValues: {
    utenlandskIdent: soknadSelectors.PersonOpplysningerSelector(state).utenlandskIdent,
    medfolgendeFamilie: soknadSelectors.PersonOpplysningerSelector(state).medfolgendeFamilie,
    medfolgendeAndre: soknadSelectors.PersonOpplysningerSelector(state).medfolgendeAndre,
    inntektNorskIPerioden: soknadSelectors.ArbeidsinntektSelector(state).inntektNorskIPerioden,
    inntektUtenlandskIPerioden: soknadSelectors.ArbeidsinntektSelector(state).inntektUtenlandskIPerioden,
    inntektNaturalFribolig: soknadSelectors.ArbeidsinntektNaturalytelserSelector(state).friBil,
    inntektNaturalFribil: soknadSelectors.ArbeidsinntektNaturalytelserSelector(state).friBolig,
    inntektNaturalIAnnet: soknadSelectors.ArbeidsinntektNaturalytelserSelector(state).friAnnet,
    inntektErInnrapporteringspliktig: soknadSelectors.ArbeidsinntektSelector(state).inntektErInnrapporteringspliktig,
    inntektTrygdeavgiftBlirTrukket: soknadSelectors.ArbeidsinntektSelector(state).inntektTrygdeavgiftBlirTrukket,
    arbeidsgiverBekrefterUtsendelse: soknadSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBekrefterUtsendelse,
    arbeidstakerAnsattUnderUtsendelsen: soknadSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidstakerAnsattUnderUtsendelsen,
    erstatterArbeidstakerenUtsendte: soknadSelectors.ArbeidsgiversBekreftelseSelector(state).erstatterArbeidstakerenUtsendte,
    arbeidstakerTidligereUtsendt24Mnd: soknadSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidstakerTidligereUtsendt24Mnd,
    arbeidsgiverBetalerArbeidsgiveravgift: soknadSelectors.ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBetalerArbeidsgiveravgift,
    trygdeavgiftTrukketGjennomSkatt: soknadSelectors.ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkatt,
    trygdeavgiftTrukketGjennomSkattDato: formatterDatoTilNorsk(soknadSelectors.ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkattDato),
    oppgittAdresseGatenavn: soknadSelectors.BostedAdresseSelector(state).gatenavn,
    oppgittAdresseHusnummer: soknadSelectors.BostedAdresseSelector(state).husnummer,
    oppgittAdresseRegion: soknadSelectors.BostedAdresseSelector(state).region,
    oppgittAdressePostnummer: soknadSelectors.BostedAdresseSelector(state).postnummer,
    oppgittAdressePoststed: soknadSelectors.BostedAdresseSelector(state).poststed,
    oppgittAdresseLand: soknadSelectors.BostedAdresseSelector(state).landkode,
    utsendteNeste12Mnd: Math.trunc(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).utsendteNeste12Mnd) || null,
    antallAdmAnsatte: Math.trunc(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAdmAnsatte) || null,
    antallAnsatte: Math.trunc(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).antallAnsatte) || null,
    andelOmsetningINorge: Math.round(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOmsetningINorge) || null,
    andelOppdragINorge: Math.round(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelOppdragINorge) || null,
    andelKontrakterINorge: Math.round(soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).andelKontrakterINorge) || null,
    arbeidstakereRekruttertILand: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).arbeidstakereRekruttertILand,
    ekstraArbeidsgivere: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
    oppholdUtlandFom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).fom),
    oppholdUtlandTom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).tom),
    oppholdsland: soknadSelectors.OppholdUtlandSelector(state).oppholdslandkoder,
    arbeidUtland: soknadSelectors.ArbeidUtlandSelector(state),
    ektefelleEllerBarnINorge: soknadSelectors.OppholdUtlandSelector(state).ektefelleEllerBarnINorge,
    studentSemester: soknadSelectors.OppholdUtlandSelector(state).studentSemester,
    erSelvstendig: soknadSelectors.SelvstendigArbeidSelector(state).erSelvstendig,
    selvstendigForetak: soknadSelectors.SelvstendigArbeidSelector(state).selvstendigForetak,
    antallMaanederINorge: soknadSelectors.BostedSelector(state).antallMaanederINorge,
    EOSBarnetrygdFraNAV: soknadSelectors.BostedSelector(state).EOSBarnetrygdFraNAV,
    maritimtArbeid: soknadSelectors.MaritimtArbeidSelector(state),
    soknadsperiodeFom: formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).fom),
    soknadsperiodeTom: formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).tom),
    foretakUtland: soknadSelectors.ForetakUtlandSelector(state),
    kontaktNavn: soknadSelectors.ArbeidNorgeSelector(state).kontaktNavn,
    kontaktEpost: soknadSelectors.ArbeidNorgeSelector(state).kontaktEpost,
    fullmektigFirma: soknadSelectors.ArbeidNorgeSelector(state).fullmektigFirma,
    fullmektigGateadresse: soknadSelectors.ArbeidNorgeSelector(state).fullmektigGateadresse,
    fullmektigPostnr: soknadSelectors.ArbeidNorgeSelector(state).fullmektigPostnr,
    fullmektigPoststed: soknadSelectors.ArbeidNorgeSelector(state).fullmektigPoststed,
    fullmektigRegion: soknadSelectors.ArbeidNorgeSelector(state).fullmektigRegion,
    fullmektigLand: soknadSelectors.ArbeidNorgeSelector(state).fullmektigLandkode,
    tidligeremedlemskap: behandlingsperioderSelectors.tidligereMedlemskap(state),
    avklartefakta: {
      soknadsland: avklartefaktaSelectors.Soknadsland(state),
      yrkesgruppe: avklartefaktaSelectors.Yrkesgruppe(state),
      yrkesaktivitetAntallLand: avklartefaktaSelectors.YrkesaktivitetAntallLand(state),
      yrkesaktivitet: avklartefaktaSelectors.Yrkesaktivitet(state),
      sokkelSkipKonklusjon: avklartefaktaSelectors.ArbeidSokkelSkipSelector(state),
    },
    vilkar: {
      vesentligVirksomhet: (vilkarSelectors.vesentligVirksomhetSelector(state).oppfylt),
      vesentligVirksomhetBegrunnelser: (vilkarSelectors.vesentligVirksomhetSelector(state).begrunnelseKoder),
      normaltDriverVirksomhet: (vilkarSelectors.normaltDriverVirksomhetSelector(state).oppfylt),
      normaltDriverVirksomhetBegrunnelser: (vilkarSelectors.normaltDriverVirksomhetSelector(state).begrunnelseKoder),
      forutgaendeMedlemskap: (vilkarSelectors.forutgaendeMedlemskap(state).oppfylt),
      forutgaendeMedlemskapBegrunnelser: (vilkarSelectors.forutgaendeMedlemskap(state).begrunnelseKoder),
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
    vurderingLovvalg: avklartefaktaSelectors.AvklartefaktaLovvalgKodeSelector(state),
  },
});

const mapDispatchToProps = dispatch => ({
  sendSoknad: (bid, dokument) => dispatch(soknadOperations.send(bid, dokument)),
  oppfriskSaksopplysninger: saksnummer => saksopplysningerOperations.oppfrisk(saksnummer),
});

const SoknadpanelerForm = reduxForm({
  form: KV.Form.SOKNAD,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => {
    const settings = {
      context: {
        skalOppgittAdresseValideres: props.oppgittAdresseHarVerdier,
      },
    };

    return Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.saksopplysninger, settings)(values);
  },
})(Soknadpaneler);

export default connect(mapStateToProps, mapDispatchToProps)(SoknadpanelerForm);
