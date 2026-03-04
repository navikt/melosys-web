import useHentPersonopplysninger from "../informasjonlinje/useHentpersonopplysninger";
import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import * as Utils from "../../utils";
import * as Nav from "../../navFrontend";

const uoppgittEllerUkjenteLand = ["UOPPGITT", "UKJENT"];

function StatsborgerskapFeil({ className }: { className: string }) {
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const personopplysninger = useHentPersonopplysninger(behandlingID, false);
  if (!personopplysninger) return null;

  const erUoppgittEllerUkjent = (statsborgerskap: string) => uoppgittEllerUkjenteLand.includes(statsborgerskap);

  const statsborgerskapErUoppgittUkjent =
    Utils._isEmpty(personopplysninger.statsborgerskap) ||
    personopplysninger.statsborgerskap.every((statsborgerskap) => erUoppgittEllerUkjent(statsborgerskap.toUpperCase()));

  if (!statsborgerskapErUoppgittUkjent) return null;

  return (
    <Nav.Alert variant="warning" className={className}>
      Statsborgerskapet er ukjent, eller er en landkode som ikke kan overføres til SED. Hvis du skal sende SED må du
      vurdere om du skal/kan registrere statsborgerskap i PDL, eller gi informasjon i fritekstfelt i SED.
    </Nav.Alert>
  );
}

export default StatsborgerskapFeil;
