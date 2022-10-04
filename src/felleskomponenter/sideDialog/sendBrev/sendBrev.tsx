import React, { useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { change, getFormValues, reduxForm, reset } from "redux-form";
import { AlertStripeFeil, AlertStripeSuksess } from "nav-frontend-alertstriper";
import { FysiskDokument } from "Domene";
import { ColumnWidth } from "nav-frontend-grid";

import { URL_BASENAME } from "../../../constants";

import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Ikoner from "../../../resources/images";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../skjema";
import * as Utils from "../../../utils";
import * as Mui from "../../ui";

import { behandlingerOperations } from "../../../ducks/behandlinger";
import { formSelectors } from "../../../ducks/form";
import BrevValg from "./brevValg";
import BrevMottaker, { erArbeidsgiverEllerVirksomhet } from "./brevMottaker";
import { SendBrevFormValues } from "./types";
import BrevMottakereTabell from "./brevMottakereTabell";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import sendBrevSchema from "./sendBrevSchema";
import "./sendBrev.css";
import FritekstvedleggSkjema from "./fritekstvedleggSkjema";
import { dokumenterOperations } from "../../../ducks/dokumenter";
import VedleggVelger from "../../vedleggvelger";
import VedleggTable from "../../vedleggTable";

const FORHANDSVIS_ERROR_MESSAGE = "Det oppstod en feil da vedlegget skulle forhåndsvises";

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

export type Fritekstvedlegg = {
  tittel: string;
  fritekst: string;
};

interface Props {
  redigerbart: boolean;
  visApneINyttVindu: boolean;
  behandlingID: number;
  brevTypeSelectWidth?: ColumnWidth;
  mottakerSelectWidth?: ColumnWidth;
  mottakerTabellWidth?: ColumnWidth;
  felterWidth?: ColumnWidth;
  formValues: SendBrevFormValues;
  dokumenter: FysiskDokument[];
  saksnummer: string;
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
  dokumenter,
  brevTypeSelectWidth = "12",
  mottakerSelectWidth = "12",
  mottakerTabellWidth = "12",
  felterWidth = "12",
  saksnummer,
}: Props & PropsFromRedux) => {
  const [tilgjengeligeMaler, setTilgjengeligeMaler] = useState<Api.DokumenterV2.TilgjengeligeMalerResDto>();
  const [muligeMottakere, setMuligeMottakere] = useState<Api.DokumenterV2.HentMuligeMottakereResDto>();
  const [brevSendt, setBrevSendt] = useState(false);
  const [brevSendtFeil, setBrevSendtFeil] = useState(false);
  const [valgteVedlegg, setValgteVedlegg] = useState<FysiskDokument[]>([]);
  const [visFritekstvedleggSkjema, setVisFritekstvedleggSkjema] = useState(false);
  const [fritekstvedlegg, setFritekstvedlegg] = useState<Fritekstvedlegg[]>([]);
  const [redigerFritekstvedleggIndex, setRedigerFritekstvedleggIndex] = useState<number | undefined>(undefined);
  const [forhandsvisFritekstvedleggError, setForhandsvisFritekstvedleggError] = useState(false);

  const tilgjengeligeMottakere = tilgjengeligeMaler?.map((mal) => mal.mottaker) || [];
  const tilgjengeligeBrevtyper =
    tilgjengeligeMaler?.find((mal) => mal?.mottaker.uuid === formValues?.mottaker)?.brevTyper || [];

  useEffect(() => {
    Api.DokumenterV2.hentTilgjengeligeMaler(behandlingID).then((response) => {
      response.forEach((mal) => {
        mal.mottaker.uuid = Utils._uuid();
      });
      setTilgjengeligeMaler(response);
    });
  }, []);

  useEffect(() => {
    changeField(
      "valgtBrev",
      tilgjengeligeBrevtyper.find((brevType) => brevType.type.kode === formValues.type)
    );
  }, [formValues?.type]);

  const erMottakerGyldig = (values: SendBrevFormValues) => {
    if (!values?.valgtMottaker) return false;
    const { rolle, orgnrSettesAvSaksbehandler } = values.valgtMottaker;
    if (erArbeidsgiverEllerVirksomhet(rolle) && !orgnrSettesAvSaksbehandler && !values.arbeidsgiver) return false;
    if (erArbeidsgiverEllerVirksomhet(rolle) && orgnrSettesAvSaksbehandler && !values.organisasjonsnummer) return false;
    return true;
  };

  useEffect(() => {
    if (tilgjengeligeBrevtyper?.length === 1 && erMottakerGyldig(formValues)) {
      changeField("type", tilgjengeligeBrevtyper[0].type.kode);
    }
  }, [tilgjengeligeBrevtyper, formValues?.valgtMottaker, formValues?.organisasjonsnummer, formValues?.arbeidsgiver]);

  const kanHenteMuligeMottakere = (values: SendBrevFormValues) => {
    if (!values || !values.valgtMottaker || !values.type || values.valgtMottaker?.feilmelding) return false;
    return erMottakerGyldig(values);
  };

  useEffect(() => {
    if (kanHenteMuligeMottakere(formValues)) {
      Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
        produserbartdokument: formValues?.type || "",
        orgnr: formValues.organisasjonsnummer || formValues.arbeidsgiver || null,
      }).then((response) => setMuligeMottakere(response));
    }
  }, [formValues?.type, formValues?.valgtMottaker, formValues?.organisasjonsnummer, formValues?.arbeidsgiver]);

  const finnValgAlternativ = (felt: Api.DokumenterV2.Felt) => {
    return felt?.valg?.valgAlternativer.find(
      (alternativ) => alternativ.beskrivelse === formValues?.felt?.[felt.kode]?.valg
    );
  };

  const hentFormVerdi = (feltNavn: string, hentValgverdi: boolean = false): any => {
    const feltFraValgtMal = formValues?.valgtBrev?.felter?.find((felt) => felt.kode === feltNavn);
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
      ? muligeMottakere?.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker)
      : [];
  };

  const hentBrevRequest = (mottakerRolle: string): Api.DokumenterV2.OpprettBrevReqDto => {
    return {
      produserbardokument: formValues.type || "",
      mottaker: mottakerRolle,
      innledningFritekst: hentFormVerdi("INNLEDNING_FRITEKST"),
      manglerFritekst: hentFormVerdi("MANGLER_FRITEKST"),
      fritekstTittel: hentFormVerdi("BREV_TITTEL", true),
      fritekst: hentFormVerdi("FRITEKST"),
      kopiMottakere: hentKopiMottakere() || [],
      kontaktopplysninger: hentFormVerdi("STANDARDTEKST_KONTAKTINFORMASJON"),
      saksvedlegg: valgteVedlegg.map((vedlegg) => ({
        dokumentID: vedlegg.dokumentID,
        journalpostID: vedlegg.journalpostID,
      })),
      fritekstvedlegg,
    };
  };

  const lagFritekstPdfUrl = async (index: number) => {
    const data = {
      produserbardokument: MKV.Koder.brev.produserbaredokumenter.GENERELT_FRITEKSTVEDLEGG,
      mottaker: muligeMottakere?.hovedMottaker.rolle || "",
      fritekstTittel:
        redigerFritekstvedleggIndex === index
          ? formValues.felt?.FRITEKSTVEDLEGG_TITTEL?.feltVerdi
          : fritekstvedlegg[index].tittel,
      fritekst:
        redigerFritekstvedleggIndex === index
          ? formValues.felt?.FRITEKSTVEDLEGG_FRITEKST?.feltVerdi
          : fritekstvedlegg[index].fritekst,
      kopiMottakere: [],
      kontaktopplysninger: false,
      saksvedlegg: [],
      fritekstvedlegg: [],
    };
    try {
      setForhandsvisFritekstvedleggError(false);
      return await dokumenterOperations.forhandsvisBrevV2(behandlingID, data);
    } catch (e) {
      setForhandsvisFritekstvedleggError(true);
      return "";
    }
  };

  const sendBrev = () => {
    if (!formValues?.valgtMottaker) return;

    let requestBody: Api.DokumenterV2.OpprettBrevReqDto = hentBrevRequest(formValues.valgtMottaker.rolle);
    if (formValues.valgtMottaker.rolle === "ARBEIDSGIVER") {
      requestBody = {
        ...requestBody,
        orgNr: formValues.valgtMottaker.orgnrSettesAvSaksbehandler
          ? formValues.organisasjonsnummer
          : formValues.arbeidsgiver,
        kontaktpersonNavn: formValues.valgtMottaker.orgnrSettesAvSaksbehandler ? formValues.kontaktperson : null,
      };
    }
    Api.DokumenterV2.opprettBrev(behandlingID, requestBody)
      .then(() => {
        setBrevSendt(true);
        oppdaterBehandling();
        resetForm();
        setFritekstvedlegg([]);
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

  const resetFritekstvedlegg = () => {
    changeField("felt.FRITEKSTVEDLEGG_TITTEL.feltVerdi", "");
    changeField("felt.FRITEKSTVEDLEGG_FRITEKST.feltVerdi", "");
    setVisFritekstvedleggSkjema(false);
    setRedigerFritekstvedleggIndex(undefined);
  };

  const leggTilFritekstvedlegg = () => {
    const tittel = formValues.felt?.FRITEKSTVEDLEGG_TITTEL?.feltVerdi;
    const fritekst = formValues.felt?.FRITEKSTVEDLEGG_FRITEKST?.feltVerdi;
    if (tittel && fritekst && fritekst !== "<p></p>\n") {
      const newFritekstvedlegg = [...fritekstvedlegg];
      if (redigerFritekstvedleggIndex !== undefined) {
        newFritekstvedlegg[redigerFritekstvedleggIndex] = { tittel, fritekst };
      } else {
        newFritekstvedlegg.push({ tittel, fritekst });
      }
      setFritekstvedlegg(newFritekstvedlegg);
      changeField("felt.FRITEKSTVEDLEGG_TITTEL.feltVerdi", "");
      changeField("felt.FRITEKSTVEDLEGG_FRITEKST.feltVerdi", "");
      setVisFritekstvedleggSkjema(false);
      setRedigerFritekstvedleggIndex(undefined);
    }
  };

  const redigerFritekstvedlegg = (index: number) => {
    const vedlegg = fritekstvedlegg[index];
    changeField("felt.FRITEKSTVEDLEGG_TITTEL.feltVerdi", vedlegg.tittel);
    changeField("felt.FRITEKSTVEDLEGG_FRITEKST.feltVerdi", vedlegg.fritekst);
    setRedigerFritekstvedleggIndex(index);
    setVisFritekstvedleggSkjema(true);
  };

  const slettFritekstvedlegg = (index: number) => {
    const newFritekstvedlegg = [...fritekstvedlegg];
    newFritekstvedlegg.splice(index, 1);
    setFritekstvedlegg(newFritekstvedlegg);
    if (index === redigerFritekstvedleggIndex) {
      setRedigerFritekstvedleggIndex(undefined);
    }
    if (redigerFritekstvedleggIndex && index < redigerFritekstvedleggIndex) {
      setRedigerFritekstvedleggIndex(redigerFritekstvedleggIndex - 1);
    }
  };

  const overstyrBlurEvent = (event: React.FocusEvent) => {
    event.preventDefault();
  };

  if (!tilgjengeligeMaler || !formValues) return null;

  const mottakerErValgt = formValues.valgtMottaker;
  const brevtypeErValgt = formValues.valgtBrev;

  const nyttvinduHref = `${URL_BASENAME}/sendbrev/${behandlingID}/${saksnummer}`;
  const vedleggFelt = formValues.valgtBrev?.felter?.find((felt) => felt.kode === Api.DokumenterV2.FeltType.VEDLEGG);
  const fritekstvedleggFelt = formValues.valgtBrev?.felter?.find(
    (felt) => felt.kode === Api.DokumenterV2.FeltType.FRITEKSTVEDLEGG
  );

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
        <Nav.Column xs={mottakerSelectWidth}>
          <BrevMottaker
            redigerbart={redigerbart}
            tilgjengeligeMottakere={tilgjengeligeMottakere}
            overstyrBlurEvent={overstyrBlurEvent}
            changeField={changeField}
          />
        </Nav.Column>
      </Nav.Row>

      {mottakerErValgt && tilgjengeligeBrevtyper.length !== 1 && (
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
              {tilgjengeligeBrevtyper.map((brevType) => (
                <option key={brevType.type.kode} value={brevType.type.kode}>
                  {brevType.type.term}
                </option>
              ))}
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
      )}

      <BrevValg
        formValues={formValues}
        width={felterWidth}
        redigerbart={redigerbart}
        changeField={changeField}
        finnValgAlternativ={finnValgAlternativ}
      />

      {formIsValid && brevtypeErValgt && muligeMottakere && (
        <Nav.Row>
          <Nav.Column xs={mottakerTabellWidth}>
            <BrevMottakereTabell
              muligeMottakere={muligeMottakere}
              valgtMottaker={formValues.valgtMottaker}
              hentBrevRequest={hentBrevRequest}
            />
          </Nav.Column>
        </Nav.Row>
      )}

      {forhandsvisFritekstvedleggError && (
        <Nav.AlertStripe type="advarsel" className="fritekst_varsel">
          {FORHANDSVIS_ERROR_MESSAGE}
        </Nav.AlertStripe>
      )}

      {(vedleggFelt || fritekstvedleggFelt) && (
        <VedleggTable
          valgteVedlegg={valgteVedlegg}
          fritekstvedlegg={fritekstvedlegg}
          redigerFritekstvedlegg={redigerFritekstvedlegg}
          slettFritekstvedlegg={slettFritekstvedlegg}
          lagFritekstPdfUrl={lagFritekstPdfUrl}
          setValgteVedlegg={setValgteVedlegg}
          label="Vedlegg"
        />
      )}

      {vedleggFelt && (
        <VedleggVelger dokumenter={dokumenter} valgteVedlegg={valgteVedlegg} onChange={setValgteVedlegg} />
      )}

      {fritekstvedleggFelt &&
        (visFritekstvedleggSkjema ? (
          <FritekstvedleggSkjema
            felt={fritekstvedleggFelt}
            index={redigerFritekstvedleggIndex}
            resetFritekstvedlegg={resetFritekstvedlegg}
            leggTilFritekstvedlegg={leggTilFritekstvedlegg}
            width={felterWidth}
          />
        ) : (
          <Mui.Lenkeknapp onClick={() => setVisFritekstvedleggSkjema(true)} ikon={Ikoner.Add}>
            {fritekstvedleggFelt.beskrivelse}
          </Mui.Lenkeknapp>
        ))}

      <div>
        <Nav.Hovedknapp
          mini
          disabled={!redigerbart || !formIsValid || !!formValues.valgtMottaker?.feilmelding || visFritekstvedleggSkjema}
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
