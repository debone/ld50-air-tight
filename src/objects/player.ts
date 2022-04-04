import { SceneWorld } from "../scenes/world";

enum Directions {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

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
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: SceneWorld;

  declare keyW: Phaser.Input.Keyboard.Key;
  declare keyA: Phaser.Input.Keyboard.Key;
  declare keyS: Phaser.Input.Keyboard.Key;
  declare keyD: Phaser.Input.Keyboard.Key;

  declare keySpace: Phaser.Input.Keyboard.Key;
  declare keyShift: Phaser.Input.Keyboard.Key;

  lastMoveTime = 0;
  lastCarryTime = 0;
  lastTemperatureTime = 0;

  playerPos = new Phaser.Math.Vector2(0, 0);
  playerTemperature = 7;

  direction = Directions.DOWN;
  playerStatus = Status.NORMAL;

  carrying = "";

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number | undefined
  ) {
    super(scene, x, y, texture, frame);

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

    const tags = this.scene.anims.createFromAseprite("player");
    console.log(tags);

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
    this.updatePlayerMovement(time);
    this.updateTemperature(time);
    this.updateCarrying(time);
  }

  updateCarrying(time: number) {
    const repeatMoveDelay = 200;

    if (time > this.lastCarryTime + repeatMoveDelay) {
      if (this.keySpace.isDown) {
        this.carrying = this.carrying === "" ? "something" : "";
        this.scene.registry.set("playerCarrying", this.carrying);
        this.lastCarryTime = time;
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

      this.scene.airTemp.setDeltaMax(this.playerPos.x, this.playerPos.y, 1, this.playerTemperature);
      this.scene.registry.set("playerTemperature", this.playerTemperature);
      this.lastTemperatureTime = time;
    }
  }

  isTileOpenAt(worldX: number, worldY: number) {
    const tile = this.scene.map.getTileAt(worldX, worldY, true);
    //console.log(tile);
    return tile && tile.index > 0;
  }

  tryMoveTo(nextX: number, nextY: number, time: number) {
    if (this.isTileOpenAt(nextX, nextY)) {
      //this.x = this.scene.map.tileToWorldX(this.playerPos.x);
      //this.y = this.scene.map.tileToWorldY(this.playerPos.y);

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

    this.setDepth(this.playerPos.x + this.playerPos.y * this.scene.map.width);
  }
}
