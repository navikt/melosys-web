import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Utils from "../../../../utils";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { FellesHandlersContext } from "../../../../contexts";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { landkoderSelectors } from "../../../../ducks/landkoder";

import vurderingStartSchema from "./vurderingStartSchema";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingStart = ({ bekreft, aktivtSteg, oppdaterStatus }: Props) => {
  const dispatch = useDispatch();

  const søknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const søknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const landkoder = useSelector(landkoderSelectors.LandkoderFraSakstypeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.SisteOpplysningerHentetDatoSelector);

  const { control, watch, formState, trigger } = useForm({
    resolver: yupResolver(vurderingStartSchema),
    mode: "all",
    defaultValues: {
      fom: søknadsperiode && Utils.dato.formatterDatoTilNorsk(søknadsperiode.fom),
      tom: søknadsperiode && Utils.dato.formatterDatoTilNorsk(søknadsperiode.tom),
      land: søknadsland && søknadsland.toString(),
    } as FieldValues,
  });
  const formValues = watch();
  const [initialValues, setInitialValues] = useState<FieldValues>({ ...formState.defaultValues });

  const [visSpinner, setVisSpinner] = useState(false);
  const { oppfriskOgLastInnSaksopplysninger } = useContext(FellesHandlersContext) as any;

  const skalHenteRegisteropplysninger =
    !registeropplysningerHentet ||
    formValues?.fom !== initialValues?.fom ||
    formValues?.tom !== initialValues?.tom ||
    formValues?.land !== initialValues?.land;

  const stegErGyldig = formState?.isValid && !skalHenteRegisteropplysninger && !visSpinner;

  useEffect(() => {
    if (registeropplysningerHentet) {
      dispatch(menypanelOperations.visMenypanel());
    }
  }, []);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  useEffect(() => {
    trigger("tom");
  }, [formValues.fom, trigger]);

  const lagrePeriodeOgLand = () => {
    dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland([formValues.land], false));

    dispatch(
      mottatteOpplysningerOperations.oppdaterPeriode({
        fom: Utils.dato.formatterDatoTilISO(formValues.fom, null, ""),
        tom: Utils.dato.formatterDatoTilISO(formValues.tom, null, ""),
      })
    );
  };
  const bekreftHandle = async () => {
    setInitialValues({
      fom: formValues.fom,
      tom: formValues.tom,
      land: formValues.land,
    });
    lagrePeriodeOgLand();

    if (skalHenteRegisteropplysninger) {
      setVisSpinner(true);
      await oppfriskOgLastInnSaksopplysninger();
      setVisSpinner(false);
      dispatch(menypanelOperations.visMenypanel());
    }
    bekreft();
  };

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingStart">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Oppgi søknadsperiode og -land</Nav.Typo.Innholdstittel>

      <Nav.Fieldset legend="Periode">
        <Nav.Row>
          <Nav.Column xs="3">
            <Forms.Datovelger label="Fra og med" name="fom" disabled={!redigerbart} control={control} />
          </Nav.Column>
          <Nav.Column xs="3">
            <Forms.Datovelger label="Til og med" name="tom" disabled={!redigerbart} control={control} />
          </Nav.Column>
          <Nav.Column xs="5">
            <Forms.Select
              label={
                <LabelMedHjelpetekst
                  label="Land"
                  hjelpetekst="SETT INN HJELPETEKST"
                  hjelpetekstClassName="hjelpetekst"
                />
              }
              emptyFieldText="Velg"
              emptyFieldDisabled={!!formValues.land}
              name="land"
              disabled={!redigerbart}
              control={control}
            >
              {landkoder.map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreftHandle,
          disabled: !formState?.isValid || !redigerbart,
        }}
        spinner={visSpinner}
        bekreftTekst="Bekreft og innhent registeropplysninger"
      />
    </div>
  );
};
