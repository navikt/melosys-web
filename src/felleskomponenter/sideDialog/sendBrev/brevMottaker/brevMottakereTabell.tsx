import React from "react";
import { RootState } from "AppTypes";
import { getFormValues } from "redux-form";
import { connect, ConnectedProps } from "react-redux";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Skjema from "../../../skjema";
import * as Utils from "../../../../utils";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { formSelectors } from "../../../../ducks/form";
import { SendBrevFormValues } from "../types";
import { erBruker } from "./brevMottaker";
import Dokumentliste, { BrevDokumentMetadataType } from "../../../dokumentliste";
import BrevVedlegg from "../brevVedlegg/brevVedlegg";
import { FeilmeldingProps, TilgjengeligStandardvedlegg } from "../../../../services/modules/dokumenter-v2";
import "./brevMottakereTabell.less";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formIsValid: formSelectors.SendBrevValidSelector(state),
  formValues: getFormValues(KV.Form.SEND_BREV)(state) as SendBrevFormValues,
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

// Les props-typen direkte fra BrevVedlegg-komponenten og lag et subset som passer som “vedlegg”-prop til tabellen.
// Legg de til standardvedlegg siden vi vil styre filtrert liste i tabellen
type BrevVedleggPropsFromComponent = React.ComponentProps<typeof BrevVedlegg>;
type VedleggSubsetProps = Pick<
  BrevVedleggPropsFromComponent,
  | "fritekstvedlegg"
  | "setFritekstvedlegg"
  | "valgteVedlegg"
  | "setValgteVedlegg"
  | "changeField"
  | "dokumenter"
  | "visFritekstvedleggSkjema"
  | "setVisFritekstvedleggSkjema"
  | "redigerFritekstvedleggIndex"
  | "setRedigerFritekstvedleggIndex"
> & {
  standardvedlegg: TilgjengeligStandardvedlegg[];
};

interface BrevMottakereTabellProps {
  muligeMottakere?: Api.DokumenterV2.HentMuligeMottakereResDto;
  muligeMottakereNorskMyndighet?: Api.DokumenterV2.MuligMottaker[];
  formIsValid: boolean;
  redigerbart: boolean;
  brevVedlegg: VedleggSubsetProps;
  saksbehandlerNrToIdent?: string | null;
}

