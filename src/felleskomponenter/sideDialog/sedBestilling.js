import React, { useState } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../utils/navFrontend';
import * as Api from '../../services/api';
import * as Utils from '../../utils';
import { lagYupToReduxformErrorMapper } from '../skjema/validering/skjemaer/lagYupToReduxformErrorMapper';
import { sed as sedSchema } from '../skjema/validering/skjemaer/sed';
import { EessiKodeverkSelectors } from '../../ducks/eessikodeverk';
import './sedBestilling.css';

const TomtFelt = ({ redigerbart, tekst }) => (
  <option value="" disabled={!redigerbart}>{tekst}</option>
);

TomtFelt.propTypes = {
  redigerbart: PT.bool.isRequired,
  tekst: PT.string,
};

TomtFelt.defaultProps = {
  tekst: 'Velg...',
};

const SideDialogSedBestilling = ({ redigerbart, behandlingID, kodeverk }) => {
  const [mottakerinstitusjoner, setMottakerinstitusjoner] = useState([]);

  const [valgtFagomrade, setValgtFagomrade] = useState(kodeverk.fagomradeLovvalg.kode);
  const [valgtBuc, setValgtBuc] = useState('');
  const [valgtSed, setValgtSed] = useState('');
  const [valgtLand, setValgtLand] = useState('');
  const [valgtMottakerinstitusjon, setValgtMottakerinstitusjon] = useState('');

  const [opprettetBucUrl, setOpprettetBucUrl] = useState('');
  const [bucOpprettet, setBucOpprettet] = useState(false);
  const [oppretterBuc, setOppretterBuc] = useState(false);
  const [feilmeldinger, setFeilmeldinger] = useState({ buc: undefined, land: undefined, mottakerinstitusjon: undefined });
  const [oppdaterteFelt, setOppdaterteFelt] = useState({ buc: false, land: false, mottakerinstitusjon: false });
  const [alertmelding, setAlertmelding] = useState('');

  const hentMottakerinstitusjoner = async bucType => {
    if (bucType) {
      try {
        const institusjoner = await Api.Eessi.mottakerinstitusjoner.hent(bucType);
        setMottakerinstitusjoner(institusjoner);
      } catch (e) {
        Utils.logger.error(e);
        setAlertmelding('Finner ingen mottakerinstitusjoner');
      }
    }
  };

  const overstyrSubmit = event => {
    event.preventDefault();
  };

  const resetForm = () => {
    setValgtFagomrade(kodeverk.fagomradeLovvalg.kode);
    setValgtBuc('');
    setValgtSed('');
    setValgtLand('');
    setValgtMottakerinstitusjon('');
    setFeilmeldinger({ buc: undefined, land: undefined, mottakerinstitusjon: undefined });
    setOppdaterteFelt({ buc: false, land: false, mottakerinstitusjon: false });
  };

  const resetState = () => {
    setBucOpprettet(false);
    setOppretterBuc(false);
    setOpprettetBucUrl('');
    setAlertmelding('');
  };

  const resetKomponent = () => {
    resetForm();
    resetState();
  };

  const erValidert = () => sedSchema.isValidSync({
    buc: valgtBuc,
    land: valgtLand,
    mottakerinstitusjon: valgtMottakerinstitusjon,
  });

  const valider = ({ buc = valgtBuc, land = valgtLand, mottakerinstitusjon = valgtMottakerinstitusjon }) =>
    setFeilmeldinger(lagYupToReduxformErrorMapper(sedSchema)({ buc, land, mottakerinstitusjon }));

  const sendSed = async () => {
    if (erValidert()) {
      try {
        setOppretterBuc(true);
        const sedResponse = await Api.Eessi.bucer.opprett(behandlingID, {
          bucType: valgtBuc,
          mottakerLand: valgtLand,
          mottakerId: valgtMottakerinstitusjon,
        });

        setBucOpprettet(true);
        if (sedResponse) {
          setOpprettetBucUrl(sedResponse);
          setAlertmelding('');
          resetForm();
        }
      } catch (e) {
        Utils.logger.error(e);
        setAlertmelding('Saken kunne ikke opprettes i RINA');
      }
    } else {
      setOppdaterteFelt({ buc: true, land: true, mottakerinstitusjon: true });
      valider({});
    }

    setOppretterBuc(false);
  };

  const tilgjengeligeMottakerinstitusjoner = land => (land ? mottakerinstitusjoner.filter(institusjon => institusjon.landkode === land) : []);

  const hentValgtKode = event => event.target.value;

  const oppdaterFelt = felt => {
    const prevState = { ...oppdaterteFelt };
    prevState[felt] = true;
    setOppdaterteFelt(prevState);
  };

  const fagomradeEndret = event => {
    const fagomrade = hentValgtKode(event);
    setValgtFagomrade(fagomrade);
  };

  const bucEndret = event => {
    const buc = hentValgtKode(event);
    setValgtBuc(buc);
    oppdaterFelt('buc');
    valider({ buc });

    setValgtSed(buc ? kodeverk.tilgjengeligeSeder(buc, valgtFagomrade)[0].kode : '');
    hentMottakerinstitusjoner(buc);
  };

  const landEndret = event => {
    const land = hentValgtKode(event);
    setValgtLand(land);
    oppdaterFelt('land');
    valider({ land });
  };

  const mottakerinstitusjonEndret = event => {
    const mottakerinstitusjon = hentValgtKode(event);
    setValgtMottakerinstitusjon(mottakerinstitusjon);
    oppdaterFelt('mottakerinstitusjon');
    valider({ mottakerinstitusjon });
  };

  const displayName = elem => `${elem.kode} - ${elem.term}`;

  const feil = felt => (oppdaterteFelt[felt] ? feilmeldinger[felt] : undefined);

  return (
    <div className="sedbestilling">
      <form onSubmit={overstyrSubmit}>
        <Nav.Fieldset legend="">
          <Nav.Select bredde="fullbredde" label="Fagområde" onChange={fagomradeEndret} value={valgtFagomrade} disabled >
            <TomtFelt redigerbart={redigerbart} />
            { kodeverk.tilgjengeligeFagomrader.map(fagomrade => <option key={fagomrade.kode} value={fagomrade.kode}>{fagomrade.term}</option>) }
          </Nav.Select>
          <Nav.Select bredde="fullbredde" label="BUC" disabled={!redigerbart} onChange={bucEndret} value={valgtBuc} feil={feil('buc')}>
            <TomtFelt redigerbart={redigerbart} />
            { kodeverk.tilgjengeligeBucer(valgtFagomrade).map(buc => <option key={buc.kode} value={buc.kode}>{displayName(buc)}</option>) }
          </Nav.Select>
          <Nav.Select bredde="fullbredde" label="SED" value={valgtSed} disabled>
            <TomtFelt redigerbart={redigerbart} tekst="" />
            { kodeverk.tilgjengeligeSeder(valgtBuc, valgtFagomrade).map(forsteSed => <option key={forsteSed.kode} value={forsteSed.kode}>{displayName(forsteSed)}</option>) }
          </Nav.Select>
          <Nav.Select bredde="fullbredde" label="Land" disabled={!redigerbart} onChange={landEndret} value={valgtLand} feil={feil('land')}>
            <TomtFelt redigerbart={redigerbart} />
            {MKV.KTObjects.landkoder.map(item => (<option key={item.kode} value={item.kode}>{`${item.term} (${item.kode})`}</option>))}
          </Nav.Select>
          <Nav.Select bredde="fullbredde" label="Mottaker institusjon" disabled={!redigerbart} onChange={mottakerinstitusjonEndret} value={valgtMottakerinstitusjon} feil={feil('mottakerinstitusjon')}>
            <TomtFelt redigerbart={redigerbart} />
            { tilgjengeligeMottakerinstitusjoner(valgtLand).map(elem => <option key={elem.id} value={elem.id}>{elem.navn}</option>) }
          </Nav.Select>
          <Nav.Hovedknapp spinner={oppretterBuc} htmlType="submit" disabled={!redigerbart} onClick={sendSed}>Opprett BUC</Nav.Hovedknapp>&nbsp;
          <Nav.Knapp type="standard" disabled={!redigerbart} onClick={resetKomponent}>Avbryt utfylling</Nav.Knapp>
        </Nav.Fieldset>
        {(opprettetBucUrl && bucOpprettet) &&
          <Nav.AlertStripe type="suksess" className="varsel">
            Saken er nå opprettet i RINA <Nav.Lenker href={opprettetBucUrl} target="_blank">{opprettetBucUrl}</Nav.Lenker>
          </Nav.AlertStripe>}
        {alertmelding &&
          <Nav.AlertStripe type="advarsel" className="varsel">{alertmelding}</Nav.AlertStripe>}
      </form>
    </div>
  );
};

SideDialogSedBestilling.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  kodeverk: PT.object.isRequired,
};

const mapStateToProps = state => ({
  kodeverk: {
    fagomradeLovvalg: EessiKodeverkSelectors.sektorSelector(state).filter(el => el.kode === 'LA')[0],
    tilgjengeligeFagomrader: EessiKodeverkSelectors.sektorSelector(state),
    tilgjengeligeBucer: fagomrade => EessiKodeverkSelectors.alleBUCtyperSelector(state)[EessiKodeverkSelectors.kodemapsSelector(state).SEKTOR2BUC[fagomrade]],
    tilgjengeligeSeder: (buc, fagomrade) => (
      (buc && fagomrade)
        ? EessiKodeverkSelectors.alleSEDtyperSelector(state)
          .filter(el => EessiKodeverkSelectors.kodemapsSelector(state).BUC2SEDS[fagomrade][buc].includes(el.kode))
        : []
    ),
  },
});

export default connect(mapStateToProps)(SideDialogSedBestilling);
