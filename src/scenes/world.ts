import Phaser from "phaser";
import { TILE_HEIGHT, TILE_WIDTH } from "../../src/consts";
import { ObjectsLayer } from "../objects/objectsLayer";
import { Player } from "../objects/player";
import { AirTemperature } from "../systems/airTemperature";

import tilesImg from "../assets/outside-ground-tileset.png";
import temperatureImg from "../assets/temperature.png";
import objectTileset from "../assets/object-tileset.png";

import playerImg from "../assets/player.png";
import playerImgJson from "../assets/player.json";

// https://hue.tools/mix?colors=bd3a0aff%3B4984b9ff&steps=16&view=steps&mode=lch

// floor inspiration
// https://labs.phaser.io/assets/tilemaps/tiles/gridtiles.png

export class SceneWorld extends Phaser.Scene {
  declare map: Phaser.Tilemaps.Tilemap;
  declare marker: Phaser.GameObjects.Graphics;

  declare groundLayer: Phaser.Tilemaps.TilemapLayer;
  declare interactiveLayer: Phaser.Tilemaps.TilemapLayer;
  declare airLayer: Phaser.Tilemaps.TilemapLayer;

  declare objectLayer: ObjectsLayer;

  declare airTemp: AirTemperature;

  declare level: number[][];

  declare player: Player;

