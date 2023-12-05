import { Textarea as NavFrontendTextarea } from "nav-frontend-skjema";
import { _uuid } from "../../utils";

// eslint-disable-next-line react/prop-types
const Textarea = ({ spellCheck = true, ...rest }) => (
  <NavFrontendTextarea {...rest} spellCheck={spellCheck} id={rest.id ?? _uuid()} />
);

export default Textarea;
