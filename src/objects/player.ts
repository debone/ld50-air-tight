import { assert } from "../lib/assert";
import { SceneWorld } from "../scenes/world";
import { Battery } from "./battery";
import { Wall } from "./wall";

enum Directions {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

const inFrontOf = {
  [Directions.UP]: { x: 0, y: -1 },
  [Directions.DOWN]: { x: 0, y: 1 },
  [Directions.LEFT]: { x: -1, y: 0 },
  [Directions.RIGHT]: { x: 1, y: 0 },
};

enum Status {
  NORMAL = 0,
  HANDSUP = 1,
  WALKING_NORMAL = 2,
  WALKING_HANDSUP = 3,
}

const playerAnimKeys = {
  [Status.NORMAL]: {
    [Directions.DOWN]: "down",
    [Directions.RIGHT]: "right",
    [Directions.LEFT]: "left",
    [Directions.UP]: "up",
  },
  [Status.HANDSUP]: {
    [Directions.DOWN]: "down_holding",
    [Directions.RIGHT]: "right_holding",
    [Directions.LEFT]: "left_holding",
    [Directions.UP]: "up_holding",
  },
  [Status.WALKING_NORMAL]: {
    [Directions.DOWN]: "down_walk",
    [Directions.RIGHT]: "right_walk",
    [Directions.LEFT]: "left_walk",
    [Directions.UP]: "up_walk",
  },
  [Status.WALKING_HANDSUP]: {
    [Directions.DOWN]: "down_holding_walk",
    [Directions.RIGHT]: "right_holding_walk",
    [Directions.LEFT]: "left_holding_walk",
    [Directions.UP]: "up_holding_walk",
  },
};

export class Player extends Phaser.GameObjects.Sprite {
  declare scene: SceneWorld;

  declare keyW: Phaser.Input.Keyboard.Key;
  declare keyA: Phaser.Input.Keyboard.Key;
  declare keyS: Phaser.Input.Keyboard.Key;
  declare keyD: Phaser.Input.Keyboard.Key;

  declare keySpace: Phaser.Input.Keyboard.Key;
  declare keyShift: Phaser.Input.Keyboard.Key;

  declare playerPos: Phaser.Math.Vector2;

  lastMoveTime = 0;
  lastCarryTime = 0;
  lastTemperatureTime = 0;

  dead = false;

  playerLife = 3;
  temperatureRoundsDamage = 10;
  currentTemperatureDamageRound = 0;

  playerTemperature = 7;

  direction = Directions.DOWN;
  playerStatus = Status.NORMAL;

  declare carryingObject: Wall | Battery | undefined;
  carrying = "";

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number | undefined
  ) {
    super(scene, x * 16, y * 16, texture, frame);

    this.playerPos = new Phaser.Math.Vector2(x, y);

    /*

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 8, end: 9 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 1, end: 2 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('player', { start: 11, end: 13 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('player', { start: 4, end: 6 }),
        frameRate: 10,
        repeat: -1
    });
    */

    this.scene.anims.createFromAseprite("player");

    this.scene.registry.set("playerLife", this.playerLife);

    this.keyW = this.scene.input.keyboard.addKey("W");
    this.keyA = this.scene.input.keyboard.addKey("A");
    this.keyS = this.scene.input.keyboard.addKey("S");
    this.keyD = this.scene.input.keyboard.addKey("D");

    this.keySpace = this.scene.input.keyboard.addKey("SPACE");
    this.keyShift = this.scene.input.keyboard.addKey("SHIFT");

    this.setOrigin(0.66);
    this.scale = 2;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    //this.rotation += 0.01;
  }

  update(time: number) {
    if (!this.dead) {
      this.updatePlayerMovement(time);
      this.updateTemperature(time);
      this.updateCarrying(time);
    }
  }

