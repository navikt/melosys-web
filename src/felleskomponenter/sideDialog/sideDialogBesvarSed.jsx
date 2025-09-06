import { useEffect, useState } from "react";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";
import * as Utils from "../../utils";
import * as Api from "../../services/api";
import "./sideDialogBesvarSed.less";
import { Accordion } from "@navikt/ds-react";

function StatusEtikett({ status }) {
  if (!status) {
    return null;
  }

  const lagTag = (variant, statusStreng) => <Nav.Tag variant={variant}>{statusStreng}</Nav.Tag>;

  switch (status.toUpperCase()) {
    case KV.Koder.SedStatus.UTKAST:
      return lagTag("warning", "Under arbeid");
    case KV.Koder.SedStatus.SENDT:
    case KV.Koder.SedStatus.MOTTATT:
      return lagTag("success", Utils.streng.storeForbokstaver(status));
    case KV.Koder.SedStatus.AVBRUTT:
      return lagTag("error", Utils.streng.storeForbokstaver(status));
    default:
      return lagTag("info", Utils.streng.storeForbokstaver(status));
  }
}

StatusEtikett.propTypes = {
  status: PT.string.isRequired,
};

const sedTypeTerm = (sedType) => EKV.Terms.sedtyper[sedType];

function EnkeltSed({ sed }) {
  return (
    <Nav.Box
      as={Nav.Link}
      href={sed.rinaUrl}
      target="_blank"
      padding="2"
      borderWidth="1"
      borderRadius="medium"
      borderColor="border-default"
    >
      <div className="kolonne__navn">
        <Nav.BodyLong weight="semibold" size="small" className="lenkepanel__heading">
          {sed.sedType} - {sedTypeTerm(sed.sedType)}
        </Nav.BodyLong>
        <Nav.BodyLong size="small">Opprettet: {Utils.dato.formatterDatoTilNorsk(sed.opprettetDato)}</Nav.BodyLong>
      </div>
      <div className="kolonne__status">
        <StatusEtikett status={sed.status} />
      </div>
    </Nav.Box>
  );
}

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

function EnkeltBucHeading({ bucType, opprettetDato }) {
  return (
    <div>
      <Nav.Heading size="xsmall">
        {bucType} - {bucTypeTerm(bucType)}
      </Nav.Heading>
      <Nav.BodyLong size="small">Opprettet: {Utils.dato.formatterDatoTilNorsk(opprettetDato)}</Nav.BodyLong>
    </div>
  );
}

EnkeltBucHeading.propTypes = {
  bucType: PT.string.isRequired,
  opprettetDato: PT.string.isRequired,
};

const sorterEtterDato = (liste) => liste.sort((a, b) => new Date(b.opprettetDato) - new Date(a.opprettetDato));

function EnkeltBuc({ buc }) {
  return (
    <Accordion>
      <Accordion.Item>
        <Accordion.Header>
          <EnkeltBucHeading {...buc} />
        </Accordion.Header>
        <Accordion.Content>
          <div className="buc_tabell">
            <Nav.BodyLong weight="semibold" size="small" className="tabell_header kolonne__navn">
              Navn på SED
            </Nav.BodyLong>
            <Nav.BodyLong weight="semibold" size="small" className="tabell_header kolonne__status">
              Status
            </Nav.BodyLong>
            {sorterEtterDato(buc.seder).map((sed) => (
              <EnkeltSed key={sed.sedId} sed={sed} />
            ))}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

EnkeltBuc.propTypes = {
  buc: PT.shape({
    bucType: PT.string.isRequired,
    opprettetDato: PT.string.isRequired,
    seder: PT.arrayOf(EnkeltSed.propTypes.sed).isRequired,
  }).isRequired,
};

function HenterOpplysningerSpinner() {
  return (
    <div className="henter_opplysninger">
      <Nav.Loader />
      <Nav.BodyLong size="small">Henter BUCer knyttet til saken</Nav.BodyLong>
    </div>
  );
}

function SideDialogBesvarSed({ behandlingID }) {
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
}

SideDialogBesvarSed.propTypes = {
  behandlingID: PT.number.isRequired,
};

export default SideDialogBesvarSed;
