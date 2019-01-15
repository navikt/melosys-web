class DomeneRegel {
  constructor(skjema = {}, saksopplysninger = {}) {
    this.skjema = skjema;
    this.saksopplysninger = saksopplysninger;
  }

  byggRegelSvar = (erOppfylt, positivTekst, negativTekst) => (
    {
      fritekst: erOppfylt ? positivTekst : negativTekst,
      status: erOppfylt,
    }
  );

  manglerOpplysninger = manglerTekst => (
    {
      fritekst: manglerTekst,
      status: undefined,
    }
  )
}

export default DomeneRegel;
