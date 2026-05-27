import { useEffect } from "react";
import { useSelector } from "react-redux";

import { useDispatch } from "../../hooks";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";
import { STATUS } from "../../services";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import {
  pensjonsopptjeningOperations,
  pensjonsopptjeningSelectors,
  pensjonsopptjeningTypes,
} from "../../ducks/pensjonsopptjening";
import { beskrivelseForInntektType } from "./inntektTypeBeskrivelser";

const formaterDato = (dato: string | null | undefined): string => Utils.dato.formatterDatoTilNorsk(dato, false, "—");

const kildeLabel = (kilde: pensjonsopptjeningTypes.PensjonsopptjeningKilde | string | null | undefined): string => {
  switch (kilde) {
    case "SKATT":
      return "Skatt";
    case "AVGIFTSSYSTEMET":
      return "Avgiftssystemet";
    case "MELOSYS":
      return "Melosys";
    default:
      return kilde ?? "Ukjent kilde";
  }
};

function Pensjonsopptjening() {
  const dispatch = useDispatch();
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const pensjonsopptjening = useSelector(pensjonsopptjeningSelectors.PensjonsopptjeningSelector);
  const perioder = useSelector(pensjonsopptjeningSelectors.PensjonsopptjeningPerioderSelector);

  useEffect(() => {
    if (behandlingID > 0) {
      dispatch(pensjonsopptjeningOperations.hentPensjonsopptjening(behandlingID));
    }
  }, [behandlingID, dispatch]);

  if (pensjonsopptjening.status === STATUS.NOT_STARTED) return null;

  const sortertePerioder = [...perioder].sort((a, b) => b.aar - a.aar);

  return (
    <div className="panel panelSeksjon">
      <Nav.VStack gap="6">
        <Nav.Heading level="2">Pensjonsopptjening</Nav.Heading>

        {pensjonsopptjening.status === STATUS.PENDING && <Nav.Loader />}

        {pensjonsopptjening.status === STATUS.ERROR && (
          <Nav.Alert variant="warning" inline>
            Kunne ikke hente pensjonsopptjening fra POPP.
          </Nav.Alert>
        )}

        {pensjonsopptjening.status === STATUS.OK && sortertePerioder.length === 0 && (
          <Nav.Alert variant="info" inline>
            Ingen pensjonsopptjening registrert i POPP for personen.
          </Nav.Alert>
        )}

        {pensjonsopptjening.status === STATUS.OK && sortertePerioder.length > 0 && (
          <Nav.Table>
            <Nav.Table.Header>
              <Nav.Table.Row shadeOnHover={false}>
                <Nav.Table.HeaderCell scope="col">År</Nav.Table.HeaderCell>
                <Nav.Table.HeaderCell scope="col" align="right">
                  PGI
                </Nav.Table.HeaderCell>
                <Nav.Table.HeaderCell scope="col">Kilde</Nav.Table.HeaderCell>
                <Nav.Table.HeaderCell scope="col">Type</Nav.Table.HeaderCell>
                <Nav.Table.HeaderCell scope="col">Registrert</Nav.Table.HeaderCell>
                <Nav.Table.HeaderCell scope="col">Oppdatert</Nav.Table.HeaderCell>
              </Nav.Table.Row>
            </Nav.Table.Header>
            <Nav.Table.Body>
              {sortertePerioder.map((periode, idx) => (
                <Nav.Table.Row key={`${periode.aar}-${periode.kilde}-${idx}`} shadeOnHover={false}>
                  <Nav.Table.DataCell>{periode.aar}</Nav.Table.DataCell>
                  <Nav.Table.DataCell align="right">
                    {Utils.formaterTilNorskBelopUtenDesimaler(periode.pgi)}
                  </Nav.Table.DataCell>
                  <Nav.Table.DataCell>{kildeLabel(periode.kilde)}</Nav.Table.DataCell>
                  <Nav.Table.DataCell>
                    <Nav.Tooltip
                      content={beskrivelseForInntektType(periode.inntektType, periode.inntektTypeDekode)}
                      maxChar={120}
                    >
                      <span>{periode.inntektType}</span>
                    </Nav.Tooltip>
                  </Nav.Table.DataCell>
                  <Nav.Table.DataCell>{formaterDato(periode.registrert)}</Nav.Table.DataCell>
                  <Nav.Table.DataCell>{formaterDato(periode.oppdatert)}</Nav.Table.DataCell>
                </Nav.Table.Row>
              ))}
            </Nav.Table.Body>
          </Nav.Table>
        )}
      </Nav.VStack>
    </div>
  );
}

export default Pensjonsopptjening;
