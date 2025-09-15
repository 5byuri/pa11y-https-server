/* eslint-disable @typescript-eslint/no-explicit-any */
// ts-ignore-undefined
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type { Pa11yCiReport } from "../api";

export interface Pa11yIssue {
  code: string;
  message: string;
  selector?: string;
  context?: string;
  runner?: string;
}

export async function buildPa11yReport(urls: string[], pa11yOptions: Record<string, any> = {}): Promise<Pa11yCiReport> {
  let pa11y;
  const report: Pa11yCiReport = {
    total: urls.length,
    passes: 0,
    errors: 0,
    results: {},
  };

  for (const url of urls) {
    try {
      const results = await pa11y(url, pa11yOptions);
      const issues: Pa11yIssue[] = results?.issues ?? [];
      report.results[url] = issues;
      if (issues.length > 0) {
        report.errors += issues.length;
      } else {
        report.passes += 1;
      }
    } catch (error) {
      // Record the error under this URL and continue
      report.results[url] = [error instanceof Error ? error : new Error(String(error))];
    }
  }

  return report;
}

