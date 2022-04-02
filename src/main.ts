import "./style.css";

import Phaser from "phaser";

import { SceneMain } from "./scenes/main";
import { SceneWorld } from "./scenes/world";

import { GAME_CONFIG } from "./consts";
import { SceneHUD } from "./scenes/hud";

const config = {
  ...GAME_CONFIG,
  scene: [SceneWorld, SceneHUD],
};

new Phaser.Game(config);
