import React, { useCallback, useEffect } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import { FieldValues, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";

import MKV from "../../../melosyskodeverk";
import * as Forms from "../../../felleskomponenter/forms";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";
import * as Utils from "../../../utils";

import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";

import vurdering_unntak_medlemskap from "./vurderingUnntakMedlemskapSchema";
import "./vurderingUnntakMedlemskap.css";

const { INNVILGET, DELVIS_INNVILGET, AVSLAATT } = MKV.Koder.innvilgelsesResultat;

interface VurderingUnntakMedlemskapProps {
  oppdaterStatus: (isValid: boolean) => void;
  tilbake: () => void;
}

const VurderingUnntakMedlemskap = ({ oppdaterStatus, tilbake }: VurderingUnntakMedlemskapProps) => {
  const dispatch = useDispatch();
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const mottatteOpplysningerPeriode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const lovvalgsperiode = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);

  const { control, getValues, formState } = useForm({
    resolver: yupResolver(vurdering_unntak_medlemskap),
    context: { sluttDato: mottatteOpplysningerPeriode.tom },
    mode: "all",
    defaultValues: {
      innvilgelsesResultat: lovvalgsperiode.innvilgelsesResultat,
      fom: Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato || mottatteOpplysningerPeriode.fom),
      tom: Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato || mottatteOpplysningerPeriode.tom),
      bestemmelse: lovvalgsperiode.bestemmelse || "",
    } as FieldValues,
  });
  const formValues = getValues();

  useEffect(() => {
    oppdaterStatus(formState.isValid);
  }, [formState?.isValid]);

  const lagreFom = (fom: string) => {
    debouncedOppdaterPeriode({ fom, tom: formValues.tom, innvilgelsesResultat: formValues.innvilgelsesResultat });
  };

  const lagreTom = (tom: string) => {
    debouncedOppdaterPeriode({ fom: formValues.fom, tom, innvilgelsesResultat: formValues.innvilgelsesResultat });
  };

  const lagreInnvilgelsesResultat = (innvilgelsesResultat: string) => {
    dispatch(
      lovvalgsperioderOperations.oppdaterLovvalgsperioderState({
        innvilgelsesResultat,
      })
    );
    dispatch(lovvalgsperioderOperations.lagre());
  };

  const debouncedOppdaterPeriode = useCallback(
    Utils._debounce((data: { fom: string; tom: string; innvilgelsesResultat: string }) => {
      dispatch(
        lovvalgsperioderOperations.oppdaterLovvalgsperioderState({
          lovvalgsperiode: {
            fom: Utils.dato.formatterDatoTilISO(data.fom, null, ""),
            tom: Utils.dato.formatterDatoTilISO(data.tom, null, ""),
          },
          innvilgelsesResultat: data.innvilgelsesResultat,
        })
      );
      dispatch(lovvalgsperioderOperations.lagre());
    }, 500),
    []
  );

  return (
    <div className="vurderingUnntakMedlemskap">
      <Nav.Typo.Undertittel className="undertittel">Vurder unntaksperioder</Nav.Typo.Undertittel>
      <Nav.Fieldset legend="Vurder unntaksperiode">
        <Forms.Radio
          name="innvilgelsesResultat"
          control={control}
          label="Godkjenn unntaksperiode"
          value={INNVILGET}
          onChange={lagreInnvilgelsesResultat}
        />
        <Forms.Radio
          name="innvilgelsesResultat"
          control={control}
          label="Godkjenn, men endre periode"
          value={DELVIS_INNVILGET}
          onChange={lagreInnvilgelsesResultat}
        />
        <Forms.Radio
          name="innvilgelsesResultat"
          control={control}
          label="Ikke godkjenn"
          value={AVSLAATT}
          onChange={lagreInnvilgelsesResultat}
        />
      </Nav.Fieldset>

      {formValues.innvilgelsesResultat === INNVILGET && (
        <>
          <Nav.Row>
            <Nav.Column xs="4">
              <Forms.Select
                name="bestemmelse"
                control={control}
                label="Bestemmelse"
                emptyFieldText="Velg"
                emptyFieldDisabled={!!formValues.bestemmelse}
                disabled={!redigerbart}
              >
                {MKV.KTObjects.landkoder.map((item: KTObject) => (
                  <option key={item.kode} value={item.kode}>
                    {item.term}
                  </option>
                ))}
              </Forms.Select>
            </Nav.Column>
          </Nav.Row>
          {Utils._isEmpty(mottatteOpplysningerPeriode.tom) && (
            <Nav.AlertStripeAdvarsel className="vurderingUnntakMedlemskap__alertstripe">
              Du kan ikke godkjenne en unntaksperiode med åpen sluttdato
            </Nav.AlertStripeAdvarsel>
          )}
        </>
      )}

      {formValues.innvilgelsesResultat === DELVIS_INNVILGET && (
        <Nav.Fieldset legend="Lovvalgsperiode">
          <Nav.Row>
            <Nav.Column xs="2">
              <Forms.Datovelger
                label="Fra og med"
                name="fom"
                disabled={!redigerbart}
                control={control}
                onChange={lagreFom}
              />
            </Nav.Column>
            <Nav.Column xs="2">
              <Forms.Datovelger
                label="Til og med"
                name="tom"
                disabled={!redigerbart}
                control={control}
                onChange={lagreTom}
              />
            </Nav.Column>
            <Nav.Column xs="4">
              <Forms.Select
                name="bestemmelse"
                control={control}
                label="Bestemmelse"
                emptyFieldText="Velg"
                emptyFieldDisabled={!!formValues.bestemmelse}
                disabled={!redigerbart}
              >
                {MKV.KTObjects.landkoder.map((item: KTObject) => (
                  <option key={item.kode} value={item.kode}>
                    {item.term}
                  </option>
                ))}
              </Forms.Select>
            </Nav.Column>
          </Nav.Row>
          <Nav.AlertStripeInfo className="vurderingUnntakMedlemskap__alertstripe">
            Ved endring av unntaksperiode bør det sendes informasjon til utenlandsk myndighet. Benytt fritekstbrev i
            brevmenyen.
          </Nav.AlertStripeInfo>
        </Nav.Fieldset>
      )}

      {formValues.innvilgelsesResultat === AVSLAATT && (
        <Nav.AlertStripeInfo className="vurderingUnntakMedlemskap__alertstripe">
          Ved endring av unntaksperiode bør det sendes informasjon til utenlandsk myndighet. Benytt fritekstbrev i
          brevmenyen.
        </Nav.AlertStripeInfo>
      )}

      <Mui.StegKnapper
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
        bekreftKnappProps={{
          onClick: () => console.log("bekreft"),
          disabled: !formState?.isValid || !redigerbart,
        }}
        bekreftTekst="Bekreft og avslutt"
      />
    </div>
  );
};

export default VurderingUnntakMedlemskap;
