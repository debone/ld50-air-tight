import "./style.css";

import Phaser from "phaser";

import { SceneMain } from "./scenes/main";

import { GAME_CONFIG } from "./consts";

const config = {
  ...GAME_CONFIG,
  scene: [SceneMain],
};

new Phaser.Game(config);
