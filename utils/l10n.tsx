/**
 * L[ocalizatio]n
 **/

/*

Notes:

Localization is currently hardcoded to sv_cheats and the language menu
in LSO. Need to rethink it.

*/

import React, { useContext, useEffect } from "react";

import EventEmitter from "events";
import stripJsonComments from "strip-json-comments";
import { builtInLanguages } from "../../games/horror/src/LanguageMenu";
import { createContext } from "react";
import { useState } from "react";

export class FormattableString extends String {
  template: string;

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

/**

Making l10n it's own namespace kind of makes it an odd one out.

Let's rethink this.

 */
export namespace l10n {
  export let language = currentLanguageFileProxy;

  export async function loadFallbackLanguageFile(path) {
    try {
      loadFallbackLanguageText(await (await fetch(path)).text());
    } catch (e) {
      throw Error(`Error parsing language file: ${path}`);
    }
  }

  export async function loadFallbackLanguageText(text) {
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
    language = currentLanguageFileProxy;
    l10nEvents.emit("languageFileLoaded", currentLanguageFileProxy);
  }

  export async function loadLanguageFromUrl(url) {
    let languageFile;
    try {
      languageFile = await fetch(url);
      loadLanguageText(await languageFile.text());
    } catch (e) {
      // languageFile = await fetch(builtInLanguages[DEFAULT_LANGUAGE]);
    }
  }

  // export async function loadLanguageKey(key) {
  //   let languageFile;
  //   try {
  //     languageFile = await fetch(builtInLanguages[key]);
  //     loadLanguageText(await languageFile.text());
  //   } catch (e) {
  //     // languageFile = await fetch(builtInLanguages[DEFAULT_LANGUAGE]);
  //   }
  // }

  export async function loadLanguageText(text) {
    let languageFile;
    try {
      languageFile = JSON.parse(stripJsonComments(text));
    } catch (e) {
      console.log(e);
      console.log("Error loading language.");
      return;
    }
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
  }

  export function L10nProvider({
    children,
    languages,
    languageText,
    currentLanguage,
    defaultLanguage,
  }) {
    const [language, setLanguage] = useState(currentLanguageFileProxy);
    const [showGame, setShowGame] = useState(false);

    useEffect(() => {
      const _setLanguage = (languageFile) => {
        setLanguage(languageFile);
      };
      l10nEvents.on("languageFileLoaded", _setLanguage);
      return () => {
        l10nEvents.off("languageFileLoaded", _setLanguage);
      };
    }, []);

    useEffect(() => {
      (async () => {
        l10n.loadFallbackLanguageText(
          await (await fetch(languages[defaultLanguage])).text()
        );
        setShowGame(true);
      })();
    }, [languages, defaultLanguage]);

    useEffect(() => {
      if (languageText && languageText !== "") {
        l10n.loadLanguageText(languageText);
      } else {
        l10n.loadLanguageFromUrl(languages[currentLanguage]);
      }
    }, [languages, languageText, currentLanguage]);

    return <Context.Provider value={{ language }}>{children}</Context.Provider>;
  }

  export const Context = createContext({});

  export function Text({ name, format }) {
    const { language } = useContext<any>(Context);
    return <>{language[name].format(format || [])}</>;
  }
}
