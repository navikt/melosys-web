/* eslint-disable */

import Enzyme, { shallow, mount } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import createFetchMock from "vitest-fetch-mock";
import { vi } from "vitest";
import "@testing-library/jest-dom/extend-expect";

// Oppsettfilen for Yup kjøres ikke uten videre av vi. Derfor er det nødvendig å importere den manuelt her.
import "./setupYup";

const fetchMocker = createFetchMock(vi);
// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMocker.enableMocks();

Enzyme.configure({ adapter: new Adapter() });

global.shallow = shallow;
global.mount = mount;

// Mocker frontendlogger
global.frontendlogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mocker localStorage
global.localStorage = {
  removeItem: vi.fn(),
  setItem: vi.fn(),
  getItem: vi.fn(),
};

// Mocker sessionStorage
global.sessionStorage = {
  removeItem: vi.fn(),
  setItem: vi.fn(),
  getItem: vi.fn(),
};
