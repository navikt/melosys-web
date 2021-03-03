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

import "./vurderingRepresentant.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formValues: getFormValues(KV.Form.REPRESENTANT)(state),
  initialValues: {
    selvbetalende: true,
  },
  formIsValid: formSelectors.VurderRepresentantFormValid(state),
  representantnummerValid: formSelectors.VurderRepresentantRepresentantnummerValid(state),
  organisasjonsnummerValid: formSelectors.VurderRepresentantOrganisasjonsnummerValid(state),
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
  representantnummerValid,
  organisasjonsnummerValid,
}: Props & PropsFromRedux) => {
  const [representantListe, setRepresentantListe] = useState<Api.Representant.RepresentantListeResDto>([]);
  const [representantData, setRepresentantData] = useState<Api.Representant.RepresentantDataResDto>();
  const [organisasjon, setOrganisasjon] = useState<Organisasjon | undefined>();
  const hjelpetekstNummer =
    "Representantnummeret du legger til her vil bli overført til Avgiftssystemet (ME7-bildet) når du fatter vedtak.\nSkal du opprette en ny representant, må du gjøre det i Avgiftssystemet.\nListen du finner her oppdateres hvert døgn. Hvis du har opprettet eller endret en representant i Avgiftssystemet i dag, vil du derfor ikke finne oppdateringen her. Dette har ikke betydning for overføringen til Avgiftssystemet, så lenge nummeret er riktig.";
  const hjelpetekstAdresse =
    "Kopi av vedtak sendes til adressen som hentes opp når du legger inn organisasjonsnummer. Kontroller at org.nr. og adresse er korrekt og stemmer overens med det som ligger i Avgiftssystemet.";

  useEffect(() => {
    Api.Representant.hentRepresentantListe()
      .then((liste: Api.Representant.RepresentantListeResDto) => {
        setRepresentantListe(liste.sort((a, b) => a.nummer.localeCompare(b.nummer)));
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

  async function hentOrganisasjonHvisValid(data: { orgnr: string; valid: boolean }) {
    if (data.valid) {
      const response = await hentOrganisasjon(data.orgnr);
      if (response.data.response) {
        Utils.logger.error(
          response.data.response.status === 404 ? "Kunne ikke finne organisasjon" : "Feil ved henting av organisasjon"
        );
      } else {
        setOrganisasjon(response.data);
      }
    }
  }
  const debouncedHentOrganisasjon = useCallback(Utils._debounce(hentOrganisasjonHvisValid, 1000), []);

  useEffect(() => {
    setOrganisasjon(undefined);
    if (formValues && formValues.organisasjonsnummer) {
      debouncedHentOrganisasjon({ orgnr: formValues.organisasjonsnummer, valid: organisasjonsnummerValid });
    }
  }, [formValues && formValues.organisasjonsnummer, organisasjonsnummerValid]);

  function hentRepresentant(data: { representantnummer: string; valid: boolean }) {
    if (data.valid) {
      Api.Representant.hentRepresentant(data.representantnummer)
        .then(setRepresentantData)
        .catch(() => {});
    } else {
      setRepresentantData(undefined);
    }
  }
  const debouncedHentRepresentant = useCallback(Utils._debounce(hentRepresentant, 1000), []);

  useEffect(() => {
    setRepresentantData(undefined);
    if (formValues && formValues.representantnummer) {
      debouncedHentRepresentant({ representantnummer: formValues.representantnummer, valid: representantnummerValid });
    }
  }, [formValues && formValues.representantnummer, representantnummerValid]);

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
                {hjelpetekstNummer.split("\n").map((paragraf) => (
                  <p key={Utils._uuid()}>{paragraf}</p>
                ))}
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
              disabled={!redigerbart}
              autoComplete="off"
            />
            <datalist id="dataliste-representanter">
              {representantListe.map((rep) => (
                <option key={Utils._uuid()} value={rep.nummer}>
                  {`${rep.navn} (${rep.nummer})`}
                </option>
              ))}
            </datalist>
            <Skjema.Checkbox feltNavn="selvbetalende" label="Søker er selvbetalende" />
          </Nav.Column>
          {representantData && (
            <Nav.Column xs="6">
              <div className="representantData">
                <p className="dataelement">{`${representantData.navn} (${representantData.nummer})`}</p>
                {representantData.adresselinjer.length > 0 &&
                  representantData.adresselinjer.map((linje) => (
                    <p className="dataelement" key={Utils._uuid()}>
                      {linje}
                    </p>
                  ))}
                <p className="dataelement">{representantData.postnummer}</p>
                <p className="dataelement">
                  <b>Org.nr.: </b>
                  {representantData.orgnr}
                </p>
              </div>
            </Nav.Column>
          )}
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
          <Nav.Column xs="4">
            <Skjema.Input
              feltNavn="organisasjonsnummer"
              label={<Nav.typo.Element>Organisasjonsnummer</Nav.typo.Element>}
              placeholder="Skriv inn"
              disabled={!redigerbart}
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
