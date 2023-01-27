import React, { MouseEventHandler, useState } from "react";
import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as Ikoner from "../../../resources/images";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";
import * as Utils from "../../../utils";

interface BrevutkastProps {
  changeField: (field: string, data: any) => void;
  tilgjengeligeMottakere: Api.DokumenterV2.TilgjengeligMottaker[];
  utkastPåBehandlingen: Api.DokumenterV2.OpprettBrevReqDto[];
}

const Brevutkast = ({ changeField, tilgjengeligeMottakere, utkastPåBehandlingen }: BrevutkastProps) => {
  const [aktivtUtkast, setAktivtUtkast] = useState<string | null>(null);

  const tittelTilUtkast = (utkast: Api.DokumenterV2.OpprettBrevReqDto) =>
    !Utils._isEmpty(utkast.dokumentTittel)
      ? utkast.dokumentTittel
      : KV.finnTermFraListe(MKV.KTObjects.brev.produserbaredokumenter, utkast.produserbardokument);

  const inaktiveUtkast = utkastPåBehandlingen.filter((utkast) => tittelTilUtkast(utkast) !== aktivtUtkast);

  const fyllUtFormFraValgtUtkast = (valgtUtkast: Api.DokumenterV2.OpprettBrevReqDto) => {
    changeField("mottaker", tilgjengeligeMottakere.find((mottaker) => mottaker.rolle === valgtUtkast.mottaker)?.uuid);
    changeField("type", valgtUtkast.produserbardokument);
    changeField("felt.DISTRIBUSJONSTYPE.valg", valgtUtkast.distribusjonstype); // TODO Finne løsning
    changeField("felt.DOKUMENT_TITTEL.valg", valgtUtkast.dokumentTittel);
    changeField("felt.BREV_TITTEL.valg", valgtUtkast.fritekstTittel);
    changeField("felt.INNLEDNING_FRITEKST", valgtUtkast.innledningFritekst);
    changeField("felt.MANGLER_FRITEKST", valgtUtkast.manglerFritekst);
    changeField("felt.FRITEKST", valgtUtkast.fritekst);
    changeField("felt.STANDARDTEKST_KONTAKTINFORMASJON", valgtUtkast.kontaktopplysninger);
    changeField("etater", valgtUtkast.orgnrEtater);
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
          {inaktiveUtkast.map((utkast) => (
            <Mui.Lenkeknapp
              key={tittelTilUtkast(utkast)}
              value={tittelTilUtkast(utkast)}
              onClick={velgUtkast}
              ikon={Ikoner.Draft}
              className="brevutkast__utkast"
            >
              {tittelTilUtkast(utkast)}
            </Mui.Lenkeknapp>
          ))}
        </div>
      )}
    </>
  );
};

export default Brevutkast;
