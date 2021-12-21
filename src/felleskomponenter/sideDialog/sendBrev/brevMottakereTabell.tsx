import React from "react";
import { RootState } from "AppTypes";
import { getFormValues } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import MottakerTabell from "../../tabell/mottakerTabell";
import * as KV from "../../../kodeverk";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { formSelectors } from "../../../ducks/form";
import { DokumenterV2 } from "../../../services/api";
import PdfLenkeListe from "../../pdfLenkeListe";
import * as Ikoner from "../../../resources/images";
import { SendBrevFormValues } from "./types";
import * as Skjema from "../../skjema";

const { BRUKER, ARBEIDSGIVER } = KV.Koder.MottakerRolle;

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formIsValid: formSelectors.SendBrevValidSelector(state),
  formValues: getFormValues(KV.Form.SEND_BREV)(state) as SendBrevFormValues,
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface BrevMottakereTabellProps {
  muligeMottakere: DokumenterV2.HentMuligeMottakereResDto;
  formIsValid: boolean;
  valgtMottaker: any;
  hentBrevRequest: any;
}

const BrevMottakereTabell = ({
  muligeMottakere,
  valgtMottaker,
  behandlingID,
  formValues,
  formIsValid,
  hentBrevRequest,
}: BrevMottakereTabellProps & PropsFromRedux) => {
  const lagDokumenterData = (muligMottaker: DokumenterV2.MuligMottaker, ikon?: boolean) => {
    const orgnrFraFormValues = valgtMottaker.orgnrSettesAvSaksbehandler
      ? formValues.organisasjonsnummer
      : formValues.arbeidsgiver;
    return [
      {
        sendesTilDokumenterV2: true,
        navn: ikon ? <Ikoner.Forhandsvis /> : muligMottaker.dokumentNavn,
        data: {
          ...hentBrevRequest(muligMottaker.rolle),
          orgNr: muligMottaker.rolle !== BRUKER ? muligMottaker.orgnr || orgnrFraFormValues : null,
          kontaktpersonNavn:
            muligMottaker.rolle === ARBEIDSGIVER && valgtMottaker.orgnrSettesAvSaksbehandler
              ? formValues.kontaktperson
              : null,
        },
      },
    ];
  };

  const mapRad = (muligMottaker: DokumenterV2.MuligMottaker) => {
    return [
      {
        verdi: (
          <PdfLenkeListe
            behandlingID={behandlingID}
            dokumenter={lagDokumenterData(muligMottaker)}
            vedKlikk={() => formIsValid}
            className="forhåndsvisning"
          />
        ),
      },
      { verdi: muligMottaker.mottakerNavn },
      {
        verdi: (
          <PdfLenkeListe
            behandlingID={behandlingID}
            dokumenter={lagDokumenterData(muligMottaker, true)}
            vedKlikk={() => formIsValid}
            className="forhåndsvisning"
          />
        ),
        style: "midtstilt",
      },
    ];
  };

  const mapKopiMottakere = (muligeBrevMottakere: DokumenterV2.HentMuligeMottakereResDto) => {
    return formValues?.kopimottaker
      ? muligeBrevMottakere.kopiMottakere.map((muligMottaker) => mapRad(muligMottaker))
      : [];
  };

  const mapMottakerRader = (muligeBrevMottakere: DokumenterV2.HentMuligeMottakereResDto) => {
    return [
      mapRad(muligeBrevMottakere.hovedMottaker),
      ...mapKopiMottakere(muligeBrevMottakere),
      ...muligeBrevMottakere.fasteMottakere.map((muligMottaker) => mapRad(muligMottaker)),
    ];
  };

  return (
    <>
      {muligeMottakere?.kopiMottakere?.length !== 0 && (
        <Skjema.Checkbox
          className="kopimottakerSjekkboks"
          feltNavn="kopimottaker"
          label="Send kopi til bruker/brukers fullmektig"
        />
      )}

      <MottakerTabell
        className="tabell"
        rader={mapMottakerRader(muligeMottakere)}
        kolonner={[
          { verdi: "Dokumenter", bredde: "48%" },
          { verdi: "Mottaker", bredde: "44%" },
          { verdi: "Forhåndsvis", bredde: "8%", style: "normal_font_weight midtstilt" },
        ]}
      />
    </>
  );
};

export default connector(BrevMottakereTabell);
