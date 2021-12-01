import React, { Fragment, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { change, getFormValues, reduxForm, reset } from "redux-form";
import { AlertStripeFeil, AlertStripeSuksess } from "nav-frontend-alertstriper";

import * as Api from "../../services/api";
import * as KV from "../../kodeverk";
import * as Nav from "../../navFrontend";
import * as Skjema from "../skjema";
import * as Utils from "../../utils";
import BrevMottaker from "./sendBrev/brevMottaker";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { lagYupToReduxformErrorMapper } from "../../yup";
import ValgAlternativer from "./sendBrev/valgAlternativer";
import FeltBeskrivelse from "./sendBrev/feltBeskrivelse";
import { formSelectors } from "../../ducks/form";

import sendBrevSchema from "./sendBrevSchema";
import "./sendBrev.css";
import BrevFelt from "./sendBrev/brevFelt";
import BrevMottakereTabell from "./sendBrev/brevMottakereTabell";

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
  const [tilgjengeligeMaler, setTilgjengeligeMaler] = useState<Api.DokumenterV2.TilgjengeligeMalerResDto>();

  const [brevSendt, setBrevSendt] = useState(false);
  const [brevSendtFeil, setBrevSendtFeil] = useState(false);
  const [muligeMottakere, setMuligeMottakere] = useState<Api.DokumenterV2.HentMuligeMottakereResDto>();
  const [mottakerFeil, setMottakerFeil] = useState<string>();

  useEffect(() => {
    Api.DokumenterV2.hentTilgjengeligeMaler(behandlingID).then((response) => {
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

  const hentFormVerdi = (feltNavn: string, hentValgverdi: boolean = false): any => {
    const feltFraValgtMal = formValues?.valgtMal?.felter?.find((felt) => felt.kode === feltNavn);
    if (!feltFraValgtMal) {
      return null;
    }
    const valgAlternativTrigger = feltFraValgtMal.valg?.valgAlternativTrigger;

    if (!valgAlternativTrigger) {
      return formValues.felt?.[feltNavn]?.feltVerdi;
    }

    const valgtAlternativ = formValues.felt?.[feltNavn]?.valg;
    if (valgtAlternativ === valgAlternativTrigger?.beskrivelse) {
      return formValues.felt?.[feltNavn]?.feltVerdi;
    }
    return hentValgverdi ? valgtAlternativ : null;
  };

  const hentBrevRequest = (mottakerRolle: string): Api.DokumenterV2.OpprettBrevReqDto => {
    return {
      produserbardokument: formValues.type || "",
      mottaker: mottakerRolle,
      innledningFritekst: hentFormVerdi("INNLEDNING_FRITEKST"),
      manglerFritekst: hentFormVerdi("MANGLER_FRITEKST"),
      fritekstTittel: hentFormVerdi("BREV_TITTEL", true),
      fritekst: hentFormVerdi("FRITEKST"),
      kopiMottakere: muligeMottakere?.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker) || [],
      kontaktopplysninger: hentFormVerdi("STANDARDTEKST_KONTAKTINFORMASJON"),
    };
  };

  const sendBrev = () => {
    const mottaker = finnMottakerFraValgtMal(formValues.mottaker);
    if (!mottaker) return;
    let requestBody: Api.DokumenterV2.OpprettBrevReqDto = hentBrevRequest(mottaker.rolle);
    if (mottaker.rolle === "ARBEIDSGIVER") {
      requestBody = {
        ...requestBody,
        orgNr: mottaker.orgnrSettesAvSaksbehandler ? formValues.organisasjonsnummer : formValues.arbeidsgiver,
        kontaktpersonNavn: mottaker.orgnrSettesAvSaksbehandler ? formValues.kontaktperson : null,
      };
    }
    Api.DokumenterV2.opprettBrev(behandlingID, requestBody)
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
          {(felt.valg === null ||
            (formValues.felt && formValues.felt[felt.kode]?.valg === felt.valg.valgAlternativTrigger.beskrivelse)) && (
            <BrevFelt felt={felt} visHjelpetekst={felt.valg === null} />
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
