/* eslint-disable @typescript-eslint/no-explicit-any */
// Copyright 2025 larshermges
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


import http from "http";
import { UrlConfig } from "../api";
import sarifBuilder from "../lib/helpers/sarifbuilder";
import { getUrlsFromSitemap } from "./getUrlsFromSitemap";
import { buildPa11yReport } from "../lib/scan";

type Method = "sarif" | "json";

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost:50259');
    const scanningMethodInput = url.searchParams.get('scanningMethod');
    const sitemapURL = url.searchParams.get("sitemapurl");

    if (!sitemapURL || (scanningMethodInput !== 'sarif' && scanningMethodInput !== 'json')) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: "Invalid or missing parameters",
        required: { scanningMethod: ["sarif", "json"], sitemapurl: "<url>" },
        got: { scanningMethod: scanningMethodInput, sitemapurl: sitemapURL },
      }));
      return;
    }

    const baseConfig: UrlConfig = { urls: [] };
    const sitemapConfig = await getUrlsFromSitemap(sitemapURL, baseConfig).catch(() => baseConfig);
    const urlsToScan = Array.isArray(sitemapConfig?.urls) ? sitemapConfig.urls : [];
    if (urlsToScan.length === 0) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        total: 0,
        passes: 0,
        errors: 0,
        results: {},
        note: 'No URLs found in sitemap',
      }));
      return;
    }



    // Run pa11y for the found URLs
    let report;
    try {
      report = await buildPa11yReport(urlsToScan);
    } catch (e) {
      res.writeHead(501, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Scanner unavailable',
        message: e?.message ?? 'Unknown error',
        hint: "Install pa11y: npm i pa11y",
      }));
      return;
    }

    const method = scanningMethodInput as Method;
    if (method === 'sarif') {
      const sarif = sarifBuilder(report);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(sarif));
      
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(report, (key, value) => (value instanceof Error ? { message: value.message } : value)));
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error),
    }));
  }
});

server.listen(50259, () => {
  console.log("Server running at http://localhost:50259/");
});
