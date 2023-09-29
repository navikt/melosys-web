import { ChangeEvent, KeyboardEvent, useMemo, useState } from "react";

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
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      oppdaterRegisteropplysninger(formValues.inkluderSiste5Aar);
    }
  };

  const initialValues = {
    inkluderSiste5Aar: useSelector(modalerSelectors.InkluderSiste5AarSelector),
  };

  console.log(initialValues);

  const {
    control,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    mode: "all",
    values: useMemo(() => initialValues as FieldValues, [initialValues]),
  });
  const formValues = watch();

  return (
    <Nav.Panel className="oppdater-registeropplysninger" border>
      <Forms.Checkbox
        className="inkluderSiste5Aar"
        name="inkluderSiste5Aar"
        control={control}
        label="Hent registeropplysninger for 5 år"
        value="Inkl siste 5 år"
      />
      <span
        className="oppdater-registeropplysninger__oppdateringsknapp"
        role="button"
        tabIndex={0}
        onClick={() => oppdaterRegisteropplysninger(formValues.inkluderSiste5Aar)}
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
