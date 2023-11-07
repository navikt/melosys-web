import { useEffect } from "react";
import { FysiskDokument } from "Domene";

import MKV from "../../../../melosyskodeverk";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";

import { SendBrevFormValues } from "../types";
import { Fritekstvedlegg } from "../sendBrev";
import LagredeUtkast from "./lagredeUtkast";

const { BRUKER, VIRKSOMHET, ARBEIDSGIVER, ANNEN_ORGANISASJON, NORSK_MYNDIGHET } = MKV.Koder.mottakerroller;

interface BrevutkastProps {
  changeField: (field: string, data: any) => void;
  dokumenter: FysiskDokument[];
  formValues: SendBrevFormValues;
  tilgjengeligeMottakere: Api.DokumenterV2.TilgjengeligMottaker[];
  utkastPåBehandlingen: Api.Brevutkast.BrevutkastResDto[];
  setSaksvedlegg: (vedlegg: FysiskDokument[]) => void;
  setFritekstvedlegg: (vedlegg: Fritekstvedlegg[]) => void;
}

const Brevutkast = ({
  changeField,
  dokumenter,
  formValues,
  tilgjengeligeMottakere,
  utkastPåBehandlingen,
  setSaksvedlegg,
  setFritekstvedlegg,
}: BrevutkastProps) => {
  const aktivtUtkast = formValues?.aktivtUtkast;

  const aktivtUtkastTittel = aktivtUtkast?.tittel || null;

  const inaktiveUtkast = utkastPåBehandlingen.filter((utkast) => utkast.tittel !== aktivtUtkastTittel);

  const settMottaker = (valgtUtkast: Api.DokumenterV2.OpprettBrevReqDto) => {
    const mottakerFraRolle = (rolle: string) =>
      tilgjengeligeMottakere.find((mottaker) => mottaker.rolle === rolle)?.uuid;
    switch (valgtUtkast.mottaker) {
      case BRUKER:
        changeField("mottaker", mottakerFraRolle(BRUKER));
        break;
      case VIRKSOMHET:
        changeField("mottaker", mottakerFraRolle(VIRKSOMHET));
        changeField("arbeidsgiver", valgtUtkast.orgNr);
        break;
      case ARBEIDSGIVER:
        changeField(
          "mottaker",
          tilgjengeligeMottakere.find((mottaker) =>
            mottaker.adresser?.find((adresse) => adresse.orgnr === valgtUtkast.orgNr)
          )?.uuid
        );
        changeField("arbeidsgiver", valgtUtkast.orgNr);
        break;
      case ANNEN_ORGANISASJON:
        changeField("mottaker", mottakerFraRolle(ANNEN_ORGANISASJON));
        changeField("organisasjonsnummer", valgtUtkast.orgNr);
        changeField("kontaktperson", valgtUtkast.kontaktpersonNavn);
        break;
      case NORSK_MYNDIGHET:
        changeField("mottaker", mottakerFraRolle(NORSK_MYNDIGHET));
        changeField("norskeMyndigheter", valgtUtkast.orgnrNorskMyndighet);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (aktivtUtkast) settMottaker(aktivtUtkast.brevbestilling);
  }, [aktivtUtkast]);

  useEffect(() => {
    if (aktivtUtkastTittel && aktivtUtkast && formValues?.valgtMottaker?.uuid) {
      changeField("type", aktivtUtkast.brevbestilling.produserbardokument?.kode);
    }
  }, [formValues?.valgtMottaker?.uuid, aktivtUtkastTittel]);

  const settFeltValg = (felt: string, verdi?: string | null) => changeField(`felt.${felt}.valg`, verdi);
  const settFeltVerdi = (felt: string, verdi?: string | boolean | null) => changeField(`felt.${felt}.feltVerdi`, verdi);

  const settFeltForFritekstTittel = () => {
    if (!aktivtUtkast?.brevbestilling.fritekstTittel) return;

    const valgAlternativer = formValues?.valgtBrev?.felter?.find((felt) => felt.kode === "BREV_TITTEL")?.valg
      ?.valgAlternativer;
    const valgAlternativFraFritekstTittel = valgAlternativer?.find(
      (alternativ) => alternativ.beskrivelse === aktivtUtkast.brevbestilling.fritekstTittel
    );

    if (valgAlternativFraFritekstTittel) {
      settFeltValg("BREV_TITTEL", valgAlternativFraFritekstTittel.kode);
    } else {
      const valgAlternativTilFritekst = valgAlternativer?.find((alternativ) => alternativ.visFelt);
      settFeltValg("BREV_TITTEL", valgAlternativTilFritekst?.kode);
      settFeltVerdi("BREV_TITTEL", aktivtUtkast.brevbestilling.fritekstTittel);
    }
  };

  const settFeltForInnledningFritekst = () => {
    const valgAlternativer = formValues?.valgtBrev?.felter?.find((felt) => felt.kode === "INNLEDNING_FRITEKST")?.valg
      ?.valgAlternativer;
    if (aktivtUtkast?.brevbestilling.innledningFritekst) {
      const valgAlternativTilFritekst = valgAlternativer?.find((alternativ) => alternativ.visFelt);
      settFeltValg("INNLEDNING_FRITEKST", valgAlternativTilFritekst?.kode);
      settFeltVerdi("INNLEDNING_FRITEKST", aktivtUtkast.brevbestilling.innledningFritekst);
    } else {
      const valgAlternativSomIkkeErFritekst = valgAlternativer?.find((alternativ) => !alternativ.visFelt);
      settFeltValg("INNLEDNING_FRITEKST", valgAlternativSomIkkeErFritekst?.kode);
    }
  };

  const settFeltForSaksvedlegg = (saksvedlegg: Api.DokumenterV2.Saksvedlegg[]) => {
    const dokumentIDer = saksvedlegg?.map((vedlegg) => vedlegg.dokumentID);
    const journalpostIDer = saksvedlegg?.map((vedlegg) => vedlegg.journalpostID);
    setSaksvedlegg(
      dokumenter?.filter(
        (dokument) => dokumentIDer.includes(dokument.dokumentID) && journalpostIDer.includes(dokument.journalpostID)
      )
    );
  };

  const settKopiTilBruker = (kopiMottakere: Api.DokumenterV2.KopiMottaker[]) => {
    if (!Utils._isEmpty(kopiMottakere)) {
      changeField("kopiTilBruker", true);
    }
  };

  useEffect(() => {
    if (aktivtUtkastTittel && aktivtUtkast && formValues?.valgtBrev?.type) {
      const utkast = aktivtUtkast.brevbestilling;
      settFeltValg("DISTRIBUSJONSTYPE", utkast.distribusjonstype);
      settFeltVerdi("DOKUMENT_TITTEL", utkast.dokumentTittel);
      settFeltForFritekstTittel();
      settFeltForInnledningFritekst();
      settFeltVerdi("MANGLER_FRITEKST", utkast.manglerFritekst);
      settFeltVerdi("FRITEKST", utkast.fritekst);
      settFeltVerdi("STANDARDTEKST_KONTAKTINFORMASJON", utkast.kontaktopplysninger);
      setFritekstvedlegg(utkast.fritekstvedlegg || []);
      settFeltForSaksvedlegg(utkast.saksvedlegg || []);
      settKopiTilBruker(utkast.kopiMottakere || []);
    }
  }, [formValues?.valgtBrev?.type, aktivtUtkastTittel]);

  return (
    <LagredeUtkast
      alleUtkast={inaktiveUtkast}
      settAktivtUtkast={(valgtUtkast) => changeField("aktivtUtkast", valgtUtkast)}
    />
  );
};

export default Brevutkast;
