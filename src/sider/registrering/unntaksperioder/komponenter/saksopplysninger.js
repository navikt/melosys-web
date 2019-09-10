import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../../kodeverk';
import * as Utils from '../../../../utils';
import * as Api from '../../../../services/api';
import * as MPT from '../../../../proptypes';
import * as Nav from '../../../../utils/navFrontend';
import * as RegistreringContext from '../../state/registreringContext';
import ListevelgerFlervalg from '../../../../felleskomponenter/ui/listevelgerFlervalg';
import Medlemskap from '../../../../felleskomponenter/medlemskap';
import EndrePeriode from './endrePeriode';
import { lovvalgsperioderOperations } from '../../../../ducks/lovvalgsperioder';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../../ducks/avklartefakta';
import { endrePeriodeSkjema } from '../validering/endrePeriodeSkjema';
import { endrePeriodeSelectors } from '../../state/ducks/endrePeriode';
import { createValidator } from '../../../../felleskomponenter/skjema/validering/skjemaer/createValidator';

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

const Saksopplysninger = props => {
  const [unntaksperiodeVurdering, setUnntaksperiodeVurdering] = React.useState(KV.Koder.Unntaksperiode.GODKJENT);
  const [begrunnelseFritekst, setBegrunnelseFritekst] = React.useState('');
  const [ikkeGodkjentBegrunnelseKoder, setIkkeGodkjentBegrunnelseKoder] = React.useState([]);
  const [endrePeriodeFeilmeldinger, setEndrePeriodeFeilmeldinger] = React.useState({ fom: undefined, tom: undefined, fritekst: undefined });

  const overstyrSubmit = event => {
    event.preventDefault();
  };

  const textAreaOnChange = event => {
    setBegrunnelseFritekst(event.target.value);
  };

  const lagAvklartfakta = () => ({
    referanse: MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE,
    avklartefaktaKode: MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE,
    fakta: [props.endrePeriode.begrunnelse],
    subjektID: null,
    begrunnelseKoder: [],
    begrunnelseFritekst: props.endrePeriode.fritekst || null,
  });

  const oppdaterAvklartefakta = () =>
    props.oppdaterAvklartefakta(props.behandlingID, [...props.avklartefakta, lagAvklartfakta()]);

  const lagLovvalgsperioder = () => ([{
    fomDato: `${Utils.dato.formatterDatoTilISO(props.endrePeriode.fom)}`,
    tomDato: `${Utils.dato.formatterDatoTilISO(props.endrePeriode.tom)}`,
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
    props.endrePeriode.skalEndres
      ? oppdaterAvklartefakta()
        .then(() => oppdaterLovvalgsperioder()
          .then(() => dispatchSaksflyt()))
      : dispatchSaksflyt());

  const godkjenn = behandlingID => endrePeriodeOgLagre(() => Api.Saksflyt.Unntaksperioder.godkjenn(behandlingID));

  const innhentInfo = behandlingID => endrePeriodeOgLagre(() => Api.Saksflyt.Unntaksperioder.innhentinfo(behandlingID));

  const kanEndrePeriode = () => props.redigerbart
    && (unntaksperiodeVurdering === KV.Koder.Unntaksperiode.GODKJENT
    || unntaksperiodeVurdering === KV.Koder.Unntaksperiode.INNHENT);

  const validerEndrePeriode = () => {
    const { endrePeriode } = props;
    if (!kanEndrePeriode() || !endrePeriode.skalEndres) {
      return true;
    }

    const fritekstPakrevd = endrePeriode.begrunnelse === MKV.Koder.begrunnelser.folketrygdloven.endret_unntaksperiode.ANNET;
    const settings = { context: { fritekstPakrevd } };
    const stateObject = { fom: endrePeriode.fom, tom: endrePeriode.tom, fritekst: endrePeriode.fritekst };
    const feilmeldinger = createValidator(endrePeriodeSkjema, settings)(stateObject);
    const validert = Utils._isEmpty(feilmeldinger);

    if (!validert) {
      setEndrePeriodeFeilmeldinger(feilmeldinger);
    }
    return validert;
  };

  const validerFelt = () => validerEndrePeriode();

  const submitRegistrering = () => {
    if (!validerFelt()) {
      return false;
    }

    const { behandlingID, history } = props;
    const tilForsiden = () => history.push('/');
    switch (unntaksperiodeVurdering) {
      case KV.Koder.Unntaksperiode.GODKJENT:
        godkjenn(behandlingID)
          .then(tilForsiden)
          .catch(Utils.logger.error);
        return true;
      case KV.Koder.Unntaksperiode.INNHENT:
        innhentInfo(behandlingID)
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
    setIkkeGodkjentBegrunnelseKoder([...event.value]);
  };

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
                  <Nav.Fieldset legend="Vurder unntaksperiode" onChange={e => setUnntaksperiodeVurdering(e.target.value)} disabled={!redigerbart}>
                    <Nav.Radio name={unikRadioButtonGruppeID} value={KV.Koder.Unntaksperiode.GODKJENT} label="Godkjenn" defaultChecked />
                    <Nav.Radio name={unikRadioButtonGruppeID} value={KV.Koder.Unntaksperiode.INNHENT} label="Innhent informasjon" />
                    <Nav.Radio name={unikRadioButtonGruppeID} value={KV.Koder.Unntaksperiode.AVSLAG} label="Ikke godkjenn" />
                  </Nav.Fieldset>
                </Nav.Column>
              </Nav.Row>
              {unntaksperiodeVurdering === KV.Koder.Unntaksperiode.AVSLAG && (
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
                      {ikkeGodkjentBegrunnelseKoder.includes('ANNET') &&
                        <Nav.Textarea
                          label="Skriv inn begrunnelse for avslaget..."
                          onChange={textAreaOnChange}
                          value={begrunnelseFritekst}
                          maxLength={255}
                          bredde="fullbredde" />
                      }
                    </Nav.Column>
                  </Nav.Row>
                </Fragment>
              )}
              <Nav.Row className="seksjon">
                <EndrePeriode
                  feilmeldinger={endrePeriodeFeilmeldinger}
                  redigerbart={kanEndrePeriode()} />
              </Nav.Row>
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
