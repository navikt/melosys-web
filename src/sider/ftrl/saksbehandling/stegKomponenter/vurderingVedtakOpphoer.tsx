import * as Nav from "../../../../navFrontend";
import "./vurderingVedtak.css";

interface Props {
  tilbake: () => void;
  aktivtSteg: boolean;
}

export const VurderingVedtakOpphoer = ({ aktivtSteg }: Props) => {
  if (!aktivtSteg) return null;

  return (
    <div className="vurderingVedtak">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Opphøer av frivillig medlemskap etter § 2-15
      </Nav.Typo.Innholdstittel>
    </div>
  );
};
