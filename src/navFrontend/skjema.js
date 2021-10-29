import React from "react";

import { Textarea as NavFrontendTextarea } from "nav-frontend-skjema";

// eslint-disable-next-line react/prop-types
const Textarea = (props) => <NavFrontendTextarea {...props} spellCheck={props.spellCheck || true} />;

export { Textarea };
export {
  Checkbox,
  Radio,
  RadioPanelGruppe,
  SkjemaGruppe,
  Fieldset,
  Select,
  SelectProps,
  Input,
} from "nav-frontend-skjema";
