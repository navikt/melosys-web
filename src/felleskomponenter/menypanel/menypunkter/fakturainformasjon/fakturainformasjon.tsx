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
      const queries = [`&fakturaStatus=${FakturaStatus.BESTILLT}`];
      dispatch(fakturainformasjonOperations.hentFakturaserier(fakturaserieReferanseFraBehandling, queries));
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

  return (
    <Nav.Container fluid className="fakturainformasjon">
      {visReferanseEnabled && <Nav.Row>Fakturaseriereferanse: {fakturaserieReferanseFraBehandling}</Nav.Row>}
      {fakturainformasjon.data?.map((data: any) => {
        const { faktura: fakturaer, fakturaserieReferanse } = data;

        return (
          <div key={fakturaserieReferanse}>
            <Nav.Row>
              <Nav.Column xs="12">
                <Nav.Typo.Systemtittel>Fakturainformasjon</Nav.Typo.Systemtittel>
                <Table>
                  <Table.Header>
                    <Table.Row shadeOnHover={false}>
                      <Table.HeaderCell />
                      <Table.HeaderCell scope="col">Dato</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Kvartal</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Uteststående betaling</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {fakturaer?.map((faktura: any) => (
                      <Faktura key={faktura.id} faktura={faktura} />
                    ))}
                  </Table.Body>
                </Table>
              </Nav.Column>
            </Nav.Row>
          </div>
        );
      })}
    </Nav.Container>
  );
};

export default Fakturainformasjon;
