const dotenv = require("dotenv-save");

/*
cra-build-watch setter ikke  PUBLIC_URL for ressurser i index.html(for eksempel frontendlogger, favicon).
Setter derfor PUBLIC_URL her.
*/

dotenv.set("PUBLIC_URL", "/melosys");
