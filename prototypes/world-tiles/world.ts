import Phaser from "phaser";
import { TILE_HEIGHT, TILE_WIDTH } from "../../src/consts";

// https://hue.tools/mix?colors=bd3a0aff%3B4984b9ff&steps=16&view=steps&mode=lch

// floor inspiration
// https://labs.phaser.io/assets/tilemaps/tiles/gridtiles.png

export class SceneWorld extends Phaser.Scene {
  map: Phaser.Tilemaps.Tilemap;
  marker: Phaser.GameObjects.Graphics;
  airLayer: Phaser.Tilemaps.TilemapLayer;

  level: number[][];
  airTemperature: number[];
  nextAirTemperature: number[];

  preload() {
    this.load.image("tiles", new URL("./pixeltile.png", import.meta.url).href);
    this.load.image(
      "temperature",
      new URL("./temperature.png", import.meta.url).href
    );
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

    this.airTemperature = [
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 16, 16, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 16, 16, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
    ];

    this.nextAirTemperature = this.airTemperature.slice();

    // When loading from an array, make sure to specify the tileWidth and tileHeight
    this.map = this.make.tilemap({
      data: this.level,
      tileWidth: TILE_WIDTH,
      tileHeight: TILE_HEIGHT,
    });

    const tiles = this.map.addTilesetImage("tiles", null, 1, 1);
    const ground = this.map.createLayer(0, tiles, 0, 0);

    const temperature = this.map.addTilesetImage("temperature", null, 1, 1);
    this.airLayer = this.map.createBlankLayer("air", temperature, 0, 0);
    this.airLayer.fill(0);

    this.marker = this.add.graphics();
    this.marker.lineStyle(2, 0xffffff, 1);
    this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);

    this.time.addEvent({
      delay: 1000,
      callback: () => this.airTemperatureTick(),
      loop: true,
    });
  }

  disperseMask = [
    [+0.1, +0.1, +0.1],
    [+0.1, 0, +0.1],
    [+0.1, +0.1, +0.1],
  ];

  minTemp = 1;
  maxTemp = 16;
  epsilon = 0.0001;

  energyCalc(current, energy) {
    if (energy < this.epsilon) {
      return current;
    }

    if (current + energy > this.maxTemp - this.epsilon) {
      return this.maxTemp;
    }

    if (current + energy < this.minTemp + this.epsilon) {
      return this.minTemp;
    }

    return current + energy;
  }

  airTemperatureTick() {
    //console.log("tick", this.airLayer);
    for (let i = 0, l = this.airTemperature.length; i < l; i++) {
      let x = i % 16;
      let y = Math.floor(i / 16);

      if (this.airTemperature[i] > 1) {
        const nextTemp = Math.max(
          this.minTemp,
          Math.min(
            this.maxTemp,
            this.nextAirTemperature[y * 16 + x] * this.disperseMask[1][1]
          )
        );

        const energy = Math.abs(nextTemp - this.nextAirTemperature[y * 16 + x]);

        this.nextAirTemperature[y * 16 + x] = nextTemp;

        if (x > 0) {
          this.nextAirTemperature[y * 16 + x - 1] = this.energyCalc(
            this.nextAirTemperature[y * 16 + x - 1],
            energy * this.disperseMask[1][0]
          );
        }

        if (x < 16 - 1) {
          this.nextAirTemperature[y * 16 + x + 1] = this.energyCalc(
            this.nextAirTemperature[y * 16 + x + 1],
            energy * this.disperseMask[1][2]
          );
        }

        if (y > 0) {
          if (x > 0) {
            this.nextAirTemperature[(y - 1) * 16 + x - 1] = this.energyCalc(
              this.nextAirTemperature[(y - 1) * 16 + x - 1],
              energy * this.disperseMask[0][0]
            );
          }

          this.nextAirTemperature[(y - 1) * 16 + x] = this.energyCalc(
            this.nextAirTemperature[(y - 1) * 16 + x],
            energy * this.disperseMask[0][1]
          );

          if (x < 16 - 1) {
            this.nextAirTemperature[(y - 1) * 16 + x + 1] = this.energyCalc(
              this.nextAirTemperature[(y - 1) * 16 + x + 1],
              energy * this.disperseMask[0][2]
            );
          }
        }

        if (y < 16 - 1) {
          if (x > 0) {
            this.nextAirTemperature[(y + 1) * 16 + x - 1] = this.energyCalc(
              this.nextAirTemperature[(y + 1) * 16 + x - 1],
              energy * this.disperseMask[2][0]
            );
          }

          this.nextAirTemperature[(y + 1) * 16 + x] = this.energyCalc(
            this.nextAirTemperature[(y + 1) * 16 + x],
            energy * this.disperseMask[2][1]
          );

          if (x < 16 - 1) {
            this.nextAirTemperature[(y + 1) * 16 + x + 1] = this.energyCalc(
              this.nextAirTemperature[(y + 1) * 16 + x + 1],
              energy * this.disperseMask[2][2]
            );
          }
        }
      }
    }

    this.airTemperature = this.nextAirTemperature.slice();
    this.nextAirTemperature[6 * 16 + 6] = 16;

    console.log(
      this.airTemperature[6 * 16 + 5],
      this.airTemperature[6 * 16 + 6],
      this.airTemperature[6 * 16 + 7]
    );

    this.airLayer.forEachTile((tile) => {
      tile.index = Math.floor(this.airTemperature[tile.y * 16 + tile.x]);

      if (tile.properties?.temperature > 0) {
        /*        const testTile = this.airLayer.putTileAt(tile.x - 1, tile.y);
        if (testTile) {
          testTile.index = 
        }*/
      }
    });
  }

  update(/*time, delta*/) {
    const worldPoint = this.input.activePointer.positionToCamera(
      this.cameras.main
    ) as Phaser.Math.Vector2;

    // Rounds down to nearest tile
    const pointerTileX = this.map.worldToTileX(worldPoint.x);
    const pointerTileY = this.map.worldToTileY(worldPoint.y);

    // Snap to tile coordinates, but in world space
    this.marker.x = this.map.tileToWorldX(pointerTileX);
    this.marker.y = this.map.tileToWorldY(pointerTileY);

    //(this.input.manager.activePointer.isDown)
    // var tile = map.getTileAt(pointerTileX, pointerTileY);
  }
}
