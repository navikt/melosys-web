import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector, autofill, setSubmitFailed } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../kodeverk';
import * as Utils from '../utils';
import * as Api from '../services/api';
import * as Skjema from '../soknad-komponenter/skjema';
import * as MPT from '../proptypes';
import * as Nav from '../utils/navFrontend';
import ListevelgerFlervalg from '../komponenter/ui/listevelgerFlervalg';
import Personopplysninger from '../soknad-komponenter/personopplysninger';
import Medlemskap from '../komponenter/medlemskap';
import { lovvalgsperioderSelectors, lovvalgsperioderOperations } from '../ducks/lovvalgsperioder';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../ducks/avklartefakta/';
import { endrePeriodeSkjema } from './validering/endrePeriodeSkjema';
import { createValidator } from '../soknad-komponenter/skjema/validering/skjemaer/createValidator';
import { EndrePeriode } from './endrePeriode';
import './saksopplysninger.css';

const uuid = require('uuid/v4');

const UnntakPeriodeBegrunnelse = kode => {
  if (!kode) return '';
  return KV.kodeTilTerm(kode, MKV.KTObjects.begrunnelser.unntak_periode_begrunnelser);
};

const RegisterkontrollTreff = ({ begrunnelseKode }) => (
  <div className="registerkontroll-listeelement">
    <Nav.Ikoner kind="advarsel-sirkel-fyll" size="24" />
    <Nav.Normaltekst>{UnntakPeriodeBegrunnelse(begrunnelseKode)}</Nav.Normaltekst>
  </div>
);

RegisterkontrollTreff.propTypes = {
  begrunnelseKode: PT.string.isRequired,
};

