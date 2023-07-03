import { Textarea as NavFrontendTextarea } from "nav-frontend-skjema";

// eslint-disable-next-line react/prop-types
const Textarea = ({ spellCheck = true, ...rest }) => <NavFrontendTextarea {...rest} spellCheck={spellCheck} />;

export default Textarea;
