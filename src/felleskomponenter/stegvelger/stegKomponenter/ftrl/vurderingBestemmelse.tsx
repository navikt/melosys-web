import React, { Fragment, useEffect, useState } from 'react';
import { RootState } from 'AppTypes';
import { connect, ConnectedProps } from 'react-redux';

import MKV from '../../../../melosyskodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';

import { BOOLSK_STRING } from '../../../../constants';
import { vilkarSelectors } from '../../../../ducks/vilkar';
import { lagBegrunnelse, lagVilkaar } from '../../../../regler/vilkar';
import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from '../../../../ducks/medlemskapsperioder';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { folketrygdenkodeverkSelectors } from '../../../../ducks/folketrygdenkodeverk';

import './vurderingBestemmelse.css';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';


const mapStateToProps = (state: RootState) => ({
  vilkarListe: vilkarSelectors.VilkarSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  medlemskapsperioder: medlemskapsperioderSelectors.MedlemskapsperioderDataSelector(state),
  vilkaarKodeverk: folketrygdenkodeverkSelectors.VilkaarSelector(state),
  begrunnelserKodeverk: folketrygdenkodeverkSelectors.BegrunnelserSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterBestemmelse: (bestemmelse: string) => dispatch(medlemskapsperioderOperations.oppdaterBestemmelse(bestemmelse)),
});


