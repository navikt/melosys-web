import { formValueSelector } from "redux-form";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";

const journalforingFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.JOURNALFORING);

const mapStateToProps = (state: RootState) => ({
  avsenderNavn: journalforingFormValueSelector(state, "avsenderNavn"),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type AvsenderAnnenPersonEllerVirksomhetProps = PropsFromRedux & {
  hentOgVisAvsender: (ident: string) => void;
};

const AvsenderAnnenPersonEllerVirksomhet = ({
  hentOgVisAvsender,
  avsenderNavn,
}: AvsenderAnnenPersonEllerVirksomhetProps) => {
  const IDFeltTastOppHandler = async (sokStreng: string) => {
    if (Utils.organisasjon.erOrgnrGyldig(sokStreng) || Utils.person.erGyldigFnrEllerDnr(sokStreng)) {
      hentOgVisAvsender(sokStreng);
    }
  };

  return (
    <div className="avsender">
      <Skjema.FellesInputFnrDnrOrgnrSaksnr
        feltNavn="avsenderID"
        label="F.nr./d-nr. eller org.nr."
        onChange={IDFeltTastOppHandler}
        className="avsender__input"
        bredde="L"
      />
      <div className="avsender__navn">
        <Nav.Typo.Element className="avsender__navn__label">Navn: </Nav.Typo.Element>
        <Nav.BodyLong size="small">{avsenderNavn || ""}</Nav.BodyLong>
      </div>
    </div>
  );
};

export default connector(AvsenderAnnenPersonEllerVirksomhet);
