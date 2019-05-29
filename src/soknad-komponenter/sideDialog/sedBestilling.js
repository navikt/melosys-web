import React, { useState, useEffect } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import { connect } from 'react-redux';
import { reduxForm, change, setSubmitFailed, reset, stopSubmit, isValid, isDirty } from 'redux-form';

import * as KV from '../../kodeverk';
import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema';
import { createValidator } from '../skjema/validering/skjemaer/createValidator';
import { sed as sedValidering } from '../skjema/validering/skjemaer/sed';

import { behandlingerSelectors } from '../../ducks/behandlinger';
import { sedOperations, sedSelectors, sedTypes } from '../../ducks/sed';
import './sedBestilling.css';
import { formSelectors } from '../../ducks/form';

const SideDialogSedBestilling = ({
  redigerbart,
  behandlingID,
  bucSedRelasjoner,
  mottakerinstitusjoner,
  hentMottakerinstitusjoner,
  hentBucSedRelasjoner,
  oppdaterBucSedRelasjoner,
  oppdaterMottakerinstitusjoner,
  bestillSed,
  settSkjemaVerdi,
  resetSedBestillingForm,
  resetValidering,
  erValidert,
  settFeilFelt,
}) => {
  const hentOgLagreBucSedRelasjoner = async () => {
    if (bucSedRelasjoner.length === 0) {
      const rel = await hentBucSedRelasjoner();

      if (rel && rel.type === sedTypes.OK) {
        oppdaterBucSedRelasjoner(rel.data);
      }
    }
  };

  useEffect(() => {
    hentOgLagreBucSedRelasjoner();
  }, []);

  const hentOgLagreMottakerinstitusjoner = async bucType => {
    if (bucType) {
      const institusjoner = await hentMottakerinstitusjoner(bucType);

      if (institusjoner) {
        oppdaterMottakerinstitusjoner(institusjoner.data);
      }
    }
  };

  const [valgtFagomrade, setValgtFagomrade] = useState(MKV.Koder.sed.fagomrader.LOVVALG);
  const [valgtBuc, setValgtBuc] = useState('');
  const [valgtSed, setValgtSed] = useState('');
  const [valgtLand, setValgtLand] = useState('');
  const [valgtMottakerinstitusjon, setValgtMottakerinstitusjon] = useState('');

  const [opprettetSedUrl, setOpprettetSedUrl] = useState('');
  const [sedSendt, setSedSendt] = useState(false);

  const overstyrSubmit = event => {
    event.preventDefault();
  };

  const resetForm = () => {
    resetSedBestillingForm();

    setValgtFagomrade(MKV.Koder.sed.fagomrader.LOVVALG);
    setValgtBuc('');
    setValgtSed('');
    setValgtLand('');
    setValgtMottakerinstitusjon('');

    resetValidering();
  };

  const resetState = () => {
    setSedSendt(false);
    setOpprettetSedUrl('');
  };

  const resetKomponent = () => {
    resetForm();
    resetState();
  };

  const sendSed = async () => {
    if (erValidert()) {
      const sedResponse = await bestillSed(behandlingID, {
        bucType: valgtBuc,
        mottakerLand: valgtLand,
        mottakerId: valgtMottakerinstitusjon,
      });

      setSedSendt(true);
      if (sedResponse && sedResponse.type === sedTypes.OK) {
        setOpprettetSedUrl(sedResponse.data);
        resetForm();
      }
    } else {
      settFeilFelt('buc', 'land', 'mottakerinstitusjon');
    }
  };

  const hentValgtKode = event => event.nativeEvent.target[event.nativeEvent.target.selectedIndex].value;

  const fagomradeSelector = relasjon => Array.from(new Set(relasjon.map(rel => rel.fagomrade)))
    .map(kode => KV.kodeTilObjekt(kode, MKV.KTObjects.sed.fagomrader));

  const bucSelector = (fagomrade, relasjon) => relasjon.filter(rel => rel.fagomrade === fagomrade).map(rel => rel.buc)
    .map(kode => KV.kodeTilObjekt(kode, MKV.KTObjects.sed.bucer));

  const sedSelector = (buc, relasjon) => relasjon.filter(rel => rel.buc === buc).map(rel => rel.forsteSed)
    .map(kode => KV.kodeTilObjekt(kode, MKV.KTObjects.sed.seder));

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

    setValgtSed(buc ? sedSelector(buc, bucSedRelasjoner)[0].kode : '');

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

  return bucSedRelasjoner && (
    <div className="sedbestilling">
      <form onSubmit={overstyrSubmit}>
        <Nav.Fieldset legend="Ny SED">
          <Nav.Select bredde="fullbredde" label="Fagområde" onChange={fagomradeEndret} value={valgtFagomrade} disabled >
            <option />
            {fagomradeSelector(bucSedRelasjoner).map(fagomrade => <option key={fagomrade.kode} value={fagomrade.kode}>{fagomrade.term}</option>)}
          </Nav.Select>
          <Skjema.Select bredde="fullbredde" feltNavn="buc" label="BUC" disabled={!redigerbart} onChange={bucEndret} value={valgtBuc}>
            { bucSelector(valgtFagomrade, bucSedRelasjoner).map(buc => <option key={buc.kode} value={buc.kode}>{displayName(buc)}</option>) }
          </Skjema.Select>
          <Nav.Select bredde="fullbredde" label="SED" value={valgtSed} disabled>
            <option />
            { sedSelector(valgtBuc, bucSedRelasjoner).map(forsteSed => <option key={forsteSed.kode} value={forsteSed.kode}>{displayName(forsteSed)}</option>)}
          </Nav.Select>
          <Skjema.Select bredde="fullbredde" feltNavn="land" label="Land" disabled={!redigerbart} onChange={landEndret}>
            {MKV.KTObjects.landkoder.map(item => (<option key={item.kode} value={item.kode}>{`${item.term} (${item.kode})`}</option>))}
          </Skjema.Select>
          <Skjema.Select bredde="fullbredde" feltNavn="mottakerinstitusjon" label="Mottaker institusjon" disabled={!redigerbart} onChange={mottakerinstitusjonEndret}>
            { tilgjengeligeMottakerinstitusjoner(valgtLand).map(elem => <option key={elem.id} value={elem.id}>{elem.navn}</option>) }
          </Skjema.Select>
          <Nav.Hovedknapp htmlType="submit" disabled={!redigerbart} onClick={sendSed}>Opprett sed i rina</Nav.Hovedknapp>&nbsp;
          <Nav.Knapp type="standard" disabled={!redigerbart} onClick={resetKomponent}>Avbryt utfylling</Nav.Knapp>
          {(opprettetSedUrl && sedSendt) &&
            <Nav.AlertStripe type="suksess" className="varsel">
              Saken er nå opprettet i RINA <Nav.Lenker href={opprettetSedUrl}>{opprettetSedUrl}</Nav.Lenker>
            </Nav.AlertStripe>}
          {(!opprettetSedUrl && sedSendt) &&
            <Nav.AlertStripe type="advarsel" className="varsel">Saken kunne ikke opprettes i RINA</Nav.AlertStripe>}
        </Nav.Fieldset>
      </form>
    </div>
  );
};

