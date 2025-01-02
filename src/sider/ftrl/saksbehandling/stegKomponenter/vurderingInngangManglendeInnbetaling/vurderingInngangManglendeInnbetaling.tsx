import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import "./vurderingInngangManglendeInnbetaling.css";
import vurdering_inngang_manglende_innbetaling from "./vurderingInngangManglendeInnbetalingSchema";
import { BOOLSK_STRING } from "../../../../../constants";
import { oppsummertfaktaOperations, oppsummertfaktaSelectors } from "../../../../../ducks/oppsummertfakta";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import * as Utils from "../../../../../utils";
import { inngangSteg, vedtakOpphoerSteg } from "../../stegLister/stegListeManglendeInnbetalingFlyt";
import { FellesHandlersContext } from "../../../../../contexts";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean, nesteStegId?: string) => void;
}

export const VurderingInngangManglendeInnbetaling = ({ bekreft, aktivtSteg, oppdaterStatus }: Props) => {
  const dispatch = useDispatch();
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const { behandlingOppfriskes } = useContext(FellesHandlersContext) as any;

  const {
    control,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurdering_inngang_manglende_innbetaling),
    mode: "all",
    defaultValues: {
      fullstendigManglendeInnbetaling: Utils.streng.boolTilUppercaseStreng(
        useSelector(oppsummertfaktaSelectors.FullstendigManglendeInnbetalingSelector)
      ),
    } as FieldValues,
  });
  const formValues = watch();

  const handleChange = (value: string) => {
    dispatch(
      oppsummertfaktaOperations.sendInnbetalingsstatus(behandlingID, Utils.streng.uppercaseStrengTilBool(value))
    );
    oppdaterStatus(formIsValid, value === BOOLSK_STRING.SANN ? vedtakOpphoerSteg.id : inngangSteg.id);
  };

  useEffect(() => {
    if (aktivtSteg) {
      oppdaterStatus(
        formIsValid,
        formValues.fullstendigManglendeInnbetaling === BOOLSK_STRING.SANN ? vedtakOpphoerSteg.id : inngangSteg.id
      );
    }
  }, [formIsValid]);

  useEffect(() => {
    if (!behandlingOppfriskes && formIsValid) {
      dispatch(
        oppsummertfaktaOperations.sendInnbetalingsstatus(
          behandlingID,
          Utils.streng.uppercaseStrengTilBool(formValues.fullstendigManglendeInnbetaling)
        )
      );
    }
  }, [behandlingOppfriskes]);

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
        <Nav.Radio value={BOOLSK_STRING.SANN}>
          Innbetaling mangler for <b>hele</b> medlemskapsperioden.
        </Nav.Radio>
        <Nav.Radio value={BOOLSK_STRING.USANN}>
          Innbetaling mangler for <b>deler</b> av medlemskapsperioden.
        </Nav.Radio>
      </Forms.RadioGroup>

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreft,
          disabled: !formIsValid || !redigerbart,
        }}
      />
    </div>
  );
};
