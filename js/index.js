d3.select("#radarParams").on("submit", (event) => {
  event.preventDefault();
  redraw();
});

redraw();

function redraw() {
  const nRadialLevels = +d3
    .selectAll("[name='nRadialLevel']")
    .filter(function () {
      return this.checked;
    })
    .node().value;
  const nAngularLevels = +d3
    .selectAll("[name='nAngularLevel']")
    .filter(function () {
      return this.checked;
    })
    .node().value;

  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "🥹",
    "😅",
    "😂",
    "🤣",
    "🥲",
    "☺️",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🥸",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😶‍🌫️",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "🤔",
    "🫣",
    "🤭",
    "🫢",
    "🫡",
    "🤫",
    "🫠",
    "🤥",
    "😶",
    "🫥",
    "😐",
    "🫤",
    "😑",
    "🫨",
    "😬",
    "🙄",
    "😯",
    "😦",
    "😧",
    "😮",
    "😲",
    "🥱",
    "😴",
    "🤤",
    "😪",
    "😮‍💨",
    "😵",
    "😵‍💫",
    "🤐",
    "🥴",
    "🤢",
    "🤮",
    "🤧",
    "😷",
    "🤒",
    "🤕",
    "🤑",
    "🤠",
    "😈",
    "👿",
    "👹",
    "👺",
    "🤡",
    "💩",
    "👻",
    "💀",
    "☠️",
    "👽",
    "👾",
    "🤖",
    "🎃",
    "😺",
    "😸",
    "😹",
    "😻",
    "😼",
    "😽",
    "🙀",
    "😿",
    "😾",
  ];

  const generateRandomRadialIndex = d3.randomInt(nRadialLevels);
  const generateRandomAngularIndex = d3.randomInt(nAngularLevels);

  const data = emojis.map((emoji) => ({
    name: emoji,
    radialIndex: generateRandomRadialIndex(),
    angularIndex: generateRandomAngularIndex(),
  }));

  const radialLevels = [
    "Lorem ipsum",
    "Consectetur",
    "Nunc tristique",
    "Integer",
    "Proin elementum",
  ].slice(0, nRadialLevels);

  const angularLevels = [
    "Aenean tempor",
    "Non sagittis",
    "Accumsan",
    "Vivamus",
    "Euismod",
    "Malesuada",
  ].slice(0, nAngularLevels);

  const colors = [
    "#C7DCDD",
    "#F9E0C1",
    "#F7CFCF",
    "#C0E3CD",
    "#E1CEE2",
    "#E1D0C4",
  ].slice(0, nAngularLevels);

  radar({
    el: document.getElementById("radar"),
    data,
    radialLevels,
    angularLevels,
    colors,
  });
}
