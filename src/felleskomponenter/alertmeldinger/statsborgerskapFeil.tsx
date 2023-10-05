import useHentPersonopplysninger from "../informasjonlinje/useHentpersonopplysninger";
import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import * as Utils from "../../utils";
import * as Nav from "../../navFrontend";

const StatsborgerskapFeil = ({ className }: { className: string }) => {
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const personopplysninger = useHentPersonopplysninger(behandlingID, false);

  if (!personopplysninger) return null;

  const erUoppgittEllerUkjent = (statsborgerskap: string) =>
    statsborgerskap.includes("UOPPGITT") || statsborgerskap.includes("UKJENT");

  const statsborgerskapErUoppgittUkjent =
    Utils._isEmpty(personopplysninger.statsborgerskap) ||
    personopplysninger.statsborgerskap.every((statsborgerskap) => erUoppgittEllerUkjent(statsborgerskap.toUpperCase()));

  if (!statsborgerskapErUoppgittUkjent) return null;

  return (
    <Nav.AlertStripeAdvarsel className={className}>
      Statsborgerskapet er ukjent. Hvis du skal sende SED må statsborgerskap registreres i PDL.
    </Nav.AlertStripeAdvarsel>
  );
};

export default StatsborgerskapFeil;
