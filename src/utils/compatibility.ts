import type { Framework, ProjectConfig } from "./types";

export type CompatibilityStep = "api" | "database" | "auth";

export type CompatibilityIssue = {
  field: CompatibilityStep;
  value: string;
  reason: string;
};

const CLIENT_ONLY_API_REASON = "Requires server routes; Vite template is client-only.";
const CLIENT_ONLY_DB_REASON = "Requires server runtime; Vite template is client-only.";
const CLIENT_ONLY_AUTH_REASON = "Requires server routes; Vite template is client-only.";

export function getDisabledOptions(
  framework: Framework,
  step: CompatibilityStep,
): Record<string, string> {
  if (framework !== "vite-solid-router") return {};

  switch (step) {
    case "api":
      return {
        trpc: CLIENT_ONLY_API_REASON,
        hono: CLIENT_ONLY_API_REASON,
      };
    case "database":
      return {
        drizzle: CLIENT_ONLY_DB_REASON,
        prisma: CLIENT_ONLY_DB_REASON,
      };
    case "auth":
      return {
        "better-auth": CLIENT_ONLY_AUTH_REASON,
      };
  }

  return {};
}

export function getCompatibilityIssues(config: ProjectConfig): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];

  const apiDisabled = getDisabledOptions(config.framework, "api");
  const apiReason = config.api === "none" ? undefined : apiDisabled[config.api];
  if (apiReason) {
    issues.push({ field: "api", value: config.api, reason: apiReason });
  }

  const databaseDisabled = getDisabledOptions(config.framework, "database");
  const databaseReason = config.database === "none" ? undefined : databaseDisabled[config.database];
  if (databaseReason) {
    issues.push({ field: "database", value: config.database, reason: databaseReason });
  }

  const authDisabled = getDisabledOptions(config.framework, "auth");
  const authReason = config.auth === "none" ? undefined : authDisabled[config.auth];
  if (authReason) {
    issues.push({ field: "auth", value: config.auth, reason: authReason });
  }

  return issues;
}

export function assertCompatibility(config: ProjectConfig): void {
  const issues = getCompatibilityIssues(config);
  if (issues.length === 0) return;

  const summary = issues
    .map((issue) => `${issue.field}=${issue.value} (${issue.reason})`)
    .join(", ");

  throw new Error(`Incompatible selections: ${summary}`);
}
