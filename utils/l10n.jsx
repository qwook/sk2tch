/**
 * L[ocalizatio]n
 **/

import React, { useContext, useEffect } from "react";

import EventEmitter from "events";
import stripJsonComments from "strip-json-comments";

export class FormattableString extends String {
  constructor(template) {
    super(template);
    this.template = template;
  }

  format = (...args) => {
    return this.template.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] != "undefined" ? args[number] : match;
    });
  };

  toString = () => this.template;
}

const l10nEvents = new EventEmitter();
let currentLanguageFile = {};
let fallbackLanguageFile = {};

const handler = {
  get(target, prop) {
    return (
      currentLanguageFile[prop] ||
      fallbackLanguageFile[prop] ||
      new FormattableString("ERROR")
    );
  },
};
let currentLanguageFileProxy = new Proxy({}, handler);

export const l10n = {
  get language() {
    return currentLanguageFileProxy;
  },
  loadFallbackLanguageFile: async (path) => {
    l10n.loadFallbackLanguageText(await (await fetch(path)).text());
  },
  loadFallbackLanguageText: async (text) => {
    let languageFile = JSON.parse(stripJsonComments(text));
    // eslint-disable-next-line no-eval
    // languageFile = eval(languageFile + ";text;");
    // Replace all values with FormattableString:
    Object.keys(languageFile).forEach((key) => {
      if (typeof languageFile[key] === "string") {
        languageFile[key] = new FormattableString(languageFile[key]);
      } else if (Array.isArray(languageFile[key])) {
        languageFile[key] = languageFile[key].map((item) => {
          if (typeof item === "string") {
            return new FormattableString(item);
          }
          return item;
        });
      }
    });
    fallbackLanguageFile = languageFile;
    currentLanguageFileProxy = new Proxy({}, handler);
    l10nEvents.emit("languageFileLoaded", currentLanguageFileProxy);
  },
  loadLanguageFile: async (path) => {
    l10n.loadLanguageText(await (await fetch(path)).text());
  },
  loadLanguageText: (text) => {
    let languageFile = JSON.parse(stripJsonComments(text));
    // eslint-disable-next-line no-eval
    // languageFile = eval(languageFile + ";text;");
    // Replace all values with FormattableString:
    Object.keys(languageFile).forEach((key) => {
      if (typeof languageFile[key] === "string") {
        languageFile[key] = new FormattableString(languageFile[key]);
      } else if (Array.isArray(languageFile[key])) {
        languageFile[key] = languageFile[key].map((item) => {
          if (typeof item === "string") {
            return new FormattableString(item);
          }
          return item;
        });
      }
    });
    currentLanguageFile = languageFile;
    currentLanguageFileProxy = new Proxy({}, handler);
    l10nEvents.emit("languageFileLoaded", currentLanguageFileProxy);
  },
  L10nProvider: ({ children }) => {
    const [language, setLanguage] = React.useState(currentLanguageFileProxy);

    useEffect(() => {
      const _setLanguage = (languageFile) => {
        setLanguage(languageFile);
      };
      l10nEvents.on("languageFileLoaded", _setLanguage);
      return () => l10nEvents.off("languageFileLoaded", _setLanguage);
    }, []);

    return (
      <l10n.Context.Provider value={{ language }}>
        {children}
      </l10n.Context.Provider>
    );
  },
  Context: React.createContext({}),
  Text: ({ name, format }) => {
    const { language } = useContext(l10n.Context);
    return <>{language[name].format(format || [])}</>;
  },
};
