import * as Nav from "../../navFrontend";

interface FullmaktForTrygdeavgiftConfirmationPanelProps {
  harBekreftet: boolean;
  onChange: (val: boolean) => void;
}

const FullmaktForTrygdeavgiftConfirmationPanel = ({
  harBekreftet,
  onChange,
}: FullmaktForTrygdeavgiftConfirmationPanelProps) => {
  return (
    <Nav.ConfirmationPanel
      checked={harBekreftet}
      onChange={() => onChange(!harBekreftet)}
      label="Jeg bekrefter at fullmektig for betaling er riktig"
    >
      <Nav.Typo.Element>Husk at det vanligvis er arbeidsgiver som skal motta faktura</Nav.Typo.Element>
      <Nav.Typo.Normaltekst>
        Hvis bruker har oppgitt en annen fullmektig for betaling, skal du spørre bruker om det er riktig.
        <br />
        <br />
        Kontroller at
      </Nav.Typo.Normaltekst>
      <Nav.List>
        <Nav.List.Item>organisasjonsnummeret som er oppgitt tilhører riktig enhet i virksomheten</Nav.List.Item>
        <Nav.List.Item>organisasjonsnummeret er registrert i OeBS</Nav.List.Item>
      </Nav.List>
    </Nav.ConfirmationPanel>
  );
};

export default FullmaktForTrygdeavgiftConfirmationPanel;
