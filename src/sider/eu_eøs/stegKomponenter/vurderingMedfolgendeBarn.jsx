import { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import PT from "prop-types";

import * as MPT from "../../../proptypes";
import * as Utils from "../../../utils";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";

import MKV from "../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../constants";

import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";

import { hentFaktaVerdi } from "../../../domeneUtils";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartfakta,
  slettAvklartfakta,
  lagAvklartefaktaBegrunnelse,
} from "../../../felleskomponenter/stegvelger";

import "./vurderingMedfolgendeBarn.css";

const MedfolgendeBarn = ({
  navn,
  idNummer,
  omfattet,
  redigerbart,
  onCheck,
  onMount,
  onUnmount,
  begrunnelse,
  onBegrunnelseChange,
}) => {
  const radioName = Utils._uuid();

  useEffect(() => {
    onMount();

    return () => {
      onUnmount();
    };
  }, []);

  return (
    <Nav.Row className="vurdering-medfolgende-barn__enkelt">
      <Nav.Column xs="12">
        <div className="personalia">
          {navn && (
            <>
              <Nav.Typo.Element>{navn}</Nav.Typo.Element>
              &nbsp;
            </>
          )}
          {idNummer && <Nav.BodyLong size="small">(F.nr/d-nr.: {idNummer})</Nav.BodyLong>}
        </div>
        <Nav.RadioGroup
          legend=""
          hideLegend
          disabled={!redigerbart}
          onChange={onCheck}
          defaultValue={omfattet}
          name={radioName}
        >
          <Nav.Radio value={BOOLSK_STRING.SANN}>Ja</Nav.Radio>
          <Nav.Radio value={BOOLSK_STRING.USANN}>Nei</Nav.Radio>
        </Nav.RadioGroup>
        {omfattet === BOOLSK_STRING.USANN && (
          <Nav.Row>
            <Nav.Column xs="8">
              <Nav.Select
                onChange={(e) => onBegrunnelseChange(e.target.value)}
                value={begrunnelse}
                readOnly={!redigerbart}
                label="Begrunnelse for avslag:"
              >
                <option key={Utils._uuid()} value="" disabled>
                  Velg...
                </option>
                {MKV.KTObjects.begrunnelser.medfolgende_barn_begrunnelser.map(({ kode, term }) => (
                  <option key={kode} value={kode}>
                    {term}
                  </option>
                ))}
              </Nav.Select>
            </Nav.Column>
          </Nav.Row>
        )}
      </Nav.Column>
    </Nav.Row>
  );
};

MedfolgendeBarn.propTypes = {
  navn: PT.string,
  idNummer: PT.string,
  omfattet: PT.oneOf([BOOLSK_STRING.SANN, BOOLSK_STRING.USANN, null]),
  redigerbart: PT.bool.isRequired,
  onCheck: PT.func.isRequired,
  onUnmount: PT.func.isRequired,
  onMount: PT.func.isRequired,
  begrunnelse: PT.string,
  onBegrunnelseChange: PT.func.isRequired,
};

MedfolgendeBarn.defaultProps = {
  navn: "",
  idNummer: "",
  omfattet: null,
  begrunnelse: "",
};

