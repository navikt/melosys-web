import React, { Fragment, useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { getFormValues, reduxForm } from "redux-form";
import { AlertStripeFeil } from "nav-frontend-alertstriper";
import * as Skjema from "../../skjema";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Api from "../../../services/api";
import * as Utils from "../../../utils";
import sendBrevSchema from "../sendBrevSchema";
import { lagYupToReduxformErrorMapper } from "../../../yup";
import { OrganisasjonsAdresse } from "../../adresser";
import MottakerAdresseComponent from "./mottakerAdresse";
import BeskrivelseHjelpetekstComponent from "./beskrivelseHjelpetekst";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { OrganisasjonOperations } from "../../../ducks/organisasjoner";
import { formSelectors } from "../../../ducks/form";

const { BRUKER, ARBEIDSGIVER } = KV.Koder.MottakerRolle;

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.SEND_BREV)(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  orgnrValid: formSelectors.SendBrevOrgnummerValidSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentOrganisasjon: (orgnr: string) => dispatch(OrganisasjonOperations.hent(orgnr)),
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
  muligeMottakere: Api.DokumenterV2.HentMuligeMottakereResDto | undefined;
  setMuligeMottakere: (muligeMottakere: Api.DokumenterV2.HentMuligeMottakereResDto | undefined) => void;
  setMottakerFeil: (mottakerFeil: string | undefined) => void;
  mottakerFeil: string | undefined;
}

