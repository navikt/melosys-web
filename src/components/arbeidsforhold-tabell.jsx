import React from 'react'
import {Link} from 'react-router-dom'

const ArbeidsforholdRad = ({data}) => {
  const fnr = data.arbeidstaker.ident.ident;
  const orgnr = data.arbeidsgiver.orgnummer;
  const linkTo = `/arbeidsforholdet/${fnr}/${orgnr}`;
  return (
    <tr>
      <td>{data.arbeidsgiver.orgnummer}</td>
      <td>TODO:OrgNavn</td>
      <td>{data.ansettelsesPeriode.periode.fom && data.ansettelsesPeriode.periode.fom.slice(0, 10)}</td>
      <td>{data.ansettelsesPeriode.periode.tom && data.ansettelsesPeriode.periode.tom.slice(0, 10)}</td>
      <td>{data.arbeidsavtale[0].stillingsprosent}%</td>
      <td>{data.arbeidsforholdstype}</td>
      <td>{data.arbeidsavtale[0].yrke.termnavn}</td>
      <td>{data.permisjonOgPermittering[0].permisjonsPeriode.permisjonsprosent}</td>
      <td>Bekreftet</td>
      <td><Link to={linkTo}>Vis</Link></td>
    </tr>
  );
};

const ArbeidsforholdTabell = ({
                                arbeidsforhold = []
                              }) => {
  if (!arbeidsforhold || !arbeidsforhold.length) {
    return null;
  }

  const rows = arbeidsforhold.map((item) => <ArbeidsforholdRad key={item.arbeidsforholdID} data={item}/>);
  return (
    <table className="tabell-enkel">
      <thead>
      <tr>
        <th>Org.nr.</th>
        <th>Navn</th>
        <th>Start</th>
        <th>Slutt</th>
        <th>Stilling</th>
        <th>Arbeidsforhold</th>
        <th>Yrke</th>
        <th>Perm%</th>
        <th>Bekreftet</th>
        <th>&nbsp;</th>
      </tr>
      </thead>
      <tbody>
      {rows}
      </tbody>
    </table>
  );
};


ArbeidsforholdTabell.displayName = 'ArbeidsforholdTabell';
export default ArbeidsforholdTabell;