class Saksopplysninger extends Component {
  state = {
    begrunnelseFritekst: '',
    ikkeGodkjentBegrunnelseKoder: [],
    skalEndrePeriode: false,
    fom: null,
    tom: null,
    endrePeriodeBegrunnelse: MKV.Koder.folketrygdloven.begrunnelser.endret_unntaksperiode.PERIODE_FEILREGISTRERT,
    endrePeriodeBegrunnelseFritekst: '',
    endrePeriodeFeilmeldinger: { fom: undefined, tom: undefined, fritekst: undefined },
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.sed.lovvalgsperiode) {
      return;
    }
    const periode = this.hentLovvalgsperiode(nextProps);
    const fom = this.state.fom || periode.fom;
    const tom = this.state.tom || periode.tom;
    this.setState({ fom, tom });
  }

  overstyrSubmit = event => {
    event.preventDefault();
  };
  textAreaOnChange = event => {
    const begrunnelseFritekst = event.target.value;
    this.setState({ begrunnelseFritekst });
  };
  submitRegistrering = () => {
    if (!this.validerFelt()) {
      return false;
    }

    const { behandlingID, unntaksperiode, history } = this.props;
    const tilForsiden = () => history.push('/');
    switch (unntaksperiode) {
      case KV.Koder.Unntaksperiode.GODKJENT:
        this.godkjenn(behandlingID)
          .then(tilForsiden)
          .catch(Utils.logger.error);
        return true;
      case KV.Koder.Unntaksperiode.INNHENT:
        this.innhentInfo(behandlingID)
          .then(tilForsiden)
          .catch(Utils.logger.error);
        return true;
      case KV.Koder.Unntaksperiode.AVSLAG: {
        const ikkegodkjenn = {
          ikkeGodkjentBegrunnelseKoder: [...this.state.ikkeGodkjentBegrunnelseKoder],
          begrunnelseFritekst: this.state.begrunnelseFritekst,
        };
        Api.Saksflyt.Unntaksperioder.ikkegodkjenn(behandlingID, { ...ikkegodkjenn })
          .then(tilForsiden)
          .catch(Utils.logger.error);
        return true;
      }
      default:
        return false;
    }
  };

  godkjenn = behandlingID => this.endrePeriodeOgLagre(() => Api.Saksflyt.Unntaksperioder.godkjenn(behandlingID));

  innhentInfo = behandlingID => this.endrePeriodeOgLagre(() => Api.Saksflyt.Unntaksperioder.innhentinfo(behandlingID));

  endrePeriodeOgLagre = dispatchSaksflyt => (
    this.state.skalEndrePeriode
      ? this.oppdaterAvklartefakta()
        .then(() => this.oppdaterLovvalgsperioder()
          .then(() => dispatchSaksflyt()))
      : dispatchSaksflyt());

  lagAvklartfakta = () => ({
    referanse: MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE,
    avklartefaktaKode: MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE,
    fakta: [this.state.endrePeriodeBegrunnelse],
    subjektID: null,
    begrunnelseKoder: [],
    begrunnelseFritekst: this.state.endrePeriodeBegrunnelseFritekst || null,
  });

  oppdaterAvklartefakta = () =>
    this.props.oppdaterAvklartefakta(this.props.behandlingID, [...this.props.avklartefakta, this.lagAvklartfakta()]);

  lagLovvalgsperioder = () => ([{
    fomDato: `${Utils.dato.formatterDatoTilISO(this.state.fom)}`,
    tomDato: `${Utils.dato.formatterDatoTilISO(this.state.tom)}`,
    lovvalgsbestemmelse: this.props.sed.lovvalgsbestemmelse,
    tilleggBestemmelse: null,
    unntakFraBestemmelse: null,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland: this.props.sed.lovvalgslandKode,
    unntakFraLovvalgsland: null,
    trygdeDekning: MKV.Koder.trygdedekninger.UTEN_DEKNING,
    medlemskapstype: MKV.Koder.medlemskapstyper.UNNTATT,
    medlemskapsperiodeID: null,
  }]);

  oppdaterLovvalgsperioder = () =>
    this.props.oppdaterLovvalgsperioder(this.props.behandlingID, this.lagLovvalgsperioder());

  kanEndrePeriode = () => this.props.unntaksperiode === KV.Koder.Unntaksperiode.GODKJENT
    || this.props.unntaksperiode === KV.Koder.Unntaksperiode.INNHENT;

  validerFelt = () => this.validerEndrePeriode();

  validerEndrePeriode = () => {
    if (!this.kanEndrePeriode()) {
      return true;
    }

    const fritekstPakrevd = this.state.endrePeriodeBegrunnelse === MKV.Koder.begrunnelser.ftrl_endret_unntaksperiode.ANNET;
    const settings = { context: { fritekstPakrevd } };
    const stateObject = { fom: this.state.fom, tom: this.state.tom, fritekst: this.state.endrePeriodeBegrunnelseFritekst };
    const endrePeriodeFeilmeldinger = createValidator(endrePeriodeSkjema, settings)(stateObject);
    const validert = Utils._isEmpty(endrePeriodeFeilmeldinger);

    if (!validert) {
      this.setState({ endrePeriodeFeilmeldinger });
    }
    return validert;
  };

  skalEndrePeriodeChangeHandler = skalEndrePeriode => this.setState({ skalEndrePeriode });

  fomChangeHandler = fom => this.setState({ fom });

  tomChangeHandler = tom => this.setState({ tom });

  endrePeriodeBegrunnelseChangeHandler = endrePeriodeBegrunnelse => this.setState({ endrePeriodeBegrunnelse });

  endrePeriodeBegrunnelseFritekstChangeHandler = endrePeriodeBegrunnelseFritekst => this.setState({ endrePeriodeBegrunnelseFritekst });

  tilPeriode = (fom, tom) => ({
    fom: Utils.dato.formatterDatoTilNorsk(fom),
    tom: Utils.dato.formatterDatoTilNorsk(tom),
  });

  hentLovvalgsperiode = props => (
    !Utils._isEmpty(props.lovvalgsperiode)
      ? this.tilPeriode(props.lovvalgsperiode.fomDato, props.lovvalgsperiode.tomDato)
      : this.tilPeriode(props.sed.lovvalgsperiode.fom, props.sed.lovvalgsperiode.tom));

  render() {
    const {
      medlemskap, sed, vurderingBegrunnelser, unntaksperiode,
    } = this.props;
    if (!sed.lovvalgsperiode) {
      return null;
    }

    const listevalgEndringHandler = event => {
      const ikkeGodkjentBegrunnelseKoder = [...event.value];
      this.setState({ ikkeGodkjentBegrunnelseKoder });
    };
    return (
      <div>
        <form name="registrering" id="registrering" onSubmit={this.overstyrSubmit}>
          <div className="stegvelger panelSeksjon">
            <div className="panel stegFane steg0 stegFane--aktiv">
              <Nav.Systemtittel>Registrering av unntaksperioder</Nav.Systemtittel>
              <br />
              <div className="vurderingEndrePeriode">
                <Nav.Row className="seksjon">
                  <Nav.Column xs="12">
                    <Nav.Element>Treff ved automatisk kontroll</Nav.Element>
                    {vurderingBegrunnelser.begrunnelseKoder && vurderingBegrunnelser.begrunnelseKoder.map(begrunnelseKode =>
                      <RegisterkontrollTreff key={uuid()} begrunnelseKode={begrunnelseKode} />)}
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row className="seksjon">
                  <Nav.Column xs="12">
                    <Skjema.RadioGruppe feltNavn="unntaksperiode" label="Vurder unntaksperiode">
                      <Skjema.Radio key={uuid()} feltNavn="unntaksperiode" value={KV.Koder.Unntaksperiode.GODKJENT} label="Godkjenn" />
                      <Skjema.Radio key={uuid()} feltNavn="unntaksperiode" value={KV.Koder.Unntaksperiode.INNHENT} label="Innhent informasjon" />
                      <Skjema.Radio key={uuid()} feltNavn="unntaksperiode" value={KV.Koder.Unntaksperiode.AVSLAG} label="Ikke godkjenn" />
                    </Skjema.RadioGruppe>
                  </Nav.Column>
                </Nav.Row>
                {unntaksperiode === KV.Koder.Unntaksperiode.AVSLAG && (
                  <Fragment>
                    <Nav.Row>
                      <Nav.Column xs="6">
                        <Nav.Fieldset legend="Begrunnelse for ikke godkjent unntaksperiode">
                          <ListevelgerFlervalg
                            disabled={false}
                            muligeValg={MKV.KTObjects.begrunnelser.ikke_godkjent_begrunnelser}
                            label="Legg til begrunnelse for ikke oppfylt:"
                            tillatFritekst={false}
                            onChange={listevalgEndringHandler}
                          />
                        </Nav.Fieldset>
                      </Nav.Column>
                    </Nav.Row>
                    <Nav.Row>
                      <Nav.Column xs="6">
                        {this.state.ikkeGodkjentBegrunnelseKoder.includes('ANNET') &&
                        <Nav.Textarea
                          label="Skriv inn begrunnelse for avslaget..."
                          onChange={this.textAreaOnChange}
                          value={this.state.begrunnelseFritekst}
                          maxLength={255}
                          bredde="fullbredde" />
                        }
                      </Nav.Column>
                    </Nav.Row>
                  </Fragment>
                )}
                <Nav.Row className="seksjon">
                  <EndrePeriode
                    skalEndres={this.state.skalEndrePeriode}
                    skalEndresChangeHandler={this.skalEndrePeriodeChangeHandler}
                    fom={this.state.fom}
                    fomChangeHandler={this.fomChangeHandler}
                    tom={this.state.tom}
                    tomChangeHandler={this.tomChangeHandler}
                    begrunnelse={this.state.endrePeriodeBegrunnelse}
                    begrunnelseChangeHandler={this.endrePeriodeBegrunnelseChangeHandler}
                    fritekst={this.state.endrePeriodeBegrunnelseFritekst}
                    fritekstChangeHandler={this.endrePeriodeBegrunnelseFritekstChangeHandler}
                    feilmeldinger={this.state.endrePeriodeFeilmeldinger}
                    redigerbart={this.kanEndrePeriode()} />
                </Nav.Row>
                <Nav.Row className="seksjon">
                  <Nav.Column xs="3">
                    <Nav.Hovedknapp onClick={() => this.submitRegistrering()}>LAGRE</Nav.Hovedknapp>
                  </Nav.Column>
                </Nav.Row>
              </div>
            </div>
          </div>
        </form>
        <Personopplysninger redigerbart />
        {medlemskap && <Medlemskap medlemskap={medlemskap} />}
      </div>
    );
  }
}

