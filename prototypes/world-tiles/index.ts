import "../../src/style.css";

import Phaser from "phaser";

import { SceneWorld } from "./world";
import { GAME_CONFIG } from "../../src/consts";

const config = {
  ...GAME_CONFIG,
  scene: [SceneWorld],
};

new Phaser.Game(config);
