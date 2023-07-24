import { createBrowserHistory } from "history";
import * as Constants from "./constants";

const browserHistory = createBrowserHistory({
  basename: Constants.URL_BASENAME,
});
export default browserHistory;
