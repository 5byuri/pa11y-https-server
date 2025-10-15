// Copyright 2025 Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH.
// SPDX-License-Identifier: MIT

export interface UrlConfig {
  urls: string[];
}

export type Method = "json" | "sarif";

export interface ReporterConfig {
  reporters?: unknown[];
  [key: string]: unknown;
}

export interface Pa11yCiOptions {
  chromeLaunchConfig?: object;
  concurrency?: number;
  threshold?: number;
  useIncognitoBrowserContext?: boolean;
  reporters?: unknown[];
  log?: unknown;
}

export interface Pa11yCiReport {
  total: number;
  passes: number;
  errors: number;
  results: { [url: string]: unknown[] | Error[] };
}