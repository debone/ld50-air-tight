import Phaser from "phaser";
import { TILE_HEIGHT, TILE_WIDTH } from "../../src/consts";
import { AirTemperature } from "../systems/airTemperature";

// https://hue.tools/mix?colors=bd3a0aff%3B4984b9ff&steps=16&view=steps&mode=lch

// floor inspiration
// https://labs.phaser.io/assets/tilemaps/tiles/gridtiles.png

export class SceneWorld extends Phaser.Scene {
  map: Phaser.Tilemaps.Tilemap;
  marker: Phaser.GameObjects.Graphics;
  airLayer: Phaser.Tilemaps.TilemapLayer;

  airTemp: AirTemperature;

  level: number[][];

  preload() {
    this.load.image("tiles", new URL("/src/assets/pixeltile.png", import.meta.url).href);
    this.load.image("temperature", new URL("/src/assets/temperature.png", import.meta.url).href);
  }

  create() {
    // Load a map from a 2D array of tile indices
    this.level = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    // When loading from an array, make sure to specify the tileWidth and tileHeight
    this.map = this.make.tilemap({
      data: this.level,
      tileWidth: TILE_WIDTH,
      tileHeight: TILE_HEIGHT,
    });

    const tiles = this.map.addTilesetImage("tiles", undefined, 1, 1);
    const ground = this.map.createLayer(0, tiles, 0, 0);

    const temperature = this.map.addTilesetImage("temperature", undefined, 1, 1);
    this.airLayer = this.map.createBlankLayer("air", temperature, 0, 0);
    this.airLayer.fill(1);

    this.marker = this.add.graphics();
    this.marker.lineStyle(2, 0xffffff, 1);
    this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);

    this.time.addEvent({
      delay: 1000,
      callback: () => this.airTemperatureTick(),
      loop: true,
    });

    this.airTemp = new AirTemperature(this.map.width, this.map.height);
    this.airTemp.conductivity = 0.7;
    // inside?
    //this.airTemp.loss = 0.2;
    this.airTemp.loss = 0.2;

    this.airTemp.block(15, 4);
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
    this.airTemp.set(5, 7, 10);
  }

  airTemperatureTick() {
    this.airTemp.tick();
    this.airTemp.set(5, 6, 10);

    this.airLayer.forEachTile((tile) => {
      tile.index = Math.floor(this.airTemp.get(tile.x, tile.y));

      if (tile.properties?.temperature > 0) {
        /*        const testTile = this.airLayer.putTileAt(tile.x - 1, tile.y);
        if (testTile) {
          testTile.index = 
        }*/
      }
    });
  }

  update(/*time, delta*/) {
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
      if (tile && tile.index > 0) {
        this.airTemp.block(tile.x, tile.y);
      } else if (tile.index === 0) {
        this.airTemp.unblock(tile.x, tile.y);
      }
    }
  }
}