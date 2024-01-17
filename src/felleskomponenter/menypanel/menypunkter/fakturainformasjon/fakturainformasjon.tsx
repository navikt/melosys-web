import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";

import { fakturaserierOperations, fakturaserierSelectors, fakturaserierTypes } from "../../../../ducks/fakturaserier";
import "./fakturainformasjon.css";
import { Faktura } from "./faktura";
import { STATUS } from "../../../../services";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { Table } from "@navikt/ds-react";
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

const Fakturainformasjon = () => {
  const dispatch = useDispatch();
  const visReferanseEnabled = useFeatureToggle(MELOSYS_FAKTURERINGSKOMPONENTEN_VIS_REFERANSE);
  const fakturaserier = useSelector(fakturaserierSelectors.FakturaserierSelector);
  const fakturaserieReferanseFraBehandling = useSelector((state) =>
    behandlingsresultatSelectors.fakturaserieReferanseSelector(state)
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
      if (!Utils._isEmpty(fakturaserie.faktura && fakturaserie.faktura.length > 0)) {
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
            <Nav.Typo.Systemtittel>Fakturainformasjon</Nav.Typo.Systemtittel>
            <Table>
              <Table.Header>
                <Table.Row shadeOnHover={false}>
                  <Table.HeaderCell />
                  <Table.HeaderCell scope="col">
                    <LabelMedHjelpetekst
                      area-controls="fakturainformasjon-area-control"
                      className="hjelpetekst_wrapper"
                      label="Dato"
                      hjelpetekst="Viser når status sist ble oppdatert, for eksempel når faktura ble bestilt."
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell scope="col">Kvartal</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Utestående betaling</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {alleFakturaer.map((faktura) => (
                  <Faktura key={faktura.fakturaReferanse} faktura={faktura} />
                ))}
              </Table.Body>
            </Table>
          </Nav.Column>
        </Nav.Row>
      </div>
    </Nav.Container>
  );
};

export default Fakturainformasjon;
