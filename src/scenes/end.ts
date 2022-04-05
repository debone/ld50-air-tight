import Phaser from "phaser";

export class SceneEnd extends Phaser.Scene {
  declare keySpace: Phaser.Input.Keyboard.Key;

  constructor() {
    super("end");
  }

  create() {
    this.add
      .text(400, 200, "HOT POINT", {
        fontFamily: "Bebas Neue",
        fontSize: "100px",
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true);
    this.registry.set("restart", this.registry.get("restart") + 1);
    this.add
      .text(200, 300, "You died.\nPress space to restart", {
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
