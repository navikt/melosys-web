import { useSelector } from "react-redux";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Utils from "../../../../../utils";
import { useDispatch } from "../../../../../hooks";

import { PeriodeOgLandVelger } from "./komponenter/periodeVelger/periodeVelger";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import vurdering_opplysninger from "./vurderingOpplysningerSchema";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import "./vurderingOpplysninger.less";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import {
  helseutgiftDekkesPeriodeOperations,
  helseutgiftDekkesPeriodeSelector,
} from "../../../../../ducks/helseutgiftdekkesperiode";
import { HelseutgiftDekkesPeriodeDto } from "../../../../../services/modules/helseutgiftDekkesPeriode/helseutgiftDekkesPeriode";
import { useContext, useEffect, useMemo, useState } from "react";
import { UkjentSluttdatoMedlemskapsperiode } from "../../../../ftrl/saksbehandling/stegKomponenter/vurderingPeriode/komponenter/ukjentSluttdatoMedlemskapsperiode";
import { oppsummertfaktaOperations, oppsummertfaktaSelectors } from "../../../../../ducks/oppsummertfakta";
import { FellesHandlersContext } from "../../../../../contexts";
import { DialogboksOppfriskSak } from "../../../../../felleskomponenter/dialogboks";
import { menypanelOperations } from "../../../../../ducks/menypanel";
import { navigeringOperations } from "../../../../../ducks/navigering";
import { BehandlingUnderOppfriskningSelector } from "../../../../../ducks/modaler/selectors";

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

interface FellesHandlers {
  oppfriskOgLastInnSaksopplysninger: () => Promise<void>;
}

