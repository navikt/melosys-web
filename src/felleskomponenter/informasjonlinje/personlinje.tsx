import * as StringUtils from "../../utils/streng";
import * as Ikon from "../../resources/images";

import useHentPersonopplysninger from "./useHentpersonopplysninger";
import KopierbarTekst from "../kopierbarTekst";

function Personlinje({ behandlingID }: { behandlingID: number }) {
  const skipHentPersonopplysninger = behandlingID < 0;
  const personopplysninger = useHentPersonopplysninger(behandlingID, skipHentPersonopplysninger);

  if (!personopplysninger) return null;

  return personopplysninger ? (
    <div className="personlinje">
      <div className="personlinje__navn">
        <Ikon.Kjoenn kjoenn={personopplysninger.kjoenn} className="ikon-navn" aria-hidden />
        {personopplysninger.navn}
      </div>
      {personopplysninger.erDoed && (
        <div className="personlinje_dod">
          <span>(Død)</span> <Ikon.Kors className="ikon-doed" aria-hidden />
        </div>
      )}
      <div className="personlinje__separator">/</div>
      <KopierbarTekst hovertekst="Kopier fødselsnummer">{personopplysninger.fnr}</KopierbarTekst>
      <div className="personlinje__separator">/</div>
      <div>{StringUtils.separerListeMedBindestrek([...new Set(personopplysninger.statsborgerskap)])}</div>
      <div className="personlinje__separator">/</div>
      <div>{personopplysninger.sivilstand}</div>
    </div>
  ) : (
    <div className="personlinje">Klarte ikke hente personopplysninger</div>
  );
}

export default Personlinje;
