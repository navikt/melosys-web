import { FieldValues, useForm } from "react-hook-form";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";

import MKV from "../../../../../melosyskodeverk";
import * as Utils from "../../../../../utils";
import * as Nav from "../../../../../navFrontend";
import * as Symboler from "../../symboler";
import * as Forms from "../../../../forms";
import {
  mottatteOpplysningerOperations,
  mottatteOpplysningerSelectors,
} from "../../../../../ducks/mottatteOpplysninger";
import Knapperad from "../../../../knapperad";

import soknadsperiodeSchema from "./soknadsperiodeSchema";
import "./soknadsperiode.css";

type SoknadsperiodeProps = {
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
  tittel: string;
};

export const Soknadsperiode = ({ redigerbart, tittel, lagreSoknadOgOppfriskSaksopplysninger }: SoknadsperiodeProps) => {
  const dispatch = useDispatch();
  const [erEndrePeriodeSynlig, setErEndrePeriodeSynlig] = useState(false);
  const behandlingHarLand = useSelector(mottatteOpplysningerSelectors.HarLandSelector);
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const soknadsperiodeFom = Utils.dato.formatterDatoTilNorsk(soknadsperiode?.fom, false, "");
  const soknadsperiodeTom = Utils.dato.formatterDatoTilNorsk(soknadsperiode?.tom, false, "");

  const { control, watch, formState, reset } = useForm({
    resolver: yupResolver(soknadsperiodeSchema),
    mode: "all",
    defaultValues: {
      fom: soknadsperiodeFom,
      tom: soknadsperiodeTom,
    } as FieldValues,
  });
  const formValues = watch();

  const visEndrePeriode = () => setErEndrePeriodeSynlig(true);
  const skjulEndrePeriode = () => setErEndrePeriodeSynlig(false);

  const skalOppfriskeSaksopplysninger = () => {
    const flytMedInngangsvilkår =
      window.location.pathname.indexOf(`${MKV.Koder.sakstyper.EU_EOS}/saksbehandling/`) > -1;

    return behandlingHarLand || !flytMedInngangsvilkår;
  };

  const lagre = async () => {
    await dispatch(
      mottatteOpplysningerOperations.oppdaterPeriode({
        fom: Utils.dato.formatterDatoTilISO(formValues.fom, ""),
        tom: Utils.dato.formatterDatoTilISO(formValues.tom, ""),
      })
    );
    if (skalOppfriskeSaksopplysninger()) {
      lagreSoknadOgOppfriskSaksopplysninger();
    }
    skjulEndrePeriode();
  };

  const avbryt = () => {
    reset({
      fom: soknadsperiodeFom,
      tom: soknadsperiodeTom,
    });
    skjulEndrePeriode();
  };

  return (
    <div className="soknadsperiode">
      <Nav.BodyLong size="small" className="soknadsperiode__etikett">
        {tittel}
      </Nav.BodyLong>
      {!erEndrePeriodeSynlig && (
        <div className="periode__container">
          <Nav.Typo.Element className="periode">
            {soknadsperiodeFom} - {soknadsperiodeTom}
          </Nav.Typo.Element>
          {redigerbart && (
            <div>
              <Symboler.Rediger onClick={visEndrePeriode} />
            </div>
          )}
        </div>
      )}
      {erEndrePeriodeSynlig && (
        <Nav.Row>
          <Nav.Column xs="12" className="endring__container">
            <Forms.Datovelger name="fom" control={control} label="Fra og med" bredde="S" />
            <Forms.Datovelger
              name="tom"
              control={control}
              label="Til og med"
              bredde="S"
              minDate={Utils.dato.norskStringTilDate(formValues?.fom)}
            />
          </Nav.Column>
          <Nav.Column xs="12">
            <Knapperad
              avbryt={avbryt}
              avbrytTekst="Avbryt"
              bekreft={lagre}
              bekreftTekst="Lagre"
              redigerbart
              bekreftRedigerbart={formState?.isValid}
            />
          </Nav.Column>
        </Nav.Row>
      )}
    </div>
  );
};

export default Soknadsperiode;
