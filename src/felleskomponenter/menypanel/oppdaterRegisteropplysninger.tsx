import { KeyboardEvent, useMemo } from "react";

import "./oppdaterRegisteropplysninger.css";
import * as Nav from "../../navFrontend";
import { Refresh } from "../../resources/images";
import * as Forms from "../forms";
import { FieldValues, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { modalerSelectors } from "../../ducks/modaler";

type OppdaterRegisteroppslysningerProps = {
  sistOppdatert: string;
  oppdaterRegisteropplysninger: (isSiste5aar: boolean) => void;
};

export const OppdaterRegisteropplysninger = ({
  sistOppdatert,
  oppdaterRegisteropplysninger,
}: OppdaterRegisteroppslysningerProps) => {
  const initialValues = {
    inkluderSiste5Aar: useSelector(modalerSelectors.InkluderSiste5AarSelector),
  };

  const { control, watch } = useForm({
    mode: "all",
    values: useMemo(() => initialValues as FieldValues, [initialValues]),
  });
  const formValues = watch();
  const { inkluderSiste5Aar } = formValues;

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      oppdaterRegisteropplysninger(inkluderSiste5Aar);
    }
  };

  return (
    <Nav.Panel className="oppdater-registeropplysninger" border>
      <Forms.Checkbox
        className="oppdater-registeropplysninger__checkbox"
        name="inkluderSiste5Aar"
        control={control}
        label="Inkl siste 5 år"
        value="Inkl siste 5 år"
      />
      <span
        className="oppdater-registeropplysninger__oppdateringsknapp"
        role="button"
        tabIndex={0}
        onClick={() => oppdaterRegisteropplysninger(inkluderSiste5Aar)}
        onKeyPress={handleKeyPress}
      >
        <Refresh />
        Oppdater registeropplysninger
      </span>
      <span className="oppdater-registeropplysninger__sistOppdatert">
        {` (sist oppdatert ${sistOppdatert || "- "})`}
      </span>
    </Nav.Panel>
  );
};

export default OppdaterRegisteropplysninger;
