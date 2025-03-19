import { KeyboardEvent, useEffect, useMemo } from "react";

import "./oppdaterRegisteropplysninger.css";
import { Refresh } from "../../resources/images";
import * as Forms from "../forms";
import { FieldValues, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { modalerOperations, modalerSelectors } from "../../ducks/modaler";
import MKV from "../../melosyskodeverk";

const { FTRL } = MKV.Koder.sakstyper;
const { ÅRSAVREGNING } = MKV.Koder.behandlinger.behandlingstyper;

interface OppdaterRegisteroppslysningerProps {
  sistOppdatert: string;
  oppdaterRegisteropplysninger: (isSiste5aar: boolean) => void;
  sakstype: string;
  sakstema: string;
}

export function OppdaterRegisteropplysninger({
  sistOppdatert,
  oppdaterRegisteropplysninger,
  sakstype,
  sakstema,
}: OppdaterRegisteroppslysningerProps) {
  const initialValues = {
    inkluderSiste5Aar: useSelector(modalerSelectors.InkluderSiste5AarSelector),
  };

  const { control, watch } = useForm({
    mode: "all",
    values: useMemo(() => initialValues as FieldValues, [initialValues]),
  });
  const formValues = watch();
  const { inkluderSiste5Aar } = formValues;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(modalerOperations.leggTilInkluderSiste5Aar(formValues.inkluderSiste5Aar));
  }, [formValues.inkluderSiste5Aar]);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      oppdaterRegisteropplysninger(inkluderSiste5Aar);
    }
  };

  const erÅrsavregning = sakstema === ÅRSAVREGNING;

  return (
    <div className="oppdater-registeropplysninger">
      {sakstype === FTRL && !erÅrsavregning && (
        <Forms.Checkbox
          className="oppdater-registeropplysninger__checkbox"
          name="inkluderSiste5Aar"
          control={control}
          label="Inkl. siste 5 år"
          value="Inkl. siste 5 år"
          size="small"
        />
      )}
      <span
        className="oppdater-registeropplysninger__oppdateringsknapp"
        role="button"
        tabIndex={0}
        onClick={() =>
          erÅrsavregning
            ? //TODO bruk den andre registeropplysningen
            : oppdaterRegisteropplysninger(inkluderSiste5Aar)
        }
        onKeyPress={handleKeyPress}
      >
        <Refresh />
        Oppdater registeropplysninger
      </span>
      <span className="oppdater-registeropplysninger__sistOppdatert">
        {` (sist oppdatert ${sistOppdatert || "- "})`}
      </span>
    </div>
  );
}

export default OppdaterRegisteropplysninger;
