class DomeneRegel {
  constructor(skjema = {}, saksopplysninger = {}) {
    this.skjema = skjema;
    this.saksopplysninger = saksopplysninger;
  }

  byggRegelSvar = (erOppfylt, positivTekst, negativTekst) => (
    {
      tekst: erOppfylt ? positivTekst : negativTekst,
      status: erOppfylt,
    }
  );

  manglerOpplysninger = manglerTekst => (
    {
      tekst: manglerTekst,
      status: undefined,
    }
  )
}

export default DomeneRegel;
