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

export const VurderingInngang = ({ bekreft, oppdaterStatus }: Props) => {
  const [visOppfrisk, setVisOppfrisk] = useState(false);
  const dispatch = useDispatch();

  const periodeFom = Utils.dato.formatterDatoTilNorsk(useSelector(mottatteOpplysningerSelectors.PeriodeFomSelector));
  const periodeTom = Utils.dato.formatterDatoTilNorsk(useSelector(mottatteOpplysningerSelectors.PeriodeTomSelector));
  const søknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector)[0];
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingUnderOppfriskning = useSelector(BehandlingUnderOppfriskningSelector);
  const { lagreMottatteOpplysningerOgOppfriskSaksopplysninger } = useContext(FellesHandlersContext) as any;

  const { formState } = useForm({
    resolver: yupResolver(vurderingInngangSchema),
    mode: "all",
    defaultValues: {
      fom: periodeFom,
      tom: periodeTom,
      land: søknadsland,
    } as FieldValues,
  });

  const stegErGyldig = formState?.isValid && !behandlingUnderOppfriskning;

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const bekreftOgFortsett = () => {
    bekreft();
  };

  return (
    <div className="vurderingInngang">
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
            bekreft();
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
