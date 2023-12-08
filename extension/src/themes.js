export const Themes = {
  DEFAULT: {
    background: "#201e1f",
    backgroundAccent: "#322c2f",
    ui: "#9d6790",
    text: "#faf1f9",
    textFineprint: "#d6b2ce",
    primary: "#d631d6",
    primaryDark: "#961296",
    primaryText: "#faf1f9",
    secondary: "#969696",
    secondaryDark: "#565656",
    secondaryText: "#ffffff",
    hue: 180,
  },
};

export function changeTheme(theme) {
  for (let key in theme) {
    document.querySelector(":root").style.setProperty("--" + key, theme[key]);
  }
}
