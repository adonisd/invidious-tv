const dark = {
  colors: {
    background: "#121212",
    surface: "#1E1E1E",
    "on-surface": "#FFFFFF",
    primary: "#BB86FC",
    "on-primary": "#000000",
    secondary: "#03DAC6",
    "on-secondary": "#000000",
    error: "#CF6679",
    "on-error": "#000000",
    info: "#2196F3",
    "on-info": "#000000",
    success: "#4CAF50",
    "on-success": "#000000",
    warning: "#FB8C00",
    "on-warning": "#000000",
  },
};

const dracula = {
  colors: {
    background: "#282a36",
    surface: "#44475a",
    "on-surface": "#f8f8f2",
    primary: "#bd93f9",
    "on-primary": "#282a36",
    secondary: "#ff79c6",
    "on-secondary": "#282a36",
    error: "#ff5555",
    "on-error": "#282a36",
    info: "#8be9fd",
    "on-info": "#282a36",
    success: "#50fa7b",
    "on-success": "#282a36",
    warning: "#f1fa8c",
    "on-warning": "#282a36",
  },
};

const solarizedDark = {
  colors: {
    background: "#002b36", // base03
    surface: "#073642", // base02
    "on-surface": "#eee8d5", // base2
    primary: "#268bd2", // blue
    "on-primary": "#002b36",
    secondary: "#2aa198", // cyan
    "on-secondary": "#002b36",
    error: "#dc322f", // red
    "on-error": "#002b36",
    info: "#839496", // base0
    "on-info": "#002b36",
    success: "#859900", // green
    "on-success": "#002b36",
    warning: "#b58900", // yellow
    "on-warning": "#002b36",
  },
};

const catppuccin = {
  colors: {
    background: "#1e1e2e", // base
    surface: "#313244", // mantle
    "on-surface": "#cdd6f4", // text
    primary: "#cba6f7", // mauve
    "on-primary": "#1e1e2e",
    secondary: "#89dceb", // sky
    "on-secondary": "#1e1e2e",
    error: "#f38ba8", // red
    "on-error": "#1e1e2e",
    info: "#74c7ec", // sapphire
    "on-info": "#1e1e2e",
    success: "#a6e3a1", // green
    "on-success": "#1e1e2e",
    warning: "#f9e2af", // yellow
    "on-warning": "#1e1e2e",
  },
};

const catppuccinMocha = {
  colors: {
    background: "#1e1e2e", // base
    surface: "#313244", // mantle
    "on-surface": "#cdd6f4", // text
    primary: "#cba6f7", // mauve
    "on-primary": "#1e1e2e",
    secondary: "#89dceb", // sky
    "on-secondary": "#1e1e2e",
    error: "#f38ba8", // red
    "on-error": "#1e1e2e",
    info: "#74c7ec", // sapphire
    "on-info": "#1e1e2e",
    success: "#a6e3a1", // green
    "on-success": "#1e1e2e",
    warning: "#f9e2af", // yellow
    "on-warning": "#1e1e2e",
  },
};

export const themes = {
  dark,
  dracula,
  solarizedDark,
  catppuccin,
  catppuccinMocha,
} as const;

export type ThemeName = keyof typeof themes;
export interface ThemeSelector {
  [key: string]: ThemeName;
}

export const themeSelector: ThemeSelector = {
  dark: "dark",
  dracula: "dracula",
  solarizedDark: "solarizedDark",
  catppuccin: "catppuccin",
  catppuccinMocha: "catppuccinMocha",
};
