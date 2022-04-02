import "./style.css";

import Phaser from "phaser";

import { SceneMain } from "./scenes/main";
import { SceneWorld } from "./scenes/world";

import { GAME_CONFIG } from "./consts";

const config = {
  ...GAME_CONFIG,
  scene: [SceneWorld],
};

new Phaser.Game(config);
