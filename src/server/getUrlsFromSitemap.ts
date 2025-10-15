// Copyright 2025 Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH.
// SPDX-License-Identifier: MIT

/* eslint-disable @typescript-eslint/no-explicit-any */

import { UrlConfig } from "../api";
import { load } from "cheerio";
export function getUrlsFromSitemap(
  sitemapUrl: string,
  config: UrlConfig
): Promise<UrlConfig> {
  return Promise.resolve()
    .then(() => fetch(sitemapUrl))
    .then((response) => response.text())
    .then((body) => {
      const $ = load(body, { xmlMode: true });
      const isSitemapIndex = $("sitemapindex").length > 0;
      if (isSitemapIndex) {
        return Promise.all(
          $("sitemap > loc")
            .toArray()
            .map((element) => {
              return getUrlsFromSitemap($(element as any).text(), config);
            })
        ).then((configs) => {
          return configs.pop()!;
        });
      }
      $("url > loc")
        .toArray()
        .forEach((element) => {
           const url = $(element as any).text();
          config.urls.push(url);
        });
      return config;
    })
    .catch((error: any) => {
      if (error.stack && error.stack.includes("node-fetch")) {
        throw new Error(`The sitemap "${sitemapUrl}" could not be loaded`);
      }
      throw new Error(`The sitemap "${sitemapUrl}" could not be parsed`);
    });
}
