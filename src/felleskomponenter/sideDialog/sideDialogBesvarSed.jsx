import { useEffect, useState } from "react";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";
import * as Utils from "../../utils";
import * as Api from "../../services/api";
import "./sideDialogBesvarSed.css";

const StatusEtikett = ({ status }) => {
  if (!status) {
    return null;
  }

  const lagEtikett = (type, statusStreng) => <Nav.EtikettBase type={type}>{statusStreng}</Nav.EtikettBase>;

  switch (status.toUpperCase()) {
    case KV.Koder.SedStatus.UTKAST:
      return lagEtikett("fokus", "Under arbeid");
    case KV.Koder.SedStatus.SENDT:
    case KV.Koder.SedStatus.MOTTATT:
      return lagEtikett("suksess", Utils.streng.storeForbokstaver(status));
    case KV.Koder.SedStatus.AVBRUTT:
      return lagEtikett("advarsel", Utils.streng.storeForbokstaver(status));
    default:
      return lagEtikett("info", Utils.streng.storeForbokstaver(status));
  }
};

StatusEtikett.propTypes = {
  status: PT.string.isRequired,
};

const sedTypeTerm = (sedType) => EKV.Terms.sedtyper[sedType];

const EnkeltSed = ({ sed }) => (
  <Nav.LenkepanelBase href={sed.rinaUrl} target="_blank" border>
    <div className="kolonne__navn">
      <Nav.Typo.Element className="lenkepanel__heading">
        {sed.sedType} - {sedTypeTerm(sed.sedType)}
      </Nav.Typo.Element>
      <Nav.Typo.Normaltekst>Opprettet: {Utils.dato.formatterDatoTilNorsk(sed.opprettetDato)}</Nav.Typo.Normaltekst>
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

const bucTypeTerm = (bucType) => EKV.Selectors.alleBucer[bucType];

const EnkeltBucHeading = ({ bucType, opprettetDato }) => (
  <div>
    <Nav.Typo.Undertittel>
      {bucType} - {bucTypeTerm(bucType)}
    </Nav.Typo.Undertittel>
    <Nav.Typo.Normaltekst>Opprettet: {Utils.dato.formatterDatoTilNorsk(opprettetDato)}</Nav.Typo.Normaltekst>
  </div>
);

EnkeltBucHeading.propTypes = {
  bucType: PT.string.isRequired,
  opprettetDato: PT.string.isRequired,
};

const sorterEtterDato = (liste) => liste.sort((a, b) => new Date(b.opprettetDato) - new Date(a.opprettetDato));

const EnkeltBuc = ({ buc }) => (
  <Nav.Ekspanderbartpanel border tittel={<EnkeltBucHeading {...buc} />}>
    <div className="buc_tabell">
      <Nav.Typo.Element className="tabell_header kolonne__navn">Navn på SED</Nav.Typo.Element>
      <Nav.Typo.Element className="tabell_header kolonne__status">Status</Nav.Typo.Element>
      {sorterEtterDato(buc.seder).map((sed) => (
        <EnkeltSed key={sed.sedId} sed={sed} />
      ))}
    </div>
  </Nav.Ekspanderbartpanel>
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
    <Nav.Typo.Normaltekst>Henter BUCer knyttet til saken</Nav.Typo.Normaltekst>
  </div>
);

const SideDialogBesvarSed = ({ behandlingID }) => {
  const [bucer, setBucer] = useState([]);
  const [feilmelding, setFeilmelding] = useState("");
  const [henterData, setHenterData] = useState(true);

  const hentBucUnderArbeid = async () => {
    if (behandlingID !== -1 && bucer.length === 0) {
      try {
        setHenterData(true);

        const { UTKAST, AVBRUTT, SENDT, MOTTATT } = KV.Koder.SedStatus;
        const data = await Api.Eessi.bucer.hentBucerForBehandling(behandlingID, [UTKAST, AVBRUTT, SENDT, MOTTATT]);

        setBucer(data.bucer);
        setHenterData(false);
      } catch (e) {
        setHenterData(false);
        setFeilmelding("Kunne ikke hente BUCer knyttet til saken");
      }
    }
  };

  useEffect(() => {
    hentBucUnderArbeid();
  }, []);

  const kanViseListe = (liste) => !henterData && !feilmelding && liste && liste.length > 0;

  const hentKomponent = () => {
    if (kanViseListe(bucer)) {
      return sorterEtterDato(bucer).map((buc) => <EnkeltBuc key={buc.id} buc={buc} />);
    }
    if (henterData) {
      return <HenterOpplysningerSpinner />;
    }

    return (
      <Nav.Alert variant="warning" className="varsel">
        {feilmelding || "For øyeblikket ingen BUCer knyttet til denne saken"}
      </Nav.Alert>
    );
  };

  return <div className="besvar_sed">{hentKomponent()}</div>;
};

SideDialogBesvarSed.propTypes = {
  behandlingID: PT.number.isRequired,
};

export default SideDialogBesvarSed;
