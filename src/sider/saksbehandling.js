import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { validForm } from 'react-redux-form-validation';

import {
  gyldigePaneler,
  feltGrupper,
  alleFeltNavn,
  alleValideringer,
} from '../utils/panelFelter';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import Vilkarsveileder from '../felles-komponenter/vilkarsveileder/vilkarsveileder';
import Personopplysninger from '../felles-komponenter/personopplysninger';
import Tilleggsopplysninger from '../felles-komponenter/tilleggsopplysninger';
import Medlemskap from '../felles-komponenter/medlemskap';
import ArbeidsgivereNorge from '../felles-komponenter/arbeidsgivereNorge';
import UtsendendeArbeidsgiver from '../felles-komponenter/utsendendeArbeidsgiver';
import ArbeidsgiverUtland from '../felles-komponenter/arbeidsgiverUtland';
import OppholdUtland from '../felles-komponenter/oppholdUtland';
import Inntekt from '../felles-komponenter/inntektUtland';
import Bekreftelser from '../felles-komponenter/bekreftelser';
import SideOppsummering from '../felles-komponenter/sideOppsummering';
import SideDialog from '../felles-komponenter/sideDialog/sideDialog';
import SideKommentarer from '../felles-komponenter/sideKommentarer';
import { hentLandkoder } from '../ducks/landkoder';

import {
  hentFagsaker,
  PersonSelector,
  MedlemskapSelector,
  ArbeidsgivereNorgeSelector,
  InntektSoknadenSelector,
  BekreftelserSelector,
  OppsummeringSelector,
} from '../ducks/fagsaker/fagsaker';

import {
  hentSoknad,
  sendSoknad,
  oppdaterSoknadState,
  SoknadSelector,
  ArbeidsinntektSelector,
  ArbeidNorgeSelector,
  OppholdUtlandSelector,
  ArbeidsgiversBekreftelseSelector,
} from '../ducks/soknad';

import {
  hentFaktaavklaring,
  sendFaktaavklaring,
  oppdaterFaktaavklaringState,
  FaktaavklaringSelector,
  FaktaavklaringOppholdSelector,
  FaktaavklaringOppholdPeriodeSelector,
  FaktaavklaringSysselsettingSelector,
  FaktaavklaringUtsendingSelector,
  FaktaavklaringSektorSelector,
  FaktaavklaringYrkesaktivitetFordelingSelector,
  FaktaavklaringVirksomhetSelector,
  FaktaavklaringAktivitetSelector,
  FaktaavklaringBostedslandSelector,
  FaktaavklaringTjenestemannSelector,
  FaktaavklaringValgteArbeidsforholdSelector,
  FaktaavklaringForretningsstedSelector,
} from '../ducks/faktaavklaring';

import {
  hentVurdering,
  VurderingSelector,
} from '../ducks/vurdering';

import { boolTilStreng } from '../utils/utils';
import { formatterDatoTilNorsk } from '../utils/dato';

import { SoknadenFormSelector } from '../ducks/form';

import './saksbehandling.css';
import '../felles-komponenter/skjema/skjema.css';

class Saksbehandling extends Component {
  static propTypes = {
    hentLandkoder: PT.func.isRequired,
    hentFagsaker: PT.func.isRequired,
    hentSoknad: PT.func.isRequired,
    sendSoknad: PT.func.isRequired,
    hentFaktaavklaring: PT.func.isRequired,
    sendFaktaavklaring: PT.func.isRequired,
    hentVurdering: PT.func.isRequired,
    match: PT.object.isRequired,
    person: MPT.Person,
    medlemskap: MPT.Medlemskap,
    arbeidsgivereNorge: MPT.ArbeidsgivereNorge,
    inntekt: MPT.Inntekt,
    vurdering: PT.object,
    bekreftelser: MPT.Bekreftelser,
    oppsummering: MPT.Oppsummering,
    soknad: PT.object,
    faktaavklaring: PT.object,
    soknadArbeidsinntekt: PT.object,
    soknadOppholdUtland: MPT.OppholdUtland,
    soknadArbeidNorge: MPT.ArbeidNorge,
    handleSubmit: PT.func.isRequired,
    errorSummary: PT.object,
    errorSummaryTitle: PT.string,
    soknadForm: PT.object.isRequired,
    oppdaterSoknad: PT.func.isRequired,
    oppdaterFaktaavklaring: PT.func.isRequired,
    valid: PT.bool.isRequired,
  };

