import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../../hooks";

import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";

import { fakturaserierOperations, fakturaserierSelectors, fakturaserierTypes } from "../../../../ducks/fakturaserier";
import "./fakturainformasjon.less";
import { Faktura } from "./faktura";
import { STATUS } from "../../../../services";
import moment from "moment";
import LabelMedHjelpetekst from "../../../labelMedHjelpetekst";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import useFeatureToggle from "../../../../featuretoggle/useFeatureToggle";
import { MELOSYS_FAKTURERINGSKOMPONENTEN_VIS_REFERANSE } from "../../../../featuretoggle/toggleNavn";

export interface FakturaMedSerieReferanse extends fakturaserierTypes.Faktura {
  fakturaserieReferanse: string;
}

const gyldigeFakturaStatuser = [
  fakturaserierTypes.FakturaStatus.BESTILT,
  fakturaserierTypes.FakturaStatus.FEIL,
  fakturaserierTypes.FakturaStatus.MANGLENDE_INNBETALING,
  fakturaserierTypes.FakturaStatus.INNE_I_OEBS,
];

function Fakturainformasjon() {
  const dispatch = useDispatch();
  const fakturaserier = useSelector(fakturaserierSelectors.FakturaserierSelector);
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector);
  const visReferanse = useFeatureToggle(MELOSYS_FAKTURERINGSKOMPONENTEN_VIS_REFERANSE);

  useEffect(() => {
    if (saksnummer) {
      dispatch(fakturaserierOperations.hentAlleFakturaserierForSak(saksnummer));
    }
  }, [saksnummer]);

  if (Utils._isEmpty(fakturaserier.data) || fakturaserier.status !== STATUS.OK) {
    return null;
  }

  const alleFakturaer = fakturaserier.data
    .reduce((fakturaer: FakturaMedSerieReferanse[], fakturaserie) => {
      if (!Utils._isEmpty(fakturaserie.faktura)) {
        const fakturaerMedReferanse = fakturaserie.faktura.map((faktura) => ({
          ...faktura,
          fakturaserieReferanse: fakturaserie.fakturaserieReferanse,
        }));
        fakturaer.push(...fakturaerMedReferanse);
      }
      return fakturaer;
    }, [])
    .filter((faktura) => gyldigeFakturaStatuser.includes(faktura.status))
    .sort((a, b) => moment(b.sistOppdatert).diff(moment(a.sistOppdatert)));

  return (
    <Nav.Container fluid className="fakturainformasjon">
      <div key={saksnummer}>
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Heading level="2">Fakturainformasjon</Nav.Heading>
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
                  {visReferanse && <Nav.Table.HeaderCell scope="col">Referanse</Nav.Table.HeaderCell>}
                </Nav.Table.Row>
              </Nav.Table.Header>
              <Nav.Table.Body>
                {alleFakturaer.map((faktura) => (
                  <Faktura key={faktura.fakturaReferanse} faktura={faktura} visReferanse={visReferanse} />
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