Saksopplysninger.propTypes = {
  behandlingID: PT.number.isRequired,
  medlemskap: MPT.Medlemskap,
  sed: PT.object, // TODO prop-type
  vurderingBegrunnelser: PT.object,
  skjema: PT.any,
  unntaksperiode: PT.string,
  lovvalgsperiode: PT.object.isRequired,
  avklartefakta: PT.array.isRequired,
  settFeilFelt: PT.func.isRequired,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  oppdaterAvklartefakta: PT.func.isRequired,
  oppdaterLovvalgsperioder: PT.func.isRequired,
};

Saksopplysninger.defaultProps = {
  medlemskap: {},
  vurderingBegrunnelser: {},
  sed: {},
  skjema: {},
  unntaksperiode: '',
};

const skjemaSelector = formValueSelector(KV.Form.SOKNAD);
const mapStateToProps = state => ({
  unntaksperiode: skjemaSelector(state, 'unntaksperiode'),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  initialValues: {
    unntaksperiode: KV.Koder.Unntaksperiode.GODKJENT,
  },
});
const mapDispatchToProps = dispatch => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(autofill(KV.Form.SOKNAD, feltNavn, verdi)),
  settFeilFelt: (...feltNavn) => (setSubmitFailed(KV.Form.SOKNAD, ...feltNavn)),
  oppdaterAvklartefakta: (behandlingID, avklartefaktaListe) => dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
  oppdaterLovvalgsperioder: (behandlingID, lovvalgsperiodeListe) => dispatch(lovvalgsperioderOperations.send(behandlingID, lovvalgsperiodeListe)),
});

const SaksopplysningerForm = reduxForm({
  form: KV.Form.SOKNAD,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  onSubmit: () => {
  },
})(Saksopplysninger);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksopplysningerForm));