  static defaultProps = {
    person: {},
    medlemskap: {},
    arbeidsgivereNorge: [],
    inntekt: {},
    vurdering: {},
    bekreftelser: [],
    oppsummering: {},
    soknad: {},
    faktaavklaring: {},
    soknadArbeidsinntekt: {},
    soknadOppholdUtland: {},
    soknadArbeidNorge: {},
    errorSummary: {},
    errorSummaryTitle: '',
  };

  state = {
    gyldigePaneler: {},
  };

  componentDidMount() {
    const { snr } = this.props.match.params;
    this.props.hentFagsaker(snr).then(response => {
      const { behandlinger = [] } = response.data;
      const { oppsummering: { behandlingID } } = behandlinger[0];
      this.props.hentSoknad(behandlingID);
      this.props.hentFaktaavklaring(behandlingID);
      this.props.hentVurdering(behandlingID);
    });
    this.props.hentLandkoder();
  }

  componentWillReceiveProps(nextProps) {
    const { syncErrors } = nextProps.soknadForm;

    // Oppdaterer alle paneler og setter grønn hake dersom ingen felter
    // i panelet lenger er ugyldig (ikke validerer).
    this.setState({ gyldigePaneler: gyldigePaneler(syncErrors) });
  }

  fattVedtakHandler = () => {
    const bid = this.props.oppsummering.behandlingID;
    const soknad = { soknadDokument: { ...this.props.soknad.soknadDokument } };

    if (this.props.valid) {
      this.props.sendSoknad(bid, soknad);
      this.props.sendFaktaavklaring(bid, this.props.faktaavklaring);
    }
  }

  beOmVurdering = () => {
    const { behandlingID } = this.props.oppsummering;
    if (this.props.valid) {
      this.props.hentVurdering(behandlingID);
    }
  }

  overstyrSubmit = event => {
    event.preventDefault();

    this.props.oppdaterSoknad(this.props.soknadForm.values);
    this.props.oppdaterFaktaavklaring(this.props.soknadForm.values);
  }

  /* eslint-disable */
  lagreOgLukk = () => { alert('Ikke implementert'); }
  avslaSoknad = () => { alert('Ikke implementert'); }
  /* eslint-enable */