const BrevMottaker = ({
  formValues,
  redigerbart,
  behandlingID,
  hentOrganisasjon,
  setMuligeMottakere,
  orgnrValid,
  setMottakerFeil,
  mottakerFeil,
}: Props & PropsFromRedux) => {
  const [adresse, setAdresse] = useState<{
    mottakerAdresse?: Api.DokumenterV2.MottakerAdresse;
    organisasjonsAdresse?: Api.Organisasjon;
  }>();

  const finnMottakerFraValgtMal = (uuid?: string) => {
    if (!formValues?.valgtMal) return undefined;
    return formValues.valgtMal.muligeMottakere.find((muligMottaker) => muligMottaker.uuid === uuid);
  };
  const mottakerErBruker = finnMottakerFraValgtMal(formValues?.mottaker)?.rolle === BRUKER;
  const mottakerErArbeidsgiver =
    finnMottakerFraValgtMal(formValues?.mottaker)?.rolle === ARBEIDSGIVER &&
    !finnMottakerFraValgtMal(formValues?.mottaker)?.orgnrSettesAvSaksbehandler;
  const mottakerOrgNrSettesAvSaksbehandler =
    finnMottakerFraValgtMal(formValues?.mottaker)?.rolle === ARBEIDSGIVER &&
    finnMottakerFraValgtMal(formValues?.mottaker)?.orgnrSettesAvSaksbehandler;

  const arbeidsgiverHjelptekst =
    "Hvis arbeidsgiveren du ønsker å sende brev til ikke vises her, må du legge til denne i sidemenyen under «Arbeidsgiver/virksomhet». Det samme gjelder hvis du skal legge til kontaktopplysninger. \nHvis arbeidsgiveren ikke er en nåværende arbeidsgiver, kan du velge «Annen organisasjon» som mottaker og legge den til manuelt.";

  const hentMuligeMottakere = (valgtMal: string, orgnr: string | undefined) => {
    Api.DokumenterV2.hentMuligeMottakere(behandlingID, { produserbartdokument: valgtMal, orgnr: orgnr || null }).then(
      setMuligeMottakere
    );
  };

  const hentOrganisasjonIfValid = async (data: { orgnr?: string; valid: boolean; type: string }) => {
    if (!data.valid || !data.orgnr) return;
    const response = await hentOrganisasjon(data.orgnr);
    if (response.data.response) {
      setMottakerFeil(
        response.data.response.status === 404 ? "Kunne ikke finne organisasjon" : "Feil ved henting av organisasjon"
      );
    } else {
      setAdresse({ organisasjonsAdresse: response.data });
      hentMuligeMottakere(data.type, data.orgnr);
    }
  };

  const debouncedHentOrganisasjon = useCallback(Utils._debounce(hentOrganisasjonIfValid, 500), []);

  useEffect(() => {
    setAdresse(undefined);
    setMottakerFeil(undefined);
    setMuligeMottakere(undefined);
    if (!formValues || !formValues.type) return;
    const mottaker = finnMottakerFraValgtMal(formValues.mottaker);
    if (!mottaker) return;
    if (mottaker.rolle === BRUKER) {
      if (mottaker.feilmelding) setMottakerFeil(mottaker.feilmelding);
      else {
        setAdresse({ mottakerAdresse: mottaker?.adresser ? mottaker.adresser[0] : undefined });
        hentMuligeMottakere(formValues.type, undefined);
      }
    }
    if (mottaker.rolle === ARBEIDSGIVER && mottaker.orgnrSettesAvSaksbehandler) {
      debouncedHentOrganisasjon({ orgnr: formValues.organisasjonsnummer, valid: orgnrValid, type: formValues.type });
    }
    if (mottaker.rolle === ARBEIDSGIVER && !mottaker.orgnrSettesAvSaksbehandler) {
      if (mottaker.feilmelding) setMottakerFeil(mottaker.feilmelding);
    }
  }, [formValues?.mottaker, formValues?.organisasjonsnummer, orgnrValid]);

  useEffect(() => {
    setAdresse(undefined);
    setMuligeMottakere(undefined);
    if (formValues?.arbeidsgiver && formValues?.type) {
      const mottaker = finnMottakerFraValgtMal(formValues.mottaker);
      setAdresse({
        mottakerAdresse:
          mottaker && mottaker?.adresser
            ? mottaker.adresser.find(
                (mottakerAdresse: Api.DokumenterV2.MottakerAdresse) =>
                  mottakerAdresse.tittel.orgnr === formValues.arbeidsgiver
              )
            : undefined,
      });
      hentMuligeMottakere(formValues.type, formValues.arbeidsgiver);
    }
  }, [formValues?.arbeidsgiver]);

  return (
    <>
      <Skjema.Select
        feltNavn="mottaker"
        label={
          <BeskrivelseHjelpetekstComponent
            beskrivelse="Mottaker"
            hjelpetekst={formValues.valgtMal?.mottakereHjelpetekst || null}
          />
        }
        disabled={!redigerbart || formValues.valgtMal?.muligeMottakere.length === 1}
        emptyFieldText="Velg..."
        emptyFieldDisabled={!!formValues.mottaker}
      >
        {formValues.valgtMal?.muligeMottakere.map((mottaker) => (
          <option key={mottaker.uuid} value={mottaker.uuid}>
            {mottaker.type}
          </option>
        ))}
      </Skjema.Select>
      {mottakerErBruker && (
        <Nav.Row>
          <Nav.Column xs="12">
            {mottakerFeil && <AlertStripeFeil>{mottakerFeil}</AlertStripeFeil>}
            {adresse?.mottakerAdresse && (
              <MottakerAdresseComponent {...adresse?.mottakerAdresse} className="brukeradresse" />
            )}
          </Nav.Column>
        </Nav.Row>
      )}

      {mottakerErArbeidsgiver && (
        <Nav.Row>
          {mottakerFeil ? (
            <AlertStripeFeil>{mottakerFeil}</AlertStripeFeil>
          ) : (
            <Nav.Column xs="12">
              <Nav.Typo.Normaltekst style={{ marginBottom: "0.5rem" }} tag="div">
                Velg:
                <Nav.Hjelpetekst
                  className="hjelpetekst"
                  tittel={arbeidsgiverHjelptekst}
                  type={Nav.PopoverOrientering.Venstre}
                >
                  {arbeidsgiverHjelptekst.split("\n").map((paragraf) => (
                    <p key={Utils._uuid()}>{paragraf}</p>
                  ))}
                </Nav.Hjelpetekst>
              </Nav.Typo.Normaltekst>
              {finnMottakerFraValgtMal(formValues.mottaker)?.adresser?.map(
                (virksomhet: Api.DokumenterV2.MottakerAdresse) => (
                  <Fragment key={Utils._uuid()}>
                    <Skjema.Radio
                      className="arbeidsgiver_radio"
                      feltNavn="arbeidsgiver"
                      label={`${virksomhet.tittel.mottakerNavn} (org.nr. ${virksomhet.tittel.orgnr})`}
                      id={`arbeidsgiver.${virksomhet.tittel.orgnr}`}
                      key={`arbeidsgiver.${virksomhet.tittel.orgnr}`}
                      value={virksomhet.tittel.orgnr}
                      disabled={!redigerbart}
                    />
                    {formValues.arbeidsgiver === virksomhet.tittel.orgnr && adresse?.mottakerAdresse && (
                      <MottakerAdresseComponent {...adresse?.mottakerAdresse} className="arbeidsgiveradresse" />
                    )}
                  </Fragment>
                )
              )}
            </Nav.Column>
          )}
        </Nav.Row>
      )}

      {mottakerOrgNrSettesAvSaksbehandler && (
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.Input
              feltNavn="organisasjonsnummer"
              label="Organisasjonsnummer"
              placeholder="Skriv inn"
              disabled={!redigerbart}
            />
            {adresse?.organisasjonsAdresse && (
              <OrganisasjonsAdresse organisasjon={adresse.organisasjonsAdresse} visNavn boldNavn visTittel={false} />
            )}
          </Nav.Column>
          <Nav.Column xs="6">
            <Skjema.Input
              feltNavn="kontaktperson"
              label="Kontaktperson"
              placeholder="Skriv inn"
              disabled={!redigerbart}
            />
          </Nav.Column>
          {mottakerFeil && <AlertStripeFeil>{mottakerFeil}</AlertStripeFeil>}
        </Nav.Row>
      )}
    </>
  );
};

const BrevMottakerForm = reduxForm<{}, Props & PropsFromRedux>({
  form: KV.Form.SEND_BREV,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(sendBrevSchema),
})(BrevMottaker);

export default connector(BrevMottakerForm);
