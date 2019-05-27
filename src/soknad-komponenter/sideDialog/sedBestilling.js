import React, { useState, useEffect } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

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
import LandVelger from '../skjema/landvelger';
import { kodeTilTerm, kodeTilObjekt } from '../../kodeverk';

const bucinfoOLD = [
  {
    buc: 'LA_BUC_01',
    forsteSed: 'A001',
    fagomrade: 'HORISONTAL',
  },
  {
    buc: 'LA_BUC_02',
    forsteSed: 'A003',
    fagomrade: 'LOVVALG',
  },
  {
    buc: 'LA_BUC_03',
    forsteSed: 'A008',
    fagomrade: 'LOVVALG',
  },
  {
    buc: 'LA_BUC_04',
    forsteSed: 'A009',
    fagomrade: 'LOVVALG',
  },
  {
    buc: 'LA_BUC_05',
    forsteSed: 'A010',
    fagomrade: 'LOVVALG',
  },
  {
    buc: 'LA_BUC_06',
    forsteSed: 'A005',
    fagomrade: 'LOVVALG',
  },
];

const harBlankMelding = (verdi, melding = 'Velg et element i nedtrekkslisten') => ((verdi === '') ? melding : false);

const sedBestillingValidering = verdier => ({
  // fagomrade: (harBlankMelding(verdier.fagomrade) || false),
  buc: (harBlankMelding(verdier.buc) || false),
  // sed: (harBlankMelding(verdier.sed, 'Velg en BUC for å sette SED') || false),
  land: (harBlankMelding(verdier.land) || false),
  mottakerinstitusjon: (harBlankMelding(verdier.mottakerinstitusjon) || false),
});

const erSkjemaGyldig = verdier => {
  const verdiKopi = { ...verdier };
  const validering = sedBestillingValidering(verdiKopi);
  return Object.values(validering)
    .every(enkeltValidering => enkeltValidering === false);
};

const BucOgSed = ({
  feltData, redigerbart, meta, settSkjemaVerdi,
}) => {
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
      */}
    </React.Fragment>
  );
};

const SideDialogSedBestilling = ({
  redigerbart, bucinfo, mottakerinstitusjoner, hentMottakerinstitusjoner, hentBucSedRelasjoner, oppdaterBucSedRelasjoner, oppdaterMottakerinstitusjoner, settSkjemaVerdi,
}) => {
  const hentOgLagreBucinformasjon = async () => {
    const rel = await hentBucSedRelasjoner();
    oppdaterBucSedRelasjoner(rel.data);
  };

  useEffect(() => {
    hentOgLagreBucinformasjon();
  }, []);

  const hentOgLagreMottakerinstitusjoner = async bucType => {
    if (bucType) {
      const institusjoner = await hentMottakerinstitusjoner(bucType);
      oppdaterMottakerinstitusjoner(institusjoner.data);
    }
  };

  const [valgtFagomrade, setValgtFagomrade] = useState(MKV.Koder.sed.fagomrader.LOVVALG);
  const [valgtBuc, setValgtBuc] = useState('');
  const [valgtSed, setValgtSed] = useState('');
  const [valgtLand, setValgtLand] = useState('');
  const [valgtMottakerinstitusjon, setValgtMottakerinstitusjon] = useState('');

  const overstyrSubmit = event => {
    event.preventDefault();
  };

  /* const validerFelt = async () => {
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
  }; */
  const sendSed = () => {
    console.dir({
      fagomrade: valgtFagomrade,
      buc: valgtBuc,
      sed: valgtSed,
      land: valgtLand,
      mottakerinstitusjon: valgtMottakerinstitusjon,
    });
  };

  const resetFelter = () => {
    setValgtFagomrade(MKV.Koder.sed.fagomrader.LOVVALG);
    setValgtBuc('');
    setValgtSed('');
    setValgtLand('');
    setValgtMottakerinstitusjon('');
  };

  const hentValgtKode = event => event.nativeEvent.target[event.nativeEvent.target.selectedIndex].value;

  const fagomradeSelector = relasjon => Array.from(new Set(relasjon.map(rel => rel.fagomrade)))
    .map(kode => kodeTilObjekt(kode, MKV.KTObjects.sed.fagomrader));

  const bucSelector = (fagomrade, relasjon) => relasjon.filter(rel => rel.fagomrade === fagomrade).map(rel => rel.buc)
    .map(kode => kodeTilObjekt(kode, MKV.KTObjects.sed.bucer));

  const sedSelector = (buc, relasjon) => relasjon.filter(rel => rel.buc === buc).map(rel => rel.forsteSed)
    .map(kode => kodeTilObjekt(kode, MKV.KTObjects.sed.seder));

  const tilgjengeligeMottakerinstitusjoner = land => (land ? mottakerinstitusjoner.filter(institusjon => institusjon.landkode === land) : []);

  const fagomradeEndret = event => {
    const fagomrade = hentValgtKode(event);
    setValgtFagomrade(fagomrade);
    settSkjemaVerdi('fagomrade', fagomrade);
  };

  const bucEndret = event => {
    const buc = hentValgtKode(event);
    setValgtBuc(buc);
    settSkjemaVerdi('buc', buc);

    setValgtSed(buc ? sedSelector(buc, bucinfo)[0].kode : '');

    hentOgLagreMottakerinstitusjoner(buc);
  };

  const landEndret = event => {
    const land = hentValgtKode(event);
    setValgtLand(land);
    settSkjemaVerdi('land', land);
  };

  const mottakerinstitusjonEndret = event => {
    const institusjon = hentValgtKode(event);
    setValgtMottakerinstitusjon(institusjon);
    settSkjemaVerdi('mottakerinstitusjon', institusjon);
  };

  const displayName = elem => `${elem.kode} - ${elem.term}`;

  return bucinfo && (
    <div className="sedbestilling">
      <form onSubmit={overstyrSubmit}>
        <Nav.Fieldset legend="Ny SED">
          <Nav.Select bredde="fullbredde" label="Fagområde" onChange={fagomradeEndret} value={valgtFagomrade} disabled >
            <option />
            {fagomradeSelector(bucinfo).map(fagomrade => <option key={fagomrade.kode} value={fagomrade.kode}>{fagomrade.term}</option>)}
          </Nav.Select>
          <Skjema.Select bredde="fullbredde" feltNavn="buc" label="BUC" disabled={!redigerbart} onChange={bucEndret} value={valgtBuc}>
            { bucSelector(valgtFagomrade, bucinfo).map(buc => <option key={buc.kode} value={buc.kode}>{displayName(buc)}</option>) }
          </Skjema.Select>
          <Nav.Select bredde="fullbredde" label="SED" value={valgtSed} disabled>
            <option />
            { sedSelector(valgtBuc, bucinfo).map(forsteSed => <option key={forsteSed.kode} value={forsteSed.kode}>{displayName(forsteSed)}</option>)}
          </Nav.Select>
          <Skjema.Select bredde="fullbredde" feltNavn="land" label="Land" disabled={!redigerbart} onChange={landEndret}>
            {MKV.KTObjects.landkoder.map(item => (<option key={item.kode} value={item.kode}>{`${item.term} (${item.kode})`}</option>))}
          </Skjema.Select>
          <Skjema.Select bredde="fullbredde" feltNavn="mottakerinstitusjon" label="Mottaker institusjon" disabled={!redigerbart} onChange={mottakerinstitusjonEndret} >
            { tilgjengeligeMottakerinstitusjoner(valgtLand).map(elem => <option key={elem.id} value={elem.id}>{elem.navn}</option>) }
          </Skjema.Select>
          <Nav.Hovedknapp htmlType="submit" disabled={!redigerbart} onClick={sendSed}>Opprett sed i rina</Nav.Hovedknapp>&nbsp;
          { /* TODO: Bug: Reset resetter også fagområde (sjekk brevBestilling) */}
          <Nav.Knapp htmlType="reset" type="standard" disabled={!redigerbart} onClick={resetFelter}>Avbryt utfylling</Nav.Knapp>
          { /* TODO: infoboks med lenke til sak i rina */
            false && <Nav.AlertStripe type="suksess" className="varsel">Saken er nå opprettet i RINA [link]</Nav.AlertStripe>}
          { /* TODO: alert-boks dersom sak ikke blir opprettet */
            false && <Nav.AlertStripe type="advarsel" className="varsel">{this.state.feilmelding}</Nav.AlertStripe>}
        </Nav.Fieldset>
      </form>
    </div>
  );
};

