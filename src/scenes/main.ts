import Phaser from "phaser";

import tilesImg from "../assets/outside-ground-tileset.png?url";
import temperatureImg from "../assets/temperature.png?url";
import objectTileset from "../assets/object-tileset.png?url";
import hudImg from "../assets/hud.png?url";
import playerImg from "../assets/player.png?url";

import playerImgJson from "../assets/player.json?url";

declare var WebFont: any;

export class SceneMain extends Phaser.Scene {
  declare keySpace: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "SceneMain" });
  }

  preload() {
    this.load.spritesheet("hud", hudImg, {
      frameWidth: 800,
      frameHeight: 600,
    });

    this.load.image("tiles", tilesImg);
    this.load.image("temperature", temperatureImg);

    this.load.spritesheet("objects", objectTileset, {
      frameWidth: 48,
      frameHeight: 48,
    });

    this.load.aseprite("player", playerImg, playerImgJson);
    this.load.script("webfont", "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js");
  }

  create() {
    this.registry.set("restart", 0);

    WebFont.load({
      google: {
        families: ["Bebas Neue", "Fjalla One"],
      },
      active: () => {
        this.add
          .text(400, 200, "HOT POINT", {
            fontFamily: "Bebas Neue",
            fontSize: "100px",
            color: "#ffffff",
          })
          .setShadow(2, 2, "#333333", 2, false, true);
        this.add
          .text(200, 300, "Press space to start", {
            fontFamily: "Bebas Neue",
            fontSize: "32px",
            color: "#ffffff",
          })
          .setShadow(2, 2, "#333333", 2, false, true);
        this.add
          .text(250, 500, "CW: Flashing lights", {
            fontFamily: "Bebas Neue",
            fontSize: "48px",
            color: "#ff0000",
          })
          .setShadow(2, 2, "#333333", 2, false, true);
      },
    });

    this.keySpace = this.input.keyboard.addKey("SPACE");
  }

  update(/*time, delta*/) {
    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      this.scene.transition({
        target: "world",
        duration: 2000,
        moveBelow: true,
      });
    }
  }
}
