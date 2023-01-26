import React, { MouseEventHandler, useState } from "react";
import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";
import * as Utils from "../../../utils";

interface BrevutkastProps {
  changeField: (field: string, data: any) => void;
  utkastPåBehandlingen: Api.DokumenterV2.OpprettBrevReqDto[];
}

const Brevutkast = ({ changeField, utkastPåBehandlingen }: BrevutkastProps) => {
  const [aktivtUtkast, setAktivtUtkast] = useState<string | null>(null);

  const tittelTilUtkast = (utkast: Api.DokumenterV2.OpprettBrevReqDto) =>
    !Utils._isEmpty(utkast.dokumentTittel)
      ? utkast.dokumentTittel
      : KV.finnTermFraListe(MKV.KTObjects.brev.produserbaredokumenter, utkast.produserbardokument);

  const inaktiveUtkast = utkastPåBehandlingen.filter((utkast) => tittelTilUtkast(utkast) !== aktivtUtkast);

  const fyllUtFormFraValgtUtkast = (valgtUtkast: Api.DokumenterV2.OpprettBrevReqDto) => {
    changeField("type", valgtUtkast.produserbardokument);
    changeField("valgtMottaker.rolle", valgtUtkast.mottaker);
    changeField("etater", valgtUtkast.orgnrEtater);
    // TODO Fyll inn resten. Må nok hente tilgjengelige maler på nytt
  };

  const velgUtkast: MouseEventHandler<HTMLButtonElement> = (event) => {
    const tittel = (event.target as HTMLButtonElement).value;
    setAktivtUtkast(tittel);
    const valgtUtkast = utkastPåBehandlingen.find((utkast) => tittelTilUtkast(utkast) === tittel);
    if (valgtUtkast) {
      fyllUtFormFraValgtUtkast(valgtUtkast);
    }
  };

  return (
    <>
      {!Utils._isEmpty(inaktiveUtkast) && (
        <div className="brevutkast">
          <Nav.Typo.Element>Lagrede utkast</Nav.Typo.Element>
          <ul>
            {inaktiveUtkast.map((utkast) => (
              <li key={tittelTilUtkast(utkast)}>
                <Mui.Lenkeknapp value={tittelTilUtkast(utkast)} onClick={velgUtkast}>
                  {tittelTilUtkast(utkast)}
                </Mui.Lenkeknapp>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Brevutkast;
