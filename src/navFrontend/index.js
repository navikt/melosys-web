import { Column, Container, Row } from "./grid";
import NavFrontendSpinner from "nav-frontend-spinner";
import Tekstomrade from "nav-frontend-tekstomrade";
import {
  Box,
  Button,
  HelpText,
  Link,
  Tag,
  Modal,
  Checkbox,
  Radio,
  Select,
  CheckboxGroup,
} from "@navikt/ds-react";
import Alert from "./alert";
import TextField from "./skjema/textfield";
import RadioGroup from "./skjema/radiogroup";

// Egne implementasjoner av pakker fra nav-frontend. Noen av disse har blitt fjernet fra nav-frontend, men vi implementerer de selv fordi vi fortsatt har bruk for de.
import { Fieldset, SkjemaGruppe, Textarea } from "./skjema";
import * as Typo from "./typografi";

export {
  Alert,
  Container,
  Row,
  Column,
  SkjemaGruppe,
  Fieldset,
  Select,
  Textarea,
  Typo,
  NavFrontendSpinner,
  Tekstomrade,
  Tag,
  HelpText,
  Button,
  Box,
  Link,
  Modal,
  Checkbox,
  TextField,
  Radio,
  RadioGroup,
  CheckboxGroup,
};
