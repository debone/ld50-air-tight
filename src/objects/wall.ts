import { SceneWorld } from "../scenes/world";

export class Wall extends Phaser.GameObjects.Sprite {
  declare scene: SceneWorld;
  declare objectPos: Phaser.Math.Vector2;

  canBePicked = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    objectX: number,
    objectY: number,
    texture: string | Phaser.Textures.Texture
  ) {
    super(scene, x, y, texture, 49);
    this.objectPos = new Phaser.Math.Vector2(objectX, objectY);
  }

  onPick() {
    this.scene.interactiveLayer.putTileAt(1, this.objectPos.x, this.objectPos.y);
    this.scene.airTemp.unblock(this.objectPos.x, this.objectPos.y);
  }

  onDrop(tileX: number, tileY: number): boolean {
    if (this.scene.interactiveLayer.getTileAt(tileX, tileY).index === 1) {
      this.scene.interactiveLayer.putTileAt(0, tileX, tileY);
      this.scene.airTemp.block(tileX, tileY);
      return true;
    }
    return false;
  }
}
