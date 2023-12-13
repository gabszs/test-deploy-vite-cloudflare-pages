import { SyntheticEvent } from "react";
import * as yup from "yup";
import { Stream } from "../components/views/Dashboard/StreamList";
import { SymCount, Tickers } from "./datafetching";

export interface ReturnError {
  message: string;
}

export interface InputData {
  name: string | null;
  email: string | null;
  password: string | null;
}

export interface TickSubs {
  newticks: string[];
  delticks: string[];
  redirect?: boolean;
}

interface FmtTickers {
  symbols: string[];
  symcount: SymCount;
}

type DBStream = Stream & { user_id: string };

interface OldStreamData {
  streams: Stream[];
  oldstream: Stream;
}

export const local = {
  id: "u_id",
  token: "u_token",
  streams: "u_streams",
  joined: "u_joindate",
  imp_streams: "u_impStreams",
};

export const messages: { [key: string]: string } = {
  name: "Name must contain only alphabet characters.",
  email: "Please enter a valid email.",
  pass: "Passwords must have special, uppercase, lowercase and digit characters",
  passmin: "Password must have at least 8 characters",
  passmax: "Password must have at most 32 characters",
  cpassword: "Passwords must match",
};

const reg = /^([^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/;

const userSchema = yup
  .object({
    name: yup
      .string()
      .matches(/^[^0-9]+$/, messages.name)
      .required(),
    email: yup.string().email(messages.email).required(),
    password: yup
      .string()
      .min(8, messages.passmin)
      .max(32, messages.passmax)
      .test({
        test: (v: string) => !reg.test(v),
        message: messages.pass,
      }),
  })
  .noUnknown(true, "Invalid fields detected");

const schemas = {
  auth: userSchema.pick(["email", "password"]).noUnknown(true),
  password: userSchema.pick(["password"]).noUnknown(true),
  signup: userSchema,
};

export const formatTicker = (symbol: string) => {
  const ticker = (symbol + "@ticker").toLowerCase();
  return ticker;
};

const countSymbols = (streams: Stream[], user_id: string): FmtTickers => {
  let allsyms = [];

  streams.forEach((stream: DBStream) => {
    allsyms = allsyms.concat(stream.symbols);
    stream.user_id = user_id;
  });

  const symcount = allsyms.reduce((store: SymCount, sym: string) => {
    store[sym] = store[sym] + 1 || 1;
    return store;
  }, {});

  const symbols = Object.keys(symcount);
  return { symbols, symcount };
};

const formatSymbols = (
  store: Tickers,
  formatter: Intl.NumberFormat,
): Tickers => {
  const formatted: Tickers = {};
  for (const sym in store) {
    const keys = Object.keys(store[sym]).sort();
    const [average, change, last, pchange] = keys.map((k) =>
      formatter.format(store[sym][k]),
    );
    formatted[sym] = { average, change, last, pchange };
  }
  return formatted;
};

const validateForm = (
  input: InputData,
  schema: "signup" | "password" | "auth" = "auth",
): void | string => {
  try {
    schemas[schema].validateSync(input);
  } catch (e) {
    throw new Error((e as yup.ValidationError).errors[0]);
  }
};

const stopPropagation = (e: SyntheticEvent) => {
  e.stopPropagation();
};

const validateField = (
  property: string,
  input: Partial<InputData>,
): void | string => {
  try {
    userSchema.validateSyncAt(property, input);
  } catch (e) {
    const message = (e as yup.ValidationError).errors[0];
    throw message;
  }
};

const addTicks = (symbols: string[], symcount: SymCount): string[] => {
  const newticks = symbols.reduce((store: string[], sym) => {
    symcount[sym] = symcount[sym] + 1 || 1;
    if (symcount[sym] == 1) store.push(formatTicker(sym));
    return store;
  }, []);

  return newticks;
};

const delTicks = (oldsymbols: string[], symcount: SymCount) => {
  const delticks = oldsymbols.reduce((store: string[], oldsym) => {
    symcount[oldsym] -= 1;
    if (symcount[oldsym] < 1) {
      delete symcount[oldsym];
      store.push(formatTicker(oldsym));
    }
    return store;
  }, []);

  return delticks;
};

const queryTicks = (ticks: string[], key: string): string => {
  const queryName = `${key}=`;
  if (ticks.length < 1) return queryName + "[]";
  const encoded = encodeURIComponent(JSON.stringify(ticks));
  const tickParam = `${queryName}${encoded}`;
  return tickParam;
};

const filterStreams = (id: string, streams: Stream[]): OldStreamData => {
  let oldstream: Stream;
  const newstreams = streams.filter((stream) => {
    if (stream.id === id) oldstream = stream;
    return stream.id !== id;
  });
  return { streams: newstreams, oldstream };
};

export {
  addTicks,
  countSymbols,
  delTicks,
  filterStreams,
  formatSymbols,
  queryTicks,
  stopPropagation,
  validateField,
  validateForm,
};
