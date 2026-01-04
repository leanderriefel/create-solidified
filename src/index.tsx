import { createRoot, useKeyboard, useOnResize, useRenderer } from "@opentui/react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { createCliRenderer, measureText, TextAttributes } from "@opentui/core";
import { scaffoldProject } from "./utils/scaffold";
import { getInstallCommand, getRunCommand } from "./utils/package-manager";
import { getDisabledOptions } from "./utils/compatibility";
import type {
  PackageManager,
  Framework,
  StyleOption,
  DatabaseOption,
  AuthOption,
  ApiOption,
  TestingOption,
  LintingOption,
  FormattingOption,
  GitHooksOption,
  DeploymentOption,
} from "./utils/types";

type Step =
  | "name"
  | "pm"
  | "framework"
  | "style"
  | "database"
  | "auth"
  | "api"
  | "testing"
  | "linting"
  | "formatting"
  | "gitHooks"
  | "deployment"
  | "confirm"
  | "done";

const PACKAGE_MANAGERS = [
  { name: "bun", value: "bun" },
  { name: "pnpm", value: "pnpm" },
  { name: "npm", value: "npm" },
  { name: "yarn", value: "yarn" },
];

const FRAMEWORKS = [
  {
    name: "Vite + Solid Router",
    value: "vite-solid-router",
  },
  {
    name: "SolidStart",
    value: "solid-start",
  },
];

const STYLES = [
  { name: "None", value: "none" },
  { name: "Tailwind CSS", value: "tailwind" },
  { name: "UnoCSS", value: "unocss" },
  { name: "Sass", value: "sass" },
];

const DATABASES = [
  { name: "None", value: "none" },
  { name: "Drizzle ORM", value: "drizzle" },
  { name: "Prisma", value: "prisma" },
];

const AUTH_PROVIDERS = [
  { name: "None", value: "none" },
  { name: "Better Auth", value: "better-auth" },
  { name: "Clerk", value: "clerk" },
];

const API_OPTIONS = [
  { name: "None", value: "none" },
  { name: "tRPC", value: "trpc" },
  { name: "Hono", value: "hono" },
];

const TESTING_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Vitest", value: "vitest" },
  { name: "Playwright", value: "playwright" },
];

const LINTING_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Biome", value: "biome" },
  { name: "ESLint", value: "eslint" },
  { name: "Oxlint", value: "oxlint" },
];

const FORMATTING_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Biome", value: "biome" },
  { name: "Prettier", value: "prettier" },
];

const GIT_HOOKS_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Husky + Lint-Staged", value: "husky" },
];

const DEPLOYMENT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Vercel", value: "vercel" },
  { name: "Netlify", value: "netlify" },
  { name: "Cloudflare", value: "cloudflare" },
];

// Color palette - very light blue and cyan
const c = {
  primary: "#87CEEB", // Sky blue
  secondary: "#B0E0E6", // Powder blue
  accent: "#E0FFFF", // Light cyan
  border: "#5F9EA0", // Cadet blue
  muted: "#708090", // Slate gray
  success: "#98FB98", // Pale green
  error: "#FF6B6B", // Light red
};

type SelectionOption = {
  name: string;
  value: string;
  disabled?: boolean;
  reason?: string;
};

type SelectionStepProps = {
  title: string;
  options: SelectionOption[];
  selectedIndex: number;
  hint?: string;
};

const SelectionStep = ({ title, options, selectedIndex, hint }: SelectionStepProps) => (
  <box flexDirection="column" alignItems="center">
    <text fg={c.accent}>{title}</text>
    <box flexDirection="column" alignItems="center" style={{ marginTop: 1 }}>
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        const isDisabled = option.disabled === true;
        const color = isDisabled ? c.muted : isSelected ? c.accent : c.secondary;
        const label =
          isDisabled && option.reason ? `${option.name} (${option.reason})` : option.name;
        return (
          <text key={option.value} fg={color}>
            {isSelected ? `▸ ${label} ◂` : `  ${label}  `}
          </text>
        );
      })}
    </box>
    {hint && (
      <text fg={c.muted} style={{ marginTop: 1 }} attributes={TextAttributes.DIM}>
        {hint}
      </text>
    )}
  </box>
);

const TITLE_FONT = "block" as const;
const TITLE_CHOICES = ["Create Solidified", "Solidified", "Solid", "CS"] as const;
const TITLE_WIDTHS = TITLE_CHOICES.map((text) => ({
  text,
  width: measureText({ text, font: TITLE_FONT }).width,
}));
const pickTitle = (width: number) =>
  TITLE_WIDTHS.find((option) => option.width < width)?.text ??
  TITLE_WIDTHS[TITLE_WIDTHS.length - 1]!.text;

