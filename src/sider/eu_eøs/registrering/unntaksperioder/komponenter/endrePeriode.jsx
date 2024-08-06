import PT from "prop-types";
import { v4 as uuid } from "uuid";

import MKV from "../../../../../melosyskodeverk";
import * as Utils from "../../../../../utils";
import * as Nav from "../../../../../navFrontend";
import * as MPT from "../../../../../proptypes";
import Datovelger from "../../../../../felleskomponenter/datovelger";
import "./endrePeriode.css";
import { useEffect } from "react";

const EndrePeriode = ({
  endrePeriode,
  lovvalgsperiode,
  sedLovvalgsperiode,
  oppdaterFom,
  oppdaterTom,
  oppdaterBegrunnelse,
  oppdaterFritekst,
  feilmeldinger,
  redigerbart,
}) => {
  const { fom, tom, begrunnelse, fritekst } = endrePeriode;

  const tilPeriode = (fomDato, tomDato) => ({
    fom: Utils.dato.formatterDatoTilNorsk(fomDato),
    tom: Utils.dato.formatterDatoTilNorsk(tomDato),
  });

  const hentLovvalgsperiode = (props) =>
    !Utils._isEmpty(props.lovvalgsperiode)
      ? tilPeriode(props.lovvalgsperiode.fomDato, props.lovvalgsperiode.tomDato)
      : tilPeriode(props.sedLovvalgsperiode.fom, props.sedLovvalgsperiode.tom);

  useEffect(() => {
    const periode = hentLovvalgsperiode({ lovvalgsperiode, sedLovvalgsperiode });
    oppdaterFom(periode.fom);
    oppdaterTom(periode.tom);
  }, [lovvalgsperiode]);

  const fritekstPaakrevd = () => begrunnelse === MKV.Koder.begrunnelser.folketrygdloven.endret_unntaksperiode.ANNET;

  const oppdaterFelt = (event, oppdater) => {
    event.stopPropagation();
    oppdater(event.target.value);
  };

  return (
    <div className="endre_periode">
      <Nav.Column xs="3">
        <Datovelger
          label="Startdato"
          value={Utils.dato.norskStringTilDate(fom)}
          onChange={oppdaterFom}
          feil={feilmeldinger.fom}
          disabled={!redigerbart}
        />
      </Nav.Column>
      <Nav.Column xs="3" className="sluttdato-datovelger">
        <Datovelger
          label="Sluttdato"
          value={Utils.dato.norskStringTilDate(tom)}
          onChange={oppdaterTom}
          feil={feilmeldinger.tom}
          disabled={!redigerbart}
        />
      </Nav.Column>
      <Nav.Column xs="12">
        <Nav.Select
          label="Begrunnelse for endret periode"
          onChange={(e) => oppdaterFelt(e, oppdaterBegrunnelse)}
          readOnly={!redigerbart}
          error={feilmeldinger.begrunnelse}
          value={begrunnelse || "0"}
        >
          <option key={uuid()} value="0" disabled>
            Velg i listen
          </option>
          {MKV.KTObjects.begrunnelser.folketrygdloven.endret_unntaksperiode.map((kodeobjekt) => (
            <option key={kodeobjekt.kode} value={kodeobjekt.kode}>
              {kodeobjekt.term}
            </option>
          ))}
        </Nav.Select>
      </Nav.Column>
      {fritekstPaakrevd() && (
        <Nav.Column xs="6">
          <Nav.Textarea
            label="Skriv inn begrunnelse for endring av periode..."
            maxLength={255}
            onChange={(e) => oppdaterFelt(e, oppdaterFritekst)}
            value={fritekst}
            feil={feilmeldinger.fritekst}
            disabled={!redigerbart}
          />
        </Nav.Column>
      )}
    </div>
  );
};

EndrePeriode.propTypes = {
  endrePeriode: PT.shape({
    fom: PT.string,
    tom: PT.string,
    begrunnelse: PT.string,
    fritekst: PT.string,
  }).isRequired,
  lovvalgsperiode: PT.shape({
    fomDato: PT.string,
    tomDato: PT.string,
  }).isRequired,
  sedLovvalgsperiode: MPT.Periode,
  oppdaterFom: PT.func.isRequired,
  oppdaterTom: PT.func.isRequired,
  oppdaterBegrunnelse: PT.func.isRequired,
  oppdaterFritekst: PT.func.isRequired,
  feilmeldinger: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
};

EndrePeriode.defaultProps = {
  sedLovvalgsperiode: {},
};

export default EndrePeriode;
