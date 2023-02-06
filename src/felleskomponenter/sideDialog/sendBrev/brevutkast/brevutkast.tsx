import React, { useEffect } from "react";
import { FysiskDokument } from "Domene";
import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import { SendBrevFormValues } from "../types";
import { Fritekstvedlegg } from "../sendBrev";
import LagredeUtkast from "./lagredeUtkast";

const { BRUKER, ARBEIDSGIVER, VIRKSOMHET, ETAT } = KV.Koder.MottakerRolle;

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

  // DEPRECATED. Denne blir unødvendig/mindre komplisert når man går over til Mottakerroller
  const settMottaker = (valgtUtkast: Api.DokumenterV2.OpprettBrevReqDto) => {
    if (valgtUtkast.mottaker === BRUKER) {
      changeField("mottaker", tilgjengeligeMottakere.find((mottaker) => mottaker.rolle === valgtUtkast.mottaker)?.uuid);
    } else if ([ARBEIDSGIVER, VIRKSOMHET].includes(valgtUtkast.mottaker)) {
      const arbeidsgiverMedValgtOrgnr = tilgjengeligeMottakere.find((mottaker) =>
        mottaker.adresser?.find((adresse) => adresse.tittel.orgnr === valgtUtkast.orgNr)
      )?.uuid;
      const organisasjonFraOrgnr = tilgjengeligeMottakere.find((mottaker) => mottaker.orgnrSettesAvSaksbehandler)?.uuid;

      const orgnrSettesAvSaksbehandler =
        valgtUtkast.kontaktpersonNavn || (organisasjonFraOrgnr && !arbeidsgiverMedValgtOrgnr);

      changeField("mottaker", orgnrSettesAvSaksbehandler ? organisasjonFraOrgnr : arbeidsgiverMedValgtOrgnr);
      changeField(orgnrSettesAvSaksbehandler ? "organisasjonsnummer" : "arbeidsgiver", valgtUtkast.orgNr);
      changeField("kontaktperson", valgtUtkast.kontaktpersonNavn);
    } else if (valgtUtkast.mottaker === ETAT) {
      changeField("mottaker", tilgjengeligeMottakere.find((mottaker) => mottaker.rolle === valgtUtkast.mottaker)?.uuid);
      changeField("etater", valgtUtkast.orgnrEtater);
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
      setFritekstvedlegg(utkast.fritekstvedlegg);
      settFeltForSaksvedlegg(utkast.saksvedlegg);
      settKopiTilBruker(utkast.kopiMottakere);
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