function getNextEnabledIndex(
  options: SelectionOption[],
  startIndex: number,
  delta: number,
): number {
  if (options.length === 0) return startIndex;
  let nextIndex = startIndex;

  for (let i = 0; i < options.length; i += 1) {
    nextIndex = (nextIndex + delta + options.length) % options.length;
    if (!options[nextIndex]?.disabled) {
      return nextIndex;
    }
  }

  return startIndex;
}

function App() {
  const [step, setStep] = useState<Step>("name");
  const [projectName, setProjectName] = useState("");
  const [pmIndex, setPmIndex] = useState(0);
  const [frameworkIndex, setFrameworkIndex] = useState(0);
  const [styleIndex, setStyleIndex] = useState(0);
  const [databaseIndex, setDatabaseIndex] = useState(0);
  const [authIndex, setAuthIndex] = useState(0);
  const [apiIndex, setApiIndex] = useState(0);
  const [testingIndex, setTestingIndex] = useState(0);
  const [lintingIndex, setLintingIndex] = useState(0);
  const [formattingIndex, setFormattingIndex] = useState(0);
  const [gitHooksIndex, setGitHooksIndex] = useState(0);
  const [deploymentIndex, setDeploymentIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "busy" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const renderer = useRenderer();
  const [title, setTitle] = useState(() => pickTitle(renderer.width));

  const currentPm = useMemo(() => PACKAGE_MANAGERS[pmIndex]!, [pmIndex]);
  const currentFramework = useMemo(() => FRAMEWORKS[frameworkIndex]!, [frameworkIndex]);
  const currentStyle = useMemo(() => STYLES[styleIndex]!, [styleIndex]);
  const currentDatabase = useMemo(() => DATABASES[databaseIndex]!, [databaseIndex]);
  const currentAuth = useMemo(() => AUTH_PROVIDERS[authIndex]!, [authIndex]);
  const currentApi = useMemo(() => API_OPTIONS[apiIndex]!, [apiIndex]);
  const currentTesting = useMemo(() => TESTING_OPTIONS[testingIndex]!, [testingIndex]);
  const currentLinting = useMemo(() => LINTING_OPTIONS[lintingIndex]!, [lintingIndex]);
  const currentFormatting = useMemo(() => FORMATTING_OPTIONS[formattingIndex]!, [formattingIndex]);
  const currentGitHooks = useMemo(() => GIT_HOOKS_OPTIONS[gitHooksIndex]!, [gitHooksIndex]);
  const currentDeployment = useMemo(() => DEPLOYMENT_OPTIONS[deploymentIndex]!, [deploymentIndex]);

  const isClientOnly = currentFramework.value === "vite-solid-router";
  const clientOnlyHint = "Client-only template: server features are disabled.";

  useEffect(() => {
    if (!isClientOnly) return;
    if (DATABASES[databaseIndex]?.value !== "none") setDatabaseIndex(0);
    if (AUTH_PROVIDERS[authIndex]?.value === "better-auth") setAuthIndex(0);
    if (API_OPTIONS[apiIndex]?.value !== "none") setApiIndex(0);
  }, [isClientOnly]);

  const databaseOptions = useMemo<SelectionOption[]>(() => {
    const disabled = getDisabledOptions(currentFramework.value as Framework, "database");
    return DATABASES.map((option) => ({
      ...option,
      disabled: Boolean(disabled[option.value]),
      reason: disabled[option.value],
    }));
  }, [currentFramework.value]);

  const authOptions = useMemo<SelectionOption[]>(() => {
    const disabled = getDisabledOptions(currentFramework.value as Framework, "auth");
    return AUTH_PROVIDERS.map((option) => ({
      ...option,
      disabled: Boolean(disabled[option.value]),
      reason: disabled[option.value],
    }));
  }, [currentFramework.value]);

  const apiOptions = useMemo<SelectionOption[]>(() => {
    const disabled = getDisabledOptions(currentFramework.value as Framework, "api");
    return API_OPTIONS.map((option) => ({
      ...option,
      disabled: Boolean(disabled[option.value]),
      reason: disabled[option.value],
    }));
  }, [currentFramework.value]);

  const selectionSteps: Array<{
    step:
      | "pm"
      | "framework"
      | "style"
      | "database"
      | "auth"
      | "api"
      | "testing"
      | "linting"
      | "formatting"
      | "gitHooks"
      | "deployment";
    title: string;
    options: SelectionOption[];
    index: number;
    setIndex: (value: number | ((value: number) => number)) => void;
    nextStep: Step;
    hint?: string;
  }> = [
    {
      step: "pm",
      title: "Choose a package manager",
      options: PACKAGE_MANAGERS,
      index: pmIndex,
      setIndex: setPmIndex,
      nextStep: "framework",
    },
    {
      step: "framework",
      title: "Select a framework",
      options: FRAMEWORKS,
      index: frameworkIndex,
      setIndex: setFrameworkIndex,
      nextStep: "style",
    },
    {
      step: "style",
      title: "Select a styling library",
      options: STYLES,
      index: styleIndex,
      setIndex: setStyleIndex,
      nextStep: "database",
    },
    {
      step: "database",
      title: "Select a database ORM",
      options: databaseOptions,
      index: databaseIndex,
      setIndex: setDatabaseIndex,
      nextStep: "auth",
      hint: isClientOnly ? clientOnlyHint : undefined,
    },
    {
      step: "auth",
      title: "Select an auth provider",
      options: authOptions,
      index: authIndex,
      setIndex: setAuthIndex,
      nextStep: "api",
      hint: isClientOnly ? clientOnlyHint : undefined,
    },
    {
      step: "api",
      title: "Select an API layer",
      options: apiOptions,
      index: apiIndex,
      setIndex: setApiIndex,
      nextStep: "testing",
      hint: isClientOnly ? clientOnlyHint : undefined,
    },
    {
      step: "testing",
      title: "Select a testing framework",
      options: TESTING_OPTIONS,
      index: testingIndex,
      setIndex: setTestingIndex,
      nextStep: "linting",
    },
    {
      step: "linting",
      title: "Select a linter",
      options: LINTING_OPTIONS,
      index: lintingIndex,
      setIndex: setLintingIndex,
      nextStep: "formatting",
    },
    {
      step: "formatting",
      title: "Select a formatter",
      options: FORMATTING_OPTIONS,
      index: formattingIndex,
      setIndex: setFormattingIndex,
      nextStep: "gitHooks",
    },
    {
      step: "gitHooks",
      title: "Select git hooks",
      options: GIT_HOOKS_OPTIONS,
      index: gitHooksIndex,
      setIndex: setGitHooksIndex,
      nextStep: "deployment",
    },
    {
      step: "deployment",
      title: "Select a deployment platform",
      options: DEPLOYMENT_OPTIONS,
      index: deploymentIndex,
      setIndex: setDeploymentIndex,
      nextStep: "confirm",
    },
  ];

  const activeSelectionStep = selectionSteps.find((config) => config.step === step);

  const previousStepByName: Partial<Record<Step, Step>> = {
    pm: "name",
    framework: "pm",
    style: "framework",
    database: "style",
    auth: "database",
    api: "auth",
    testing: "api",
    linting: "testing",
    formatting: "linting",
    gitHooks: "formatting",
    deployment: "gitHooks",
    confirm: "deployment",
  };

  const stepNumber = useMemo(() => {
    switch (step) {
      case "name":
        return 1;
      case "pm":
        return 2;
      case "framework":
        return 3;
      case "style":
        return 4;
      case "database":
        return 5;
      case "auth":
        return 6;
      case "api":
        return 7;
      case "testing":
        return 8;
      case "linting":
        return 9;
      case "formatting":
        return 10;
      case "gitHooks":
        return 11;
      case "deployment":
        return 12;
      case "confirm":
        return 13;
      case "done":
        return 13;
    }
  }, [step]);

  const progressBar = useMemo(() => {
    const totalWidth = 30;
    const filled = Math.round((stepNumber / 13) * totalWidth);
    const empty = totalWidth - filled;
    return "━".repeat(filled) + "─".repeat(empty);
  }, [stepNumber]);

  useOnResize((width) => {
    const nextTitle = pickTitle(width);
    setTitle((prev) => (prev === nextTitle ? prev : nextTitle));
  });

  const exitApp = useCallback(() => {
    renderer.destroy();
    process.exit(0);
  }, [renderer]);

  const runScaffold = useCallback(async () => {
    setStatus("busy");
    const name = projectName || "my-app";

    try {
      await scaffoldProject({
        name,
        directory: name,
        packageManager: currentPm.value as PackageManager,
        framework: currentFramework.value as Framework,
        style: currentStyle.value as StyleOption,
        database: currentDatabase.value as DatabaseOption,
        auth: currentAuth.value as AuthOption,
        api: currentApi.value as ApiOption,
        testing: currentTesting.value as TestingOption,
        linting: currentLinting.value as LintingOption,
        formatting: currentFormatting.value as FormattingOption,
        gitHooks: currentGitHooks.value as GitHooksOption,
        deployment: currentDeployment.value as DeploymentOption,
      });
      setStatus("success");

      setTimeout(() => {
        renderer.destroy();
        console.log(`Project created: ${name}`);
        console.log(`Next: cd ${name}`);
        console.log(
          `Then: ${getInstallCommand(
            currentPm.value as PackageManager,
          )} && ${getRunCommand(currentPm.value as PackageManager)} dev`,
        );
        process.exit(0);
      }, 0);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, [
    projectName,
    currentPm,
    currentFramework,
    currentStyle,
    currentDatabase,
    currentAuth,
    currentApi,
    currentTesting,
    currentLinting,
    currentFormatting,
    currentGitHooks,
    currentDeployment,
    renderer,
  ]);

  useKeyboard((key) => {
    if ((key.name === "q" && step !== "name") || (key.ctrl && key.name === "c")) {
      exitApp();
      return;
    }

    if (status === "busy") return;

    if (key.name === "escape") {
      const previousStep = previousStepByName[step];
      if (previousStep) setStep(previousStep);
      return;
    }

    if (activeSelectionStep) {
      const options = activeSelectionStep.options;
      if (key.name === "down" || key.name === "j") {
        activeSelectionStep.setIndex((i) => getNextEnabledIndex(options, i, 1));
      }
      if (key.name === "up" || key.name === "k") {
        activeSelectionStep.setIndex((i) => getNextEnabledIndex(options, i, -1));
      }
      if (key.name === "return") {
        const selected = options[activeSelectionStep.index];
        if (!selected?.disabled) {
          setStep(activeSelectionStep.nextStep);
        }
      }
      return;
    }

    if (step === "confirm" && key.name === "return") {
      setStep("done");
      runScaffold();
    }
  });

  const handleNameSubmit = useCallback((value: string) => {
    setProjectName(value || "my-app");
    setStep("pm");
  }, []);

  return (
    <box alignItems="center" justifyContent="center" flexGrow={1}>
      <box flexDirection="column" justifyContent="center" alignItems="center">
        {/* Header */}
        <ascii-font color={c.primary} font={TITLE_FONT} text={title} />

        {/* Progress */}
        <text fg={c.muted} style={{ marginTop: 2 }}>
          {progressBar} {stepNumber}/13
        </text>

        {/* Current Step */}
        <box flexDirection="column" style={{ marginTop: 2 }}>
          {/* Step: Name */}
          {step === "name" && (
            <box flexDirection="column" alignItems="center">
              <text fg={c.accent}>What is your project named?</text>
              <box
                border
                borderColor={c.primary}
                style={{
                  marginTop: 1,
                  width: 40,
                  height: 3,
                  paddingRight: 1,
                  paddingLeft: 1,
                }}
              >
                <input placeholder="my-app" focused onSubmit={handleNameSubmit} />
              </box>
            </box>
          )}

          {/* Step: Selection */}
          {activeSelectionStep && (
            <SelectionStep
              title={activeSelectionStep.title}
              options={activeSelectionStep.options}
              selectedIndex={activeSelectionStep.index}
              hint={activeSelectionStep.hint}
            />
          )}

          {/* Step: Confirm */}
          {step === "confirm" && (
            <box flexDirection="column" alignItems="flex-start">
              <text fg={c.accent}>Ready to create your project?</text>
              <text fg={c.muted} style={{ marginTop: 1 }}>
                Press Enter to scaffold
              </text>
              <box flexDirection="column" style={{ marginTop: 1 }}>
                <text fg={c.muted}>Project: {projectName}</text>
                <text fg={c.muted}>Package Manager: {currentPm.name}</text>
                <text fg={c.muted}>Framework: {currentFramework.name}</text>
                <text fg={c.muted}>Style: {currentStyle.name}</text>
                <text fg={c.muted}>Database: {currentDatabase.name}</text>
                <text fg={c.muted}>Auth: {currentAuth.name}</text>
                <text fg={c.muted}>API: {currentApi.name}</text>
                <text fg={c.muted}>Testing: {currentTesting.name}</text>
                <text fg={c.muted}>Linting: {currentLinting.name}</text>
                <text fg={c.muted}>Formatting: {currentFormatting.name}</text>
                <text fg={c.muted}>Git Hooks: {currentGitHooks.name}</text>
                <text fg={c.muted}>Deployment: {currentDeployment.name}</text>
              </box>
            </box>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <box flexDirection="column" alignItems="flex-start">
              {status === "busy" && <text fg={c.primary}>◐ Scaffolding project...</text>}
              {status === "error" && <text fg={c.error}>✗ Error: {errorMessage}</text>}
              {status === "success" && <text fg={c.success}>✓ Project created successfully!</text>}
            </box>
          )}
        </box>

        {/* Footer */}
        <text fg={c.muted} style={{ marginTop: 2 }} attributes={TextAttributes.DIM}>
          ↑↓ navigate • Enter select • Esc back • q quit
        </text>
      </box>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