  updateCarrying(time: number) {
    const repeatMoveDelay = 200;

    if (time > this.lastCarryTime + repeatMoveDelay) {
      if (this.keySpace.isDown) {
        let objectInFront = this.scene.objectLayer.getObjectAt(
          inFrontOf[this.direction].x + this.playerPos.x,
          inFrontOf[this.direction].y + this.playerPos.y
        );
        if (
          this.carryingObject === undefined &&
          objectInFront !== 0 &&
          objectInFront !== undefined &&
          objectInFront.canBePicked
        ) {
          let carryingObject = this.scene.objectLayer.takeObjectFrom(
            inFrontOf[this.direction].x + this.playerPos.x,
            inFrontOf[this.direction].y + this.playerPos.y
          );
          assert(carryingObject !== undefined, "broke js");
          this.carryingObject = carryingObject;
          this.carrying = "something";
          this.scene.registry.set("playerCarrying", this.carrying);
          this.lastCarryTime = time;
        } else if (
          this.carryingObject !== undefined &&
          objectInFront === 0 &&
          objectInFront !== undefined &&
          this.scene.objectLayer.putObjectAt(
            inFrontOf[this.direction].x + this.playerPos.x,
            inFrontOf[this.direction].y + this.playerPos.y,
            this.carryingObject
          )
        ) {
          this.carryingObject = undefined;
          this.carrying = "";
          this.scene.registry.set("playerCarrying", this.carrying);
          this.lastCarryTime = time;
        }
      }
    }
  }

  updateTemperature(time: number) {
    if (time > this.lastTemperatureTime + 500) {
      const playerAreaTemperature = this.scene.airTemp.unguardedGet(this.playerPos.x, this.playerPos.y);
      if (this.playerTemperature - playerAreaTemperature > 0) {
        this.playerTemperature -= Math.min(0.5, Math.abs(this.playerTemperature - playerAreaTemperature));
      }
      if (this.playerTemperature - playerAreaTemperature < 0) {
        this.playerTemperature += Math.min(0.5, Math.abs(this.playerTemperature - playerAreaTemperature));
      }

      if (this.playerTemperature > 10 || this.playerTemperature < 3) {
        this.currentTemperatureDamageRound++;
        if (this.currentTemperatureDamageRound >= this.temperatureRoundsDamage) {
          this.currentTemperatureDamageRound = 0;
          this.playerLife -= 1;
          this.scene.registry.set("playerLife", this.playerLife);
          if (this.playerTemperature > 10) {
            this.scene.cameras.main.flash(1000, 230, 72, 46);
          } else if (this.playerTemperature < 3) {
            this.scene.cameras.main.flash(1000, 138, 235, 241);
          }

          if (this.playerLife === 0) {
            this.playerDie();
          }
        }
      }

      this.scene.airTemp.setDeltaMax(this.playerPos.x, this.playerPos.y, 1, this.playerTemperature);
      this.scene.registry.set("playerTemperature", this.playerTemperature);
      this.lastTemperatureTime = time;
    }
  }

  playerDie() {
    if (
      this.carryingObject !== undefined &&
      this.scene.objectLayer.putObjectAt(this.playerPos.x, this.playerPos.y, this.carryingObject)
    ) {
      this.carryingObject = undefined;
      this.carrying = "";
      this.scene.registry.set("playerCarrying", this.carrying);
    }

    this.scene.cameras.main.fadeOut(1500, 255, 255, 255);

    this.dead = true;

    this.scene.time.delayedCall(5500, () => {
      this.playerPos.x = 20;
      this.playerPos.y = 10;

      this.lastMoveTime = 0;
      this.lastCarryTime = 0;
      this.lastTemperatureTime = 0;

      this.dead = false;
      this.playerLife = 3;
      this.scene.registry.set("playerLife", this.playerLife);
      this.temperatureRoundsDamage = 10;
      this.currentTemperatureDamageRound = 0;

      this.playerTemperature = 7;

      this.direction = Directions.DOWN;
      this.playerStatus = Status.NORMAL;
    });

    this.scene.time.delayedCall(6000, () => {
      this.scene.cameras.main.fadeIn(500, 0, 0, 0);
    });

    if (this.playerTemperature > 7) {
      this.scene.scene
        .get("comms")
        .events.emit("messages", [
          "I hope it didn't hurt much",
          "You need to avoid getting yourself boiled",
        ]);
    } else {
      this.scene.scene
        .get("comms")
        .events.emit("messages", ["Captain, you froze to death", "Maybe your heat vision is turned off?"]);
    }
  }

