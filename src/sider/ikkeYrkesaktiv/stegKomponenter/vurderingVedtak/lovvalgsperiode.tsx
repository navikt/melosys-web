import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../../hooks";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import * as Utils from "../../../../utils";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Nav from "../../../../navFrontend";

import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";

import { PERIODE_HJELPETEKST } from "./tekster";
import lovvalgsperioderSchema from "./lovvalgsperioderSchema";
import Knapperad from "../../../../felleskomponenter/knapperad";

interface LovvalgsperiodeProps {
  kontrollerFerdigbehandling: () => void;
  onRedigeringErAktiv: (redigeringErAktiv: boolean) => void;
}

export function Lovvalgsperiode({ kontrollerFerdigbehandling, onRedigeringErAktiv }: LovvalgsperiodeProps) {
  const dispatch = useDispatch();

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const lovvalgsperiode = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);
  const lovvalgsperiodeFom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode?.fomDato);
  const lovvalgsperiodeTom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode?.tomDato);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const mottatteOpplysningerPeriode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);

  const { control, watch, formState, trigger } = useForm({
    resolver: yupResolver(lovvalgsperioderSchema),
    context: {
      soknadsperiode: mottatteOpplysningerPeriode,
    },
    mode: "all",
    values: {
      fom: lovvalgsperiodeFom,
      tom: lovvalgsperiodeTom,
    } as FieldValues,
  });
  const formValues = watch();

  const [visPeriodeEndringFelter, setVisPeriodeEndringFelter] = useState(false);

  useEffect(() => {
    onRedigeringErAktiv(!visPeriodeEndringFelter);
  }, [visPeriodeEndringFelter]);

  const lagreLovvalgsperiodeOgKontroller = async (values: FieldValues) => {
    await dispatch(
      lovvalgsperioderOperations.oppdaterLovvalgsperiode(behandlingID, lovvalgsperiode.periodeID, {
        ...lovvalgsperiode,
        fomDato: Utils.dato.formatterDatoTilISO(values.fom, ""),
        tomDato: Utils.dato.formatterDatoTilISO(values.tom, ""),
      }),
    );
    kontrollerFerdigbehandling();
  };

  function EndrePeriodeKnapp() {
    return (
      <Nav.Button
        variant="secondary"
        onClick={() => setVisPeriodeEndringFelter(true)}
        onKeyDown={(event) => {
          if ([" ", "Enter"].includes(event.key)) {
            event.preventDefault();
            setVisPeriodeEndringFelter(true);
          }
        }}
        disabled={!redigerbart}
      >
        Endre
      </Nav.Button>
    );
  }

  const handleLagrePeriodeEndring = async () => {
    await lagreLovvalgsperiodeOgKontroller({ fom: formValues.fom, tom: formValues.tom });
    setVisPeriodeEndringFelter(false);
  };

  return (
    <Nav.Column>
      <Nav.BodyLong as="div" weight="semibold" size="small" className="info">
        <LabelMedHjelpetekst label="Periode" hjelpetekst={PERIODE_HJELPETEKST} />
      </Nav.BodyLong>

      {visPeriodeEndringFelter ? (
        <>
          <div className="datofelt_wrapper">
            <Forms.Datovelger
              label="Fra og med"
              name="fom"
              readOnly={!redigerbart}
              control={control}
              onChange={() => trigger("tom")}
            />
            <Forms.Datovelger
              label="Til og med"
              name="tom"
              minDate={Utils.dato.norskStringTilDate(formValues.fom)}
              readOnly={!redigerbart}
              control={control}
            />
          </div>
          <Knapperad
            bekreft={handleLagrePeriodeEndring}
            bekreftTekst="Lagre"
            avbryt={() => setVisPeriodeEndringFelter(false)}
            avbrytTekst="Avbryt"
            redigerbart={redigerbart}
            bekreftRedigerbart={redigerbart && formState.isValid}
            size="small"
          />
        </>
      ) : (
        <Nav.BodyLong size="small" className="periode">
          <span>
            {lovvalgsperiodeFom} - {lovvalgsperiodeTom}
          </span>
          <EndrePeriodeKnapp />
        </Nav.BodyLong>
      )}
    </Nav.Column>
  );
}
