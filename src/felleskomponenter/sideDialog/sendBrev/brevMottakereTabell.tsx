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

const { BRUKER, ARBEIDSGIVER } = KV.Koder.MottakerRolle;

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formIsValid: formSelectors.SendBrevValidSelector(state),
  formValues: getFormValues(KV.Form.SEND_BREV)(state) as SendBrevFormValues,
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface BrevMottakereTabellProps {
  muligeMottakere: DokumenterV2.HentMuligeMottakereResDto | undefined;
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

  const mapMottakerRader = (muligeBrevMottakere: DokumenterV2.HentMuligeMottakereResDto) => {
    if (!valgtMottaker) return [];
    return [
      mapRad(muligeBrevMottakere.hovedMottaker),
      ...muligeBrevMottakere.kopiMottakere.map((muligMottaker) => mapRad(muligMottaker)),
      ...muligeBrevMottakere.fasteMottakere.map((muligMottaker) => mapRad(muligMottaker)),
    ];
  };

  return (
    <MottakerTabell
      className="tabell"
      rader={muligeMottakere && formIsValid ? mapMottakerRader(muligeMottakere) : []}
      kolonner={[
        { verdi: "Dokumenter", bredde: "44%" },
        { verdi: "Mottaker", bredde: "40%" },
        { verdi: "Forhåndsvis", bredde: "8%", style: "normal_font_weight midtstilt" },
        { verdi: "Slett", bredde: "8%", style: "normal_font_weight midtstilt" },
      ]}
    />
  );
};

export default connector(BrevMottakereTabell);
