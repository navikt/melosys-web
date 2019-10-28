import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../kodeverk';
import * as Utils from '../../../utils';
import * as Api from '../../../services/api';
import * as MPT from '../../../proptypes';
import * as Nav from '../../../utils/navFrontend';
import * as RegistreringContext from '../state/registreringContext';
import * as Mui from '../../../felleskomponenter/ui';
import Medlemskap from '../../../felleskomponenter/medlemskap';
import EndrePeriode from './komponenter/endrePeriode';
import RegisterkontrollTreff from '../komponenter/registerkontrollTreff';
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import { endrePeriodeSkjema, ikkeGodkjentBegrunnelseSkjema } from './validering/unntaksperiodeSkjema';
import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { lagYupToReduxformErrorMapper } from '../../../felleskomponenter/skjema/validering/skjemaer/lagYupToReduxformErrorMapper';

import '../saksopplysninger.css';

const uuid = require('uuid/v4');

const Saksopplysninger = props => {
  const [unntaksperiodeVurdering, setUnntaksperiodeVurdering] = React.useState(KV.Koder.Unntaksperiode.GODKJENT);
  const [begrunnelseFritekst, setBegrunnelseFritekst] = React.useState('');
  const [ikkeGodkjentBegrunnelseKoder, setIkkeGodkjentBegrunnelseKoder] = React.useState([]);
  const [ikkeGodkjentFeilmeldinger, setIkkeGodkjentFeilmeldinger] = React.useState({ begrunnelseKoder: undefined, begrunnelseFritekst: undefined });
  const [endrePeriodeFeilmeldinger, setEndrePeriodeFeilmeldinger] = React.useState({ fom: undefined, tom: undefined, fritekst: undefined });
  const [endrePeriodeFom, setEndrePeriodeFom] = React.useState('');
  const [endrePeriodeTom, setEndrePeriodeTom] = React.useState('');
  const [endrePeriodeBegrunnelse, setEndrePeriodeBegrunnelse] = React.useState(MKV.Koder.begrunnelser.folketrygdloven.endret_unntaksperiode.PERIODE_FEILREGISTRERT);
  const [endrePeriodeFritekst, setEndrePeriodeFritekst] = React.useState('');
  const [periodeOver5aarVarslet, setPeriodeOver5aarVarslet] = React.useState(false);
  const [durationWarningMessage, setDurationWarningMessage] = React.useState(null);

  const hentBehandlingsresultat = async () => Api.Behandlinger.resultat.hentResultat(props.behandlingID);
  const hentLovvalgsperioder = async () => Api.Lovvalgsperioder.hent(props.behandlingID);

  const settEndretPeriodeOpplysninger = async avklartFakta => {
    setUnntaksperiodeVurdering(KV.Koder.Unntaksperiode.DELVIS_GODKJENT);
    setEndrePeriodeBegrunnelse(avklartFakta.fakta[0]); // Har alltid bare ett fakta i disse tilfellene
    setEndrePeriodeFritekst(avklartFakta.begrunnelseFritekst);

    const lovvalgsperioder = await hentLovvalgsperioder();
    if (lovvalgsperioder) {
      setEndrePeriodeFom(Utils.dato.formatterDatoTilNorsk(lovvalgsperioder[0].fomDato));
      setEndrePeriodeTom(Utils.dato.formatterDatoTilNorsk(lovvalgsperioder[0].tomDato));
    }
  };

  const godkjentUnntaksperiode = async () => {
    const endretPeriodeFakta = props.avklartefakta.find(value => value.referanse === MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE);
    if (endretPeriodeFakta) {
      settEndretPeriodeOpplysninger(endretPeriodeFakta);
    } else {
      setUnntaksperiodeVurdering(KV.Koder.Unntaksperiode.GODKJENT);
    }
  };

  const ikkeGodkjentUnntaksperiode = behandlingsresultat => {
    setUnntaksperiodeVurdering(KV.Koder.Unntaksperiode.AVSLAG);
    setBegrunnelseFritekst(behandlingsresultat.begrunnelseFritekst);
    setIkkeGodkjentBegrunnelseKoder(behandlingsresultat.begrunnelseKoder);
  };

  const initialiserSkjema = async () => {
    const behandlingsresultat = await hentBehandlingsresultat();
    if (behandlingsresultat.utfallRegistreringUnntak === MKV.Koder.utfallregistreringunntak.GODKJENT) {
      godkjentUnntaksperiode();
    } else if (behandlingsresultat.utfallRegistreringUnntak === MKV.Koder.utfallregistreringunntak.IKKE_GODKJENT) {
      ikkeGodkjentUnntaksperiode(behandlingsresultat);
    }
  };

  React.useEffect(() => {
    initialiserSkjema();
  }, [props.avklartefakta]);

  const overstyrSubmit = event => {
    event.preventDefault();
  };

  const textAreaOnChange = event => {
    setBegrunnelseFritekst(event.target.value);
  };

  const lagAvklartfakta = () => ({
    referanse: MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE,
    avklartefaktaKode: MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE,
    fakta: [endrePeriodeBegrunnelse],
    subjektID: null,
    begrunnelseKoder: [],
    begrunnelseFritekst: endrePeriodeFritekst || null,
  });

  const oppdaterAvklartefakta = () =>
    props.oppdaterAvklartefakta(props.behandlingID, [...props.avklartefakta, lagAvklartfakta()]);

  const lagLovvalgsperioder = () => ([{
    fomDato: `${Utils.dato.formatterDatoTilISO(endrePeriodeFom)}`,
    tomDato: `${Utils.dato.formatterDatoTilISO(endrePeriodeTom)}`,
    lovvalgsbestemmelse: props.sed.lovvalgsbestemmelse,
    tilleggBestemmelse: null,
    unntakFraBestemmelse: null,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland: props.sed.lovvalgslandKode,
    unntakFraLovvalgsland: null,
    trygdeDekning: MKV.Koder.trygdedekninger.UTEN_DEKNING,
    medlemskapstype: MKV.Koder.medlemskapstyper.UNNTATT,
    medlemskapsperiodeID: null,
  }]);

  const oppdaterLovvalgsperioder = () =>
    props.oppdaterLovvalgsperioder(props.behandlingID, lagLovvalgsperioder());

  const endrePeriodeOgLagre = dispatchSaksflyt => (
    oppdaterAvklartefakta()
      .then(() => oppdaterLovvalgsperioder()
        .then(() => dispatchSaksflyt())));

  const godkjenn = behandlingID => Api.Saksflyt.Unntaksperioder.godkjenn(behandlingID);

  const delvisGodkjenn = behandlingID => endrePeriodeOgLagre(() => Api.Saksflyt.Unntaksperioder.godkjenn(behandlingID));

  const kanEndrePeriode = () => (unntaksperiodeVurdering === KV.Koder.Unntaksperiode.DELVIS_GODKJENT);

  const validerEndrePeriode = () => {
    if (!kanEndrePeriode()) {
      return true;
    }

    const fritekstPakrevd = endrePeriodeBegrunnelse === MKV.Koder.begrunnelser.folketrygdloven.endret_unntaksperiode.ANNET;
    const begrunnelsePakrevd = !endrePeriodeBegrunnelse;
    const settings = { context: { fritekstPakrevd, begrunnelsePakrevd } };
    const stateObject = {
      fom: endrePeriodeFom, tom: endrePeriodeTom, fritekst: endrePeriodeFritekst, begrunnelse: endrePeriodeBegrunnelse,
    };
    const feilmeldinger = lagYupToReduxformErrorMapper(endrePeriodeSkjema, settings)(stateObject);
    setEndrePeriodeFeilmeldinger(feilmeldinger);

    return Utils._isEmpty(feilmeldinger);
  };

  const validerAvslag = ikkeGodkjentBegrunnelse => {
    if (unntaksperiodeVurdering !== KV.Koder.Unntaksperiode.AVSLAG) {
      return true;
    }

    const koder = ikkeGodkjentBegrunnelse || ikkeGodkjentBegrunnelseKoder;

    const settings = { context: { fritekstPakrevd: koder.includes('ANNET') } };
    const stateObject = {
      begrunnelseKoder: koder,
      begrunnelseFritekst,
    };

    const feilmeldinger = lagYupToReduxformErrorMapper(ikkeGodkjentBegrunnelseSkjema, settings)(stateObject);
    setIkkeGodkjentFeilmeldinger(feilmeldinger);

    return Utils._isEmpty(feilmeldinger);
  };

  const validerFelt = () => validerEndrePeriode() && validerAvslag();

  const sjekkDatoVarsel = (fom, tom) => {
    if (!kanEndrePeriode()) {
      return null;
    }

    const fomISO = Utils.dato.formatterDatoTilISO(fom);
    const tomISO = Utils.dato.formatterDatoTilISO(tom);
    const varighet = Utils.dato.datoDiff(fomISO, tomISO, 'years');

    if (varighet <= 0) {
      return 'Ugyldig periode';
    } else if (varighet > 5) {
      return 'Perioden overstiger 5 år';
    }
    return null;
  };
  const visPeriodeVarselStripe = () => {
    if (!durationWarningMessage) {
      return null;
    }
    return (
      <Nav.Row className="seksjon">
        <Nav.Column xs="8">
          <Nav.AlertStripe className="feilmelding" type="advarsel" >
            {durationWarningMessage}
          </Nav.AlertStripe>
        </Nav.Column>
      </Nav.Row>
    );
  };

  const submitRegistrering = () => {
    if (!validerFelt()) {
      setPeriodeOver5aarVarslet(false);
      return false;
    }

    const durationWarning = sjekkDatoVarsel(endrePeriodeFom, endrePeriodeTom);
    setDurationWarningMessage(durationWarning);
    if (durationWarning) {
      if (!periodeOver5aarVarslet) {
        setPeriodeOver5aarVarslet(true);
        return false;
      }
    }
    const { behandlingID, history } = props;
    const tilForsiden = () => history.push('/');
    switch (unntaksperiodeVurdering) {
      case KV.Koder.Unntaksperiode.GODKJENT:
        godkjenn(behandlingID)
          .then(tilForsiden)
          .catch(Utils.logger.error);
        return true;
      case KV.Koder.Unntaksperiode.DELVIS_GODKJENT:
        delvisGodkjenn(behandlingID)
          .then(tilForsiden)
          .catch(Utils.logger.error);
        return true;
      case KV.Koder.Unntaksperiode.AVSLAG: {
        const ikkegodkjenn = {
          ikkeGodkjentBegrunnelseKoder: [...ikkeGodkjentBegrunnelseKoder],
          begrunnelseFritekst,
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

  const {
    medlemskap, sed, vurderingBegrunnelser, redigerbart,
  } = props;
  if (!sed.lovvalgsperiode) {
    return null;
  }

  const listevalgEndringHandler = event => {
    const ikkeGodkjentBegrunnelse = [...event.value];
    setIkkeGodkjentBegrunnelseKoder(ikkeGodkjentBegrunnelse);
    validerAvslag(ikkeGodkjentBegrunnelse);
  };

  const endreUnntaksperiodeVurdering = e => setUnntaksperiodeVurdering(e.target.value);

  const unikRadioButtonGruppeID = uuid();
  return (
    <div>
      <form name="registrering" id="registrering" onSubmit={overstyrSubmit}>
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
                  <Nav.Fieldset legend="Vurder unntaksperiode" disabled={!redigerbart}>
                    <Nav.Radio
                      name={unikRadioButtonGruppeID}
                      value={KV.Koder.Unntaksperiode.GODKJENT}
                      checked={KV.Koder.Unntaksperiode.GODKJENT === unntaksperiodeVurdering}
                      onChange={endreUnntaksperiodeVurdering}
                      label="Godkjenn unntaksperiode"
                    />
                    <Nav.Radio
                      name={unikRadioButtonGruppeID}
                      value={KV.Koder.Unntaksperiode.DELVIS_GODKJENT}
                      checked={KV.Koder.Unntaksperiode.DELVIS_GODKJENT === unntaksperiodeVurdering}
                      onChange={endreUnntaksperiodeVurdering}
                      label="Godkjenn, men endre periode"
                    />
                    {kanEndrePeriode() && (
                      <Nav.Row>
                        <EndrePeriode
                          redigerbart={redigerbart}
                          feilmeldinger={endrePeriodeFeilmeldinger}
                          sedLovvalgsperiode={props.sedLovvalgsperiode}
                          lovvalgsperiode={props.lovvalgsperiode}
                          oppdaterFom={setEndrePeriodeFom}
                          oppdaterTom={setEndrePeriodeTom}
                          oppdaterBegrunnelse={setEndrePeriodeBegrunnelse}
                          oppdaterFritekst={setEndrePeriodeFritekst}
                          endrePeriode={({
                            fom: endrePeriodeFom,
                            tom: endrePeriodeTom,
                            begrunnelse: endrePeriodeBegrunnelse,
                            fritekst: endrePeriodeFritekst,
                          })}
                        />
                      </Nav.Row>
                    )}
                    <Nav.Radio
                      name={unikRadioButtonGruppeID}
                      value={KV.Koder.Unntaksperiode.AVSLAG}
                      checked={KV.Koder.Unntaksperiode.AVSLAG === unntaksperiodeVurdering}
                      onChange={endreUnntaksperiodeVurdering}
                      label="Ikke godkjenn"
                    />
                  </Nav.Fieldset>
                </Nav.Column>
              </Nav.Row>
              {unntaksperiodeVurdering === KV.Koder.Unntaksperiode.AVSLAG && (
                <Fragment>
                  <Nav.Row>
                    <Nav.Column xs="6">
                      <Nav.Fieldset legend="Begrunnelse for ikke godkjent unntaksperiode">
                        <Mui.ListevelgerFlervalg
                          disabled={false}
                          muligeValg={MKV.KTObjects.begrunnelser.ikke_godkjent_begrunnelser}
                          label="Legg til begrunnelse for ikke oppfylt:"
                          tillatFritekst={false}
                          onChange={listevalgEndringHandler}
                          feil={ikkeGodkjentFeilmeldinger.begrunnelseKoder}
                          defaultElementer={ikkeGodkjentBegrunnelseKoder}
                        />
                      </Nav.Fieldset>
                    </Nav.Column>
                  </Nav.Row>
                  <Nav.Row>
                    <Nav.Column xs="6">
                      {ikkeGodkjentBegrunnelseKoder.includes('ANNET') &&
                        <Nav.Textarea
                          label="Skriv inn begrunnelse for avslaget..."
                          onChange={textAreaOnChange}
                          value={begrunnelseFritekst}
                          maxLength={255}
                          feil={ikkeGodkjentFeilmeldinger.begrunnelseFritekst}
                          bredde="fullbredde" />
                      }
                    </Nav.Column>
                  </Nav.Row>
                </Fragment>
              )}
              {durationWarningMessage && visPeriodeVarselStripe()}
              <Nav.Row className="seksjon">
                <Nav.Column xs="3">
                  <Nav.Hovedknapp onClick={() => submitRegistrering()} disabled={!redigerbart}>LAGRE</Nav.Hovedknapp>
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
};


Saksopplysninger.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  medlemskap: MPT.Medlemskap,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  vurderingBegrunnelser: PT.object,
  skjema: PT.any,
  avklartefakta: PT.array.isRequired,
  lovvalgsperiode: PT.object.isRequired,
  sedLovvalgsperiode: MPT.Periode,
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
  sedLovvalgsperiode: {},
};

const mapStateToProps = state => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  sedLovvalgsperiode: behandlingerSelectors.SEDSelector(state).lovvalgsperiode,
});
const mapDispatchToProps = dispatch => ({
  oppdaterAvklartefakta: (behandlingID, avklartefaktaListe) => dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
  oppdaterLovvalgsperioder: (behandlingID, lovvalgsperiodeListe) => dispatch(lovvalgsperioderOperations.send(behandlingID, lovvalgsperiodeListe)),
});

export default withRouter(RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
