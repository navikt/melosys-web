import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Utils from "../../../../utils";

import { FellesHandlersContext } from "../../../../contexts";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { landkoderSelectors } from "../../../../ducks/landkoder";
import { navigeringOperations } from "../../../../ducks/navigering";

import vurderingInngangSchema from "./vurderingInngangSchema";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import MKV from "../../../../melosyskodeverk";
import { DialogboksOppfriskSak } from "../../../../felleskomponenter/dialogboks";
import "./vurderingInngang.css";
import { BehandlingUnderOppfriskningSelector } from "../../../../ducks/modaler/selectors";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingInngang = ({ bekreft, aktivtSteg, oppdaterStatus }: Props) => {
  const [visOppfrisk, setVisOppfrisk] = useState(false);
  const dispatch = useDispatch();

  const periodeFom = Utils.dato.formatterDatoTilNorsk(useSelector(mottatteOpplysningerSelectors.PeriodeFomSelector));
  const periodeTom = Utils.dato.formatterDatoTilNorsk(useSelector(mottatteOpplysningerSelectors.PeriodeTomSelector));
  const søknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector)[0];
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.SisteOpplysningerHentetDatoSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const behandlingUnderOppfriskning = useSelector(BehandlingUnderOppfriskningSelector);
  const { lagreMottatteOpplysningerOgOppfriskSaksopplysninger } = useContext(FellesHandlersContext) as any;

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
    !Utils.dato.erLikeDatoer(formValues?.fom, periodeFom) ||
    !Utils.dato.erLikeDatoer(formValues?.tom, periodeTom) ||
    formValues?.land !== søknadsland;

  const landUtenStøtteValgt =
    sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE &&
    (formValues.land === MKV.Koder.landkoder.FR || formValues.land === MKV.Koder.landkoder.IT);

  const stegErGyldig =
    formState?.isValid && !skalHenteRegisteropplysninger && !landUtenStøtteValgt && !behandlingUnderOppfriskning;

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const lagrePeriodeOgLand = async () => {
    await Promise.all([
      dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland([formValues.land], false)),
      dispatch(
        mottatteOpplysningerOperations.oppdaterPeriode({
          fom: Utils.dato.formatterDatoTilISO(formValues.fom, ""),
          tom: Utils.dato.formatterDatoTilISO(formValues.tom, ""),
        })
      ),
    ]);
  };

  const innhentRegisteropplysninger = () => {
    lagrePeriodeOgLand().finally(() => setVisOppfrisk(true));
  };

  const bekreftOgFortsett = () => {
    if (skalHenteRegisteropplysninger) {
      innhentRegisteropplysninger();
    } else {
      bekreft();
    }
  };

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingInngang_ikkeYrkesaktiv">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Oppgi opplysninger fra søknaden</Nav.Typo.Innholdstittel>

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreftOgFortsett,
          disabled: !formState?.isValid || !redigerbart,
        }}
      />

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={lagreMottatteOpplysningerOgOppfriskSaksopplysninger}
          avbryt={() => setVisOppfrisk(false)}
          lukk={() => {
            setVisOppfrisk(false);
            dispatch(menypanelOperations.visMenypanel());
            if (!landUtenStøtteValgt) {
              bekreft();
            }
          }}
          tilForsiden={() => {
            setVisOppfrisk(false);
            dispatch(navigeringOperations.tilForsiden());
          }}
          bekreftetFraStart
        />
      )}
    </div>
  );
};
