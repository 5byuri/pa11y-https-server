// Copyright 2025 Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH.
// SPDX-License-Identifier: MIT

/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // Log the URLs to be scanned
    console.log(`Scanning ${urlsToScan.length} URLs from sitemap: ${sitemapURL}`);

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