SideDialogSedBestilling.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  bucSedRelasjoner: PT.array.isRequired,
  mottakerinstitusjoner: PT.array.isRequired,
  hentMottakerinstitusjoner: PT.func.isRequired,
  oppdaterBucSedRelasjoner: PT.func.isRequired,
  oppdaterMottakerinstitusjoner: PT.func.isRequired,
  bestillSed: PT.func.isRequired,
  erValidert: PT.func.isRequired,
  settFeilFelt: PT.func.isRequired,
  resetSedBestillingForm: PT.func.isRequired,
  sedBestillingSkjemaVerdier: PT.object,
  settSkjemaVerdi: PT.func.isRequired,
  resetValidering: PT.func.isRequired,
};

SideDialogSedBestilling.defaultProps = {
  sedBestillingSkjemaVerdier: {},
};

const form = {
  form: KV.Form.SED_BESTILLING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: createValidator(sedValidering),
  onSubmit: () => {},
};

const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  bucSedRelasjoner: sedSelectors.BucSedRelasjonSelector(state),
  mottakerinstitusjoner: sedSelectors.MottakerinstitusjonerSelector(state),
  sedBestillingSkjemaVerdier: formSelectors.SedBestillingFormSelector(state).values,
  erValidert: () => isValid(KV.Form.SED_BESTILLING)(state) && isDirty(KV.Form.SED_BESTILLING)(state),
  initialValues: {
    buc: '',
    land: '',
    mottakerinstitusjon: '',
  },
});

const mapDispatchToProps = dispatch => ({
  hentBucSedRelasjoner: () => dispatch(sedOperations.hentBucSedRelasjoner()),
  hentMottakerinstitusjoner: bucType => dispatch(sedOperations.hentMottakerinstitusjoner(bucType)),
  oppdaterBucSedRelasjoner: relasjoner => dispatch(sedOperations.oppdaterBucSedRelasjoner(relasjoner)),
  oppdaterMottakerinstitusjoner: institusjoner => dispatch(sedOperations.oppdaterMottakerinstitusjoner(institusjoner)),
  bestillSed: (behandlingID, data) => dispatch(sedOperations.opprettBuc(behandlingID, data)),
  settFeilFelt: (...feltNavn) => dispatch(setSubmitFailed(KV.Form.SED_BESTILLING, ...feltNavn)),
  resetSedBestillingForm: () => dispatch(reset(KV.Form.SED_BESTILLING)),
  resetValidering: () => dispatch(stopSubmit(KV.Form.SED_BESTILLING, {})),
  settSkjemaVerdi: (felt, verdi) => dispatch(change(KV.Form.SED_BESTILLING, felt, verdi)),
});

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(SideDialogSedBestilling));
