/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Pa11yCiReport } from "../../api";

export default function sarifBuilder(report: Pa11yCiReport) {
  type SarifRule = {
    id: string;
    shortDescription: { text: string };
  };

  type SarifResult = {
    ruleId: string;
    level: string;
    message: { text: string };
    locations: Array<{
      physicalLocation: {
        artifactLocation: { uri: string };
      };
      logicalLocations: Array<{
        fullyQualifiedName: string;
      }>;
    }>;
    properties: {
      context: unknown;
      runner: unknown;
    };
  };

  const sarif: {
    version: string;
    $schema: string;
    runs: Array<{
      tool: {
        driver: {
          name: string;
          informationUri: string;
          rules: SarifRule[];
        };
      };
      results: SarifResult[];
    }>;
  } = {
    version: "2.1.0",
    $schema:
      "https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json",
    runs: [
      {
        tool: {
          driver: {
            name: "pa11y",
            informationUri: "https://github.com/pa11y/pa11y-ci",
            rules: [],
          },
        },
        results: [],
      },
    ],
  };

  const seenRules = new Set<string>();

  for (const [url, issues] of Object.entries(report.results)) {
    for (const issue of issues as any[]) {
      const { code, message, selector, context, runner } = issue;

      if (!seenRules.has(code)) {
        sarif.runs[0].tool.driver.rules.push({
          id: code,
          shortDescription: { text: message },
        });
        seenRules.add(code);
      }

      sarif.runs[0].results.push({
        ruleId: code,
        level: "error",
        message: { text: message },
        locations: [
          {
            physicalLocation: {
              artifactLocation: { uri: url },
            },
            logicalLocations: [
              {
                fullyQualifiedName: selector,
              },
            ],
          },
        ],
        properties: {
          context,
          runner,
        },
      });
    }
  }

  return sarif;
}
