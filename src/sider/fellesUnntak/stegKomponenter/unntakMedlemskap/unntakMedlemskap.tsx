import React, { useCallback } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import { FieldValues, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Mui from "../../../../felleskomponenter/ui";
import MKV from "../../../../melosyskodeverk";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import * as Utils from "../../../../utils";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import unntak_medlemskap from "./unntakMedlemskapSchema";

const UnntakMedlemskap = () => {
  const dispatch = useDispatch();
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const periodeMottatteOpplysninger = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const periodeLovvalg = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);

  const { control, watch, formState } = useForm({
    resolver: yupResolver(unntak_medlemskap),
    // context: { vurdering },
    mode: "onChange",
    defaultValues: {
      fom: Utils.dato.formatterDatoTilNorsk(periodeLovvalg.fom ? periodeLovvalg.fom : periodeMottatteOpplysninger.fom),
      tom: Utils.dato.formatterDatoTilNorsk(periodeLovvalg.tom ? periodeLovvalg.tom : periodeMottatteOpplysninger.tom),
      bestemmelse: "",
      vurdering: "",
    } as FieldValues,
  });
  const formValues = watch();

  const lagreFom = (fom: string) => {
    debouncedOppdaterPeriode({ fom, tom: formValues.tom });
  };

  const lagreTom = (tom: string) => {
    debouncedOppdaterPeriode({ fom: formValues.fom, tom });
  };

  const debouncedOppdaterPeriode = useCallback(
    Utils._debounce((data: { fom: string; tom: string }) => {
      dispatch(
        lovvalgsperioderOperations.oppdaterLovvalgsperioderState({
          lovvalgsperiode: {
            fom: Utils.dato.formatterDatoTilISO(data.fom, null, ""),
            tom: Utils.dato.formatterDatoTilISO(data.tom, null, ""),
          },
        })
      );
      dispatch(lovvalgsperioderOperations.lagre());
    }, 500),
    []
  );

  console.log("bestemmelse", formValues.bestemmelse);
  console.log("state", formState);
  return (
    <div className="unntakMedlemskap">
      <Nav.Typo.Undertittel className="undertittel">Vurder unntaksperioder</Nav.Typo.Undertittel>
      <Nav.Fieldset legend="Vurder unntaksperiode">
        <Skjema.RadioV2
          name="vurdering"
          control={control}
          label="Godkjenn unntaksperiode"
          value={MKV.Koder.innvilgelsesResultat.INNVILGET}
          checked={formValues.vurdering === MKV.Koder.innvilgelsesResultat.INNVILGET}
        />
        <Skjema.RadioV2
          name="vurdering"
          control={control}
          label="Godkjenn, men endre periode"
          value={MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET}
          checked={formValues.vurdering === MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET}
        />
        <Skjema.RadioV2
          name="vurdering"
          control={control}
          label="Ikke godkjenn"
          value={MKV.Koder.innvilgelsesResultat.AVSLAATT}
          checked={formValues.vurdering === MKV.Koder.innvilgelsesResultat.AVSLAATT}
        />
      </Nav.Fieldset>

      {formValues.vurdering === MKV.Koder.innvilgelsesResultat.INNVILGET && (
        <Nav.Column xs="4">
          <Skjema.SelectV2
            name="bestemmelse"
            control={control}
            label="Bestemmelse"
            emptyFieldText="Velg"
            feil={(formState.errors.bestemmelse?.message as any)?.melding}
            emptyFieldDisabled={!!formValues.bestemmelse}
            disabled={!redigerbart}
          >
            {MKV.KTObjects.landkoder.map((item: KTObject) => (
              <option key={item.kode} value={item.kode}>
                {item.term}
              </option>
            ))}
          </Skjema.SelectV2>
        </Nav.Column>
      )}

      {formValues.vurdering === MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET && (
        <Nav.Fieldset legend="Lovvalgsperiode">
          <Nav.Row>
            <Nav.Column xs="2">
              <Skjema.DatovelgerV2
                label="Fra og med:"
                name="fom"
                feil={(formState.errors.fom?.message as any)?.melding}
                disabled={!redigerbart}
                control={control}
                onChange={lagreFom}
              />
            </Nav.Column>
            <Nav.Column xs="2">
              <Skjema.DatovelgerV2
                label="Til og med:"
                name="tom"
                feil={(formState.errors.tom?.message as any)?.melding}
                disabled={!redigerbart}
                control={control}
                onChange={lagreTom}
              />
            </Nav.Column>
            <Nav.Column xs="4">
              <Skjema.SelectV2
                name="bestemmelse"
                control={control}
                label="Bestemmelse"
                emptyFieldText="Velg"
                feil={(formState.errors.bestemmelse?.message as any)?.melding}
                emptyFieldDisabled={!!formValues.bestemmelse}
                disabled={!redigerbart}
              >
                {MKV.KTObjects.landkoder.map((item: KTObject) => (
                  <option key={item.kode} value={item.kode}>
                    {item.term}
                  </option>
                ))}
              </Skjema.SelectV2>
            </Nav.Column>
          </Nav.Row>
          <Nav.AlertStripeInfo className="alert">
            Ved endring av unntaksperiode bør det sendes informasjon til utenlandsk myndighet. Benytt fritekstbrev i
            brevmenyen.
          </Nav.AlertStripeInfo>
        </Nav.Fieldset>
      )}

      {formValues.vurdering === MKV.Koder.innvilgelsesResultat.AVSLAATT && (
        <Nav.AlertStripeInfo className="alert">
          Ved endring av unntaksperiode bør det sendes informasjon til utenlandsk myndighet. Benytt fritekstbrev i
          brevmenyen.
        </Nav.AlertStripeInfo>
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: () => console.log("bekreft"),
          disabled: !formState?.isValid || !redigerbart,
        }}
        bekreftTekst="Bekreft og avslutt"
      />
    </div>
  );
};

export default UnntakMedlemskap;