function BrevMottakereTabell({
  muligeMottakere,
  muligeMottakereNorskMyndighet,
  behandlingID,
  formValues,
  formIsValid,
  redigerbart,
  brevVedlegg,
  saksbehandlerNrToIdent,
}: BrevMottakereTabellProps & PropsFromRedux) {
  const valgtMottakerHarFeilmelding: FeilmeldingProps | undefined = formValues?.valgtMottaker?.feilmelding;
  const mottakerErNorskMyndighet = formValues?.valgtMottaker?.rolle === "NORSK_MYNDIGHET";

  const harStandardVedlegg =
    formValues?.valgtMottaker?.rolle === "BRUKER" && formValues?.felt?.DISTRIBUSJONSTYPE?.valg === "VEDTAK";
  const standardvedleggTilVisning = harStandardVedlegg ? brevVedlegg.standardvedlegg : [];

  const finnValgAlternativ = (felt: Api.DokumenterV2.Felt) => {
    return felt?.valg?.valgAlternativer.find((alternativ) => alternativ.kode === formValues?.felt?.[felt.kode]?.valg);
  };

  const hentFormVerdi = (feltNavn: string, hentValgverdi = false, hentKode = false): string | null => {
    const feltFraValgtMal = formValues?.valgtBrev?.felter?.find((felt) => felt.kode === feltNavn);
    if (!feltFraValgtMal) return null;
    const feltVerdi = formValues.felt?.[feltNavn]?.feltVerdi;
    if (feltFraValgtMal?.valg) {
      const valgtAlternativ = finnValgAlternativ(feltFraValgtMal);
      if (!hentValgverdi) return valgtAlternativ?.visFelt ? (feltVerdi ?? null) : null;
      if (hentKode) return valgtAlternativ?.kode ?? null;
      return valgtAlternativ?.visFelt ? (feltVerdi ?? null) : (valgtAlternativ?.beskrivelse ?? null);
    }
    return feltVerdi ?? null;
  };

  const hentKopiMottakere = () => {
    return formValues?.kopiTilBruker
      ? muligeMottakere?.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker)
      : [];
  };

  const hentOrgnr = (mottakerRolle: string) => {
    switch (mottakerRolle) {
      case "VIRKSOMHET":
      case "ARBEIDSGIVER":
        return formValues?.arbeidsgiver || null;
      case "ANNEN_ORGANISASJON":
        return formValues?.organisasjonsnummer || null;
      default:
        return null;
    }
  };

  const hentBrevRequest = (mottakerRolle: string): Record<string, unknown> => ({
    produserbardokument: formValues?.type || "",
    mottaker: mottakerRolle,
    orgNr: hentOrgnr(mottakerRolle),
    kontaktpersonNavn: mottakerRolle === "ANNEN_ORGANISASJON" ? formValues?.kontaktperson : null,
    orgnrNorskMyndighet: formValues?.norskeMyndigheter,
    innledningFritekst: hentFormVerdi("INNLEDNING_FRITEKST"),
    manglerFritekst: hentFormVerdi("MANGLER_FRITEKST"),
    fritekstTittel: hentFormVerdi("BREV_TITTEL", true),
    fritekst: hentFormVerdi("FRITEKST"),
    kopiMottakere: hentKopiMottakere() || [],
    skalViseStandardTekstOmkontaktopplysninger: hentFormVerdi("STANDARDTEKST_KONTAKTINFORMASJON"),
    saksvedlegg: brevVedlegg.valgteVedlegg?.saksvedlegg.map((v) => ({
      dokumentID: v.dokumentID,
      journalpostID: v.journalpostID,
    })),
    standardvedleggType: brevVedlegg.valgteVedlegg?.standardvedlegg?.type ?? null,
    fritekstvedlegg: brevVedlegg.fritekstvedlegg,
    distribusjonstype: hentFormVerdi("DISTRIBUSJONSTYPE", true, true),
    dokumentTittel: hentFormVerdi("DOKUMENT_TITTEL", true),
    saksbehandlerNrToIdent: saksbehandlerNrToIdent,
    institusjonID: hentFormVerdi("UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER", true, true),
  });

  const mapKopiMottakere = (
    muligeBrevMottakere: Api.DokumenterV2.HentMuligeMottakereResDto,
  ): BrevDokumentMetadataType[] => {
    return formValues?.kopiTilBruker
      ? muligeBrevMottakere.kopiMottakere.map((muligMottaker) => mapDokument(muligMottaker))
      : [];
  };

  const mapDokument = (
    muligMottaker: Api.DokumenterV2.MuligMottaker,
    erHovedMottaker = false,
  ): BrevDokumentMetadataType => {
    const rolle = erHovedMottaker ? formValues.valgtMottaker?.rolle : muligMottaker.rolle;
    return {
      mottakerNavn: muligMottaker.mottakerNavn,
      dokumentNavn: muligMottaker.dokumentNavn,
      dokumentData: {
        produserbardokument: "",
        mottaker: muligMottaker.mottakerNavn,
        ...(rolle ? hentBrevRequest(rolle) : {}),
        ...(!erBruker(rolle) && muligMottaker.orgnr ? { orgNr: muligMottaker.orgnr } : {}),
      },
    };
  };

  const mapMottakerRader = (
    muligeBrevMottakere: Api.DokumenterV2.HentMuligeMottakereResDto,
  ): BrevDokumentMetadataType[] => {
    return [
      mapDokument(muligeBrevMottakere.hovedMottaker, true),
      ...mapKopiMottakere(muligeBrevMottakere),
      ...muligeBrevMottakere.fasteMottakere.map((fastMottaker) => mapDokument(fastMottaker)),
    ];
  };

  const kanRendreVedlegg = Boolean(!valgtMottakerHarFeilmelding && redigerbart);

  return (
    <>
      {!Utils._isEmpty(muligeMottakere?.kopiMottakere) && (
        <Skjema.Checkbox
          className="kopiTilBrukerSjekkboks"
          feltNavn="kopiTilBruker"
          label="Send kopi til bruker/brukers fullmektig"
        />
      )}

      {muligeMottakere && (
        <Dokumentliste
          behandlingID={behandlingID}
          dokumenter={mapMottakerRader(muligeMottakere)}
          label={"Forhåndsvisning av brev og vedlegg"}
          className="dokumentliste--no-bottom-margin"
          validateOnClick={() => formIsValid}
        />
      )}

      {muligeMottakereNorskMyndighet && (
        <Dokumentliste
          behandlingID={behandlingID}
          dokumenter={muligeMottakereNorskMyndighet.map((muligMottaker) => mapDokument(muligMottaker))}
          label={"Forhåndsvisning av brev og vedlegg"}
          className="dokumentliste--no-bottom-margin"
        />
      )}

      {kanRendreVedlegg && (
        <BrevVedlegg
          // props som kommer fra subsettet (holdes i sync med BrevVedlegg via ComponentProps)
          fritekstvedlegg={brevVedlegg.fritekstvedlegg}
          setFritekstvedlegg={brevVedlegg.setFritekstvedlegg}
          valgteVedlegg={brevVedlegg.valgteVedlegg}
          setValgteVedlegg={brevVedlegg.setValgteVedlegg}
          changeField={brevVedlegg.changeField}
          dokumenter={brevVedlegg.dokumenter}
          visFritekstvedleggSkjema={brevVedlegg.visFritekstvedleggSkjema}
          setVisFritekstvedleggSkjema={brevVedlegg.setVisFritekstvedleggSkjema}
          redigerFritekstvedleggIndex={brevVedlegg.redigerFritekstvedleggIndex}
          setRedigerFritekstvedleggIndex={brevVedlegg.setRedigerFritekstvedleggIndex}
          // props som tabellen avleder
          formValues={formValues}
          redigerbart={redigerbart}
          behandlingID={behandlingID}
          mottakerErNorskMyndighet={mottakerErNorskMyndighet}
          muligeMottakere={muligeMottakere}
          standardvedlegg={standardvedleggTilVisning}
        />
      )}
    </>
  );
}

export default connector(BrevMottakereTabell);
