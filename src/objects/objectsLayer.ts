import { assert } from "../lib/assert";
import { SceneWorld } from "../scenes/world";
import { Battery } from "./battery";
import { Wall } from "./wall";

export const objectsMappingSprite = {
  "battery-0": 18,
  "battery-1": 19,
  "battery-2": 20,
  "battery-3": 21,
  "battery-full": 22,
  "battery-charging-0": 34,
  "battery-charging-1": 35,
  "battery-charging-2": 36,
  "battery-charging-3": 37,
  "battery-charging-full": 38,

  "wall-1": 49,
};

export const objectsMapping = {
  battery: Battery,
  wall: Wall,
};

export const batterySpriteMapping = [18, 19, 20, 21, 22];
export const batteryChargingSpriteMapping = [34, 35, 36, 37, 38];

export class ObjectsLayer extends Phaser.GameObjects.Layer {
  declare map: Phaser.Tilemaps.Tilemap;
  declare objectsTextureKey: string;
  declare scene: SceneWorld;

  declare objectsArray: (Wall | Battery | 0)[][];

  constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, objectsTextureKey: string) {
    super(scene);

    this.map = map;
    this.objectsTextureKey = objectsTextureKey;

    this.objectsArray = Array(32)
      .fill(0)
      .map(() => Array(32).fill(0));
  }

  createNewObjectAt(tileX: number, tileY: number, object: keyof typeof objectsMapping) {
    let obj;
    if (object === "battery") {
      obj = new Battery(this.scene, 0, 0, tileX, tileY, this.objectsTextureKey);
    } else if (object === "wall") {
      obj = new Wall(this.scene, 0, 0, tileX, tileY, this.objectsTextureKey);
    }

    assert(obj !== undefined, "yolo");

    //TODO: Spritesheet specific, no time for fixing
    obj.scale = 2;
    obj.setOrigin(0.66);

    this.putNewObjectAt(tileX, tileY, obj);
  }

  putNewObjectAt(tileX: number, tileY: number, object: Wall | Battery) {
    this.add(object);
    this.putObjectAt(tileX, tileY, object);
  }

  putObjectAt(tileX: number, tileY: number, object: Wall | Battery) {
    assert(this.objectsArray[tileX][tileY] === 0, `There's already an object at place ${tileX} ${tileY}`);

    if (object.onDrop(tileX, tileY)) {
      const x = this.map.tileToWorldX(tileX);
      const y = this.map.tileToWorldY(tileY);

      object.x = x;
      object.y = y;

      object.objectPos.x = tileX;
      object.objectPos.y = tileY;

      this.objectsArray[tileX][tileY] = object;

      //this.scene.airTemp.block(tileX, tileY);

      object.setDepth(tileX + tileY * this.map.width);
      console.log("Adding object at depth", object.depth);
      return true;
    }

    return false;
  }

  getObjectAt(tileX: number, tileY: number): Wall | Battery | 0 {
    return this.objectsArray[tileX][tileY];
  }

  takeObjectFrom(tileX: number, tileY: number) {
    if (this.objectsArray[tileX][tileY] !== 0) {
      this.scene.airTemp.unblock(tileX, tileY);
      let object = this.objectsArray[tileX][tileY];
      assert(object !== undefined && object !== 0, "hehe");
      object.onPick();
      this.objectsArray[tileX][tileY] = 0;
      return object;
    }
    return undefined;
  }
}
