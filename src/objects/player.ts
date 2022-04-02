import { SceneWorld } from "../scenes/world";

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: SceneWorld;

  lastMoveTime = 0;

  playerPos = new Phaser.Math.Vector2(0, 0);

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number | undefined
  ) {
    super(scene, x, y, texture, frame);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    //this.rotation += 0.01;
  }

  update(time: number) {
    this.updatePlayerMovement(time);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (this.scene.cursors.left.isDown) {
      this.anims.play("left", true);
    } else if (this.scene.cursors.right.isDown) {
      this.anims.play("right", true);
    } else if (this.scene.cursors.up.isDown) {
      this.anims.play("up", true);
    } else if (this.scene.cursors.down.isDown) {
      this.anims.play("down", true);
    } else {
      this.anims.stop();
    }
  }

  isTileOpenAt(worldX: number, worldY: number) {
    const tile = this.scene.map.getTileAt(worldX, worldY, true);
    return tile && tile.index > 0;
  }

  updatePlayerMovement(time: number) {
    const repeatMoveDelay = 200;

    if (time > this.lastMoveTime + repeatMoveDelay) {
      if (this.scene.cursors.down.isDown) {
        if (this.isTileOpenAt(this.playerPos.x, this.playerPos.y + 1)) {
          this.playerPos.y += 1;
          this.lastMoveTime = time;
        }
      } else if (this.scene.cursors.up.isDown) {
        if (this.isTileOpenAt(this.playerPos.x, this.playerPos.y - 1)) {
          this.playerPos.y -= 1;
          this.lastMoveTime = time;
        }
      }

      if (this.scene.cursors.left.isDown) {
        if (this.isTileOpenAt(this.playerPos.x - 1, this.playerPos.y)) {
          this.playerPos.x -= 1;
          this.lastMoveTime = time;
        }
      } else if (this.scene.cursors.right.isDown) {
        if (this.isTileOpenAt(this.playerPos.x + 1, this.playerPos.y)) {
          this.playerPos.x += 1;
          this.lastMoveTime = time;
        }
      }
    }

    this.body.x = this.scene.map.tileToWorldX(this.playerPos.x) - 16;
    this.body.y = this.scene.map.tileToWorldY(this.playerPos.y) - 16;
  }
}
