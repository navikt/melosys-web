import React, { useCallback, useEffect, useState, Fragment } from "react";
import { connect, ConnectedProps } from "react-redux";
import { change, getFormValues, reduxForm } from "redux-form";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import { Action } from "redux";
import { Organisasjon } from "Domene";

import * as Nav from "../../../../utils/navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { OrganisasjonOperations } from "../../../../ducks/organisasjoner";
import { formSelectors } from "../../../../ducks/form";
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from "../../../../yup";
import { OrganisasjonsAdresse } from "../../../adresser";
import { RepresentantData } from "../../../../services/modules/representant";

import "./vurderingRepresentant.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formValues: getFormValues(KV.Form.REPRESENTANT)(state),
  initialValues: {
    selvbetalende: true,
  },
  formIsValid: formSelectors.VurderRepresentantFormValid(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentOrganisasjon: (orgnr: string) => dispatch(OrganisasjonOperations.hent(orgnr)),
  changeField: (field: string, data: any) => dispatch(change(KV.Form.REPRESENTANT, field, data)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void;
  oppdater: () => void;
  tilbake: () => void;
  redigerbart: boolean;
  formValues: {
    representantnummer?: string;
    selvbetalende?: boolean;
    organisasjonsnummer?: string;
    kontaktperson?: string;
  };
}

const VurderingRepresentant = ({
  bekreft,
  oppdater,
  tilbake,
  redigerbart,
  formValues,
  hentOrganisasjon,
  formIsValid,
  behandlingID,
  changeField,
}: Props & PropsFromRedux) => {
  const [representantListe, setRepresentantListe] = useState<{ navn: string; nummer: string }[]>([]);
  const [representantData, setRepresentantData] = useState<RepresentantData>();
  const [organisasjon, setOrganisasjon] = useState<Organisasjon | undefined>();
  const [representantnummerFeil, setRepresentantnummerFeil] = useState<{ feilmelding: string }>();
  const [organisasjonsnummerFeil, setOrganisasjonsnummerFeil] = useState<{ feilmelding: string }>();
  const hjelpetekstNummer =
    "Sjekk representantlisten og skriv inn riktig representantnummer. Om det ikke finnes et representantnummer, må du opprette dette i Avgiftssystemet. Opplysningene vil bli overført til Avgiftssystemet når du fatter vedtak.";
  const hjelpetekstAdresse =
    "Kopi av vedtak sendes til adressen som hentes opp når du legger inn organisasjonsnummer. Kontroller at org.nr. og adresse er korrekt og stemmer overens med det som ligger i Avgiftssystemet.";

  useEffect(() => {
    Api.Representant.hentRepresentantListe()
      .then((liste: Api.Representant.Representant[]) => {
        setRepresentantListe(liste.sort((a, b) => Utils.streng.compareObjektByFelt(a, b, "nummer")));
      })
      .catch(Utils.logger.error);
    Api.Representant.hentValgtRepresentant(behandlingID)
      .then((response) => {
        if (response.representantnummer) changeField("representantnummer", response.representantnummer);
        if (response.selvbetalende) changeField("selvbetalende", response.selvbetalende);
        if (response.organisasjonsnummer) changeField("organisasjonsnummer", response.organisasjonsnummer);
        if (response.kontaktperson) changeField("kontaktperson", response.kontaktperson);
      })
      .catch(Utils.logger.error);
  }, []);

  async function hentOrganisasjonHvisValid(orgnr: string, valid: boolean) {
    if (valid) {
      const response = await hentOrganisasjon(orgnr);
      if (response.data.response) {
        setOrganisasjonsnummerFeil({
          feilmelding:
            response.data.response.status === 404
              ? "Kunne ikke finne organisasjon"
              : "Feil ved henting av organisasjon",
        });
        return;
      }
      setOrganisasjon(response.data);
    }
  }

  useEffect(() => {
    if (formValues && formValues.organisasjonsnummer) {
      setOrganisasjon(undefined);
      const valid = Utils.organisasjon.erOrgnrGyldig(formValues.organisasjonsnummer);
      setOrganisasjonsnummerFeil(valid ? undefined : { feilmelding: "Ugyldig organisasjonsnummer" });
      hentOrganisasjonHvisValid(formValues.organisasjonsnummer, valid);
    }
  }, [formValues && formValues.organisasjonsnummer]);

  useEffect(() => {
    if (formValues && formValues.representantnummer) {
      if (/^\d+$/.test(formValues.representantnummer)) {
        setRepresentantnummerFeil(undefined);
        Api.Representant.hentRepresentant(formValues.representantnummer)
          .then(setRepresentantData)
          .catch(Utils.logger.error);
      } else {
        setRepresentantnummerFeil({ feilmelding: "Ugyldig representantnummer" });
        setRepresentantData(undefined);
      }
    }
  }, [formValues && formValues.representantnummer]);

  function lagreRepresentantValg(data: { formValues: any; formIsValid: boolean }) {
    if (data.formIsValid && data.formValues) {
      Api.Representant.sendValgtRepresentant(behandlingID, {
        representantnummer: data.formValues.representantnummer || "",
        selvbetalende: !!data.formValues.selvbetalende,
        organisasjonsnummer: data.formValues.organisasjonsnummer || null,
        kontaktperson: data.formValues.kontaktperson || null,
      }).catch(Utils.logger.error);
    }
  }

  const debouncedLagring = useCallback(Utils._debounce(lagreRepresentantValg, 1000), []);

  useEffect(() => {
    oppdater();
    debouncedLagring({ formValues, formIsValid });
  }, [formIsValid, formValues]);

  return (
    <div className="vurderingRepresentant">
      <Nav.typo.Undertittel className="undertittel">Representant i Norge</Nav.typo.Undertittel>

      <Nav.Row>
        <Nav.Fieldset
          legend={
            <div className="representantnummer">
              Representantnummer til Avgiftssystemet
              <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekstNummer} type={Nav.PopoverOrientering.Hoyre}>
                {hjelpetekstNummer}
              </Nav.Hjelpetekst>
            </div>
          }
          className="velg-representantnummer"
        >
          <Nav.Column xs="5">
            <Skjema.Input
              feltNavn="representantnummer"
              label="Velg eller skriv inn representantnummer"
              list="dataliste-representanter"
              placeholder="Velg eller skriv inn"
              feil={representantnummerFeil}
              disabled={!redigerbart}
            />
            <datalist id="dataliste-representanter">
              {representantListe.map((rep) => (
                <option key={Utils._uuid()} value={rep.nummer}>
                  {rep.navn}
                </option>
              ))}
            </datalist>
            <Skjema.Checkbox feltNavn="selvbetalende" label="Søker er selvbetalende" />
          </Nav.Column>
        </Nav.Fieldset>
      </Nav.Row>

      {formValues && !formValues.selvbetalende && (
        <Nav.Row>
          <Nav.typo.Undertittel className="representantadresse">
            <Fragment>
              Representantens adresse
              <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekstAdresse} type={Nav.PopoverOrientering.Hoyre}>
                {hjelpetekstAdresse}
              </Nav.Hjelpetekst>
            </Fragment>
          </Nav.typo.Undertittel>
          <Nav.Column xs="3">
            <Skjema.Input
              feltNavn="organisasjonsnummer"
              label={<Nav.typo.Element>Organisasjonsnummer</Nav.typo.Element>}
              placeholder="Skriv inn"
              disabled={!redigerbart}
              feil={organisasjonsnummerFeil}
            />
            {organisasjon && <OrganisasjonsAdresse organisasjon={organisasjon} visNavn boldNavn visTittel={false} />}
          </Nav.Column>
          <Nav.Column xs="5">
            <Skjema.Input
              feltNavn="kontaktperson"
              label={
                <Nav.typo.Element>
                  Kontaktperson <span className="valgfritt">(valgfritt)</span>
                </Nav.typo.Element>
              }
              placeholder="Skriv inn"
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      )}

      <div className="fane__knapplinje">
        <Nav.Knapp mini disabled={!redigerbart} className="fane__navigasjonsknapp" onClick={tilbake}>
          Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp
          mini
          disabled={!redigerbart || !formIsValid}
          className="fane__navigasjonsknapp"
          onClick={bekreft}
        >
          Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingRepresentantForm = reduxForm<{}, Props & PropsFromRedux>({
  form: KV.Form.REPRESENTANT,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(YupSkjemaer.vurdering_representant),
})(VurderingRepresentant);

export default connector(VurderingRepresentantForm);