/*
const EnkelLandVelger = ({ redigerbart, landEndret }) => (
  <Nav.Select bredde="fullbredde" label="Land" disabled={!redigerbart} onChange={landEndret}>
    {MKV.KTObjects.landkoder.map(item => (<option key={item.kode} value={item.kode}>{`${item.term} (${item.kode})`}</option>))}
  </Nav.Select>
);
*/
/*
const TomtValg = ({ tekst = 'Velg...' }) => (
  <option value="">{tekst}</option>
);
*/

SideDialogSedBestilling.propTypes = {
  redigerbart: PT.bool.isRequired,
  bucinfo: PT.array.isRequired,
  mottakerinstitusjoner: PT.array.isRequired,
  hentMottakerinstitusjoner: PT.func.isRequired,
  oppdaterBucSedRelasjoner: PT.func.isRequired,
  oppdaterMottakerinstitusjoner: PT.func.isRequired,
  //
  sedBestillingSkjemaVerdier: PT.object,
  settSkjemaVerdi: PT.func.isRequired,
};

SideDialogSedBestilling.defaultProps = {
  sedBestillingSkjemaVerdier: {},
};

const form = {
  form: KV.Form.SED_BESTILLING,
  enableReinitialize: true,
  destroyOnUnmount: false,
  updateUnregisteredFields: true,
  validate: sedBestillingValidering,
  onSubmit: () => {},
};

const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  bucinfo: sedSelectors.BucSedRelasjonSelector(state),
  mottakerinstitusjoner: sedSelectors.MottakerinstitusjonerSelector(state),
  sedBestillingSkjemaVerdier: formSelectors.SedBestillingFormSelector(state).values,
  initialValues: {
    buc: '',
    land: '',
    mottakerinstitusjon: '',
  },
});

const mapDispatchToProps = dispatch => ({
  // settFeilFelt: (...feltNavn) => dispatch(setSubmitFailed(KV.Form.SED_BESTILLING, ...feltNavn)),
  // settIngenFeilFelt: (...feltNavn) => dispatch(set(KV.Form.SED_BESTILLING, ...feltNavn)),
  hentBucSedRelasjoner: () => dispatch(sedOperations.hentBucSedRelasjoner()),
  hentMottakerinstitusjoner: bucType => dispatch(sedOperations.hentMottakerinstitusjoner(bucType)),
  oppdaterBucSedRelasjoner: relasjoner => dispatch(sedOperations.oppdaterBucSedRelasjoner(relasjoner)),
  oppdaterMottakerinstitusjoner: institusjoner => dispatch(sedOperations.oppdaterMottakerinstitusjoner(institusjoner)),
  settSkjemaVerdi: (felt, verdi) => dispatch(change(KV.Form.SED_BESTILLING, felt, verdi)),
});

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(SideDialogSedBestilling));
// export default connect(mapStateToProps, mapDispatchToProps)(SideDialogSedBestilling);
