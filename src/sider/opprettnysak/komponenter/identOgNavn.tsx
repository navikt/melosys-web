import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";
import * as Ikoner from "../../../resources/images";
import * as Utils from "../../../utils";
import * as Skjema from "../../../felleskomponenter/skjema";

interface IdentOgNavnProps {
  tittel: string;
  feltNavn: string;
  label: string;
  navn: string;
}

const IdentOgNavn = ({ tittel, feltNavn, label, navn }: IdentOgNavnProps) => (
  <>
    <Mui.Undertittel tekst={tittel} ikon={Ikoner.AccountCircle} className="undertittel" understrek />
    <div className="innrykk">
      <Skjema.FellesInputFnrDnrOrgnrSaksnr feltNavn={feltNavn} label={label} bredde="L" />
      {!Utils._isEmpty(navn) && (
        <span>
          <Nav.BodyLong weight="semibold" size="small" className="navnTittel">
            Navn:
          </Nav.BodyLong>
          <Nav.BodyLong size="small" className="navn">
            {navn}
          </Nav.BodyLong>
        </span>
      )}
    </div>
  </>
);

export default IdentOgNavn;
