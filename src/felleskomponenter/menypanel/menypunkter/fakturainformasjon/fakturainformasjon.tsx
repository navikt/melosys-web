import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as Nav from "../../../../navFrontend";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";

import { fakturainformasjonOperations } from "../../../../ducks/fakturainformasjon";
import "./fakturainformasjon.css";
import { _isEmpty, _toInteger } from "../../../../utils";
import { Faktura } from "./faktura";
import { STATUS } from "../../../../services";
import { FakturaStatus } from "../../../../services/modules/faktureringskomponenten/fakturainformasjon";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { Table } from "@navikt/ds-react";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_FAKTURERINGSKOMPONENTEN_VIS_REFERANSE } from "../../../../featuretoggle/toggleNavn";
import moment from "moment";
import LabelMedHjelpetekst from "../../../labelMedHjelpetekst";

const gyldigeFakturaStatuser = [
  FakturaStatus.BESTILT,
  FakturaStatus.FEIL,
  FakturaStatus.MANGLENDE_INNBETALING,
  FakturaStatus.INNE_I_OEBS,
];

const Fakturainformasjon = () => {
  const dispatch = useDispatch();
  const visReferanseEnabled = useFeatureToggle(MELOSYS_FAKTURERINGSKOMPONENTEN_VIS_REFERANSE);
  const { fakturainformasjon, fagsaker, behandlinger } = useSelector((state) => state) as any;
  const fakturaserieReferanseFraBehandling = useSelector((state) =>
    behandlingsresultatSelectors.fakturaserieReferanseSelector(state)
  );
  const { saksnummer } = fagsaker.data;
  const {
    behandlingID,
    oppsummering: { behandlingstype },
  } = behandlinger.data;

  const skalHenteFraForrigeBehandling =
    KV.objektTilKode(behandlingstype) === MKV.Koder.behandlinger.behandlingstyper.MANGLENDE_INNBETALING_TRYGDEAVGIFT;

  useEffect(() => {
    if (fakturaserieReferanseFraBehandling) {
      dispatch(fakturainformasjonOperations.hentFakturaserier(fakturaserieReferanseFraBehandling));
    }
  }, [behandlingID, saksnummer, skalHenteFraForrigeBehandling, fakturaserieReferanseFraBehandling]);

  if (
    _isEmpty(fakturainformasjon.data) ||
    fakturainformasjon.status !== STATUS.OK ||
    fakturainformasjon.data.status !== undefined
  ) {
    return null;
  }

  if (fakturainformasjon.data.violations) {
    return fakturainformasjon.data.violations.map((violation: any) => (
      <Nav.Row key={violation}>{violation.message}</Nav.Row>
    ));
  }

  const alleFakturaer = fakturainformasjon.data
    .reduce((acc: any, item: any) => {
      if (item.faktura && item.faktura.length > 0) {
        acc.push(...item.faktura);
      }
      return acc;
    }, [])
    .filter((f: any) => gyldigeFakturaStatuser.includes(f.status))
    .sort((a: any, b: any) => moment(b.sistOppdatert).diff(moment(a.sistOppdatert)));

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
                {alleFakturaer.map((faktura: any) => (
                  <Faktura key={faktura.id} faktura={faktura} />
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
