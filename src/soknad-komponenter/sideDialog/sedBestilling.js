import React, { useState, useEffect } from 'react';
import PT from 'prop-types';

import { connect } from 'react-redux';
import { reduxForm, reset, setSubmitFailed, Field, Fields, change } from 'redux-form';

import * as KV from '../../kodeverk';
import * as Nav from '../../utils/navFrontend';
// import * as MPT from '../../proptypes/';
import * as Skjema from '../skjema';

import { behandlingerSelectors } from '../../ducks/behandlinger';
import { sedOperations, sedSelectors } from '../../ducks/sed';
import './sedBestilling.css';
import { formSelectors } from '../../ducks/form';

const harBlankMelding = (verdi, melding = 'Velg et element i nedtrekkslisten') => ((!verdi || verdi === '') ? melding : false);

const sedBestillingValidering = verdier => ({
  // fagomrade: (harBlankMelding(verdier.fagomrade) || false),
  buc: (harBlankMelding(verdier.buc) || false),
  // sed: (harBlankMelding(verdier.sed, 'Velg en BUC for å sette SED') || false),
  land: (harBlankMelding(verdier.land) || false),
  mottakerinstitusjon: (harBlankMelding(verdier.mottakerinstitusjon) || false),
});

const BucOgSed = ({feltData, redigerbart, meta, settSkjemaVerdi}) => {
  const feil = meta.error ? { feilmelding: meta.error } : undefined;

  const [valgtBuc, setValgtBuc] = useState('');
  const [valgtSed, setValgtSed] = useState('');

  const bucEndret = event => {
    const index = event.nativeEvent.target.selectedIndex;
    const valgtBucKode = event.nativeEvent.target[index].value;
    setValgtBuc(valgtBucKode);

    const bucObject = feltData.bucer[index - 1];
    setValgtSed(bucObject ? bucObject.forsteSed.kode : '');

    settSkjemaVerdi('buc', valgtBucKode);
  };

  const displayName = elem => `${elem.kode} - ${elem.term}`;

  return (
    <React.Fragment>
      <Nav.Select feil={feil} bredde="fullbredde" label="BUC" disabled={!redigerbart} onChange={bucEndret} value={valgtBuc}>
        <option />
        {feltData.bucer.map(({ buc }) => <option key={buc.kode} value={buc.kode}>{displayName(buc)}</option>)}
      </Nav.Select>
      <Nav.Select bredde="fullbredde" label="SED" value={valgtSed} disabled>
        <option />
        {feltData.bucer.map(({ forsteSed }) => <option key={forsteSed.kode} value={forsteSed.kode}>{displayName(forsteSed)}</option>)}
      </Nav.Select>
      { /*
      <Skjema.Select feltNavn="buc" bredde="fullbredde" label="BUC" disabled={!redigerbart} onChange={bucEndret} value={valgtBuc}>
        {feltData.bucer.map(({ buc }) => <option key={buc.kode} value={buc.kode}>{displayName(buc)}</option>)}
      </Skjema.Select>
      <Skjema.Select feltNavn="sed" bredde="fullbredde" label="SED" value={valgtSed} disabled>
        {
          feltData.bucer
            .flatMap(elem => elem.forsteSed)
            .map(elem => <option key={elem.kode} value={elem.kode}>{displayName(elem)}</option>)
        }
      </Skjema.Select>
      */ }
    </React.Fragment>
  );
};

const erSkjemaGyldig = verdier => {
  const verdiKopi = { ...verdier };
  const validering = sedBestillingValidering(verdiKopi);
  return Object.values(validering).every(enkeltValidering => enkeltValidering === false);
};


