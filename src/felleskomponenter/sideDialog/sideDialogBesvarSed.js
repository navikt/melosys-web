import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import * as EKV from 'eessi-kodeverk';

import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';
import * as Utils from '../../utils';
import * as Api from '../../services/api';
import './sideDialogBesvarSed.css';

const StatusEtikett = ({ status }) => {
  if (!status) {
    return null;
  }

  const lagEtikett = (type, statusStreng) => (<Nav.EtikettBase type={type}>{statusStreng}</Nav.EtikettBase>);

  switch (status.toUpperCase()) {
    case KV.Koder.SedStatus.UTKAST:
      return lagEtikett('fokus', 'Under arbeid');
    case KV.Koder.SedStatus.SENDT:
    case KV.Koder.SedStatus.MOTTATT:
      return lagEtikett('suksess', Utils.streng.storeForbokstaver(status));
    case KV.Koder.SedStatus.AVBRUTT:
      return lagEtikett('advarsel', Utils.streng.storeForbokstaver(status));
    default:
      return lagEtikett('info', Utils.streng.storeForbokstaver(status));
  }
};

StatusEtikett.propTypes = {
  status: PT.string.isRequired,
};

const sedTypeTerm = sedType => EKV.Terms.sedtyper[sedType];

const EnkeltSed = ({ sed }) => (
  <Nav.LenkepanelBase href={sed.rinaUrl} target="_blank" border>
    <div className="kolonne__navn">
      <Nav.typo.Element className="lenkepanel__heading">{sed.sedType} - {sedTypeTerm(sed.sedType)}</Nav.typo.Element>
      <Nav.typo.Normaltekst>Opprettet: {Utils.dato.formatterDatoTilNorsk(sed.opprettetDato)}</Nav.typo.Normaltekst>
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
};

const bucTypeTerm = bucType => EKV.Selectors.alleBucer[bucType];

const EnkeltBucHeading = ({ bucType, opprettetDato }) => (
  <div>
    <Nav.typo.Undertittel>{bucType} - {bucTypeTerm(bucType)}</Nav.typo.Undertittel>
    <Nav.typo.Normaltekst>Opprettet: {Utils.dato.formatterDatoTilNorsk(opprettetDato)}</Nav.typo.Normaltekst>
  </div>
);

EnkeltBucHeading.propTypes = {
  bucType: PT.string.isRequired,
  opprettetDato: PT.string.isRequired,
};

const sorterEtterDato = liste => liste.sort((a, b) => new Date(b.opprettetDato) - new Date(a.opprettetDato));

const EnkeltBuc = ({ buc }) => (
  <Nav.EkspanderbartpanelBase border heading={<EnkeltBucHeading {...buc} />}>
    <div className="buc_tabell">
      <Nav.typo.Element className="tabell_header kolonne__navn">Navn på SED</Nav.typo.Element>
      <Nav.typo.Element className="tabell_header kolonne__status">Status</Nav.typo.Element>
      { sorterEtterDato(buc.seder).map(sed => <EnkeltSed key={sed.sedId} sed={sed} />) }
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
    <Nav.typo.Normaltekst>Henter BUCer knyttet til saken</Nav.typo.Normaltekst>
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

        const {
          UTKAST, AVBRUTT, SENDT, MOTTATT,
        } = KV.Koder.SedStatus;
        const data = await Api.Eessi.bucer.hentBucerForBehandling(behandlingID, [UTKAST, AVBRUTT, SENDT, MOTTATT]);

        setBucer(data.bucer);
        setHenterData(false);
      } catch (e) {
        setHenterData(false);
        Utils.logger.error(e);
        setFeilmelding('Kunne ikke hente BUCer knyttet til saken');
      }
    }
  };

  useEffect(() => {
    hentBucUnderArbeid();
  }, []);

  const kanViseListe = liste => !henterData && !feilmelding && liste && liste.length > 0;

  const hentKomponent = () => {
    if (kanViseListe(bucer)) {
      return sorterEtterDato(bucer).map(buc => <EnkeltBuc key={buc.id} buc={buc} />);
    } else if (henterData) {
      return <HenterOpplysningerSpinner />;
    }

    return (
      <Nav.AlertStripe type="advarsel" className="varsel">{feilmelding || 'For øyeblikket ingen BUCer knyttet til denne saken'}</Nav.AlertStripe>
    );
  };

  return <div className="besvar_sed">{ hentKomponent() }</div>;
};

SideDialogBesvarSed.propTypes = {
  behandlingID: PT.number.isRequired,
};

export default SideDialogBesvarSed;
