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
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Manglende innbetaling</Nav.Typo.Innholdstittel>

      <div className="label__container">
        <Nav.Typo.Normaltekst>
          Vurder konsekvens av manglende innbetaling. Du må sjekke OeBS for å se om betaling er mottatt innen fristen.
          <br /> Hvis betaling er mottatt og du ikke skal fatte nytt vedtak kan du ferdigstille denne behandlingen.
        </Nav.Typo.Normaltekst>
      </div>

      <Nav.Row className="radioknapp_gruppe__wrapper">
        <Nav.Column className="radioknapp_gruppe">
          <Forms.Radio
            label={
              <>
                Innbetaling mangler for <b>hele</b> medlemskapsperioden.
              </>
            }
            name="fullstendigManglendeInnbetaling"
            control={control}
            value={BOOLSK_STRING.SANN}
            disabled={!redigerbart}
            onChange={handleChange}
          />
          <Forms.Radio
            label={
              <>
                Innbetaling mangler for <b>deler</b> av medlemskapsperioden.
              </>
            }
            name="fullstendigManglendeInnbetaling"
            control={control}
            value={BOOLSK_STRING.USANN}
            disabled={!redigerbart}
            onChange={handleChange}
          />
        </Nav.Column>
      </Nav.Row>

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreft,
          disabled: !formIsValid || !redigerbart,
        }}
      />
    </div>
  );
};
