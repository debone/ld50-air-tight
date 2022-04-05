// https://hue.tools/mix?format=rgb&colors=182243ff%3B8d9524ff&steps=10&view=steps&mode=lch
export const COLORS = [
  "#182243", //dark blue
  "#382850",
  "#582c58",
  "#773058",
  "#933753",
  "#a94448",
  "#b7583a",
  "#bc6f2b",
  "#b7891f",
  "#a9a421", // bright yellow
];

export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;

export const TILE_IMAGE_WIDTH = 48;
export const TILE_IMAGE_HEIGHT = 48;

export const GAME_CONFIG = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  width: 800,
  height: 600,
  backgroundColor: '#394778',
  //"render.transparent": true,
  parent: "game-container",
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
};
