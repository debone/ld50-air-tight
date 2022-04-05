import { SceneWorld } from "./world";

import hudImg from "../assets/hud.png";

export class SceneHUD extends Phaser.Scene {
  declare sceneWorld: SceneWorld;

  constructor() {
    super("hud");
  }

  preload() {
    this.load.spritesheet("hud", hudImg, {
      frameWidth: 800,
      frameHeight: 600,
    });
  }

  declare temperature: Phaser.GameObjects.Text;
  declare carrying: Phaser.GameObjects.Text;

  declare hudBackground: Phaser.GameObjects.Image;
  declare coldOverlay: Phaser.GameObjects.Image;
  declare hotOverlay: Phaser.GameObjects.Image;

  declare temperaturePin: Phaser.GameObjects.Image;

  declare heatVisionHover: Phaser.GameObjects.Image;
  declare heatVisionActive: Phaser.GameObjects.Image;

  create(data: { sceneWorld: SceneWorld }) {
    this.sceneWorld = data.sceneWorld;

    this.hudBackground = this.add.image(0, 0, "hud", "");
    this.hudBackground.setOrigin(0);

    this.coldOverlay = this.add.image(0, 0, "hud", 1);
    this.coldOverlay.setOrigin(0);
    this.coldOverlay.alpha = 0.1;

    this.add
      .text(600, 50, "HOT POINT", {
        fontFamily: "Bebas Neue",
        fontSize: "36px",
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true);

    this.hotOverlay = this.add.image(0, 0, "hud", 2);
    this.hotOverlay.setOrigin(0);
    this.hotOverlay.alpha = 0;

    this.heatVisionHover = this.add.image(0, 0, "hud", 4);
    this.heatVisionHover.setOrigin(0);
    this.heatVisionHover.alpha = 0;

    this.heatVisionActive = this.add.image(0, 0, "hud", 5);
    this.heatVisionActive.setOrigin(0);
    this.heatVisionActive.alpha = 0;

    this.temperaturePin = this.add.image(0, 0, "hud", 3);
    this.temperaturePin.setOrigin(0);
    this.temperaturePin.y = -20; // HOTTEST
    this.temperaturePin.y = 140; // COLDEST

    this.temperature = this.add.text(700, 20, "0K", {
      font: "32px verdana",
      color: "cyan",
      backgroundColor: "black",
      padding: {
        x: 5,
        y: 5,
      },
      fixedWidth: 100,
    });

    this.temperature.alpha = 0;

    this.carrying = this.add.text(650, 70, "Nothing", {
      font: "24px verdana",
      color: "cyan",
      backgroundColor: "black",
      padding: {
        x: 5,
        y: 5,
      },
      fixedWidth: 150,
    });

    this.carrying.alpha = 0;

    var polygon = this.add.polygon(720, 530, [0, 0, 150, 0, 150, 110, 0, 110], 0x00ff33, 0).setInteractive();

    polygon.on("pointerover", () => {
      this.heatVisionHover.alpha = 1;
      this.heatVisionActive.alpha = 0;
    });

    polygon.on("pointerdown", () => {
      this.heatVisionHover.alpha = 0;
      this.heatVisionActive.alpha = 1;

      if (this.sceneWorld.airLayer.alpha >= 1) {
        this.sceneWorld.airLayer.alpha = 0;
      } else if (this.sceneWorld.airLayer.alpha > 0.6) {
        this.sceneWorld.airLayer.alpha = 1;
      } else if (this.sceneWorld.airLayer.alpha > 0.3) {
        this.sceneWorld.airLayer.alpha = 0.66;
      } else {
        this.sceneWorld.airLayer.alpha = 0.33;
      }
    });

    polygon.on("pointerup", () => {
      polygon.fillColor = 0xffffff;
      this.heatVisionHover.alpha = 1;
      this.heatVisionActive.alpha = 0;
    });

    polygon.on("pointerout", () => {
      this.heatVisionActive.alpha = 0;
      this.heatVisionHover.alpha = 0;
    });

    this.registry.events.on("changedata", (...args: any) => this.updateData.apply(this, args));
  }

  updateData(_parent: string, key: string, data: any) {
    //console.log(parent, key, data);
    if (key === "playerTemperature" && this.temperature) {
      this.temperature.text = `${data.toFixed(1)} K`;
      this.temperaturePin.y = Math.min(140, Math.max(-20, Phaser.Math.Linear(140, -20, data / 13)));

      this.hotOverlay.alpha = Math.max(0, Math.min(1, (data - 8) / 4));
      this.coldOverlay.alpha = Math.max(0, 1 - (data - 1) / 4);
    }

    if (key === "playerCarrying") {
      this.carrying.text = data;
    }

    if (key === "playerGoal") {
      console.log(key, data);
      if (data === 4) {
        this.sceneWorld.cameras.main.fadeOut(3000, 255, 255, 255);
        this.scene
          .get("comms")
          .events.emit("win_messages", ["That's it Captain! Thanks for the help!", "And thanks for playing!"]);
      }
    }
  }
}
