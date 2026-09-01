export const BREVBIBLIOTEK = "/brevbibliotek";

// Knappen i topplinja skal slå opp i biblioteket der brukeren står: i en sak som en
// popover ved siden av saken, ellers som en egen side. Mønstrene speiler rutene i
// routing.jsx som har :saksnr, og leses av useRouteMatch. Ruten – ikke redux – avgjør,
// så en fagsak som ligger igjen i state etter navigering ikke gir feil svar.
export const SAKSRUTER = [
  "/:sakstype/saksbehandling/:saksnr",
  "/:sakstype/registrering/:saksnr",
  "/:sakstype/ikkeYrkesaktiv/:saksnr",
  "/:sakstype/aarsavregning/:saksnr",
  "/:sakstype/pensjonist/:saksnr",
  "/:sakstype/behandling/:saksnr",
  "/:sakstype/vurderutpeking/:saksnr",
  "/:sakstype/unntaksregistrering/:saksnr",
];
