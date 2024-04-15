import Panel from "nav-frontend-paneler";
import { Column, Container, Row } from "./grid";
import NavFrontendSpinner from "nav-frontend-spinner";
import Lenker from "nav-frontend-lenker";
import Modal from "nav-frontend-modal";
import Tekstomrade from "nav-frontend-tekstomrade";
import { LenkepanelBase } from "nav-frontend-lenkepanel";
import { Alert, Tag, HelpText, Button } from "@navikt/ds-react";

// Egne implementasjoner av pakker fra nav-frontend. Noen av disse har blitt fjernet fra nav-frontend, men vi implementerer de selv fordi vi fortsatt har bruk for de.
import {
  Checkbox,
  Fieldset,
  Input,
  InputProps,
  Radio,
  RadioPanelGruppe,
  Select,
  SelectProps,
  SkjemaGruppe,
  Textarea,
} from "./skjema";
import * as Typo from "./typografi";

export {
  Alert,
  Container,
  Row,
  Column,
  Checkbox,
  Radio,
  RadioPanelGruppe,
  SkjemaGruppe,
  Fieldset,
  Select,
  SelectProps,
  Input,
  InputProps,
  Textarea,
  Panel,
  Typo,
  NavFrontendSpinner,
  Lenker,
  Modal,
  Tekstomrade,
  LenkepanelBase,
  Tag,
  HelpText,
  Button,
};