const SideDialogSedBestilling = ({
  redigerbart, hentDropdownData, /*settFeilFelt,*/ sedBestillingSkjemaVerdier, settSkjemaVerdi,
}) => {
  const [feltData, setFeltData] = useState(null); // TODO: Disse må lagres til en store, og ikke bli hentet hver gang.

  const hentOgSettFelt = async () => {
    const felt = await hentDropdownData();
    setFeltData(felt.data);
  };

  // Henter data for dropdowns ved lasting av komponenten
  useEffect(() => {
    hentOgSettFelt();
  }, []);

  const overstyrSubmit = event => {
    event.preventDefault();
  };

  const validerFelt = async () => {
    if (!erSkjemaGyldig(sedBestillingSkjemaVerdier)) {
      console.dir(sedBestillingSkjemaVerdier);
      // settFeilFelt('fagomrade', 'buc', 'sed', 'land', 'mottakerinstitusjon');
      return false;
    }

    return true;
  };

  const sendSed = async () => {
    console.log('sed sendt');
    if (!(await validerFelt())) {
      return false;
    }

    return true;
  };

  // TODO: states under skal skilles ut i egne komponenter
  // <LandOgMottakerinstitusjon />
  const [valgtLand, setValgtLand] = useState('');
  const [tilgjengeligeMottakerinstitusjoner, setTilgjengeligeMottakerinstitusjoner] = useState([]);

  const landEndret = event => {
    const index = event.nativeEvent.target.selectedIndex;
    const valgtLandKode = event.nativeEvent.target[index].value;
    setValgtLand(valgtLandKode);

    const landObject = feltData.land[index - 1];
    setTilgjengeligeMottakerinstitusjoner(landObject ? landObject.mottakerinstitusjoner : []);
  };

  return feltData && (
    <div className="sedbestilling">
      <form onSubmit={overstyrSubmit}>
        <Nav.Fieldset legend="Ny SED">
          <Skjema.Select feltNavn="fagomrade" bredde="fullbredde" label="Fagområde" disabled>
            {feltData.fagomrader.map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)}
          </Skjema.Select>
          { /* TODO: Buc og Sed i egen komponent */ }
          <Field name="buc" component={BucOgSed} feltData={feltData} settSkjemaVerdi={settSkjemaVerdi} redigerbart={redigerbart} />
          { /* TODO: Land og mottakerinstitusjoner i egen komponent */ }
          <Skjema.Select feltNavn="land" bredde="fullbredde" label="Land" disabled={!redigerbart} onChange={landEndret} value={valgtLand}>
            {feltData.land.map(({ land }) => <option key={land.kode} value={land.kode}>{land.term}</option>)}
          </Skjema.Select>
          <Skjema.Select feltNavn="mottakerinstitusjon" bredde="fullbredde" label="Mottaker institusjon" disabled={!redigerbart}>
            {
              tilgjengeligeMottakerinstitusjoner &&
                tilgjengeligeMottakerinstitusjoner.map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)
            }
          </Skjema.Select>
          <Nav.Hovedknapp htmlType="submit" disabled={!redigerbart} onClick={sendSed}>Opprett sed i rina</Nav.Hovedknapp>&nbsp;
          { /* TODO: Bug: Reset resetter også fagområde (sjekk brevBestilling) */ }
          <Nav.Knapp htmlType="reset" type="standard" disabled={!redigerbart} onClick={() => {}}>Avbryt utfylling</Nav.Knapp>
          { /* TODO: infoboks med lenke til sak i rina */
            false && <Nav.AlertStripe type="suksess" className="varsel">Saken er nå opprettet i RINA [link]</Nav.AlertStripe> }
          { /* TODO: alert-boks dersom sak ikke blir opprettet */
            false && <Nav.AlertStripe type="advarsel" className="varsel">{this.state.feilmelding}</Nav.AlertStripe> }
        </Nav.Fieldset>
      </form>
    </div>
  );
};

SideDialogSedBestilling.propTypes = {
  redigerbart: PT.bool.isRequired,
  hentDropdownData: PT.func.isRequired,
  // settFeilFelt: PT.func.isRequired,
  sedBestillingSkjemaVerdier: PT.object,
  settSkjemaVerdi: PT.func.isRequired,
};

SideDialogSedBestilling.defaultProps = {
  sedBestillingSkjemaVerdier: {},
};

/* SedBestillingForm.propTypes = {
  redigerbart: PT.bool.isRequired,
  data: PT.object.isRequired,
  settFeilFelt: PT.func.isRequired,
}; */

const form = {
  form: KV.Form.SED_BESTILLING,
  enableReinitialize: true,
  destroyOnUnmount: false,
  updateUnregisteredFields: true,
  validate: sedBestillingValidering,
  onSubmit: () => {},
};

const mapStateToProps = state => ({
  sedBestillingSkjemaVerdier: formSelectors.SedBestillingFormSelector(state).values,
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
  initialValues: {
    fagomrade: 'MEDLEMSKAP',
    buc: '',
    sed: '',
    land: '',
    mottakerinstitusjon: '',
  },
});

const mapDispatchToProps = dispatch => ({
  // settFeilFelt: (...feltNavn) => dispatch(setSubmitFailed(KV.Form.SED_BESTILLING, ...feltNavn)),
  // settIngenFeilFelt: (...feltNavn) => dispatch(set(KV.Form.SED_BESTILLING, ...feltNavn)),
  hentBucinformasjon: () => dispatch(sedOperations.hentBucinformasjon()),
  oppdaterBucinfo: bucinfo => dispatch(sedOperations.oppdaterBucinfo(bucinfo)),
  settSkjemaVerdi: (felt, verdi) => dispatch(change(KV.Form.SED_BESTILLING, felt, verdi)),
});

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(SideDialogSedBestilling));
