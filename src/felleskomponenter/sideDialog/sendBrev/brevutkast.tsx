import React, { MouseEventHandler, useEffect } from "react";
import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as Ikoner from "../../../resources/images";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";
import * as Utils from "../../../utils";
import { SendBrevFormValues } from "./types";

const { BRUKER, ARBEIDSGIVER, VIRKSOMHET, ETAT } = KV.Koder.MottakerRolle;

interface BrevutkastProps {
  aktivtUtkast: Api.Brevutkast.BrevutkastResDto | null;
  changeField: (field: string, data: any) => void;
  formValues: SendBrevFormValues;
  setAktivtUtkast: (utkast: Api.Brevutkast.BrevutkastResDto | null) => void;
  tilgjengeligeMottakere: Api.DokumenterV2.TilgjengeligMottaker[];
  utkastPåBehandlingen: Api.Brevutkast.BrevutkastResDto[];
}

const Brevutkast = ({
  aktivtUtkast,
  changeField,
  formValues,
  setAktivtUtkast,
  tilgjengeligeMottakere,
  utkastPåBehandlingen,
}: BrevutkastProps) => {
  const tittelTilUtkast = (utkast: Api.Brevutkast.BrevutkastResDto) =>
    !Utils._isEmpty(utkast.brevbestilling.dokumentTittel)
      ? utkast.brevbestilling.dokumentTittel
      : KV.finnTermFraListe(MKV.KTObjects.brev.produserbaredokumenter, utkast.brevbestilling.produserbardokument?.kode);

  const aktivtUtkastTittel = aktivtUtkast ? tittelTilUtkast(aktivtUtkast) : null;

  const inaktiveUtkast = utkastPåBehandlingen.filter((utkast) => tittelTilUtkast(utkast) !== aktivtUtkast);

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
    }
  }, [formValues?.valgtBrev?.type, aktivtUtkastTittel]);

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

  const velgUtkast: MouseEventHandler<HTMLButtonElement> = (event) => {
    const tittel = (event.target as HTMLButtonElement).value;
    const valgtUtkast = utkastPåBehandlingen.find((utkast) => tittelTilUtkast(utkast) === tittel);
    setAktivtUtkast(valgtUtkast || null);
    if (valgtUtkast) settMottaker(valgtUtkast.brevbestilling);
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
