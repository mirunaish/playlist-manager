export const Themes = {
  DARK_PINK: {
    background: "#201e1f",
    backgroundAccent: "#322c2f",
    ui: "#9d6790",
    text: "#faf1f9",
    textFineprint: "#d6b2ce",
    primary: "#d631d6",
    primaryDark: "#961296",
    primaryText: "#faf1f9",
    secondary: "#4b0082",
    secondaryDark: "#2c004b",
    secondaryText: "#ffffff",
    hue: 180,
  },
  BLUEJAY: {
    background: "#1e1f20",
    backgroundAccent: "#2c2f32",
    ui: "#67909d",
    text: "#f1f9fa",
    textFineprint: "#b2ced6",
    primary: "#31d6d6",
    primaryDark: "#129696",
    primaryText: "#f1f9fa",
    secondary: "#d63131",
    secondaryDark: "#961212",
    secondaryText: "#ffffff",
    hue: 210,
  },
  BEACH: {
    background: "#201e1f",
    backgroundAccent: "#322c2f",
    ui: "#9d8b67",
    text: "#faf1f9",
    textFineprint: "#d6cbb2",
    primary: "#d6b031",
    primaryDark: "#967612",
    primaryText: "#faf1f9",
    secondary: "#31d6d6",
    secondaryDark: "#129696",
    secondaryText: "#ffffff",
    hue: 30,
  },
  WATERMELON: {
    background: "#1f201e",
    backgroundAccent: "#2f322c",
    ui: "#679d67",
    text: "#f9faf1",
    textFineprint: "#ced6b2",
    primary: "#31d631",
    primaryDark: "#129612",
    primaryText: "#f9faf1",
    secondary: "#d63131",
    secondaryDark: "#961212",
    secondaryText: "#ffffff",
    hue: 120,
  },
};

export function changeTheme(themeName) {
  const theme = Themes[themeName];
  for (let key in theme) {
    document.querySelector(":root").style.setProperty("--" + key, theme[key]);
  }
}
