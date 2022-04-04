import { assert } from "../lib/assert";
import { SceneWorld } from "../scenes/world";

export const objectsMapping = {
  "battery-1": 17,
  "wall-1": 49,
};

export class ObjectsLayer extends Phaser.GameObjects.Layer {
  declare map: Phaser.Tilemaps.Tilemap;
  declare objectsTextureKey: string;
  declare scene: SceneWorld;

  declare objectsArray: (Phaser.GameObjects.Image | 0)[][];

  constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, objectsTextureKey: string) {
    super(scene);

    this.map = map;
    this.objectsTextureKey = objectsTextureKey;

    this.objectsArray = Array(32)
      .fill(0)
      .map(() => Array(32).fill(0));
  }

  createObjectAt(tileX: number, tileY: number, object: keyof typeof objectsMapping) {
    const obj = this.scene.make.image(
      { x: 0, y: 0, key: this.objectsTextureKey, frame: objectsMapping[object] },
      false
    );

    //TODO: Spritesheet specific, no time for fixing
    obj.scale = 2;
    obj.setOrigin(0.66);

    this.putObjectAt(tileX, tileY, obj);
  }

  putObjectAt(tileX: number, tileY: number, object: Phaser.GameObjects.Image) {
    assert(this.objectsArray[tileX][tileY] === 0, `There's already an object at place ${tileX} ${tileY}`);

    const x = this.map.tileToWorldX(tileX);
    const y = this.map.tileToWorldY(tileY);

    object.x = x;
    object.y = y;

    this.objectsArray[tileX][tileY] = object;

    this.scene.airTemp.block(tileX, tileY);
    this.add(object);

    object.setDepth(tileX + tileY * this.map.width);
    console.log("Adding object at depth", object.depth);
  }
}
