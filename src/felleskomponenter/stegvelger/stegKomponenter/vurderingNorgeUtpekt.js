import React, { useEffect } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as Skjema from '../../../felleskomponenter/skjema';
import * as Validering from '../../../felleskomponenter/skjema/validering';
import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';

import MKV from '../../../melosyskodeverk';

import { lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder';

import { konverterLovvalgsbestemmelseTilStegData, lagLovvalgsbestemmelse } from '../../../regler/lovvalgsbestemmelser';
import { konverterTilStegData, lagAvklartfakta } from '../../../regler/avklartefakta';

import './vurderingNorgeUtpekt.css';

const VurderingNorgeUtpekt = ({
  slettData,
  oppdaterData,
  bekreftOgFortsett,
  redigerbart,
  tilstand: {
    harAvklaring,
    utpekingGodkjentFakta,
    lovvalgsbestemmelse,
  },
  handleSubmit,
}) => {
  useEffect(() => {
    if (lovvalgsbestemmelse) oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelse));
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.UTPEKING_GODKJENT, utpekingGodkjentFakta));

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

  return (
    <form onSubmit={handleSubmit}>
      <Nav.typo.Undertittel className="stegTittel">Vurder utpekingen</Nav.typo.Undertittel>
      {/* <Nav.typo.Element>Treff ved automatisk kontroll</Nav.typo.Element>
      <RegisterKontrollTreff vurderingBegrunnelser={vurderingBegrunnelser} /> */}
      <Nav.Row>
        <Nav.Column xs="5">
          <Nav.Select
            label="Utenlandske myndigheter har utpekt Norge etter:"
            onChange={vedArtikkelEndring}
            value={lovvalgsbestemmelse || ''}
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
      <Nav.Row>
        <Nav.Column xs="5">
          <Nav.typo.Element>Lovvalgsperiode</Nav.typo.Element>
          <Nav.Row>
            <Nav.Column xs="6">
              <Skjema.Input
                datoFelt
                label="Fra og med"
                feltNavn="fom"
              />
            </Nav.Column>
            <Nav.Column xs="6">
              <Skjema.Input
                datoFelt
                label="Til og med"
                feltNavn="tom"
              />
            </Nav.Column>
          </Nav.Row>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="5">
          <Nav.Fieldset legend="Skal lovvalget godkjennes?">
            <Nav.Radio
              onChange={vedGodkjennEndring}
              label="Godkjenn lovvalg"
              value={KV.Koder.UtpekingAvNorgeGodkjenning.GODKJENN}
              name="godkjenn"
            />
            <Nav.Radio
              onChange={vedGodkjennEndring}
              label="Ikke godkjenn"
              value={KV.Koder.UtpekingAvNorgeGodkjenning.IKKE_GODKJENN}
              name="godkjenn"
            />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>
      <Nav.AlertStripe type="advarsel">Hvis det ikke er nok informasjon, må dette innhentes før lovvalget skal godkjennes eller ikke.</Nav.AlertStripe>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </form>
  );
};

VurderingNorgeUtpekt.propTypes = {
  slettData: PT.func.isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  tilstand: PT.shape({
    harAvklaring: PT.bool.isRequired,
    utpekingGodkjentFakta: MPT.Avklartefakta,
    lovvalgsbestemmelse: PT.string,
  }).isRequired,
  oppdaterData: PT.func.isRequired,
  handleSubmit: PT.func.isRequired,
};

const mapStateToProps = state => ({
  initialValues: {
    fom: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.FomDatoSelector(state)),
    tom: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state)),
  },
});

const mapDispatchToProps = dispatch => ({});

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

export default connect(mapStateToProps, mapDispatchToProps)(VurderingNorgeUtpektForm);
