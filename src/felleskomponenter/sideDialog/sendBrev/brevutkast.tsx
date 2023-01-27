import React, { MouseEventHandler, useEffect, useState } from "react";
import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as Ikoner from "../../../resources/images";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";
import * as Utils from "../../../utils";
import { SendBrevFormValues } from "./types";

interface BrevutkastProps {
  changeField: (field: string, data: any) => void;
  formValues: SendBrevFormValues;
  tilgjengeligeMottakere: Api.DokumenterV2.TilgjengeligMottaker[];
  utkastPåBehandlingen: Api.DokumenterV2.OpprettBrevReqDto[];
}

const Brevutkast = ({ changeField, formValues, tilgjengeligeMottakere, utkastPåBehandlingen }: BrevutkastProps) => {
  const [aktivtUtkast, setAktivtUtkast] = useState<Api.DokumenterV2.OpprettBrevReqDto | null>(null);

  const tittelTilUtkast = (utkast: Api.DokumenterV2.OpprettBrevReqDto) =>
    !Utils._isEmpty(utkast.dokumentTittel)
      ? utkast.dokumentTittel
      : KV.finnTermFraListe(MKV.KTObjects.brev.produserbaredokumenter, utkast.produserbardokument);

  const aktivtUtkastTittel = aktivtUtkast ? tittelTilUtkast(aktivtUtkast) : null;

  const inaktiveUtkast = utkastPåBehandlingen.filter((utkast) => tittelTilUtkast(utkast) !== aktivtUtkast);

  useEffect(() => {
    if (aktivtUtkastTittel && aktivtUtkast && formValues?.valgtMottaker?.uuid) {
      changeField("type", aktivtUtkast.produserbardokument);
    }
  }, [formValues?.valgtMottaker?.uuid, aktivtUtkastTittel]);

  const settFeltValg = (felt: string, verdi?: string | null) => changeField(`felt.${felt}.valg`, verdi);
  const settFeltVerdi = (felt: string, verdi?: string | boolean | null) => changeField(`felt.${felt}.feltVerdi`, verdi);

  const settFeltForFritekstTittel = () => {
    if (!aktivtUtkast?.fritekstTittel) return;

    const valgAlternativer = formValues?.valgtBrev?.felter?.find((felt) => felt.kode === "BREV_TITTEL")?.valg
      ?.valgAlternativer;
    const valgAlternativFraFritekstTittel = valgAlternativer?.find(
      (alternativ) => alternativ.beskrivelse === aktivtUtkast.fritekstTittel
    );

    if (valgAlternativFraFritekstTittel) {
      settFeltValg("BREV_TITTEL", valgAlternativFraFritekstTittel.kode);
    } else {
      const valgAlternativTilFritekst = valgAlternativer?.find((alternativ) => alternativ.visFelt);
      settFeltValg("BREV_TITTEL", valgAlternativTilFritekst?.kode);
      settFeltVerdi("BREV_TITTEL", aktivtUtkast.fritekstTittel);
    }
  };

  useEffect(() => {
    if (aktivtUtkastTittel && aktivtUtkast && formValues?.valgtBrev?.type) {
      settFeltValg("DISTRIBUSJONSTYPE", aktivtUtkast.distribusjonstype);
      settFeltValg("DOKUMENT_TITTEL", aktivtUtkast.dokumentTittel);
      settFeltForFritekstTittel();
      settFeltVerdi("INNLEDNING_FRITEKST", aktivtUtkast.innledningFritekst);
      settFeltVerdi("MANGLER_FRITEKST", aktivtUtkast.manglerFritekst);
      settFeltVerdi("FRITEKST", aktivtUtkast.fritekst);
      settFeltVerdi("STANDARDTEKST_KONTAKTINFORMASJON", aktivtUtkast.kontaktopplysninger);
      changeField("etater", aktivtUtkast.orgnrEtater);
    }
  }, [formValues?.valgtBrev?.type, aktivtUtkastTittel]);

  const velgUtkast: MouseEventHandler<HTMLButtonElement> = (event) => {
    const tittel = (event.target as HTMLButtonElement).value;
    const valgtUtkast = utkastPåBehandlingen.find((utkast) => tittelTilUtkast(utkast) === tittel);
    setAktivtUtkast(valgtUtkast || null);
    if (valgtUtkast) {
      changeField("mottaker", tilgjengeligeMottakere.find((mottaker) => mottaker.rolle === valgtUtkast.mottaker)?.uuid);
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
