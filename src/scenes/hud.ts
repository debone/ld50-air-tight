export class SceneHUD extends Phaser.Scene {
  constructor() {
    super("hud");
  }

  preload() {
    this.load.image("hud", new URL("/src/assets/hud.png", import.meta.url).href);
  }
  declare temperature: Phaser.GameObjects.Text;
  create() {
    const hudBackground = this.add.image(0, 0, "hud");

    hudBackground.setOrigin(0);

    this.add.text(10, 10, "HUD", {
      font: "32px verdana",
      color: "black",
      backgroundColor: "white",
      padding: {
        x: 5,
        y: 5,
      },
    });

    this.temperature = this.add.text(700, 20, "0K", {
      font: "32px verdana",
      color: "cyan",
      backgroundColor: "black",
      padding: {
        x: 5,
        y: 5,
      },
    });

    this.registry.events.on("changedata", (...args: any) => this.updateData.apply(this, args));
  }

  updateData(parent, key, data) {
    console.log(parent, key, data);
    if (key === "playerTemperature") {
      this.temperature.text = `${data.toFixed(1)} K`;
    }
  }
}