const VurderingMedfolgendeBarn = ({
  vurderingLovvalgBarnFakta,
  medfolgendeBarn,
  bekreftOgFortsett,
  redigerbart,
  oppdaterData,
  slettData,
  tilstand: { harAvklaring },
  tilbake,
}) => {
  const medfolgendeBarnMedFritekst = vurderingLovvalgBarnFakta.find((af) => af.begrunnelseFritekst);
  const defaultMedfolgendeBarnFritekst = medfolgendeBarnMedFritekst
    ? medfolgendeBarnMedFritekst.begrunnelseFritekst
    : "";
  const [medfolgendeBarnFritekst, setMedfolgendeBarnFritekst] = useState(defaultMedfolgendeBarnFritekst);

  useEffect(
    () => () => {
      slettData();
    },
    []
  );

  const visFritekstFelt = vurderingLovvalgBarnFakta.some((af) => hentFaktaVerdi(af) === BOOLSK_STRING.USANN);

  const oppdaterStegStoreFritekst = (fritekst) => {
    vurderingLovvalgBarnFakta.forEach((af) => {
      if (hentFaktaVerdi(af) === BOOLSK_STRING.USANN) {
        oppdaterData(
          lagAvklartfakta(
            MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN,
            af.subjektID,
            ...af.fakta,
            [...af.begrunnelseKoder],
            fritekst || null
          )
        );
      }
    });
  };
  const debouncedOppdaterStegStoreFritekst = useCallback(Utils._debounce(oppdaterStegStoreFritekst, 1000), [
    vurderingLovvalgBarnFakta,
  ]);

  const onMedfolgendeBarnFritekstChange = (e) => {
    setMedfolgendeBarnFritekst(e.target.value);
    debouncedOppdaterStegStoreFritekst(e.target.value);
  };

  return (
    <Nav.Container fluid className="vurdering-medfolgende-barn">
      <Nav.Typo.Undertittel className="undertittel">
        Skal barn oppgitt i søknaden være omfattet av norsk lovgivning?
      </Nav.Typo.Undertittel>
      {medfolgendeBarn.map((barn) => {
        const medfolgendeBarnEnkeltfakta = vurderingLovvalgBarnFakta.find((af) => af.subjektID === barn.uuid);
        const begrunnelse =
          medfolgendeBarnEnkeltfakta && medfolgendeBarnEnkeltfakta.begrunnelseKoder.length > 0
            ? medfolgendeBarnEnkeltfakta.begrunnelseKoder[0]
            : undefined;

        const onMount = () => {
          if (medfolgendeBarnEnkeltfakta) {
            oppdaterData(
              konverterAvklartfaktaTilStegData(
                MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN,
                medfolgendeBarnEnkeltfakta
              )
            );
          }
        };
        const onUnmount = () => {
          slettData(slettAvklartfakta(MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN, barn.uuid));
        };
        const onCheck = (value) => {
          oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN, barn.uuid, value, []));
        };
        const onBegrunnelseChange = (begrunnelseKode) => {
          oppdaterData(
            lagAvklartefaktaBegrunnelse(MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN, barn.uuid, [
              begrunnelseKode,
            ])
          );
        };

        return (
          <MedfolgendeBarn
            key={barn.uuid}
            navn={barn.navn}
            idNummer={barn.fnr}
            redigerbart={redigerbart}
            omfattet={hentFaktaVerdi(medfolgendeBarnEnkeltfakta)}
            onCheck={onCheck}
            onUnmount={onUnmount}
            onMount={onMount}
            begrunnelse={begrunnelse}
            onBegrunnelseChange={onBegrunnelseChange}
          />
        );
      })}
      {visFritekstFelt && (
        <Nav.Textarea
          value={medfolgendeBarnFritekst || ""}
          onChange={onMedfolgendeBarnFritekstChange}
          label="Fritekst til avsnitt om barn i vedtaksbrev"
          placeholder="Skriv inn tilleggsinformasjon..."
          readOnly={!redigerbart}
        />
      )}
      {medfolgendeBarn.length === 0 && <Nav.Alert variant="info">Ingen barn oppgitt i søknaden</Nav.Alert>}
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </Nav.Container>
  );
};

VurderingMedfolgendeBarn.propTypes = {
  vurderingLovvalgBarnFakta: MPT.AvklartefaktaListe,
  bekreftOgFortsett: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  medfolgendeBarn: PT.arrayOf(PT.object).isRequired,
  tilstand: PT.object,
  tilbake: PT.func.isRequired,
};

VurderingMedfolgendeBarn.defaultProps = {
  vurderingLovvalgBarnFakta: [],
  tilstand: {},
};

const mapStateToProps = (state) => ({
  medfolgendeBarn: mottatteOpplysningerSelectors.MedfolgendeBarnSelector(state),
});

export default connect(mapStateToProps)(VurderingMedfolgendeBarn);
