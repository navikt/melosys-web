export const testReduxState = {
  form: {
    journalforing: {
      values: {
        avsenderType: "PERSON",
        behandlingstype: "NY_VURDERING",
        saksnummer: "",
        journalforingGjelder: "BRUKER",
        brukerID: "30056928150",
        virksomhetOrgnr: null,
        erHovedpartAvsender: true,
        avsenderID: "30056928150",
        avsenderNavn: "KARAFFEL TRIVIELL",
        mottattDato: "11.12.2023",
        hoveddokument: {
          tittel: "Tittel til Dokument",
          logiskeVedlegg: [],
        },
        vedlegg: {
          pdf: {},
        },
        journalforingSoknadsland: [],
        journalforingSoknadslandUkjenteEllerAlleEosLand: false,
        forvaltningsmeldingMottaker: "BRUKER",
        skalTilordnes: false,
        submittable: false,
        sakstype: null,
        utenlandskTrygdemyndighetLandkode: null,
        brukerNavn: "KARAFFEL TRIVIELL",
        virksomhetNavn: null,
        journalforingHensikt: "KNYTT",
        opprettBehandling: true,
        vurderDokument: false,
        behandlingstema: "PENSJONIST",
      },
      initial: {
        avsenderType: "PERSON",
        behandlingstype: null,
        saksnummer: "",
        journalforingGjelder: "BRUKER",
        brukerID: "30056928150",
        virksomhetOrgnr: null,
        erHovedpartAvsender: true,
        avsenderID: "30056928150",
        avsenderNavn: null,
        mottattDato: "11.12.2023",
        hoveddokument: {
          tittel: "Tittel til Dokument",
          logiskeVedlegg: [],
        },
        vedlegg: {
          pdf: {},
        },
        journalforingSoknadsland: [],
        journalforingSoknadslandUkjenteEllerAlleEosLand: false,
        forvaltningsmeldingMottaker: "BRUKER",
        skalTilordnes: false,
        submittable: false,
      },
      registeredFields: {
        brukerID: {
          name: "brukerID",
          type: "Field",
          count: 1,
        },
        mottattDato: {
          name: "mottattDato",
          type: "Field",
          count: 1,
        },
        "hoveddokument.logiskeVedlegg": {
          name: "hoveddokument.logiskeVedlegg",
          type: "FieldArray",
          count: 1,
        },
        skalTilordnes: {
          name: "skalTilordnes",
          type: "Field",
          count: 1,
        },
        avsenderType: {
          name: "avsenderType",
          type: "Field",
          count: 5,
        },
        saksnummer: {
          name: "saksnummer",
          type: "Field",
          count: 1,
        },
        opprettBehandling: {
          name: "opprettBehandling",
          type: "Field",
          count: 3,
        },
        behandlingstema: {
          name: "behandlingstema",
          type: "Field",
          count: 1,
        },
        behandlingstype: {
          name: "behandlingstype",
          type: "Field",
          count: 4,
        },
        forvaltningsmeldingMottaker: {
          name: "forvaltningsmeldingMottaker",
          type: "Field",
          count: 3,
        },
      },
      fields: {
        forvaltningsmeldingMottaker: {
          autofilled: true,
        },
        behandlingstype: {
          touched: true,
        },
      },
      anyTouched: true,
    },
  },
  journalforing: {
    status: "OK",
    data: {
      mottattDato: "2023-12-10T23:00:00Z",
      brukerID: "30056928150",
      virksomhetOrgnr: null,
      avsenderID: "30056928150",
      avsenderNavn: null,
      avsenderType: "PERSON",
      erHovedpartAvsender: true,
      hoveddokument: {
        dokumentID: "319584",
        tittel: "Tittel til Dokument",
        logiskeVedlegg: [],
      },
      vedlegg: [],
      behandlingsInformasjon: null,
    },
  },
  landkoder: {
    status: "OK",
    data: [
      {
        kode: "NO",
        term: "Norge",
      },
      {
        kode: "SA",
        term: "Saudi-Arabia",
      },
      {
        kode: "SO",
        term: "Somalia",
      },
      {
        kode: "ES",
        term: "Spania",
      },
      {
        kode: "GB",
        term: "Storbritannia",
      },
      {
        kode: "SD",
        term: "Sudan",
      },
      {
        kode: "CH",
        term: "Sveits",
      },
      {
        kode: "SE",
        term: "Sverige",
      },
      {
        kode: "US",
        term: "USA",
      },
      {
        kode: "AT",
        term: "Østerrike",
      },
    ],
  },
  sok: {
    data: {
      fagsakListe: [
        {
          saksnummer: "MEL-3",
          navn: "TRIVIELL KARAFFEL",
          sakstema: {
            kode: "MEDLEMSKAP_LOVVALG",
            term: "Medlemskap og lovvalg",
          },
          sakstype: {
            kode: "EU_EOS",
            term: "EU/EØS-land",
          },
          saksstatus: {
            kode: "OPPRETTET",
            term: "Saken er opprettet",
          },
          opprettetDato: "2023-12-08T14:22:51.191295Z",
          behandlingOversikter: [
            {
              behandlingID: 5,
              behandlingsstatus: {
                kode: "UNDER_BEHANDLING",
                term: "Behandlingen pågår",
              },
              behandlingstype: {
                kode: "NY_VURDERING",
                term: "Ny vurdering",
              },
              behandlingstema: {
                kode: "ARBEID_TJENESTEPERSON_ELLER_FLY",
                term: "Offentlig tjenesteperson/flyvende personell",
              },
              lovvalgsperiode: {
                fom: "2023-12-23",
                tom: "2024-04-06",
              },
              medlemskapsperiode: null,
              land: {
                landkoder: ["DK"],
                erUkjenteEllerAlleEosLand: false,
              },
              soknadsperiode: {
                fom: "2023-12-23",
                tom: "2024-04-06",
              },
              opprettetDato: "2023-12-08T14:22:51.275558Z",
              behandlingsresultattype: {
                kode: "IKKE_FASTSATT",
                term: "Ikke fastsatt",
              },
              svarFrist: null,
            },
          ],
          hovedpartRolle: "BRUKER",
        },
        {
          saksnummer: "MEL-23",
          navn: "TRIVIELL KARAFFEL",
          sakstema: {
            kode: "MEDLEMSKAP_LOVVALG",
            term: "Medlemskap og lovvalg",
          },
          sakstype: {
            kode: "EU_EOS",
            term: "EU/EØS-land",
          },
          saksstatus: {
            kode: "LOVVALG_AVKLART",
            term: "Lovvalget er avklart",
          },
          opprettetDato: "2023-12-11T13:09:26.055301Z",
          behandlingOversikter: [
            {
              behandlingID: 23,
              behandlingsstatus: {
                kode: "AVSLUTTET",
                term: "Behandlingen er avsluttet",
              },
              behandlingstype: {
                kode: "FØRSTEGANG",
                term: "Førstegangsbehandling",
              },
              behandlingstema: {
                kode: "PENSJONIST",
                term: "Pensjonist/uføretrygdet",
              },
              lovvalgsperiode: null,
              medlemskapsperiode: null,
              land: null,
              soknadsperiode: null,
              opprettetDato: "2023-12-11T13:09:26.064138Z",
              behandlingsresultattype: {
                kode: "FASTSATT_LOVVALGSLAND",
                term: "Lovvalgsland er fastsatt",
              },
              svarFrist: null,
            },
          ],
          hovedpartRolle: "BRUKER",
        },
        {
          saksnummer: "MEL-26",
          navn: "TRIVIELL KARAFFEL",
          sakstema: {
            kode: "MEDLEMSKAP_LOVVALG",
            term: "Medlemskap og lovvalg",
          },
          sakstype: {
            kode: "EU_EOS",
            term: "EU/EØS-land",
          },
          saksstatus: {
            kode: "HENLAGT",
            term: "Saken er henlagt",
          },
          opprettetDato: "2023-12-11T13:09:26.055301Z",
          behandlingOversikter: [
            {
              behandlingID: 26,
              behandlingsstatus: {
                kode: "AVSLUTTET",
                term: "Behandlingen er avsluttet",
              },
              behandlingstype: {
                kode: "FØRSTEGANG",
                term: "Førstegangsbehandling",
              },
              behandlingstema: {
                kode: "PENSJONIST",
                term: "Pensjonist/uføretrygdet",
              },
              lovvalgsperiode: null,
              medlemskapsperiode: null,
              land: null,
              soknadsperiode: null,
              opprettetDato: "2023-12-11T13:09:26.064138Z",
              behandlingsresultattype: {
                kode: "FASTSATT_LOVVALGSLAND",
                term: "Lovvalgsland er fastsatt",
              },
              svarFrist: null,
            },
          ],
          hovedpartRolle: "BRUKER",
        },
        {
          saksnummer: "MEL-27",
          navn: "TRIVIELL KARAFFEL",
          sakstema: {
            kode: "MEDLEMSKAP_LOVVALG",
            term: "Medlemskap og lovvalg",
          },
          sakstype: {
            kode: "EU_EOS",
            term: "EU/EØS-land",
          },
          saksstatus: {
            kode: "HENLAGT_BORTFALT",
            term: "Saken er henlagt som bortfalt i Melosys.",
          },
          opprettetDato: "2023-12-11T13:09:26.055301Z",
          behandlingOversikter: [
            {
              behandlingID: 27,
              behandlingsstatus: {
                kode: "AVSLUTTET",
                term: "Behandlingen er avsluttet",
              },
              behandlingstype: {
                kode: "FØRSTEGANG",
                term: "Førstegangsbehandling",
              },
              behandlingstema: {
                kode: "PENSJONIST",
                term: "Pensjonist/uføretrygdet",
              },
              lovvalgsperiode: null,
              medlemskapsperiode: null,
              land: null,
              soknadsperiode: null,
              opprettetDato: "2023-12-11T13:09:26.064138Z",
              behandlingsresultattype: {
                kode: "FASTSATT_LOVVALGSLAND",
                term: "Lovvalgsland er fastsatt",
              },
              svarFrist: null,
            },
          ],
          hovedpartRolle: "BRUKER",
        },
      ],
    },
    status: "OK",
  },
};
