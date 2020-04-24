import React, { useEffect, Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as Skjema from '../../skjema';
import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';

import MKV from '../../../melosyskodeverk';
import RegisterKontrollTreff from '../../registerkontrollTreff';
import { behandlingsresultatSelectors } from '../../../ducks/behandlingsresultat';
import { behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';
import { konverterLovvalgsbestemmelseTilStegData, lagLovvalgsbestemmelse } from '../../../regler/lovvalgsbestemmelser';
import { konverterLovvalgslandTilStegData, lagLovvalgsland } from '../../../regler/lovvalgsland';
import { konverterLovvalgsperiodeTilStegData, lagLovvalgsperiode, slettLovvalgsperiode } from '../../../regler/lovvalgsperiode';
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from '../../../yup';

import './vurderingUtpekt.css';

export const VurderingUtpekt = ({
  vurderingBegrunnelser,
  slettData,
  oppdaterData,
  redigerbart,
  tilstand: {
    harAvklaring,
    lovvalgsbestemmelse,
    lovvalgsland,
  },
  handleSubmit,
  formValues,
  lovvalgsperiode,
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
      oppdaterData(lagLovvalgsperiode({
        fomDato: Utils.dato.formatterDatoTilISO(formValues.fom),
        tomDato: Utils.dato.formatterDatoTilISO(formValues.tom),
      }));
    } else {
      slettData(slettLovvalgsperiode());
    }
  }, [formValues]);

  const visLovvalgsland = lovvalgsland && lovvalgsland !== MKV.Koder.landkoder.NO;

  return (
    <form onSubmit={handleSubmit}>
      <Nav.typo.Undertittel className="stegTittel">Vurder lovvalgsbeslutningen (A003)</Nav.typo.Undertittel>
      <Nav.Row className="rad">
        <Nav.Column xs="5">
          {
            vurderingBegrunnelser.length > 0 &&
            <Fragment>
              <Nav.typo.Element>Treff ved automatisk kontroll</Nav.typo.Element>
              <RegisterKontrollTreff vurderingBegrunnelser={vurderingBegrunnelser} />
            </Fragment>
          }
        </Nav.Column>
      </Nav.Row>
      {
        visLovvalgsland &&
        <Nav.Row className="rad">
          <Nav.Column xs="5">
            <Nav.typo.Element>Lovvalgsland</Nav.typo.Element>
            <Nav.typo.Normaltekst>{lovvalgsland}</Nav.typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>
      }
      <Nav.Row className="rad">
        <Nav.Column xs="5">
          <Nav.typo.Element>Grunnlag</Nav.typo.Element>
          <Skjema.Select
            feltNavn="lovvalgsbestemmelse"
            label=""
            disabled={!redigerbart}
          >
            <option disabled key="VELG" value="">Velg</option>
            {
              MKV.Kodekombinasjoner.alleLovvalg.map(kodeObjekt => (
                <option key={Utils._uuid()} value={kodeObjekt.kode}>{kodeObjekt.term}</option>
              ))
            }
          </Skjema.Select>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="rad">
        <Nav.Column xs="5">
          <Nav.typo.Element>Lovvalgsperiode</Nav.typo.Element>
          <Nav.Row>
            <Nav.Column xs="6">
              <Skjema.Input
                datoFelt
                label="Fra og med"
                feltNavn="fom"
                disabled={!redigerbart}
              />
            </Nav.Column>
            <Nav.Column xs="6">
              <Skjema.Input
                datoFelt
                label="Til og med"
                feltNavn="tom"
                disabled={!redigerbart}
              />
            </Nav.Column>
          </Nav.Row>
        </Nav.Column>
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
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp">Bekreft og fortsett</Nav.Knapp>
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
};

VurderingUtpekt.defaultProps = {
  formValues: {},
  vurderingBegrunnelser: [],
};

const mapStateToProps = (state, ownProps) => ({
  lovvalgsperiode: {
    fomDato: behandlingsgrunnlagSelectors.PeriodeFomSelector(state),
    tomDato: behandlingsgrunnlagSelectors.PeriodeTomSelector(state),
  },
  formValues: getFormValues(KV.Form.VURDER_UTPEKING)(state),
  initialValues: {
    fom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeFomSelector(state)),
    tom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeTomSelector(state)),
    lovvalgsbestemmelse: ownProps.tilstand.lovvalgsbestemmelse || '',
    utpekingVurdering: behandlingsresultatSelectors.UtfallRegistreringUnntak(state),
  },
  vurderingBegrunnelser: behandlingsresultatSelectors.KontrollresultatBegrunnelseKoderSelector(state),
});

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
  validate: lagYupToReduxformErrorMapper(YupSkjemaer.vurder_utpeking),
})(VurderingUtpekt);

export default connect(mapStateToProps)(VurderingUtpektForm);
