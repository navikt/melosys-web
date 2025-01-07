import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";

import { fakturaserierOperations, fakturaserierSelectors, fakturaserierTypes } from "../../../../ducks/fakturaserier";
import "./fakturainformasjon.css";
import { Faktura } from "./faktura";
import { STATUS } from "../../../../services";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_FAKTURERINGSKOMPONENTEN_VIS_REFERANSE } from "../../../../featuretoggle/toggleNavn";
import moment from "moment";
import LabelMedHjelpetekst from "../../../labelMedHjelpetekst";

const gyldigeFakturaStatuser = [
  fakturaserierTypes.FakturaStatus.BESTILT,
  fakturaserierTypes.FakturaStatus.FEIL,
  fakturaserierTypes.FakturaStatus.MANGLENDE_INNBETALING,
  fakturaserierTypes.FakturaStatus.INNE_I_OEBS,
];

function Fakturainformasjon() {
  const dispatch = useDispatch();
  const visReferanseEnabled = useFeatureToggle(MELOSYS_FAKTURERINGSKOMPONENTEN_VIS_REFERANSE);
  const fakturaserier = useSelector(fakturaserierSelectors.FakturaserierSelector);
  const fakturaserieReferanseFraBehandling = useSelector((state) =>
    behandlingsresultatSelectors.fakturaserieReferanseSelector(state),
  );

  useEffect(() => {
    if (fakturaserieReferanseFraBehandling) {
      dispatch(fakturaserierOperations.hentFakturaserier(fakturaserieReferanseFraBehandling));
    }
  }, [fakturaserieReferanseFraBehandling]);

  if (Utils._isEmpty(fakturaserier.data) || fakturaserier.status !== STATUS.OK) {
    return null;
  }

  const alleFakturaer = fakturaserier.data
    .reduce((fakturaer: fakturaserierTypes.Faktura[], fakturaserie) => {
      if (!Utils._isEmpty(fakturaserie.faktura)) {
        fakturaer.push(...fakturaserie.faktura);
      }
      return fakturaer;
    }, [])
    .filter((faktura) => gyldigeFakturaStatuser.includes(faktura.status))
    .sort((a, b) => moment(b.sistOppdatert).diff(moment(a.sistOppdatert)));

  return (
    <Nav.Container fluid className="fakturainformasjon">
      {visReferanseEnabled && <Nav.Row>Fakturaseriereferanse: {fakturaserieReferanseFraBehandling}</Nav.Row>}
      <div key={fakturaserieReferanseFraBehandling}>
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Heading size="small">Fakturainformasjon</Nav.Heading>
            <Nav.Table>
              <Nav.Table.Header>
                <Nav.Table.Row shadeOnHover={false}>
                  <Nav.Table.HeaderCell />
                  <Nav.Table.HeaderCell scope="col">
                    <LabelMedHjelpetekst
                      label="Dato"
                      hjelpetekst="Viser når status sist ble oppdatert, for eksempel når faktura ble bestilt."
                    />
                  </Nav.Table.HeaderCell>
                  <Nav.Table.HeaderCell scope="col">Kvartal</Nav.Table.HeaderCell>
                  <Nav.Table.HeaderCell scope="col">Status</Nav.Table.HeaderCell>
                  <Nav.Table.HeaderCell scope="col">Utestående betaling</Nav.Table.HeaderCell>
                </Nav.Table.Row>
              </Nav.Table.Header>
              <Nav.Table.Body>
                {alleFakturaer.map((faktura) => (
                  <Faktura key={faktura.fakturaReferanse} faktura={faktura} />
                ))}
              </Nav.Table.Body>
            </Nav.Table>
          </Nav.Column>
        </Nav.Row>
      </div>
    </Nav.Container>
  );
}

export default Fakturainformasjon;
