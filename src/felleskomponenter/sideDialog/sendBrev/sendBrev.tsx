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

import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { behandlingerOperations } from "../../../ducks/behandlinger";
import { dokumenterOperations } from "../../../ducks/dokumenter";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { formSelectors } from "../../../ducks/form";

import { useFeatureToggle } from "../../../featuretoggle";
import VedleggVelger from "../../vedleggvelger";
import VedleggTable from "../../vedleggTable";

import BrevMottaker, { erArbeidsgiverEllerVirksomhet } from "./brevMottaker/brevMottaker";
import BrevMottakereTabell from "./brevMottaker/brevMottakereTabell";
import { erEtat } from "./brevMottaker/brevMottakerEtat";
import FritekstvedleggSkjema from "./fritekstvedleggSkjema";
import Brevutkast from "./brevutkast";
import BrevValg from "./brevValg";
import { SendBrevFormValues } from "./types";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import sendBrevSchema from "./sendBrevSchema";
import "./sendBrev.css";

const FORHANDSVIS_ERROR_MESSAGE = "Det oppstod en feil da vedlegget skulle forhåndsvises";

const mapStateToProps = (state: RootState) => ({
  formIsValid: formSelectors.SendBrevValidSelector(state),
  formValues: getFormValues(KV.Form.SEND_BREV)(state),
  initialValues: {
    felt: {},
  },
  soknadsland: mottatteOpplysningerSelectors.SoknadslandSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
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
  soknadsland,
  sakstype,
}: Props & PropsFromRedux) => {
  const [tilgjengeligeMaler, setTilgjengeligeMaler] = useState<Api.DokumenterV2.TilgjengeligeMalerResDto>();
  const [muligeMottakere, setMuligeMottakere] = useState<Api.DokumenterV2.HentMuligeMottakereResDto>();
  const [muligeMottakereFeil, setMuligeMottakereFeil] = useState<string | undefined>(undefined);
  const [muligeMottakereEtater, setMuligeMottakereEtater] = useState<Api.DokumenterV2.MuligMottaker[]>();
  const [brevSendt, setBrevSendt] = useState(false);
  const [brevSendtFeil, setBrevSendtFeil] = useState(false);
  const [valgteVedlegg, setValgteVedlegg] = useState<FysiskDokument[]>([]);
  const [visFritekstvedleggSkjema, setVisFritekstvedleggSkjema] = useState(false);
  const [fritekstvedlegg, setFritekstvedlegg] = useState<Fritekstvedlegg[]>([]);
  const [redigerFritekstvedleggIndex, setRedigerFritekstvedleggIndex] = useState<number | undefined>(undefined);
  const [forhandsvisFritekstvedleggError, setForhandsvisFritekstvedleggError] = useState(false);
  const [utkastPåBehandlingen, setUtkastPåBehandlingen] = useState<Api.Brevutkast.BrevutkastResDto[]>([]);
  const [aktivtUtkast, setAktivtUtkast] = useState<Api.Brevutkast.BrevutkastResDto | null>(null);

  const fritekstvedleggToggle = useFeatureToggle("melosys.brev.GENERELT_FRITEKSTVEDLEGG");

  const tilgjengeligeMottakere = tilgjengeligeMaler?.map((mal) => mal.mottaker) || [];
  const tilgjengeligeBrevtyper =
    tilgjengeligeMaler?.find((mal) => mal?.mottaker.uuid === formValues?.mottaker)?.brevTyper || [];
  const mottakerErEtat = erEtat(formValues?.valgtMottaker?.rolle);

  useEffect(() => {
    Api.DokumenterV2.hentTilgjengeligeMaler(behandlingID).then((response) => {
      response.forEach((mal) => {
        mal.mottaker.uuid = Utils._uuid();
      });
      setTilgjengeligeMaler(response);
    });
    Api.Brevutkast.hentBrevutkast(behandlingID).then((response) => setUtkastPåBehandlingen(response));
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
    if (erEtat(rolle) && !harValgtEtat()) return false;
    return true;
  };

  useEffect(() => {
    if (tilgjengeligeBrevtyper?.length === 1 && erMottakerGyldig(formValues)) {
      changeField("type", tilgjengeligeBrevtyper[0].type.kode);
    } else if (tilgjengeligeBrevtyper?.length === 1 && !erMottakerGyldig(formValues)) {
      changeField("type", undefined);
    }
  }, [
    tilgjengeligeBrevtyper,
    formValues?.valgtMottaker,
    formValues?.organisasjonsnummer,
    formValues?.arbeidsgiver,
    formValues?.etater,
  ]);

  const kanHenteMuligeMottakere = (values: SendBrevFormValues) => {
    if (!values || !values.valgtMottaker || !values.type || values.valgtMottaker?.feilmelding) return false;
    return erMottakerGyldig(values);
  };

  const hentMuligeMottakere = () => {
    setMuligeMottakereFeil(undefined);

    if (mottakerErEtat) {
      Api.DokumenterV2.hentMuligeMottakereEtater(behandlingID, {
        produserbartdokument: formValues?.type || "",
        orgnrEtater: formValues.etater || [],
      })
        .then((response) => setMuligeMottakereEtater(response))
        .catch((e) => {
          setMuligeMottakereEtater([]);
          setMuligeMottakereFeil(e?.body?.message);
        });
    } else {
      Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
        produserbartdokument: formValues?.type || "",
        orgnr: formValues.organisasjonsnummer || formValues.arbeidsgiver || null,
      })
        .then((response) => setMuligeMottakere(response))
        .catch((e) => {
          setMuligeMottakere(undefined);
          setMuligeMottakereFeil(e?.body?.message);
        });
    }
  };

  useEffect(() => {
    if (kanHenteMuligeMottakere(formValues)) {
      hentMuligeMottakere();
    }
  }, [
    formValues?.type,
    formValues?.valgtMottaker,
    formValues?.organisasjonsnummer,
    formValues?.arbeidsgiver,
    formValues?.etater,
  ]);

  useEffect(() => {
    if (sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE && kanHenteMuligeMottakere(formValues)) {
      setTimeout(() => hentMuligeMottakere(), 500);
    }
  }, [soknadsland]);

  const visInnhold = Boolean(tilgjengeligeMaler && formValues);

  useEffect(() => {
    if (visInnhold) {
      Utils.navigasjon.flyttFokusTilHtmlElementFraId("brevbestilling");
    }
  }, [visInnhold]);

  const finnValgAlternativ = (felt: Api.DokumenterV2.Felt) => {
    return felt?.valg?.valgAlternativer.find((alternativ) => alternativ.kode === formValues?.felt?.[felt.kode]?.valg);
  };

  const hentFormVerdi = (feltNavn: string, hentValgverdi: boolean = false, hentKode: boolean = false): any => {
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

      if (hentKode) {
        return valgtAlternativ?.kode;
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
    const orgnr = formValues.valgtMottaker?.orgnrSettesAvSaksbehandler
      ? formValues.organisasjonsnummer
      : formValues.arbeidsgiver;
    return {
      produserbardokument: formValues.type || "",
      mottaker: mottakerRolle,
      orgNr: erArbeidsgiverEllerVirksomhet(mottakerRolle) ? orgnr : null,
      kontaktpersonNavn:
        erArbeidsgiverEllerVirksomhet(mottakerRolle) && formValues.valgtMottaker?.orgnrSettesAvSaksbehandler
          ? formValues.kontaktperson
          : null,
      orgnrEtater: formValues.etater,
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
      distribusjonstype: hentFormVerdi("DISTRIBUSJONSTYPE", true, true),
      dokumentTittel: hentFormVerdi("DOKUMENT_TITTEL", true),
    };
  };

  const lagFritekstPdfUrl = async (index: number) => {
    const data = {
      produserbardokument: MKV.Koder.brev.produserbaredokumenter.GENERELT_FRITEKSTVEDLEGG,
      mottaker: mottakerErEtat ? KV.Koder.MottakerRolle.ETAT : muligeMottakere?.hovedMottaker.rolle || "",
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

    Api.DokumenterV2.opprettBrev(behandlingID, hentBrevRequest(formValues.valgtMottaker.rolle))
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
    if (aktivtUtkast?.utkastBrevID) {
      Api.Brevutkast.slettBrevutkast(aktivtUtkast.utkastBrevID);
    }
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

  const lagreUtkast = () => {
    if (!formValues?.valgtMottaker) return;

    if (aktivtUtkast?.utkastBrevID) {
      Api.Brevutkast.oppdaterBrevutkast(aktivtUtkast.utkastBrevID, hentBrevRequest(formValues.valgtMottaker.rolle));
    } else {
      Api.Brevutkast.lagreBrevutkast(behandlingID, hentBrevRequest(formValues.valgtMottaker.rolle));
    }
  };

  const overstyrBlurEvent = (event: React.FocusEvent) => {
    event.preventDefault();
  };

  const harValgtEtat = () => formValues.etater && formValues.etater.length > 0;

  if (!tilgjengeligeMaler || !formValues) return null;
  if (!visInnhold) return null;

  const mottakerErValgt = formValues.valgtMottaker;
  const brevtypeErValgt = formValues.valgtBrev;

  const nyttvinduHref = `${URL_BASENAME}/sendbrev/${behandlingID}/${saksnummer}`;
  const vedleggFelt = formValues.valgtBrev?.felter?.find((felt) => felt.kode === Api.DokumenterV2.FeltType.VEDLEGG);
  const fritekstvedleggFelt = formValues.valgtBrev?.felter?.find(
    (felt) => felt.kode === Api.DokumenterV2.FeltType.FRITEKSTVEDLEGG
  );

  const knappErDisabled =
    !redigerbart ||
    !formIsValid ||
    !!formValues.valgtMottaker?.feilmelding ||
    visFritekstvedleggSkjema ||
    Boolean(muligeMottakereFeil);

  return (
    <div className="send_brev">
      <Brevutkast
        changeField={changeField}
        formValues={formValues}
        tilgjengeligeMottakere={tilgjengeligeMottakere}
        utkastPåBehandlingen={utkastPåBehandlingen}
        aktivtUtkast={aktivtUtkast}
        setAktivtUtkast={setAktivtUtkast}
      />

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

      {mottakerErValgt && (
        <Nav.Row>
          <Nav.Column xs={brevTypeSelectWidth}>
            <Skjema.Select
              feltNavn="type"
              label={<Nav.Typo.Element>Velg brev</Nav.Typo.Element>}
              disabled={!redigerbart || tilgjengeligeBrevtyper.length === 1}
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

      {formIsValid && brevtypeErValgt && (muligeMottakere || muligeMottakereEtater) && (
        <Nav.Row>
          <Nav.Column xs={mottakerTabellWidth}>
            <BrevMottakereTabell
              muligeMottakere={muligeMottakere}
              muligeMottakereEtater={muligeMottakereEtater}
              hentBrevRequest={hentBrevRequest}
            />
          </Nav.Column>
        </Nav.Row>
      )}

      {muligeMottakereFeil && (
        <Nav.AlertStripe type="advarsel" className="varsel">
          {muligeMottakereFeil}
        </Nav.AlertStripe>
      )}

      {forhandsvisFritekstvedleggError && (
        <Nav.AlertStripe type="advarsel" className="varsel">
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

      {fritekstvedleggToggle === "enabled" &&
        fritekstvedleggFelt &&
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
        <Nav.Hovedknapp mini disabled={knappErDisabled} className="brevknapp" onClick={sendBrev}>
          Send brev
        </Nav.Hovedknapp>
        <Nav.Knapp mini disabled={knappErDisabled} className="brevknapp" onClick={lagreUtkast}>
          Lagre og fortsett senere
        </Nav.Knapp>
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
