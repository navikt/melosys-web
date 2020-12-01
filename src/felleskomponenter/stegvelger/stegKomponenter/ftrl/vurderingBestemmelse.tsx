import React, { ChangeEventHandler, Fragment, useEffect, useState } from 'react';
import { RootState } from 'AppTypes';
import { connect, ConnectedProps } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';

import MKV from '../../../../melosyskodeverk';
import * as Nav from '../../../../utils/navFrontend';

import { BOOLSK_STRING } from '../../../../constants';
import { vilkarSelectors } from '../../../../ducks/vilkar';
import { lagBegrunnelse, lagVilkaar } from '../../../../regler/vilkar';
import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from '../../../../ducks/medlemskapsperioder';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { folketrygdenkodeverkSelectors } from '../../../../ducks/folketrygdenkodeverk';
import { finnTermFraListe, termFraNestedKTObject } from '../../../../kodeverk';

import './vurderingBestemmelse.css';


const mapStateToProps = (state: RootState) => ({
  vilkarListe: vilkarSelectors.VilkarSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  medlemskapsperioder: medlemskapsperioderSelectors.MedlemskapsperioderDataSelector(state),
  vilkaarKodeverk: folketrygdenkodeverkSelectors.VilkaarSelector(state),
  begrunnelserKodeverk: folketrygdenkodeverkSelectors.BegrunnelserSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterBestemmelse: (bestemmelse: string) => dispatch(medlemskapsperioderOperations.oppdaterBestemmelse(bestemmelse)),
  opprettMedlemskapsperiodeFraBestemmelse: () => dispatch(medlemskapsperioderOperations.opprettMedlemskapsperiodeFraBestemmelse()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface VilkarOgBegrunnelser {
  vilkaar: string,
  muligeBegrunnelser: string[]
}

interface BestemmelsesVilkar {
  bestemmelse: string,
  vilkårOgBegrunnelser: VilkarOgBegrunnelser[],
}

interface Props {
  bekreft: () => void,
  bestemmelseVilkar: BestemmelsesVilkar[],
  oppdater: () => void,
  tilbake: () => void,
  redigerbart: boolean,
  oppdaterData: (data: any) => void,
  vilkar: []
}


const VurderingBestemmelse =
  ({
    bekreft,
    bestemmelseVilkar,
    tilbake,
    redigerbart,
    oppdaterData,
    begrunnelserKodeverk,
    vilkaarKodeverk,
    oppdaterBestemmelse,
    oppdater,
    opprettMedlemskapsperiodeFraBestemmelse,
  } : Props & PropsFromRedux) => {
    const [valgtBestemmelse, setValgtBestemmelse] = useState('');
    const [valgteBegrunnelser, setValgteBegrunnelser] = useState(new Map());
    const [valgteVilkar, setValgteVilkar] = useState(new Map());
    const [erAlleValgGjort, setErAlleValgGjort] = useState(false);

    const hjelpetekst = 'Her kommer det hjelpetekster for å hjelpe saksbehandler';
    const Hjelpetekst = () => (<Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Hoyre}>{hjelpetekst}</Nav.Hjelpetekst>);


    useEffect(() => {
      const valgteBestemmelseVilkar = bestemmelseVilkar.find(element => element.bestemmelse === valgtBestemmelse);
      const alleVilkarHarSvarJaOgvalgtBegrunnelse = valgteBestemmelseVilkar && valgteBestemmelseVilkar.vilkårOgBegrunnelser.filter(vilkar =>
        (valgteVilkar.get(vilkar.vilkaar) === BOOLSK_STRING.SANN) &&
        (vilkar.muligeBegrunnelser.length > 0 ? valgteBegrunnelser.get(vilkar.vilkaar) : true))
        .length === valgteBestemmelseVilkar.vilkårOgBegrunnelser.length;

      setErAlleValgGjort(!!alleVilkarHarSvarJaOgvalgtBegrunnelse);
    }, [valgteBegrunnelser, valgtBestemmelse, valgteVilkar]);

    const handleBefreft = () => {
      opprettMedlemskapsperiodeFraBestemmelse();
      bekreft();
    };

    const handleEndreBestemmelse: ChangeEventHandler<HTMLSelectElement> = async event => {
      setValgtBestemmelse(event.target.value);
      await oppdaterBestemmelse(event.target.value);
      oppdater();
    };

    const handleEndreVilkar: ChangeEventHandler<HTMLInputElement> = event => {
      setValgteVilkar(new Map(valgteVilkar.set(event.target.name, event.target.value)));
      oppdaterData(lagVilkaar(event.target.name, event.target.value));
      if (event.target.value === BOOLSK_STRING.USANN && valgteBegrunnelser.get(event.target.name)) {
        valgteBegrunnelser.delete(event.target.name);
        setValgteBegrunnelser(new Map(valgteBegrunnelser));
        oppdaterData(lagBegrunnelse(event.target.name, []));
      }
    };

    const handleEndreBegrunnelse: ChangeEventHandler<HTMLSelectElement> = event => {
      setValgteBegrunnelser(new Map(valgteBegrunnelser.set(event.target.name, event.target.value)));
      oppdaterData(lagBegrunnelse(event.target.name, [event.target.value]));
    };

    const Alert = () => <Nav.AlertStripe type="feil" className="alerstripe">Søknaden kan foreløpig ikke behandles i Melosys. Avslutt saken som bortfalt.</Nav.AlertStripe>;

    const Vilkaar = ({ vilkaar, muligeBegrunnelser }: VilkarOgBegrunnelser) => (
      <Fragment>
        <Nav.Fieldset
          className="radio"
          legend={<Fragment>{finnTermFraListe(vilkaarKodeverk, vilkaar)}<Hjelpetekst /></Fragment>}>
          <Nav.Row>
            <Nav.Column xs="1">
              <Nav.Radio
                label="Ja"
                name={vilkaar}
                onChange={handleEndreVilkar}
                checked={valgteVilkar.get(`${vilkaar}`) === BOOLSK_STRING.SANN}
                value={BOOLSK_STRING.SANN}
                key={BOOLSK_STRING.SANN}
                disabled={!redigerbart}
              />
            </Nav.Column>
            <Nav.Column xs="1">
              <Nav.Radio
                label="Nei"
                name={vilkaar}
                onChange={handleEndreVilkar}
                checked={valgteVilkar.get(`${vilkaar}`) === BOOLSK_STRING.USANN}
                value={BOOLSK_STRING.USANN}
                key={BOOLSK_STRING.USANN}
                disabled={!redigerbart}
              />
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
        { valgteVilkar.get(`${vilkaar}`) === BOOLSK_STRING.USANN && <Alert />}
        { muligeBegrunnelser.length > 0 && valgteVilkar.get(`${vilkaar}`) === BOOLSK_STRING.SANN &&
        <Nav.Fieldset
          className="select"
          legend={<Fragment>Velg særlig grunn<Hjelpetekst /></Fragment>}>
          <Nav.Row>
            <Nav.Column xs="7">
              <Nav.Select
                label=""
                bredde="fullbredde"
                onChange={handleEndreBegrunnelse}
                name={vilkaar}
                value={valgteBegrunnelser.get(`${vilkaar}`)}
              >
                <option key="" value="" disabled={!!valgteBegrunnelser.get(`${vilkaar}`)}>Velg</option>
                {muligeBegrunnelser.map(begrunnelse => <option key={begrunnelse} value={begrunnelse}>{termFraNestedKTObject(begrunnelserKodeverk, begrunnelse)}</option>)}
              </Nav.Select>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
        }
      </Fragment>
    );

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
                {bestemmelseVilkar.map(bestemmelseMedVilkar =>
                  <option key={bestemmelseMedVilkar.bestemmelse} value={bestemmelseMedVilkar.bestemmelse}>
                    {finnTermFraListe(MKV.KTObjects.folketrygdloven_kap2_bestemmelser, bestemmelseMedVilkar.bestemmelse)}
                  </option>)}
              </Nav.Select>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>

        {bestemmelseVilkar
          .filter(bestemmelseMedVilkar => bestemmelseMedVilkar.bestemmelse === valgtBestemmelse)
          .map(bestemmelseMedVilkar => bestemmelseMedVilkar.vilkårOgBegrunnelser.map(vilkaarMedBegrunnelser =>
            <Vilkaar key={vilkaarMedBegrunnelser.vilkaar} vilkaar={vilkaarMedBegrunnelser.vilkaar} muligeBegrunnelser={vilkaarMedBegrunnelser.muligeBegrunnelser} />))}

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
            onClick={handleBefreft}>Fortsett
          </Nav.Hovedknapp>
        </div>
      </div>
    );
  };


export default connector(VurderingBestemmelse);