const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void,
  bestemmelseVilkår: BestemmelsesVilkår[],
  oppdater: () => void,
  tilbake: () => void,
  redigerbart: boolean,
  oppdaterData: (data: any) => void,
  vilkar: []
}
interface VilkårOgBegrunnelser {
  vilkaar: string,
  muligeBegrunnelser: string[]
}
interface BestemmelsesVilkår {
  bestemmelse: string,
  vilkårOgBegrunnelser: VilkårOgBegrunnelser[],
}
const VurderingBestemmelse =
  ({
    bekreft,
    bestemmelseVilkår,
    tilbake,
    redigerbart,
    oppdaterData,
    begrunnelserKodeverk,
    vilkaarKodeverk,
    oppdaterBestemmelse,
    oppdater,
  } : Props & PropsFromRedux) => {
    const [valgtBestemmelse, setValgtBestemmelse] = useState('');
    const [valgteBegrunnelser, setValgteBegrunnelser] = useState(new Map());
    const [valgteVilkår, setValgteVilkår] = useState(new Map());
    const [erAlleValgGjort, setErAlleValgGjort] = useState(false);

    const hjelpetekstVilkårTekst = 'Husk at EØS perioder kan legges sammen...';
    const VilkårLegend = () => (<Fragment>{'Har søker vært medlem i 3 av de siste 5 kalenderårene?'}<Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekstVilkårTekst} type={Nav.PopoverOrientering.Hoyre}>{hjelpetekstVilkårTekst}</Nav.Hjelpetekst></Fragment>);
    const hjelpetekstVilkår2Tekst = 'Hjelpetekst for Velg særlig grunn...';
    const Vilkår2SelectLegend = () => (<Fragment>{'Velg særlig grunn'}<Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekstVilkår2Tekst} type={Nav.PopoverOrientering.Hoyre}>{hjelpetekstVilkår2Tekst}</Nav.Hjelpetekst></Fragment>);

    useEffect(() => {
      const valgteBestemmelseVilkår = bestemmelseVilkår.find(bestemmelseVilkår => bestemmelseVilkår.bestemmelse === valgtBestemmelse);
      const alleVilkårHarSvarJaOgvalgtBegrunnelse = valgteBestemmelseVilkår && valgteBestemmelseVilkår.vilkårOgBegrunnelser.filter(vilkår =>
        (valgteVilkår.get(vilkår.vilkaar) === BOOLSK_STRING.SANN) &&
        (vilkår.muligeBegrunnelser.length > 0 ? valgteBegrunnelser.get(vilkår.vilkaar) : true))
        .length === valgteBestemmelseVilkår.vilkårOgBegrunnelser.length;

      setErAlleValgGjort(!!alleVilkårHarSvarJaOgvalgtBegrunnelse);
    }, [valgteBegrunnelser, valgtBestemmelse, valgteVilkår]);

    const handleEndreBestemmelse = async (event: any) => {
      setValgtBestemmelse(event.target.value);
      await oppdaterBestemmelse(event.target.value);
      oppdater();
    };

    const handleEndreVilkår = (event: any) => {
      setValgteVilkår(new Map(valgteVilkår.set(event.target.name, event.target.value)));
      oppdaterData(lagVilkaar(event.target.name, event.target.value));
      if (event.target.value === BOOLSK_STRING.USANN && valgteBegrunnelser.get(event.target.name)) {
        valgteBegrunnelser.delete(event.target.name);
        setValgteBegrunnelser(new Map(valgteBegrunnelser));
        oppdaterData(lagBegrunnelse(event.target.name, []));
      }
    };

    const handleEndreBegrunnelse = (event: any) => {
      setValgteBegrunnelser(new Map(valgteBegrunnelser.set(event.target.name, event.target.value)));
      oppdaterData(lagBegrunnelse(event.target.name, [event.target.value]));
    };

    const Alert = () => <Nav.AlertStripe type="feil" className="alerstripe">Søknaden kan foreløpig ikke behandles i Melosys. Avslutt saken som bortfalt.</Nav.AlertStripe>;

    const Vilkår = ({ vilkaar, muligeBegrunnelser }: VilkårOgBegrunnelser) => {
      return (
        <Fragment>
          <Nav.Fieldset className="radio" legend={Utils.kodeterm.termFraKTObject(vilkaarKodeverk, vilkaar)}>
            <Nav.Row>
              <Nav.Column xs="1">
                <Nav.Radio
                  label="Ja"
                  name={vilkaar}
                  onChange={handleEndreVilkår}
                  checked={valgteVilkår.get(`${vilkaar}`) === BOOLSK_STRING.SANN}
                  value={BOOLSK_STRING.SANN}
                  key={BOOLSK_STRING.SANN}
                  disabled={!redigerbart}
                />
              </Nav.Column>
              <Nav.Column xs="1">
                <Nav.Radio
                  label="Nei"
                  name={vilkaar}
                  onChange={handleEndreVilkår}
                  checked={valgteVilkår.get(`${vilkaar}`) === BOOLSK_STRING.USANN}
                  value={BOOLSK_STRING.USANN}
                  key={BOOLSK_STRING.USANN}
                  disabled={!redigerbart}
                />
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
          { valgteVilkår.get(`${vilkaar}`) === BOOLSK_STRING.USANN && <Alert />}
          { muligeBegrunnelser.length > 0 &&  valgteVilkår.get(`${vilkaar}`) === BOOLSK_STRING.SANN &&
          <Nav.Fieldset className="select" legend={<Vilkår2SelectLegend />}>
            <Nav.Row>
              <Nav.Column xs="7">
                <Nav.Select
                  label=""
                  bredde="fullbredde"
                  onChange={handleEndreBegrunnelse}
                  name={vilkaar}
                  value={valgteBegrunnelser.get(`${vilkaar}`)}
                >
                  <option key="" value={""} disabled={!!valgteBegrunnelser.get(`${vilkaar}`)}>Velg</option>
                  {muligeBegrunnelser.map(begrunnelse => <option key={begrunnelse} value={begrunnelse}>{Utils.kodeterm.termFraNestedKTObject(begrunnelserKodeverk, begrunnelse)}</option>)}
                </Nav.Select>
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
          }
        </Fragment>
      );
    };

    return (
      <div className="bestemmelse">
        <Nav.typo.Undertittel className="undertittel">Hvilken bestemmelse skal søknaden vurderes etter?</Nav.typo.Undertittel>

        <Nav.Fieldset className="select" legend="Velg bestemmelse">
          <Nav.Row>
            <Nav.Column xs="7">
              <Nav.Select
                label=""
                disabled={!redigerbart}
                onChange={handleEndreBestemmelse}
              >
                <option disabled={!!valgtBestemmelse} value="" key="">Velg</option>
                {bestemmelseVilkår.map(bestemmelseMedVilkår => <option key={bestemmelseMedVilkår.bestemmelse} value={bestemmelseMedVilkår.bestemmelse}>{Utils.kodeterm.termFraKTObject(MKV.KTObjects.folketrygdloven_kap2_bestemmelser, bestemmelseMedVilkår.bestemmelse)}</option>)}
              </Nav.Select>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>

        {bestemmelseVilkår
          .filter(bestemmelseMedVilkår => bestemmelseMedVilkår.bestemmelse === valgtBestemmelse)
          .map(bestemmelseMedVilkår => bestemmelseMedVilkår.vilkårOgBegrunnelser.map((vilkaarMedBegrunnelser, index) =>
              <Vilkår key={index} vilkaar={vilkaarMedBegrunnelser.vilkaar} muligeBegrunnelser={vilkaarMedBegrunnelser.muligeBegrunnelser} />
        ))}

        <div className="fane__knapplinje">
          <Nav.Knapp
            mini
            disabled={false}
            className="fane__navigasjonsknapp"
            onClick={tilbake}>Tilbake
          </Nav.Knapp>
          <Nav.Hovedknapp
            mini
            disabled={!erAlleValgGjort}
            className="fane__navigasjonsknapp"
            onClick={bekreft}>Fortsett
          </Nav.Hovedknapp>
        </div>
      </div>
    );
  };


export default connector(VurderingBestemmelse);
