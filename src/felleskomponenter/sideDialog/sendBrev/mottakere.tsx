import { HentMuligeMottakereResDto } from "../../../services/modules/dokumenter-v2";
import React from "react";
import MottakerTabell from "../../tabell/mottakerTabell";
import * as KV from "../../../kodeverk";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { formSelectors } from "../../../ducks/form";
import { lagYupToReduxformErrorMapper } from "../../../yup";

import * as Api from "../../../services/api";
import PdfLenkeListe from "../../pdfLenkeListe";
import { RootState } from "AppTypes";
import { getFormValues, reduxForm } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import sendBrevSchema from "../sendBrevSchema";
import * as Ikoner from "../../../resources/images";
const { BRUKER, ARBEIDSGIVER } = KV.Koder.MottakerRolle;

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formIsValid: formSelectors.SendBrevValidSelector(state),
  formValues: getFormValues(KV.Form.SEND_BREV)(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface MottakereComponentProps {
  muligeMottakere: HentMuligeMottakereResDto | undefined;
  formIsValid: boolean;
  valgtMottaker: any;
  formValues: {
    valgtMal?: Api.DokumenterV2.TilgjengeligeMaler;
    type?: string;
    mottaker?: string;
    organisasjonsnummer?: string;
    kontaktperson?: string;
    arbeidsgiver?: string;
    felt?: {
      [key: string]: any;
    };
  };
  hentBrevRequest: any;
}

const MottakereComponent = ({
  muligeMottakere,
  valgtMottaker,
  behandlingID,
  formValues,
  formIsValid,
  hentBrevRequest,
}: MottakereComponentProps & PropsFromRedux) => {
  const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker, valgtMottaker: any, ikon?: boolean) => {
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

  const mapRad = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return [
      {
        verdi: (
          <PdfLenkeListe
            behandlingID={behandlingID}
            dokumenter={lagDokumenterData(muligMottaker, valgtMottaker)}
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
            dokumenter={lagDokumenterData(muligMottaker, valgtMottaker, true)}
            vedKlikk={() => formIsValid}
            className="forhåndsvisning"
          />
        ),
        style: "midtstilt",
      },
    ];
  };

  const mapMottakerRader = (muligeBrevMottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    // const valgtMottaker = finnMottakerFraValgtMal(formValues.mottaker);
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

const MottakereComponentForm = reduxForm<{}, MottakereComponentProps & PropsFromRedux>({
  form: KV.Form.SEND_BREV,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(sendBrevSchema),
})(MottakereComponent);

export default connector(MottakereComponentForm);
