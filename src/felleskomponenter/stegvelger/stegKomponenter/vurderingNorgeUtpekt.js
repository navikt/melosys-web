import React, { useEffect } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as Skjema from '../../../felleskomponenter/skjema';
import * as Validering from '../../../felleskomponenter/skjema/validering';
import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';

import MKV from '../../../melosyskodeverk';
import RegisterKontrollTreff from '../../../felleskomponenter/registerkontrollTreff';
import { behandlingsresultatSelectors } from '../../../ducks/behandlingsresultat';
import { soknadSelectors } from '../../../ducks/soknad';
import { konverterLovvalgsbestemmelseTilStegData, lagLovvalgsbestemmelse } from '../../../regler/lovvalgsbestemmelser';
import { konverterTilStegData, lagAvklartfakta } from '../../../regler/avklartefakta';
import { konverterLovvalgsperiodeTilStegData, lagLovvalgsperiode, slettLovvalgsperiode } from '../../../regler/lovvalgsperiode';

import './vurderingNorgeUtpekt.css';

export const VurderingNorgeUtpekt = ({
  vurderingBegrunnelser,
  slettData,
  oppdaterData,
  bekreftOgFortsett,
  redigerbart,
  tilstand: {
    harAvklaring,
    utpekingGodkjentFakta,
    lovvalgsbestemmelse,
    utpekingGodkjent,
    utpekingIkkeGodkjent,
  },
  handleSubmit,
  formValues,
  lovvalgsperiode,
}) => {
  useEffect(() => {
    if (lovvalgsbestemmelse) oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelse));
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.UTPEKING_GODKJENT, utpekingGodkjentFakta));
    oppdaterData(konverterLovvalgsperiodeTilStegData(lovvalgsperiode));

    return () => {
      slettData();
    };
  }, []);

  const vedArtikkelEndring = event => {
    oppdaterData(lagLovvalgsbestemmelse(event.target.value));
  };

  const vedGodkjennEndring = event => {
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.UTPEKING_GODKJENT, null, event.target.value));
  };

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

  return (
    <form onSubmit={handleSubmit}>
      <Nav.typo.Undertittel className="stegTittel">Vurder utpekingen</Nav.typo.Undertittel>
      <Nav.Row className="rad">
        <Nav.Column xs="5">
          {
            vurderingBegrunnelser.length > 0 &&
            <Nav.typo.Element>Treff ved automatisk kontroll</Nav.typo.Element>
          }
          <RegisterKontrollTreff vurderingBegrunnelser={vurderingBegrunnelser} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="rad">
        <Nav.Column xs="5">
          <Nav.typo.Element>Utenlandske myndigheter har utpekt Norge etter:</Nav.typo.Element>
          <Nav.Select
            label=""
            onChange={vedArtikkelEndring}
            value={lovvalgsbestemmelse || ''}
            disabled={!redigerbart}
          >
            <option disabled key="VELG" value="">Velg</option>
            {
              MKV.Kodekombinasjoner.alleLovvalg.map(kodeObjekt => (
                <option key={Utils._uuid()} value={kodeObjekt.kode}>{kodeObjekt.term}</option>
              ))
            }
          </Nav.Select>
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
            <Nav.Radio
              onChange={vedGodkjennEndring}
              label="Godkjenn lovvalg"
              value={KV.Koder.UtpekingAvNorgeGodkjenning.GODKJENN}
              name="godkjenn"
              checked={utpekingGodkjent}
            />
            <Nav.Radio
              onChange={vedGodkjennEndring}
              label="Ikke godkjenn"
              value={KV.Koder.UtpekingAvNorgeGodkjenning.IKKE_GODKJENN}
              name="godkjenn"
              checked={utpekingIkkeGodkjent}
            />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>
      <Nav.AlertStripe type="advarsel">Hvis det ikke er nok informasjon, må dette innhentes før lovvalget skal godkjennes eller ikke.</Nav.AlertStripe>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp">Bekreft og fortsett</Nav.Knapp>
      </div>
    </form>
  );
};

VurderingNorgeUtpekt.propTypes = {
  vurderingBegrunnelser: PT.arrayOf(PT.string),
  slettData: PT.func.isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  tilstand: PT.shape({
    harAvklaring: PT.bool.isRequired,
    utpekingGodkjentFakta: MPT.Avklartefakta,
    lovvalgsbestemmelse: PT.string,
    utpekingGodkjent: PT.bool.isRequired,
    utpekingIkkeGodkjent: PT.bool.isRequired,
  }).isRequired,
  oppdaterData: PT.func.isRequired,
  handleSubmit: PT.func.isRequired,
  formValues: PT.object,
  lovvalgsperiode: MPT.Periode.isRequired,
};

VurderingNorgeUtpekt.defaultProps = {
  formValues: {},
  vurderingBegrunnelser: [],
};

const mapStateToProps = state => ({
  lovvalgsperiode: {
    fomDato: soknadSelectors.SoknadsperiodeFomSelector(state),
    tomDato: soknadSelectors.SoknadsperiodeTomSelector(state),
  },
  formValues: getFormValues(KV.Form.VURDER_UTPEKING)(state),
  initialValues: {
    fom: Utils.dato.formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeFomSelector(state)),
    tom: Utils.dato.formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeTomSelector(state)),
  },
  vurderingBegrunnelser: behandlingsresultatSelectors.KontrollBegrunnelseKoderSelector(state),
});

const nesteSteg = (values, dispatch, props) => {
  props.bekreftOgFortsett();
};

const VurderingNorgeUtpektForm = reduxForm({
  onSubmit: nesteSteg,
  form: KV.Form.VURDER_UTPEKING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.vurder_utpeking),
})(VurderingNorgeUtpekt);

export default connect(mapStateToProps)(VurderingNorgeUtpektForm);
