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
import { TomFlytMelding } from "../../../../felleskomponenter/alertmeldinger";
import { FellesHandlersContext } from "../../../../contexts";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { landkoderSelectors } from "../../../../ducks/landkoder";

import vurderingInngangSchema from "./vurderingInngangSchema";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import MKV from "../../../../melosyskodeverk";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingInngang = ({ bekreft, aktivtSteg, oppdaterStatus }: Props) => {
  const dispatch = useDispatch();

  const periodeFom = Utils.dato.formatterDatoTilNorsk(useSelector(mottatteOpplysningerSelectors.PeriodeFomSelector));
  const periodeTom = Utils.dato.formatterDatoTilNorsk(useSelector(mottatteOpplysningerSelectors.PeriodeTomSelector));
  const søknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector)[0];
  const landkoder = useSelector(landkoderSelectors.LandkoderFraSakstypeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.SisteOpplysningerHentetDatoSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);

  const { control, watch, formState, trigger } = useForm({
    resolver: yupResolver(vurderingInngangSchema),
    mode: "all",
    defaultValues: {
      fom: periodeFom,
      tom: periodeTom,
      land: søknadsland,
    } as FieldValues,
  });
  const formValues = watch();

  const skalHenteRegisteropplysninger =
    !registeropplysningerHentet ||
    formValues?.fom !== periodeFom ||
    formValues?.tom !== periodeTom ||
    formValues?.land !== søknadsland;

  const [visSpinner, setVisSpinner] = useState(false);

  const landUtenStøtteValgt =
    sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE &&
    (formValues.land === MKV.Koder.landkoder.FR || formValues.land === MKV.Koder.landkoder.IT);

  const { lagreMottatteOpplysningerOgOppfriskSaksopplysninger } = useContext(FellesHandlersContext) as any;

  const stegErGyldig = formState?.isValid && !skalHenteRegisteropplysninger && !visSpinner && !landUtenStøtteValgt;

  useEffect(() => {
    if (registeropplysningerHentet) {
      dispatch(menypanelOperations.visMenypanel());
    }
  }, []);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const lagrePeriodeOgLand = () => {
    dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland([formValues.land], false));

    dispatch(
      mottatteOpplysningerOperations.oppdaterPeriode({
        fom: Utils.dato.formatterDatoTilISO(formValues.fom, null, ""),
        tom: Utils.dato.formatterDatoTilISO(formValues.tom, null, ""),
      })
    );
  };

  const innhentRegisteropplysninger = async () => {
    if (skalHenteRegisteropplysninger) {
      lagrePeriodeOgLand();

      setVisSpinner(true);
      await lagreMottatteOpplysningerOgOppfriskSaksopplysninger();
      setVisSpinner(false);
      dispatch(menypanelOperations.visMenypanel());
    }
  };

  const bekreftOgInnhentRegisteropplysninger = async () => {
    await innhentRegisteropplysninger();
    bekreft();
  };

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingInngang">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Oppgi opplysninger fra søknaden</Nav.Typo.Innholdstittel>

      <Nav.Fieldset legend="Periode">
        <Nav.Row>
          <Nav.Column xs="3">
            <Forms.Datovelger
              label="Fra og med"
              name="fom"
              disabled={!redigerbart}
              control={control}
              onChange={() => trigger("tom")}
            />
          </Nav.Column>
          <Nav.Column xs="3">
            <Forms.Datovelger
              label="Til og med"
              minDate={Utils.dato.norskStringTilDate(formValues?.fom)}
              name="tom"
              disabled={!redigerbart}
              control={control}
            />
          </Nav.Column>
          <Nav.Column xs="5">
            <Forms.Select
              label={<LabelMedHjelpetekst label="Land" hjelpetekstClassName="hjelpetekst" />}
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

      {landUtenStøtteValgt && <TomFlytMelding />}

      {landUtenStøtteValgt && skalHenteRegisteropplysninger ? (
        <Mui.StegKnapper
          bekreftKnappProps={{
            onClick: innhentRegisteropplysninger,
            disabled: !formState?.isValid || !redigerbart,
            spinner: visSpinner,
          }}
          bekreftTekst="Innehent registeropplysninger"
        />
      ) : (
        <Mui.StegKnapper
          bekreftKnappProps={{
            onClick: bekreftOgInnhentRegisteropplysninger,
            disabled: !formState?.isValid || landUtenStøtteValgt || !redigerbart,
            spinner: visSpinner,
          }}
          bekreftTekst="Bekreft og innhent registeropplysninger"
        />
      )}
    </div>
  );
};