export function VurderingOpplysninger({ bekreft, oppdaterStatus, aktivtSteg }: Props) {
  const dispatch = useDispatch();
  const [visOppfrisk, setVisOppfrisk] = useState(false);

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const helseutgiftDekkesPeriodeErPending = useSelector(
    helseutgiftDekkesPeriodeSelector.HelseutgiftDekkesPeriodeErPendingSelector,
  );
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const helseutgiftDekkesPeriode = useSelector(helseutgiftDekkesPeriodeSelector.HelseutgiftDekkesPeriodeSelector).data;
  const { fomDato, tomDato, bostedLandkode } = helseutgiftDekkesPeriode;
  const [ukjentSluttdatoKey, setUkjentSluttdatoKey] = useState("");
  const lagretUkjentSluttdato = useSelector(oppsummertfaktaSelectors.UkjentSluttdatoMedlemskapsperiodeSelector);
  const [ukjentSluttdatoMedlemskapsperiode, setUkjentSluttdatoMedlemskapsperiode] = useState(
    lagretUkjentSluttdato || false,
  );

  const registeropplysningerHentet = useSelector(behandlingerSelectors.SisteOpplysningerHentetDatoSelector);
  const behandlingUnderOppfriskning = useSelector(BehandlingUnderOppfriskningSelector);
  const { oppfriskOgLastInnSaksopplysninger } = useContext(FellesHandlersContext) as FellesHandlers;

  const initialValues = useMemo(
    () => ({
      fomDato: Utils.dato.formatterDatoTilNorsk(fomDato, false, undefined),
      tomDato: Utils.dato.formatterDatoTilNorsk(tomDato, false, undefined),
      bostedLandkode: bostedLandkode || "",
    }),
    [fomDato, tomDato, bostedLandkode],
  );

  const {
    control,
    watch,
    trigger,
    reset,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurdering_opplysninger),
    mode: "all",
    values: initialValues,
  });
  const formValues = watch();

  const skalHenteRegisteropplysninger =
    !registeropplysningerHentet ||
    !Utils.dato.erLikeDatoer(formValues.fomDato, initialValues.fomDato) ||
    !Utils.dato.erLikeDatoer(formValues.tomDato, initialValues.tomDato) ||
    !Utils._isEqual(formValues.bostedLandkode, initialValues.bostedLandkode);

  const debouncedLagreHelseutgiftPeriode = useMemo(
    () =>
      Utils._debounce(async (ukjentSluttdato?: boolean) => {
        const latestValues = watch() as { fomDato: string; tomDato: string; bostedLandkode: string };
        const isValid = await trigger();
        if (isValid) {
          const currentUkjentSluttdato = ukjentSluttdato ?? ukjentSluttdatoMedlemskapsperiode;
          await oppdaterEllerOpprettHelseutgiftDekkesPeriode(latestValues);
          await dispatch(
            oppsummertfaktaOperations.lagreUkjentSluttdatoMedlemskapsperiode(behandlingID, currentUkjentSluttdato),
          );
        }
      }, 500),
    [watch, trigger, ukjentSluttdatoMedlemskapsperiode, behandlingID, dispatch],
  );

  const oppdaterSluttdato = async (ukjentSluttdato: boolean) => {
    setUkjentSluttdatoMedlemskapsperiode(ukjentSluttdato);
    if (ukjentSluttdato) {
      const fomISODate = Utils.dato.formatterDatoTilISO(formValues.fomDato, "");
      if (fomISODate) {
        const fomDato = new Date(fomISODate);
        const tomDato = new Date(fomDato);
        tomDato.setFullYear(tomDato.getFullYear() + 10);
        const newTomDato = Utils.dato.formatterDatoTilNorsk(tomDato.toISOString());
        reset({
          ...formValues,
          tomDato: newTomDato,
        });

        await debouncedLagreHelseutgiftPeriode(ukjentSluttdato);
        setUkjentSluttdatoKey(newTomDato);
      }
    } else {
      setUkjentSluttdatoKey("");
      if (formIsValid) {
        await dispatch(oppsummertfaktaOperations.lagreUkjentSluttdatoMedlemskapsperiode(behandlingID, ukjentSluttdato));
      }
    }
  };

  const bekreftOgFortsett = async () => {
    await dispatch(helseutgiftDekkesPeriodeOperations.hentHelseutgiftDekkesPeriode(behandlingID));
    if (skalHenteRegisteropplysninger) {
      setVisOppfrisk(true);
    } else {
      bekreft();
    }
  };

  const oppdaterEllerOpprettHelseutgiftDekkesPeriode = async (formValues: {
    fomDato: string;
    tomDato: string;
    bostedLandkode: string;
  }) => {
    await dispatch(
      helseutgiftDekkesPeriodeOperations.oppdaterEllerOpprettHelseutgiftDekkesPeriode(
        behandlingID,
        {
          fomDato: Utils.dato.formatterDatoTilISO(formValues.fomDato),
          tomDato: Utils.dato.formatterDatoTilISO(formValues.tomDato),
          bostedLandkode: formValues.bostedLandkode,
        } as HelseutgiftDekkesPeriodeDto,
        Utils._isEmpty(helseutgiftDekkesPeriode),
      ),
    );
  };

  const stegErGyldig = formIsValid && !skalHenteRegisteropplysninger && !behandlingUnderOppfriskning;

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  if (!aktivtSteg) return null;

  return (
    <>
      <Nav.Heading level="1" className="stegvelgertittel">
        Oppgi opplysninger fra attest / S1
      </Nav.Heading>

      <PeriodeOgLandVelger
        control={control}
        redigerbart={redigerbart}
        formValues={formValues}
        ukjentSluttdato={ukjentSluttdatoMedlemskapsperiode}
        handleChange={async () => {
          await debouncedLagreHelseutgiftPeriode();
        }}
        ukjentSluttdatoKey={ukjentSluttdatoKey}
      />

      <UkjentSluttdatoMedlemskapsperiode
        ukjentSluttdatoMedlemskapsperiode={ukjentSluttdatoMedlemskapsperiode}
        onUkjentSluttdatoChange={oppdaterSluttdato}
        erEøsPensjonist={true}
        redigerbart={redigerbart}
      />

      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !redigerbart || !formIsValid || helseutgiftDekkesPeriodeErPending,
          onClick: bekreftOgFortsett,
        }}
      />

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={async () => {
            await oppfriskOgLastInnSaksopplysninger();
          }}
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
    </>
  );
}

export default VurderingOpplysninger;