  declare cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super("world");
  }

  preload() {
    this.load.image("tiles", tilesImg);
    this.load.image("temperature", temperatureImg);

    this.load.spritesheet("objects", objectTileset, {
      frameWidth: 48,
      frameHeight: 48,
    });

    this.load.aseprite("player", playerImg, playerImgJson);
  }

  create() {
    this.scene.run("hud", { sceneWorld: this });
    this.scene.run("comms", { sceneWorld: this });

    // Load a map from a 2D array of tile indices
    this.level = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    // When loading from an array, make sure to specify the tileWidth and tileHeight
    this.map = this.make.tilemap({
      data: this.level,
      tileWidth: TILE_WIDTH,
      tileHeight: TILE_HEIGHT,
    });

    this.airTemp = new AirTemperature(this.map.width, this.map.height);
    this.airTemp.conductivity = 0.8;
    this.airTemp.loss = 0.2;

    const tiles = this.map.addTilesetImage("tiles", undefined, 16, 16);
    this.groundLayer = this.map.createLayer(0, tiles, 0, 0);
    this.groundLayer.randomize(0, 0, this.map.width, this.map.height, [0, 1, 2, 3, 4, 5]);
    this.groundLayer.scale = 2;

    const temperature = this.map.addTilesetImage("temperature", undefined, 1, 1);

    this.interactiveLayer = this.map.createBlankLayer("interactive", temperature, 0, 0);
    this.interactiveLayer.fill(1);
    this.interactiveLayer.alpha = 0;

    /* closed batteries */
    // 49, 50, 51, 52
    // open
    // 56, 57, 58, 59
    this.groundLayer.putTilesAt(
      [
        [16, 17, 18, 19, 20, 21, 22],
        [32, 33, 34, 35, 36, 37, 38],
        [48, 56, 57, 58, 59, 53, 54],
        [64, 65, 66, 67, 68, 69, 70],
      ],
      13,
      8
    );

    this.interactiveLayer.putTilesAt(
      [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      13,
      8
    );

    this.groundLayer.putTilesAt(
      [
        [80, 81, 82, 83],
        [96, 97, 98, 99],
        [112, 113, 114, 115],
      ],
      5,
      20
    );

    this.groundLayer.putTilesAt(
      [
        [84, 85],
        [100, 101],
        [116, 117],
      ],
      13,
      20
    );

    this.interactiveLayer.putTilesAt(
      [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      5,
      20
    );

    this.airLayer = this.map.createBlankLayer("air", temperature, 0, 0);
    this.airLayer.fill(1);
    this.airLayer.alpha = 0.33;
    this.airLayer.scale = 2;

    this.player = new Player(this, 20, 10, "player", 1);
    this.registry.set("playerGoal", 0);

    /*
    const objects = this.map.addTilesetImage("objects", undefined, 48, 48);
    this.objectLayer = this.map.createBlankLayer("object", objects, -64, -64, undefined, undefined, 48, 48);
    this.objectLayer.setDepth(3);
    this.objectLayer.setRenderOrder(0);
    this.objectLayer.putTileAt(17, 2, 2);
    this.objectLayer.putTileAt(49, 4, 2);
    this.objectLayer.putTileAt(49, 5, 2);
    this.objectLayer.putTileAt(49, 6, 2);
    this.objectLayer.scale = 2;
*/
    this.objectLayer = this.add.existing(new ObjectsLayer(this, this.map, "objects"));
    this.objectLayer.createNewObjectAt(5, 26, "battery");
    this.objectLayer.createNewObjectAt(6, 12, "battery");
    this.objectLayer.createNewObjectAt(18, 14, "battery");
    this.objectLayer.createNewObjectAt(21, 23, "battery");
    //

    this.objectLayer.createNewObjectAt(15, 15, "wall");
    this.objectLayer.createNewObjectAt(23, 20, "wall");
    this.objectLayer.createNewObjectAt(23, 22, "wall");
    this.objectLayer.createNewObjectAt(24, 25, "wall");
    this.objectLayer.createNewObjectAt(24, 26, "wall");

    this.objectLayer.createNewObjectAt(11, 19, "wall");
    this.objectLayer.createNewObjectAt(11, 20, "wall");
    this.objectLayer.createNewObjectAt(11, 21, "wall");
    this.objectLayer.createNewObjectAt(11, 22, "wall");
    this.objectLayer.createNewObjectAt(11, 23, "wall");

    this.objectLayer.createNewObjectAt(12, 19, "wall");
    this.objectLayer.createNewObjectAt(13, 19, "wall");
    this.objectLayer.createNewObjectAt(14, 19, "wall");
    this.objectLayer.createNewObjectAt(16, 19, "wall");

    this.objectLayer.createNewObjectAt(17, 22, "wall");
    this.objectLayer.createNewObjectAt(17, 23, "wall");
    this.objectLayer.createNewObjectAt(17, 24, "wall");

    this.objectLayer.createNewObjectAt(11, 24, "wall");
    this.objectLayer.createNewObjectAt(12, 24, "wall");
    this.objectLayer.createNewObjectAt(13, 24, "wall");
    this.objectLayer.createNewObjectAt(14, 24, "wall");
    this.objectLayer.createNewObjectAt(15, 24, "wall");
    this.objectLayer.createNewObjectAt(16, 24, "wall");

    this.objectLayer.createNewObjectAt(5, 2, "wall");

    this.objectLayer.add(this.player);

    //  this.map.setLayer(this.airLayer);

    this.marker = this.add.graphics();
    this.marker.lineStyle(2, 0xffffff, 1);
    this.marker.strokeRect(0, 0, this.map.tileWidth * 2, this.map.tileHeight * 2);

    //this.cameras.main.setBounds(0, 0, 100, 100);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.fadeFrom(4000, 57, 71, 120);

    this.cursors = this.input.keyboard.createCursorKeys();

    /*this.airTemp.block(15, 4);
    this.airTemp.block(13, 4);
    this.airTemp.block(12, 4);
    this.airTemp.block(11, 4);
    this.airTemp.block(10, 4);
    this.airTemp.block(9, 4);
    this.airTemp.block(8, 4);
    this.airTemp.block(7, 4);
    this.airTemp.block(6, 4);
    this.airTemp.block(5, 4);
    this.airTemp.block(4, 4);
    this.airTemp.block(3, 4);
    this.airTemp.block(2, 4);
    this.airTemp.block(1, 4);
    this.airTemp.block(0, 4);

    this.airTemp.block(4, 5);
    this.airTemp.block(4, 6);
    this.airTemp.block(4, 7);

    this.airTemp.block(8, 5);
    //this.airTemp.block(8, 6);
    this.airTemp.block(8, 7);

    this.airTemp.block(4, 8);
    this.airTemp.block(5, 8);
    this.airTemp.block(6, 8);
    this.airTemp.block(7, 8);
    this.airTemp.block(8, 8);

    this.airTemp.set(5, 5, 10);
    this.airTemp.set(5, 6, 10);
    this.airTemp.set(5, 7, 10);*/

    this.time.addEvent({
      delay: 1000,
      callback: () => this.airTemperatureTick(),
      loop: true,
    });
    this.airTemperatureTick();
  }

  airTemperatureTick() {
    this.airTemp.tick();

    this.airTemp.set(16, 9, 9);
    this.airTemp.set(17, 9, 9);

    this.airLayer.forEachTile((tile) => {
      tile.index = Math.floor(this.airTemp.unguardedGet(tile.x, tile.y));
    });
  }

  update(time: number /*, delta*/) {
    this.player.update(time);

    const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

    // Rounds down to nearest tile
    const pointerTileX = this.map.worldToTileX(worldPoint.x);
    const pointerTileY = this.map.worldToTileY(worldPoint.y);

    // Snap to tile coordinates, but in world space
    this.marker.x = this.map.tileToWorldX(pointerTileX);
    this.marker.y = this.map.tileToWorldY(pointerTileY);

    if (this.input.manager.activePointer.isDown) {
      let tile = this.map.getTileAt(pointerTileX, pointerTileY);
      console.log("Tile", tile?.index);
      console.log("Tile", tile?.collides);
      if (tile && tile.index > 0) {
        // this.airTemp.block(tile.x, tile.y);
      } else if (tile?.index === 0) {
        //this.airTemp.unblock(tile.x, tile.y);
      }
    }
  }
}
