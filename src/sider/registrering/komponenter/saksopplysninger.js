import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../kodeverk';
import * as Utils from '../../../utils';
import * as Api from '../../../services/api';
import * as MPT from '../../../proptypes';
import * as Nav from '../../../utils/navFrontend';
import * as RegistreringContext from '../state/registreringContext';
import ListevelgerFlervalg from '../../../felleskomponenter/ui/listevelgerFlervalg';
import Medlemskap from '../../../felleskomponenter/medlemskap';
import EndrePeriode from './endrePeriode';
import { lovvalgsperioderOperations } from '../../../ducks/lovvalgsperioder';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import { endrePeriodeSkjema } from '../validering/endrePeriodeSkjema';
import { endrePeriodeSelectors } from '../state/ducks/endrePeriode';
import { lagYupToReduxformErrorMapper } from '../../../felleskomponenter/skjema/validering/skjemaer/lagYupToReduxformErrorMapper';

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
    unntaksperiodeVurdering: KV.Koder.Unntaksperiode.GODKJENT,
    begrunnelseFritekst: '',
    ikkeGodkjentBegrunnelseKoder: [],
    endrePeriodeFeilmeldinger: { fom: undefined, tom: undefined, fritekst: undefined },
  };

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

    const { behandlingID, history } = this.props;
    const tilForsiden = () => history.push('/');
    switch (this.state.unntaksperiodeVurdering) {
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
    this.props.endrePeriode.skalEndres
      ? this.oppdaterAvklartefakta()
        .then(() => this.oppdaterLovvalgsperioder()
          .then(() => dispatchSaksflyt()))
      : dispatchSaksflyt());

  lagAvklartfakta = () => ({
    referanse: MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE,
    avklartefaktaKode: MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE,
    fakta: [this.props.endrePeriode.begrunnelse],
    subjektID: null,
    begrunnelseKoder: [],
    begrunnelseFritekst: this.props.endrePeriode.fritekst || null,
  });

  oppdaterAvklartefakta = () =>
    this.props.oppdaterAvklartefakta(this.props.behandlingID, [...this.props.avklartefakta, this.lagAvklartfakta()]);

  lagLovvalgsperioder = () => ([{
    fomDato: `${Utils.dato.formatterDatoTilISO(this.props.endrePeriode.fom)}`,
    tomDato: `${Utils.dato.formatterDatoTilISO(this.props.endrePeriode.tom)}`,
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

  kanEndrePeriode = () => this.props.redigerbart
    && (this.state.unntaksperiodeVurdering === KV.Koder.Unntaksperiode.GODKJENT
    || this.state.unntaksperiodeVurdering === KV.Koder.Unntaksperiode.INNHENT);

  validerFelt = () => this.validerEndrePeriode();

  validerEndrePeriode = () => {
    const { endrePeriode } = this.props;
    if (!this.kanEndrePeriode() || !endrePeriode.skalEndres) {
      return true;
    }

    const fritekstPakrevd = endrePeriode.begrunnelse === MKV.Koder.begrunnelser.folketrygdloven.endret_unntaksperiode.ANNET;
    const settings = { context: { fritekstPakrevd } };
    const stateObject = { fom: endrePeriode.fom, tom: endrePeriode.tom, fritekst: endrePeriode.fritekst };
    const endrePeriodeFeilmeldinger = lagYupToReduxformErrorMapper(endrePeriodeSkjema, settings)(stateObject);
    const validert = Utils._isEmpty(endrePeriodeFeilmeldinger);

    if (!validert) {
      this.setState({ endrePeriodeFeilmeldinger });
    }
    return validert;
  };

  render() {
    const {
      medlemskap, sed, vurderingBegrunnelser, redigerbart,
    } = this.props;
    if (!sed.lovvalgsperiode) {
      return null;
    }

    const listevalgEndringHandler = event => {
      const ikkeGodkjentBegrunnelseKoder = [...event.value];
      this.setState({ ikkeGodkjentBegrunnelseKoder });
    };
    const unikRadioButtonGruppeID = uuid();
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
                    <Nav.Fieldset legend="Vurder unntaksperiode" onChange={e => this.setState({ unntaksperiodeVurdering: e.target.value })} disabled={!redigerbart}>
                      <Nav.Radio name={unikRadioButtonGruppeID} value={KV.Koder.Unntaksperiode.GODKJENT} label="Godkjenn" defaultChecked />
                      <Nav.Radio name={unikRadioButtonGruppeID} value={KV.Koder.Unntaksperiode.INNHENT} label="Innhent informasjon" />
                      <Nav.Radio name={unikRadioButtonGruppeID} value={KV.Koder.Unntaksperiode.AVSLAG} label="Ikke godkjenn" />
                    </Nav.Fieldset>
                  </Nav.Column>
                </Nav.Row>
                {this.state.unntaksperiodeVurdering === KV.Koder.Unntaksperiode.AVSLAG && (
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
                    feilmeldinger={this.state.endrePeriodeFeilmeldinger}
                    redigerbart={this.kanEndrePeriode()} />
                </Nav.Row>
                <Nav.Row className="seksjon">
                  <Nav.Column xs="3">
                    <Nav.Hovedknapp onClick={() => this.submitRegistrering()} disabled={!redigerbart}>LAGRE</Nav.Hovedknapp>
                  </Nav.Column>
                </Nav.Row>
              </div>
            </div>
          </div>
        </form>
        {/* <Personopplysninger redigerbart /> TODO: Må hentes fra context (SPRINT-34) */}
        {medlemskap && <Medlemskap medlemskap={medlemskap} />}
      </div>
    );
  }
}

Saksopplysninger.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  medlemskap: MPT.Medlemskap,
  sed: PT.object, // TODO prop-type
  vurderingBegrunnelser: PT.object,
  skjema: PT.any,
  avklartefakta: PT.array.isRequired,
  endrePeriode: PT.object.isRequired,
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
};

const mapStateToProps = state => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  endrePeriode: endrePeriodeSelectors.EndrePeriodeSelector(state),
});
const mapDispatchToProps = dispatch => ({
  oppdaterAvklartefakta: (behandlingID, avklartefaktaListe) => dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
  oppdaterLovvalgsperioder: (behandlingID, lovvalgsperiodeListe) => dispatch(lovvalgsperioderOperations.send(behandlingID, lovvalgsperiodeListe)),
});

export default withRouter(RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
