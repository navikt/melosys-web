import React, { useEffect, useState, Fragment } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { change, getFormValues, reduxForm, reset } from "redux-form";
import { AlertStripeFeil, AlertStripeSuksess } from "nav-frontend-alertstriper";
import { ColumnWidth } from "nav-frontend-grid";

import { URL_BASENAME } from "../../../constants";
import { DokumenterV2 } from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Ikoner from "../../../resources/images";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../skjema";
import * as Utils from "../../../utils";
import BrevMottaker from "./brevMottaker";
import { behandlingerOperations } from "../../../ducks/behandlinger";
import { lagYupToReduxformErrorMapper } from "../../../yup";
import ValgAlternativer from "./valgAlternativer";
import FeltBeskrivelse from "./feltBeskrivelse";
import { formSelectors } from "../../../ducks/form";

import sendBrevSchema from "../sendBrevSchema";
import "./sendBrev.css";
import BrevFelt from "./brevFelt";
import BrevMottakereTabell from "./brevMottakereTabell";
import { SendBrevFormValues } from "./types";
import { Felt } from "../../../services/modules/dokumenter-v2";

const mapStateToProps = (state: RootState) => ({
  formIsValid: formSelectors.SendBrevValidSelector(state),
  formValues: getFormValues(KV.Form.SEND_BREV)(state),
  initialValues: {
    felt: {},
  },
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  changeField: (field: string, data: any) => dispatch(change(KV.Form.SEND_BREV, field, data)),
  resetForm: () => dispatch(reset(KV.Form.SEND_BREV)),
  oppdaterBehandling: () => dispatch(behandlingerOperations.oppdaterBehandling()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  redigerbart: boolean;
  visApneINyttVindu: boolean;
  behandlingID: number;
  brevTypeSelectWidth?: ColumnWidth;
  mottakerSelectWidth?: ColumnWidth;
  mottakerTabellWidth?: ColumnWidth;
  felterWidth?: ColumnWidth;
  formValues: SendBrevFormValues;
}

const SendBrev = ({
  behandlingID,
  changeField,
  formValues,
  formIsValid,
  oppdaterBehandling,
  redigerbart,
  resetForm,
  visApneINyttVindu,
  brevTypeSelectWidth = "12",
  mottakerSelectWidth = "12",
  mottakerTabellWidth = "12",
  felterWidth = "12",
}: Props & PropsFromRedux) => {
  const [tilgjengeligeMaler, setTilgjengeligeMaler] = useState<DokumenterV2.TilgjengeligeMalerResDto>();

  const [brevSendt, setBrevSendt] = useState(false);
  const [brevSendtFeil, setBrevSendtFeil] = useState(false);
  const [muligeMottakere, setMuligeMottakere] = useState<DokumenterV2.HentMuligeMottakereResDto>();
  const [mottakerFeil, setMottakerFeil] = useState<string>();

  useEffect(() => {
    DokumenterV2.hentTilgjengeligeMaler(behandlingID).then((response) => {
      response.forEach((mal) =>
        mal.muligeMottakere.forEach((muligMottaker) => {
          muligMottaker.uuid = Utils._uuid();
        })
      );
      setTilgjengeligeMaler(response);
    });
  }, []);

  useEffect(() => {
    const valgtMal = tilgjengeligeMaler?.find((mal) => mal.type.kode === formValues.type);
    changeField("valgtMal", valgtMal);
    changeField("mottaker", undefined);
    if (valgtMal?.muligeMottakere.length === 1) {
      changeField("mottaker", valgtMal?.muligeMottakere[0].uuid);
    }
  }, [formValues?.type]);

  const finnMottakerFraValgtMal = (uuid?: string) => {
    if (!formValues?.valgtMal) return undefined;
    return formValues.valgtMal.muligeMottakere.find((muligMottaker) => muligMottaker.uuid === uuid);
  };

  const finnValgAlternativ = (felt: Felt) =>
    felt?.valg?.valgAlternativer.find((alternativ) => alternativ.beskrivelse === formValues?.felt?.[felt.kode]?.valg);

  const hentFormVerdi = (feltNavn: string, hentValgverdi: boolean = false): any => {
    const feltFraValgtMal = formValues?.valgtMal?.felter?.find((felt) => felt.kode === feltNavn);
    if (!feltFraValgtMal) {
      return null;
    }
    const feltVerdi = formValues.felt?.[feltNavn]?.feltVerdi;

    if (feltFraValgtMal?.valg) {
      const valgtAlternativ = finnValgAlternativ(feltFraValgtMal);
      if (!hentValgverdi) {
        return valgtAlternativ?.visFelt ? feltVerdi : null;
      }
      return valgtAlternativ?.visFelt ? feltVerdi : valgtAlternativ?.beskrivelse;
    }
    return feltVerdi;
  };

  const hentKopiMottakere = () =>
    formValues.kopimottaker
      ? muligeMottakere?.kopiMottakere.map(DokumenterV2.konverterMuligMottakerTilKopiMottaker)
      : [];

  const hentBrevRequest = (mottakerRolle: string): DokumenterV2.OpprettBrevReqDto => ({
    produserbardokument: formValues.type || "",
    mottaker: mottakerRolle,
    innledningFritekst: hentFormVerdi("INNLEDNING_FRITEKST"),
    manglerFritekst: hentFormVerdi("MANGLER_FRITEKST"),
    fritekstTittel: hentFormVerdi("BREV_TITTEL", true),
    fritekst: hentFormVerdi("FRITEKST"),
    kopiMottakere: hentKopiMottakere() || [],
    kontaktopplysninger: hentFormVerdi("STANDARDTEKST_KONTAKTINFORMASJON"),
  });

  const sendBrev = () => {
    const mottaker = finnMottakerFraValgtMal(formValues.mottaker);
    if (!mottaker) return;
    let requestBody: DokumenterV2.OpprettBrevReqDto = hentBrevRequest(mottaker.rolle);
    if (mottaker.rolle === "ARBEIDSGIVER") {
      requestBody = {
        ...requestBody,
        orgNr: mottaker.orgnrSettesAvSaksbehandler ? formValues.organisasjonsnummer : formValues.arbeidsgiver,
        kontaktpersonNavn: mottaker.orgnrSettesAvSaksbehandler ? formValues.kontaktperson : null,
      };
    }
    DokumenterV2.opprettBrev(behandlingID, requestBody)
      .then(() => {
        setBrevSendt(true);
        oppdaterBehandling();
        resetForm();
      })
      .catch(() => {
        setBrevSendtFeil(true);
      });
  };

  const forkastBrev = () => {
    resetForm();
    setBrevSendt(false);
    setBrevSendtFeil(false);
  };

  const overstyrBlurEvent = (event: React.FocusEvent) => {
    event.preventDefault();
  };

  const maltypeErValgt = formValues?.type;
  const mottakerErValgt = formValues?.mottaker;

  if (!tilgjengeligeMaler || !formValues) return null;

  const nyttvinduHref = `${URL_BASENAME}/sendbrev/${behandlingID}`;

  return (
    <div className="send_brev">
      {visApneINyttVindu && (
        <div className="send_brev__apne-nytt-vindu-container">
          <Nav.Lenker target="_blank" href={nyttvinduHref}>
            <span>Åpne i nytt vindu</span>
            <Ikoner.ExternalLink />
          </Nav.Lenker>
        </div>
      )}

      <Nav.Row>
        <Nav.Column xs={brevTypeSelectWidth}>
          <Skjema.Select
            feltNavn="type"
            label={<Nav.Typo.Element>Type brev</Nav.Typo.Element>}
            disabled={!redigerbart}
            emptyFieldText="Velg..."
            emptyFieldDisabled={!!formValues.type}
            onBlur={overstyrBlurEvent}
          >
            {tilgjengeligeMaler.map((mal) => (
              <option key={mal.type.kode} value={mal.type.kode}>
                {mal.type.term}
              </option>
            ))}
          </Skjema.Select>
        </Nav.Column>
      </Nav.Row>

      {maltypeErValgt && !!formValues.valgtMal && (
        <Nav.Row>
          <Nav.Column xs={mottakerSelectWidth}>
            <BrevMottaker
              redigerbart={redigerbart}
              muligeMottakere={muligeMottakere}
              setMuligeMottakere={setMuligeMottakere}
              mottakerFeil={mottakerFeil}
              setMottakerFeil={setMottakerFeil}
              overstyrBlurEvent={overstyrBlurEvent}
            />
          </Nav.Column>
        </Nav.Row>
      )}

      {formValues.valgtMal?.felter?.map((felt) => (
        <Fragment key={felt.kode}>
          {felt.valg && (
            <Nav.Row>
              <Nav.Column xs={felterWidth}>
                <FeltBeskrivelse beskrivelse={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} />
                <ValgAlternativer valg={felt.valg} feltKode={felt.kode} redigerbart={redigerbart} />
              </Nav.Column>
            </Nav.Row>
          )}
          {(felt.valg === null || finnValgAlternativ(felt)?.visFelt) && (
            <BrevFelt felt={felt} visFeltBeskrivelse={felt.valg === null} width={felterWidth} />
          )}
        </Fragment>
      ))}

      {formIsValid && mottakerErValgt && muligeMottakere && (
        <Nav.Row>
          <Nav.Column xs={mottakerTabellWidth}>
            <BrevMottakereTabell
              muligeMottakere={muligeMottakere}
              valgtMottaker={finnMottakerFraValgtMal(formValues.mottaker)}
              hentBrevRequest={hentBrevRequest}
            />
          </Nav.Column>
        </Nav.Row>
      )}

      <div>
        <Nav.Hovedknapp
          mini
          disabled={!redigerbart || !formIsValid || !!mottakerFeil}
          className="brevknapp"
          onClick={sendBrev}
        >
          Send brev
        </Nav.Hovedknapp>
        <Nav.Knapp mini className="brevknapp" onClick={forkastBrev}>
          Forkast brev
        </Nav.Knapp>
      </div>

      {brevSendt && (
        <AlertStripeSuksess className="brev_sendt">
          Brevet er bestilt. Det kan ta noe tid før brevet vises i dokumentlisten.
        </AlertStripeSuksess>
      )}
      {brevSendtFeil && (
        <AlertStripeFeil className="brev_sendt">Brevet er ikke sendt. Det skjedde en feil.</AlertStripeFeil>
      )}
    </div>
  );
};

const SendBrevForm = reduxForm<{}, Props & PropsFromRedux>({
  form: KV.Form.SEND_BREV,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(sendBrevSchema),
})(SendBrev);

export default connector(SendBrevForm);
