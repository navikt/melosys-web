import { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../../../hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import "./vurderingInngangManglendeInnbetaling.less";
import vurdering_inngang_manglende_innbetaling from "./vurderingInngangManglendeInnbetalingSchema";
import type { VurderingInngangManglendeInnbetaling as VurderingInngangManglendeInnbetalingValg } from "./vurderingInngangManglendeInnbetalingSchema";
import { oppsummertfaktaOperations, oppsummertfaktaSelectors } from "../../../../../ducks/oppsummertfakta";
import * as oppsummertfaktaTypes from "../../../../../ducks/oppsummertfakta/types";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { inngangSteg, vedtakOpphoerSteg } from "../../stegLister/stegListeManglendeInnbetalingFlyt";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean, nesteStegId?: string) => void;
}

type RenameMe = {
  value: VurderingInngangManglendeInnbetalingValg;
  text: ReactNode;
};

const valg: RenameMe[] = [
  {
    value: "HELE_PERIODEN_OPPHØRES",
    text: (
      <>
        <b>Hele</b> perioden skal opphøres
      </>
    ),
  },
  {
    value: "DELER_AV_PERIODEN_OPPHØRES",
    text: (
      <>
        <b>Deler</b> av perioden skal opphøres
      </>
    ),
  },
  { value: "VEDTAKET_SKAL_ENDRES", text: "Vedtaket skal endres." },
  { value: "BEHANDLINGEN_SKAL_AVSLUTTES", text: "Behandlingen skal avsluttes." },
];

export function VurderingInngangManglendeInnbetaling({ bekreft, aktivtSteg, oppdaterStatus }: Props) {
  const dispatch = useDispatch();
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);

  const {
    control,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver<FieldValues>(vurdering_inngang_manglende_innbetaling),
    mode: "all",
    defaultValues: {
      fullstendigManglendeInnbetaling: useSelector(oppsummertfaktaSelectors.ManglendeInnbetalingHandlingsvalgSelector)
        ?.kode,
    } as FieldValues,
  });
  const formValues = watch();

  // Kun "hele perioden opphøres" skal føre til den korte opphørsflyten (VedtakOpphoer).
  // De tre andre valgene skal alle gå videre i den ordinære flyten (Inngang).
  const erHeleOpphørt = (value?: string) => value === "HELE_PERIODEN_OPPHØRES";
  const nesteStegId = (value?: string) => (erHeleOpphørt(value) ? vedtakOpphoerSteg.id : inngangSteg.id);

  const handleChange = (value: string) => {
    oppdaterStatus(formIsValid, nesteStegId(value));
  };

  const onBekreft = async () => {
    const response = await dispatch(
      oppsummertfaktaOperations.lagreManglendeInnbetalingHandlingsvalg(
        behandlingID,
        formValues.fullstendigManglendeInnbetaling,
      ),
    );
    if (response.type !== oppsummertfaktaTypes.FEILET) {
      bekreft();
    }
  };

  useEffect(() => {
    if (aktivtSteg) {
      oppdaterStatus(formIsValid, nesteStegId(formValues.fullstendigManglendeInnbetaling));
    }
  }, [formIsValid]);

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingInngangManglendeInnbetaling">
      <Nav.Heading level="1" className="stegvelgertittel">
        Manglende innbetaling
      </Nav.Heading>
      <div className="label__container">
        <Nav.BodyLong size="small">
          Vurder konsekvens av manglende innbetaling. Du må sjekke OeBS for å se om betaling er mottatt innen fristen.
          <br /> Hvis betaling er mottatt og du ikke skal fatte nytt vedtak kan du ferdigstille denne behandlingen.
        </Nav.BodyLong>
      </div>
      <Forms.RadioGroup
        legend=""
        hideLegend
        name="fullstendigManglendeInnbetaling"
        control={control}
        onChange={handleChange}
        readOnly={!redigerbart}
        size="medium"
      >
        {valg.map((valg: RenameMe) => (
          <Nav.Radio key={valg.value} value={valg.value}>
            {valg.text}
          </Nav.Radio>
        ))}
      </Forms.RadioGroup>
      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: onBekreft,
          disabled: !formIsValid || !redigerbart,
        }}
      />
    </div>
  );
}
