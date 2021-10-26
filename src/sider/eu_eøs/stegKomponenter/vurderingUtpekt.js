import React, { Fragment, useEffect } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";

import * as Nav from "../../../utils/navFrontend";
import * as KV from "../../../kodeverk";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as MPT from "../../../proptypes";
import * as Utils from "../../../utils";

import MKV from "../../../melosyskodeverk";
import RegisterKontrollTreff from "../../../felleskomponenter/registerkontrollTreff";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { behandlingsgrunnlagSelectors } from "../../../ducks/behandlingsgrunnlag";
import { flytSelectors } from "../../../ducks/flyt";
import { lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";

import { konverterLovvalgsbestemmelseTilStegData, lagLovvalgsbestemmelse } from "../../../regler/lovvalgsbestemmelser";
import { konverterLovvalgslandTilStegData, lagLovvalgsland } from "../../../regler/lovvalgsland";
import {
  konverterLovvalgsperiodeTilStegData,
  lagLovvalgsperiode,
  slettLovvalgsperiode,
} from "../../../regler/lovvalgsperiode";
import { lagYupToReduxformErrorMapper } from "../../../yup";
import vurderingUtpektSchema from "./vurderingUtpektSchema";

import "./vurderingUtpekt.css";

const lovvalgsbestemmelserStottetAvBrevVedNorgeUtpekt = MKV.Kodekombinasjoner.alleLovvalg.filter(
  ({ kode }) =>
    kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A ||
    kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B1 ||
    kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B2 ||
    kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B3 ||
    kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B4 ||
    kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2A ||
    kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2B ||
    kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3 ||
    kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4
);

export const VurderingUtpekt = ({
  vurderingBegrunnelser,
  slettData,
  oppdaterData,
  redigerbart,
  tilstand: { harAvklaring, lovvalgsbestemmelse, lovvalgsland },
  handleSubmit,
  formValues,
  lovvalgsperiode,
  ytterligereInformasjon,
  behandlingstema,
}) => {
  useEffect(() => {
    if (lovvalgsland) {
      oppdaterData(konverterLovvalgslandTilStegData(lovvalgsland));
      oppdaterData(lagLovvalgsland(lovvalgsland));
    }
    if (lovvalgsbestemmelse) oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelse));
    oppdaterData(konverterLovvalgsperiodeTilStegData(lovvalgsperiode));

    return () => {
      slettData();
    };
  }, []);

  useEffect(() => {
    oppdaterData(lagLovvalgsbestemmelse(formValues.lovvalgsbestemmelse));
  }, [formValues.lovvalgsbestemmelse]);

  const formValid = () => {
    const { fom, tom } = formValues;
    return Boolean(Utils.dato.vaskInputDato(fom)) && Boolean(Utils.dato.vaskInputDato(tom));
  };

  useEffect(() => {
    if (formValid()) {
      oppdaterData(
        lagLovvalgsperiode({
          fomDato: Utils.dato.formatterDatoTilISO(formValues.fom),
          tomDato: Utils.dato.formatterDatoTilISO(formValues.tom),
        })
      );
    } else {
      slettData(slettLovvalgsperiode());
    }
  }, [formValues]);

  const lovvalgslandFraForm = formValues.lovvalgsland;
  const visLovvalgsland = lovvalgslandFraForm && lovvalgslandFraForm !== MKV.Koder.landkoder.NO;
  const lovvalgslandTerm = KV.kodeTilTerm(lovvalgslandFraForm, MKV.KTObjects.landkoder);
  const lovvalgsbestemmelser =
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE
      ? lovvalgsbestemmelserStottetAvBrevVedNorgeUtpekt
      : MKV.Kodekombinasjoner.alleLovvalg;

  return (
    <form onSubmit={handleSubmit}>
      <Nav.Typo.Undertittel className="stegTittel">Vurder lovvalgsbeslutningen (A003)</Nav.Typo.Undertittel>
      <Nav.Row className="rad">
        <Nav.Column xs="5">
          {vurderingBegrunnelser.length > 0 && (
            <Fragment>
              <Nav.Typo.Element>Treff ved automatisk kontroll</Nav.Typo.Element>
              <RegisterKontrollTreff vurderingBegrunnelser={vurderingBegrunnelser} />
            </Fragment>
          )}
        </Nav.Column>
      </Nav.Row>
      {visLovvalgsland && (
        <Nav.Row className="rad">
          <Nav.Column xs="5">
            <Nav.Typo.Element>Lovvalgsland</Nav.Typo.Element>
            <Nav.Typo.Normaltekst>{lovvalgslandTerm}</Nav.Typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>
      )}
      <Nav.Row className="rad">
        <Nav.Column xs="5">
          <Nav.Typo.Element>Grunnlag</Nav.Typo.Element>
          <Skjema.Select feltNavn="lovvalgsbestemmelse" label="" disabled={!redigerbart}>
            <option disabled key="VELG" value="">
              Velg
            </option>
            {lovvalgsbestemmelser.map((kodeObjekt) => (
              <option key={Utils._uuid()} value={kodeObjekt.kode}>
                {kodeObjekt.term}
              </option>
            ))}
          </Skjema.Select>
        </Nav.Column>
      </Nav.Row>
      {(redigerbart || formValues.overgangsregelbestemmelser) && (
        <Nav.Row className="rad">
          <Nav.Column xs="5">
            <Nav.Typo.Element>Overgangsregler gjelder:</Nav.Typo.Element>
            <Skjema.ListeVelger
              feltNavn="overgangsregelbestemmelser"
              label="Legg til ny overgangsregelbestemmelse:"
              placeholder="(Velg bestemmelse)"
              muligeValg={MKV.KTObjects.lovvalgsbestemmelser.overgangsregelbestemmelser}
              disabled={!redigerbart}
              gruppe
            />
          </Nav.Column>
        </Nav.Row>
      )}
      <Nav.Row className="rad">
        <Nav.Column xs="5">
          <Nav.Typo.Element>Lovvalgsperiode</Nav.Typo.Element>
          <Nav.Row>
            <Nav.Column xs="6">
              <Skjema.Datovelger label="Fra og med" feltNavn="fom" disabled={!redigerbart} />
            </Nav.Column>
            <Nav.Column xs="6">
              <Skjema.Datovelger label="Til og med" feltNavn="tom" disabled={!redigerbart} />
            </Nav.Column>
          </Nav.Row>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="rad">
        {ytterligereInformasjon && (
          <Nav.Column xs="12">
            <Nav.Typo.Element>Ytterligere informasjon fra SED</Nav.Typo.Element>
            <Nav.Typo.Normaltekst>{ytterligereInformasjon}</Nav.Typo.Normaltekst>
          </Nav.Column>
        )}
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="5">
          <Nav.Fieldset legend="Skal lovvalget godkjennes?" disabled={!redigerbart}>
            <Skjema.Radio
              label="Godkjenn"
              value={MKV.Koder.utfallregistreringunntak.GODKJENT}
              name="godkjenn"
              feltNavn="utpekingVurdering"
            />
            <Skjema.Radio
              label="Ikke godkjenn"
              value={MKV.Koder.utfallregistreringunntak.IKKE_GODKJENT}
              name="godkjenn"
              feltNavn="utpekingVurdering"
            />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.AlertStripe type="advarsel">
            Hvis det ikke er nok informasjon, må dette innhentes før du velger «Godkjenn» eller «Ikke godkjenn».
            Lovvalgsbestemmelsen og perioden kan kun redigeres etter avtale med utenlandsk trygdemyndighet.
          </Nav.AlertStripe>
        </Nav.Column>
      </Nav.Row>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp">
          Bekreft og fortsett
        </Nav.Knapp>
      </div>
    </form>
  );
};

