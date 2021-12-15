import React, { Fragment, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { change, getFormValues, reduxForm, reset } from "redux-form";
import { AlertStripeFeil, AlertStripeSuksess } from "nav-frontend-alertstriper";

import { DokumenterV2 } from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../skjema";
import * as Utils from "../../../utils";
import BrevMottaker from "./brevMottaker";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";
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
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
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

  const finnValgAlternativ = (felt: Felt) => {
    return felt?.valg?.valgAlternativer.find(
      (alternativ) => alternativ.beskrivelse === formValues?.felt?.[felt.kode]?.valg
    );
  };

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

  const hentKopiMottakere = () => {
    return formValues.kopimottaker
      ? muligeMottakere?.kopiMottakere.map(DokumenterV2.konverterMuligMottakerTilKopiMottaker)
      : [];
  };

  const hentBrevRequest = (mottakerRolle: string): DokumenterV2.OpprettBrevReqDto => {
    return {
      produserbardokument: formValues.type || "",
      mottaker: mottakerRolle,
      innledningFritekst: hentFormVerdi("INNLEDNING_FRITEKST"),
      manglerFritekst: hentFormVerdi("MANGLER_FRITEKST"),
      fritekstTittel: hentFormVerdi("BREV_TITTEL", true),
      fritekst: hentFormVerdi("FRITEKST"),
      kopiMottakere: hentKopiMottakere() || [],
      kontaktopplysninger: hentFormVerdi("STANDARDTEKST_KONTAKTINFORMASJON"),
    };
  };

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

  const maltypeErValgt = formValues?.type;
  const mottakerErValgt = formValues?.mottaker;

  if (!tilgjengeligeMaler || !formValues) return null;

  return (
    <div className="send_brev">
      <Skjema.Select
        feltNavn="type"
        label={<Nav.Typo.Element>Type brev</Nav.Typo.Element>}
        disabled={!redigerbart}
        emptyFieldText="Velg..."
        emptyFieldDisabled={!!formValues.type}
        onBlur={(event) => {
          event.preventDefault();
        }}
      >
        {tilgjengeligeMaler.map((mal) => (
          <option key={mal.type.kode} value={mal.type.kode}>
            {mal.type.term}
          </option>
        ))}
      </Skjema.Select>

      {maltypeErValgt && !!formValues.valgtMal && (
        <BrevMottaker
          redigerbart={redigerbart}
          muligeMottakere={muligeMottakere}
          setMuligeMottakere={setMuligeMottakere}
          mottakerFeil={mottakerFeil}
          setMottakerFeil={setMottakerFeil}
        />
      )}

      {formValues.valgtMal?.felter?.map((felt) => (
        <Fragment key={`fragment_${felt.kode}`}>
          {felt.valg && (
            <>
              <FeltBeskrivelse beskrivelse={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} />
              <ValgAlternativer valg={felt.valg} feltKode={felt.kode} redigerbart={redigerbart} />
            </>
          )}
          {(felt.valg === null || finnValgAlternativ(felt)?.visFelt) && (
            <BrevFelt felt={felt} visFeltBeskrivelse={felt.valg === null} />
          )}
        </Fragment>
      ))}

      {mottakerErValgt && (
        <BrevMottakereTabell
          muligeMottakere={muligeMottakere}
          valgtMottaker={finnMottakerFraValgtMal(formValues.mottaker)}
          hentBrevRequest={hentBrevRequest}
        />
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
