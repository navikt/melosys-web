import * as Nav from "../../../../../navFrontend";
import "./gyldighetshistorikkInfo.css";

export const GyldighetshistorikkInfo = () => (
  <div className="gyldighetshistorikk-info">
    <Nav.Typo.EtikettLiten>Gyldighetshistorikk fra Folkeregisteret kan være unøyaktig.</Nav.Typo.EtikettLiten>
    <Nav.HelpText title="Historikk hjelpetekst" strategy="fixed">
      <p>Det kan variere hvordan gyldighetsdato benyttes i Folkeregisteret.</p>
      <p>
        Dersom det er en opplysningstype hvor Folkeregisteret har vedtaksmyndighet, så viser denne datoen når vedtaket
        gjelder fra. På andre opplysningstyper viser datoen når opplysningen ble gyldig i Folkeregisteret, ikke når den
        ble gyldig i virkeligheten. For eksempel viser ikke gyldighetsdato for opplysningstypen utflytting når man
        faktisk flyttet ut av landet.
      </p>
      <p>Vær derfor varsom med hvordan du bruker disse opplysningene.</p>
    </Nav.HelpText>
  </div>
);