  render() {
    const {
      person,
      medlemskap,
      arbeidsgivereNorge,
      inntekt,
      bekreftelser,
      oppsummering,
      soknadArbeidsinntekt,
      soknadOppholdUtland,
      errorSummary,
      soknadForm,
    } = this.props;

    if (!person || !person.fnr) {
      return null;
    }

    return (
      <div className="saksbehandling">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="7">
              <form name="soknad" id="soknad" onSubmit={this.overstyrSubmit}>
                <Vilkarsveileder
                  beOmVurderingHandler={this.beOmVurdering}
                  fattVedtakHandler={this.fattVedtakHandler} />
                {errorSummary}
                {person && <Personopplysninger person={person} />}
                {arbeidsgivereNorge && <ArbeidsgivereNorge arbeidsgivereNorge={arbeidsgivereNorge} />}
                <UtsendendeArbeidsgiver />
                <OppholdUtland oppholdUtland={soknadOppholdUtland} soknadForm={soknadForm} />
                <ArbeidsgiverUtland />
                {medlemskap && <Medlemskap medlemskap={medlemskap} />}
                {inntekt && <Inntekt soknadArbeidsinntekt={soknadArbeidsinntekt} />}
                {bekreftelser && <Bekreftelser bekreftelser={bekreftelser} erValidert={this.state.gyldigePaneler.bekreftelser} />}
                <Tilleggsopplysninger />
              </form>
            </Nav.Column>
            <Nav.Column xs="5">
              {oppsummering && <SideOppsummering oppsummering={oppsummering} avslaSoknadHandle={this.avslaSoknad} lagreOgLukkHandle={this.lagreOgLukk} />}
              <SideDialog />
              <SideKommentarer />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

/** Mapper både fast tekst inn til de forskjellige panelene i tillegg til å
 * mappe verdier fra søknaden (soknad) ut til Redux Form via initialValue.
 * @param state
 */
const mapStateToProps = state => ({
  person: PersonSelector(state),
  medlemskap: MedlemskapSelector(state),
  arbeidsgivereNorge: ArbeidsgivereNorgeSelector(state),
  inntekt: InntektSoknadenSelector(state),
  vurdering: VurderingSelector(state),
  bekreftelser: BekreftelserSelector(state),
  oppsummering: OppsummeringSelector(state),
  soknad: SoknadSelector(state),
  faktaavklaring: FaktaavklaringSelector(state),
  soknadForm: SoknadenFormSelector(state),
  soknadArbeidsinntekt: ArbeidsinntektSelector(state),
  soknadOppholdUtland: OppholdUtlandSelector(state),
  soknadArbeidNorge: ArbeidNorgeSelector(state),
  initialValues: {
    inntektNorskIPerioden: ArbeidsinntektSelector(state).inntektNorskIPerioden,
    inntektUtenlandskIPerioden: ArbeidsinntektSelector(state).inntektUtenlandskIPerioden,
    inntektNaeringIPerioden: ArbeidsinntektSelector(state).inntektNaeringIPerioden,
    arbeidsgiverBekrefterUtsendelse: boolTilStreng(ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBekrefterUtsendelse),
    arbeidstakerAnsattUnderUtsendelsen: boolTilStreng(ArbeidsgiversBekreftelseSelector(state).arbeidstakerAnsattUnderUtsendelsen),
    erstatterArbeidstakerenUtsendte: boolTilStreng(ArbeidsgiversBekreftelseSelector(state).erstatterArbeidstakerenUtsendte),
    arbeidstakerTidligereUtsendt24Mnd: boolTilStreng(ArbeidsgiversBekreftelseSelector(state).arbeidstakerTidligereUtsendt24Mnd),
    arbeidsgiverBetalerArbeidsgiveravgift: boolTilStreng(ArbeidsgiversBekreftelseSelector(state).arbeidsgiverBetalerArbeidsgiveravgift),
    trygdeavgiftTrukketGjennomSkatt: boolTilStreng(ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkatt),
    trygdeavgiftTrukketGjennomSkattDato: formatterDatoTilNorsk(ArbeidsgiversBekreftelseSelector(state).trygdeavgiftTrukketGjennomSkattDato),
    studentIEOS: OppholdUtlandSelector(state).studentIEOS,
    studentSkole: OppholdUtlandSelector(state).studentSkole,
    studentSemester: OppholdUtlandSelector(state).studentSemester,
    studieLand: OppholdUtlandSelector(state).studieLand,
    studentFinansiering: OppholdUtlandSelector(state).studentFinansiering,
    kontaktNavn: ArbeidNorgeSelector(state).kontaktNavn,
    kontaktEpost: ArbeidNorgeSelector(state).kontaktEpost,
    fullmektigFirma: ArbeidNorgeSelector(state).fullmektigFirma,
    fullmektigAdresse: ArbeidNorgeSelector(state).fullmektigAdresse,
    faktaavklaringOppholdsLand: FaktaavklaringOppholdSelector(state).land,
    faktaavklaringPeriodeFraOgMed: formatterDatoTilNorsk(FaktaavklaringOppholdPeriodeSelector(state).fom),
    faktaavklaringPeriodeTilOgMed: formatterDatoTilNorsk(FaktaavklaringOppholdPeriodeSelector(state).tom),
    faktaavklaringSysselsettingType: FaktaavklaringSysselsettingSelector(state).sysselsettingType,
    faktaavklaringAnsattINorskSelskap: FaktaavklaringUtsendingSelector(state).ansattINorskSelskap,
    faktaavklaringErstatterTidligereUtsendt: FaktaavklaringUtsendingSelector(state).erstatterTidligereUtsendt,
    faktaavklaringUtsendingMindreEnn24Mnd: FaktaavklaringUtsendingSelector(state).utsendingMindreEnn24Mnd,
    faktaavklaringForetakDriverINorge: FaktaavklaringUtsendingSelector(state).foretakDriverINorge,
    faktaavklaringHarForutgaendeMedlemskap: FaktaavklaringUtsendingSelector(state).harForutgaendeMedlemskap,
    faktaavklaringArbeidKnyttetTilVirksomhetUtlandet: FaktaavklaringUtsendingSelector(state).arbeidKnyttetTilVirksomhetUtlandet,
    faktaavklaringSammeTypeVirksomhet: FaktaavklaringUtsendingSelector(state).sammeTypeVirksomhet,
    faktaavklaringAnsattISektor: FaktaavklaringSektorSelector(state).ansattISektor,
    faktaavklaringAntallLand: FaktaavklaringYrkesaktivitetFordelingSelector(state).antallLand,
    faktaavklaringAktivitetINorge: FaktaavklaringVirksomhetSelector(state).aktivitetINorge,
    faktaavklaringMarginaltArbeid: FaktaavklaringVirksomhetSelector(state).marginaltArbeid,
    faktaavklaringVekslingMellomLand: FaktaavklaringVirksomhetSelector(state).vekslingMellomLand,
    faktaavklaringAktivitetLand: FaktaavklaringAktivitetSelector(state).aktivitetLand,
    faktaavklaringBekrefterFamiliebosted: FaktaavklaringBostedslandSelector(state).bekrefterFamiliebosted,
    faktaavklaringBekrefterDisponering: FaktaavklaringBostedslandSelector(state).bekrefterFamiliebosted,
    faktaavklaringBostedsland: FaktaavklaringBostedslandSelector(state).bostedsland,
    faktaavklaringTjenestemann: FaktaavklaringTjenestemannSelector(state).tjenestemann,
    faktaavklaringValgteArbeidsforhold: FaktaavklaringValgteArbeidsforholdSelector(state),
    faktaavklaringForretningsstedLand: FaktaavklaringForretningsstedSelector(state).land,
    faktaavklaringForretningsstedAntallArbeidsgivere: FaktaavklaringForretningsstedSelector(state).antallArbeidsgivere,
    faktaavklaringForretningsstedFordelingArbeidsgivere: FaktaavklaringForretningsstedSelector(state).fordelingArbeidsgivere,
  },
});

const mapDispatchToProps = dispatch => ({
  hentLandkoder: () => dispatch(hentLandkoder()),
  hentFagsaker: saksnummer => dispatch(hentFagsaker(saksnummer)),
  hentSoknad: bid => dispatch(hentSoknad(bid)),
  sendSoknad: (bid, dokument) => dispatch(sendSoknad(bid, dokument)),
  hentFaktaavklaring: saksnummer => dispatch(hentFaktaavklaring(saksnummer)),
  sendFaktaavklaring: (bid, dokument) => dispatch(sendFaktaavklaring(bid, dokument)),
  hentVurdering: behandlingID => dispatch(hentVurdering(behandlingID)),
  oppdaterSoknad: values => { dispatch(oppdaterSoknadState(values)); },
  oppdaterFaktaavklaring: values => { dispatch(oppdaterFaktaavklaringState(values)); },
});

const SaksbehandlingForm = validForm({
  form: 'soknad',
  enableReinitialize: true,
  destroyOnUnmount: false,
  updateUnregisteredFields: true,
  errorSummaryTitle: 'Følgende må vurderes eller oppgis:',
  fields: alleFeltNavn(feltGrupper),
  validate: alleValideringer(feltGrupper),
})(Saksbehandling);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksbehandlingForm));
