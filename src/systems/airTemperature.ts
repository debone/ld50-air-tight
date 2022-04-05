import { assert } from "../lib/assert";

export class AirTemperature {
  wall = 0;
  minTemperature = 1;
  maxTemperature = 16;
  epsilon = 0.0001;

  disperseMask = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  width: number;
  height: number;
  airTemperature: number[];
  airTemperatureDelta: number[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.airTemperature = Array(width * height).fill(this.minTemperature);
    this.airTemperatureDelta = Array(width * height).fill(0);
  }

  addEnergy(current: number, delta: number) {
    if (Math.abs(delta) < this.epsilon) {
      return current;
    }

    if (current + delta > this.maxTemperature - this.epsilon) {
      return this.maxTemperature;
    }

    if (current + delta < this.minTemperature + this.epsilon) {
      return this.minTemperature;
    }

    return current + delta;
  }

  conductivity = 0.7;
  loss = 0.01;

  unguardedGetDelta(x: number, y: number): number {
    return this.airTemperatureDelta[x + y * this.width];
  }
  getDelta(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return undefined;

    return this.unguardedGetDelta(x, y);
  }

  setDelta(x: number, y: number, value: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.airTemperatureDelta[x + y * this.width] += value;
  }

  /**
   * Do not use, it's probably wrong and it works good enough for the player
   */
  setDeltaMax(x: number, y: number, value: number, max: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;

    if (this.unguardedGet(x, y) < max) {
      if (this.unguardedGet(x, y) + value > max) {
        this.setDelta(x, y, max - this.unguardedGet(x, y));
      } else {
        this.setDelta(x, y, value);
      }
    }
  }

  resetDelta() {
    this.airTemperatureDelta = Array(this.width * this.height).fill(0);
  }

  unguardedGet(x: number, y: number): number {
    return this.airTemperature[x + y * this.width];
  }

  get(x: number, y: number): number | undefined {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return undefined;

    return this.unguardedGet(x, y);
  }

  set(x: number, y: number, value: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;

    assert(value >= 0 && value <= this.maxTemperature, "Value must be between temperatures");

    this.airTemperature[x + y * this.width] = value;
  }

  unblock(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return undefined;

    this.airTemperature[x + y * this.width] = this.minTemperature;
    return true;
  }

  block(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return undefined;

    this.airTemperature[x + y * this.width] = this.wall;
    return true;
  }

  calculateDisperse(x: number, y: number) {
    let tile;
    let disperseTiles = 0;
    let disperseMask = Array(9).fill(0);

    for (let tileX = x - 1, deltaX = 0; tileX <= x + 1; tileX++, deltaX++) {
      for (let tileY = y - 1, deltaY = 0; tileY <= y + 1; tileY++, deltaY++) {
        if (deltaX === 1 && deltaY === 1) continue;

        if ((tile = this.get(tileX, tileY)) && tile !== undefined && tile !== this.wall) {
          disperseTiles++;
          disperseMask[deltaX + deltaY * 3] = -1;
        }
      }
    }

    let disperseAmount = 1 / disperseTiles;

    for (let deltaX = 0; deltaX < 3; deltaX++) {
      for (let deltaY = 0; deltaY < 3; deltaY++) {
        if (disperseMask[deltaX + deltaY * 3] === -1) {
          disperseMask[deltaX + deltaY * 3] = disperseAmount;
        }
      }
    }

    return disperseMask;
  }

  calculateFlow() {
    let currentEnergy, energyToLoss, mask, energyToDisperse;

    for (let y = 0, k = this.height; y < k; y++) {
      for (let x = 0, l = this.width; x < l; x++) {
        if ((currentEnergy = this.get(x, y)) && currentEnergy !== undefined && currentEnergy > 1) {
          mask = this.calculateDisperse(x, y);
          energyToDisperse = currentEnergy * this.conductivity;
          //energyToLoss = currentEnergy * this.loss;
          //this.setDelta(x, y, -energyToLoss);

          for (let tileX = x - 1, deltaX = 0; tileX <= x + 1; tileX++, deltaX++) {
            for (let tileY = y - 1, deltaY = 0; tileY <= y + 1; tileY++, deltaY++) {
              if ((x === tileX && y === tileY) || this.get(tileX, tileY) === undefined) continue;
              // I want to add to the delta as much as energy
              // future tile delta + current tile - this tile
              let currentDelta = this.unguardedGetDelta(tileX, tileY);
              let delta = Math.max(
                0,
                Math.min(
                  energyToDisperse * mask[deltaX + deltaY * 3],
                  currentEnergy - this.unguardedGet(tileX, tileY) - currentDelta
                )
              );

              this.setDelta(tileX, tileY, delta);
            }
          }
        }
      }
    }

    for (let x = 0, l = this.width; x < l; x++) {
      for (let y = 0, k = this.height; y < k; y++) {
        if ((currentEnergy = this.get(x, y)) && currentEnergy !== undefined && currentEnergy > 1) {
          energyToLoss = currentEnergy * this.loss;
          this.setDelta(x, y, -energyToLoss);
        }
      }
    }

    for (let x = 0, l = this.width; x < l; x++) {
      for (let y = 0, k = this.height; y < k; y++) {
        this.set(x, y, this.addEnergy(this.unguardedGet(x, y), this.unguardedGetDelta(x, y)));
      }
    }
  }

  tick() {
    this.calculateFlow();
    this.resetDelta();
  }
}
