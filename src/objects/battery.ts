import { SceneWorld } from "../scenes/world";
import { batteryChargingSpriteMapping, batterySpriteMapping } from "./objectsLayer";

const TEMPERATURE_RATE = 0.18;
const CHARGE_RATE = 1;
const MAX_CHARGE = 100;

export class Battery extends Phaser.GameObjects.Sprite {
  declare scene: SceneWorld;
  declare objectPos: Phaser.Math.Vector2;

  temperature = 1;
  charge = 0;
  lastUpdate = 0;
  lastSprite = 1;

  charging = false;
  wasEverPicked = false;
  canBePicked = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    objectX: number,
    objectY: number,
    texture: string | Phaser.Textures.Texture
  ) {
    super(scene, x, y, texture, 18);
    this.objectPos = new Phaser.Math.Vector2(objectX, objectY);
  }

  onPick() {
    this.wasEverPicked = true;
    this.charging = false;
    this.scene.interactiveLayer.putTileAt(1, this.objectPos.x, this.objectPos.y);
    return true;
  }

  onDrop(tileX: number, tileY: number): boolean {
    const tileDropped = this.scene.groundLayer.getTileAt(tileX, tileY);
    // ship
    /* closed batteries */
    // 49, 50, 51, 52
    // open
    // 56, 57, 58, 59
    if (tileDropped.index === 56 || tileDropped.index === 57 || tileDropped.index === 58 || tileDropped.index === 59) {
      if (this.charge >= MAX_CHARGE) {
        this.scene.registry.set("playerGoal", this.scene.registry.get("playerGoal") + 1);
        tileDropped.index = tileDropped.index - 7;
        this.alpha = 0;
        this.canBePicked = false;
        return true;
      } else {
        this.scene.scene.get("comms").events.emit("messages", ["Cap, I need 4 fully charged ones"]);
      }
    }

    if (this.scene.interactiveLayer.getTileAt(tileX, tileY).index === 1) {
      // Chargers
      if (tileDropped.index === 85 || 117 === tileDropped.index) {
        this.charging = true;
      }

      this.scene.interactiveLayer.putTileAt(0, tileX, tileY);
      return true;
    }
    return false;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    const repeatMoveDelay = 400;

    if (time > this.lastUpdate + repeatMoveDelay) {
      this.scene.airTemp.setDeltaMax(this.objectPos.x, this.objectPos.y, 2, this.temperature);

      if (!this.wasEverPicked) {
        this.setFrame(batterySpriteMapping[this.lastSprite]);

        this.lastSprite = this.lastSprite ? 0 : 1;
        this.lastUpdate = time;
        return;
      }

      if (this.charging) {
        if (this.charge >= MAX_CHARGE) {
          this.setFrame(batteryChargingSpriteMapping[4]);
          return;
        } else {
          this.charge += CHARGE_RATE;
          this.temperature += TEMPERATURE_RATE;
        }

        this.setFrame(batteryChargingSpriteMapping[this.lastSprite]);
        let currentCharge = Math.floor(Phaser.Math.Linear(0, 3, this.charge / MAX_CHARGE));
        this.lastSprite = this.lastSprite === currentCharge ? currentCharge + 1 : currentCharge;
        this.lastUpdate = time;
        return;
      }

      this.temperature = Math.max(5, this.temperature - TEMPERATURE_RATE);
      this.setFrame(batterySpriteMapping[Math.floor(Phaser.Math.Linear(0, 3, this.charge / MAX_CHARGE))]);
      this.lastUpdate = time;
    }
  }
}