VurderingUtpekt.propTypes = {
  vurderingBegrunnelser: PT.arrayOf(PT.string),
  slettData: PT.func.isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  tilstand: PT.shape({
    harAvklaring: PT.bool.isRequired,
    lovvalgsbestemmelse: PT.string,
    lovvalgsland: PT.string,
  }).isRequired,
  oppdaterData: PT.func.isRequired,
  handleSubmit: PT.func.isRequired,
  formValues: PT.object,
  lovvalgsperiode: MPT.Periode.isRequired,
  ytterligereInformasjon: PT.string,
  behandlingstema: PT.string.isRequired,
};

VurderingUtpekt.defaultProps = {
  formValues: {},
  vurderingBegrunnelser: [],
  ytterligereInformasjon: null,
};

const mapStateToProps = (state, ownProps) => {
  const behandlingsstatus = behandlingerSelectors.BehandlingsstatusKodeSelector(state);

  const behandlingsstatusErAvsluttetEllerMidlertidigBeslutning =
    behandlingsstatus === MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET ||
    behandlingsstatus === MKV.Koder.behandlinger.behandlingsstatus.MIDLERTIDIG_LOVVALGSBESLUTNING;

  const lovvalgsperiode = behandlingsstatusErAvsluttetEllerMidlertidigBeslutning
    ? {
        fomDato: lovvalgsperioderSelectors.FomDatoSelector(state),
        tomDato: lovvalgsperioderSelectors.TomDatoSelector(state),
      }
    : {
        fomDato: behandlingsgrunnlagSelectors.PeriodeFomSelector(state),
        tomDato: behandlingsgrunnlagSelectors.PeriodeTomSelector(state),
      };

  const initialLovvalgsperiodeFom = behandlingsstatusErAvsluttetEllerMidlertidigBeslutning
    ? lovvalgsperioderSelectors.FomDatoSelector(state)
    : behandlingerSelectors.LovvalgsperiodeFomSelector(state);
  const initialLovvalgsperiodeTom = behandlingsstatusErAvsluttetEllerMidlertidigBeslutning
    ? lovvalgsperioderSelectors.TomDatoSelector(state)
    : behandlingerSelectors.LovvalgsperiodeTomSelector(state);

  return {
    lovvalgsperiode,
    formValues: getFormValues(KV.Form.VURDER_UTPEKING)(state),
    initialValues: {
      fom: initialLovvalgsperiodeFom ? Utils.dato.formatterDatoTilNorsk(initialLovvalgsperiodeFom) : "",
      tom: initialLovvalgsperiodeTom ? Utils.dato.formatterDatoTilNorsk(initialLovvalgsperiodeTom) : "",
      lovvalgsbestemmelse: ownProps.tilstand.lovvalgsbestemmelse || "",
      lovvalgsland: ownProps.tilstand.lovvalgsland,
      utpekingVurdering: flytSelectors.UtpekingVurderingSelector(state),
      overgangsregelbestemmelser: behandlingsgrunnlagSelectors
        .OvergangsregelbestemmelserSelector(state)
        .map((o) => o.kode),
    },
    vurderingBegrunnelser: behandlingsresultatSelectors.KontrollresultatBegrunnelseKoderSelector(state),
    ytterligereInformasjon: behandlingsgrunnlagSelectors.YtterligereInformasjonSelector(state),
    behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  };
};

const nesteSteg = (values, dispatch, props) => {
  props.bekreftOgFortsett();
};

const VurderingUtpektForm = reduxForm({
  onSubmit: nesteSteg,
  form: KV.Form.VURDER_UTPEKING,
  enableReinitialize: false,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurderingUtpektSchema),
})(VurderingUtpekt);

export default connect(mapStateToProps)(VurderingUtpektForm);
