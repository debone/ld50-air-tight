import "./style.css";

import Phaser from "phaser";

import { SceneMain } from "./scenes/main";
import { SceneWorld } from "./scenes/world";

import { GAME_CONFIG } from "./consts";
import { SceneHUD } from "./scenes/hud";

import PhaserGamebus from "./gamebus";
import { SceneComms } from "./scenes/comms";

const config = {
  ...GAME_CONFIG,
  plugins: {
    global: [
      {
        key: "PhaserGamebus",
        plugin: PhaserGamebus,
        start: true,
        mapping: "gamebus",
      },
    ],
  },
  scene: [SceneMain, SceneWorld, SceneHUD, SceneComms],
};

new Phaser.Game(config);