  isTileOpenAt(worldX: number, worldY: number) {
    const tile = this.scene.map.getTileAt(worldX, worldY, true, "interactive");
    //console.log(tile);
    return tile && tile.index > 0;
  }

  tryMoveTo(nextX: number, nextY: number, time: number) {
    if (this.isTileOpenAt(nextX, nextY)) {
      //this.x = this.scene.map.tileToWorldX(this.playerPos.x);
      //this.y = this.scene.map.tileToWorldY(this.playerPos.y);

      if (this.carryingObject) {
        this.carryingObject.objectPos.x = nextX;
        this.carryingObject.objectPos.y = nextY;
      }

      this.playerPos.x = nextX;
      this.playerPos.y = nextY;
      this.lastMoveTime = time;

      this.playerStatus = this.carrying !== "" ? Status.WALKING_HANDSUP : Status.WALKING_NORMAL;
      this.play({ key: playerAnimKeys[this.playerStatus][this.direction], repeat: -1 }, true);

      return;
    }

    this.playerStatus = this.carrying !== "" ? Status.HANDSUP : Status.NORMAL;
    this.play({ key: playerAnimKeys[this.playerStatus][this.direction], repeat: -1 }, true);
  }

  updatePlayerMovement(time: number) {
    const repeatMoveDelay = 200;

    if (time > this.lastMoveTime + repeatMoveDelay) {
      if (this.scene.cursors.down.isDown || this.keyS.isDown) {
        this.direction = Directions.DOWN;
        this.keyShift.isDown ? null : this.tryMoveTo(this.playerPos.x, this.playerPos.y + 1, time);
      } else if (this.scene.cursors.up.isDown || this.keyW.isDown) {
        this.direction = Directions.UP;
        this.keyShift.isDown ? null : this.tryMoveTo(this.playerPos.x, this.playerPos.y - 1, time);
      }

      if (this.scene.cursors.left.isDown || this.keyA.isDown) {
        this.direction = Directions.LEFT;
        this.keyShift.isDown ? null : this.tryMoveTo(this.playerPos.x - 1, this.playerPos.y, time);
      } else if (this.scene.cursors.right.isDown || this.keyD.isDown) {
        this.direction = Directions.RIGHT;
        this.keyShift.isDown ? null : this.tryMoveTo(this.playerPos.x + 1, this.playerPos.y, time);
      }
    }

    let goalPosX = this.scene.map.tileToWorldX(this.playerPos.x);
    let goalPosY = this.scene.map.tileToWorldY(this.playerPos.y);

    if (Math.abs(goalPosX - this.x) < 1 && Math.abs(goalPosY - this.y) < 1) {
      this.playerStatus = this.carrying !== "" ? Status.HANDSUP : Status.NORMAL;
      this.anims.stop();
      this.play({ key: playerAnimKeys[this.playerStatus][this.direction], repeat: -1 });
    }

    if (Math.abs(goalPosX - this.x) > 0.01) {
      this.x += (goalPosX - this.x) / 5;
    }

    if (Math.abs(goalPosY - this.y) > 0.01) {
      this.y += (goalPosY - this.y) * 0.2;
    }

    if (this.carryingObject) {
      this.carryingObject.x = this.x - 32;
      this.carryingObject.y = this.y - 32;
      this.carryingObject.setDepth(this.playerPos.x + this.playerPos.y * this.scene.map.width + 1);
    }

    this.setDepth(this.playerPos.x + this.playerPos.y * this.scene.map.width);
  }
}
