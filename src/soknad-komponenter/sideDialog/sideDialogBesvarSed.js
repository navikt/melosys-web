import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';
import * as Utils from '../../utils';
import * as Api from '../../services/api';
import { EessiKodeverkSelectors } from '../../ducks/eessikodeverk';
import './sideDialogBesvarSed.css';

// Per i dag finnes det bare status=UTKAST, men legger til rette for støtte av flere statuser.
const StatusEtikett = ({ status }) => (
  status.toUpperCase() === KV.Koder.SedStatus.UTKAST &&
    <Nav.EtikettBase type="fokus">Utkast</Nav.EtikettBase>
);

StatusEtikett.propTypes = {
  status: PT.string.isRequired,
};

const EnkeltSed = ({ sed, kodeverk }) => (
  <Nav.LenkepanelBase href={sed.rinaUrl} target="_blank" border>
    <div className="kolonne__navn">
      <Nav.Element className="lenkepanel__heading">{sed.sedType} - {kodeverk.sedTypeTerm(sed.sedType)}</Nav.Element>
      <Nav.Normaltekst>Opprettet: {Utils.dato.formatterDatoTilNorsk(sed.opprettetDato)}</Nav.Normaltekst>
    </div>
    <div className="kolonne__status">
      <StatusEtikett status={sed.status} />
    </div>
  </Nav.LenkepanelBase>
);

EnkeltSed.propTypes = {
  sed: PT.shape({
    sedId: PT.string.isRequired,
    rinaUrl: PT.string.isRequired,
    sedType: PT.string.isRequired,
    opprettetDato: PT.string.isRequired,
    status: PT.string.isRequired,
  }).isRequired,
  kodeverk: PT.object.isRequired,
};

const EnkeltBucHeading = ({ bucType, opprettetDato, kodeverk }) => (
  <div>
    <Nav.Undertittel>{bucType} - {kodeverk.bucTypeTerm(bucType)}</Nav.Undertittel>
    <Nav.Normaltekst>Opprettet: {Utils.dato.formatterDatoTilNorsk(opprettetDato)}</Nav.Normaltekst>
  </div>
);

EnkeltBucHeading.propTypes = {
  bucType: PT.string.isRequired,
  opprettetDato: PT.string.isRequired,
  kodeverk: PT.object.isRequired,
};

const EnkeltBuc = ({ buc, kodeverk }) => (
  <Nav.EkspanderbartpanelBase border heading={<EnkeltBucHeading {...buc} kodeverk={kodeverk} />}>
    <div className="buc_tabell">
      <Nav.Element className="tabell_header kolonne__navn">Navn på SED</Nav.Element>
      <Nav.Element className="tabell_header kolonne__status">Status</Nav.Element>
      { buc.seder.map(sed => <EnkeltSed key={sed.sedId} sed={sed} kodeverk={kodeverk} />) }
    </div>
  </Nav.EkspanderbartpanelBase>
);

EnkeltBuc.propTypes = {
  buc: PT.shape({
    bucType: PT.string.isRequired,
    opprettetDato: PT.string.isRequired,
    seder: PT.arrayOf(EnkeltSed.propTypes.sed).isRequired,
  }).isRequired,
  kodeverk: PT.object.isRequired,
};

const HenterOpplysningerSpinner = () => (
  <div className="henter_opplysninger">
    <Nav.NavFrontendSpinner />
    <Nav.Normaltekst>Henter BUCer under arbeid</Nav.Normaltekst>
  </div>
);

const SideDialogBesvarSed = ({ behandlingID, kodeverk }) => {
  const [bucer, setBucer] = useState([]);
  const [feilmelding, setFeilmelding] = useState('');
  const [henterData, setHenterData] = useState(true);

  const hentBucUnderArbeid = async () => {
    if (behandlingID !== -1 && bucer.length === 0) {
      try {
        setHenterData(true);
        const data = await Api.Eessi.hentBucerForBehandling(behandlingID);
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
      return bucer.map(buc => <EnkeltBuc key={buc.id} buc={buc} kodeverk={kodeverk} />);
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
  kodeverk: PT.object.isRequired,
};

const mapStateToProps = state => ({
  kodeverk: {
    bucTypeTerm: bucType => Object.values(EessiKodeverkSelectors.alleBUCtyperSelector(state)).flat()
      .filter(buc => buc.kode === bucType).map(buc => buc.term),
    sedTypeTerm: sedType => EessiKodeverkSelectors.alleSEDtyperSelector(state)
      .filter(sed => sed.kode === sedType).map(sed => sed.term),
  },
});

export default connect(mapStateToProps)(SideDialogBesvarSed);
