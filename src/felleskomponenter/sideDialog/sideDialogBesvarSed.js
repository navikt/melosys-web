import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import * as EKV from 'eessi-kodeverk';

import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';
import * as Utils from '../../utils';
import * as Api from '../../services/api';
import './sideDialogBesvarSed.css';

// Per i dag finnes det bare status=UTKAST, men legger til rette for støtte av flere statuser.
const StatusEtikett = ({ status }) => (
  status.toUpperCase() === KV.Koder.SedStatus.UTKAST &&
    <Nav.EtikettBase type="fokus">Utkast</Nav.EtikettBase>
);

StatusEtikett.propTypes = {
  status: PT.string.isRequired,
};

const sedTypeTerm = sedType => EKV.Terms.sedtyper[sedType];

const EnkeltSed = ({ sed }) => (
  <Nav.LenkepanelBase href={sed.rinaUrl} target="_blank" border>
    <div className="kolonne__navn">
      <Nav.Element className="lenkepanel__heading">{sed.sedType} - {sedTypeTerm(sed.sedType)}</Nav.Element>
      <Nav.Normaltekst>Opprettet: {Utils.dato.formatterDatoTilNorsk(sed.opprettetDato)}</Nav.Normaltekst>
    </div>
    <div className="kolonne__status">
      <StatusEtikett status={sed.status} />
    </div>
  </Nav.LenkepanelBase>
);

EnkeltSed.propTypes = {
  sed: PT.shape({
    sedID: PT.string.isRequired,
    rinaUrl: PT.string.isRequired,
    sedType: PT.string.isRequired,
    opprettetDato: PT.string.isRequired,
    status: PT.string.isRequired,
  }).isRequired,
};

const bucTypeTerm = bucType => EKV.Selectors.alleBucer[bucType];

const EnkeltBucHeading = ({ bucType, opprettetDato }) => (
  <div>
    <Nav.Undertittel>{bucType} - {bucTypeTerm(bucType)}</Nav.Undertittel>
    <Nav.Normaltekst>Opprettet: {Utils.dato.formatterDatoTilNorsk(opprettetDato)}</Nav.Normaltekst>
  </div>
);

EnkeltBucHeading.propTypes = {
  bucType: PT.string.isRequired,
  opprettetDato: PT.string.isRequired,
};

const EnkeltBuc = ({ buc }) => (
  <Nav.EkspanderbartpanelBase border heading={<EnkeltBucHeading {...buc} />}>
    <div className="buc_tabell">
      <Nav.Element className="tabell_header kolonne__navn">Navn på SED</Nav.Element>
      <Nav.Element className="tabell_header kolonne__status">Status</Nav.Element>
      { buc.seder.map(sed => <EnkeltSed key={sed.sedId} sed={sed} />) }
    </div>
  </Nav.EkspanderbartpanelBase>
);

EnkeltBuc.propTypes = {
  buc: PT.shape({
    bucType: PT.string.isRequired,
    opprettetDato: PT.string.isRequired,
    seder: PT.arrayOf(EnkeltSed.propTypes.sed).isRequired,
  }).isRequired,
};

const HenterOpplysningerSpinner = () => (
  <div className="henter_opplysninger">
    <Nav.NavFrontendSpinner />
    <Nav.Normaltekst>Henter BUCer under arbeid</Nav.Normaltekst>
  </div>
);

const SideDialogBesvarSed = ({ behandlingID }) => {
  const [bucer, setBucer] = useState([]);
  const [feilmelding, setFeilmelding] = useState('');
  const [henterData, setHenterData] = useState(true);

  const hentBucUnderArbeid = async () => {
    if (behandlingID !== -1 && bucer.length === 0) {
      try {
        setHenterData(true);
        const data = await Api.Eessi.bucer.hentBucerForBehandling(behandlingID);
        setBucer(data.bucer);
        setHenterData(false);
      } catch (e) {
        setHenterData(false);
        Utils.logger.error(e);
        setFeilmelding('Kunne ikke hente BUCer under arbeid');
      }
    }
  };

  useEffect(() => {
    hentBucUnderArbeid();
  }, []);

  const kanViseListe = liste => !henterData && !feilmelding && liste && liste.length > 0;

  const getKomponent = () => {
    if (kanViseListe(bucer)) {
      return bucer.map(buc => <EnkeltBuc key={buc.bucID} buc={buc} />);
    } else if (henterData) {
      return <HenterOpplysningerSpinner />;
    }

    return (
      <Nav.AlertStripe type="advarsel" className="varsel">{feilmelding || 'For øyeblikket ingen BUCer under arbeid'}</Nav.AlertStripe>
    );
  };

  return <div className="besvar_sed">{ getKomponent() }</div>;
};

SideDialogBesvarSed.propTypes = {
  behandlingID: PT.number.isRequired,
};

export default SideDialogBesvarSed;
