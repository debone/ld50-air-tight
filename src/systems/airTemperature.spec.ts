import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AirTemperature } from "./airTemperature";

describe("Air temperature", () => {
  beforeEach(() => {});

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates", () => {
    const airTemp = new AirTemperature(2, 2);

    expect(airTemp.airTemperature.length).toBe(4);
    expect(airTemp.airTemperature).toEqual([1, 1, 1, 1]);
  });

  it("find disperse correctly", () => {
    let expectedDisperse;

    let airTemp = new AirTemperature(2, 1);
    expect(airTemp.airTemperature.length).toBe(2);
    expect(airTemp.airTemperature).toEqual([1, 1]);
    expect(airTemp.calculateDisperse(0, 0)).toEqual([0, 0, 0, 0, 0, 1, 0, 0, 0]);

    airTemp = new AirTemperature(4, 4);
    expect(airTemp.airTemperature.length).toBe(16);

    expectedDisperse = 1 / 8;
    expect(airTemp.calculateDisperse(1, 1)).toEqual([
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      0,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
    ]);

    airTemp.block(0, 0);
    expectedDisperse = 1 / 7;
    expect(airTemp.calculateDisperse(1, 1)).toEqual([
      0,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      0,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
    ]);

    expectedDisperse = 1 / 8;
    expect(airTemp.calculateDisperse(2, 2)).toEqual([
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      0,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
    ]);
    airTemp.unblock(0, 0);
    expect(airTemp.calculateDisperse(2, 2)).toEqual([
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      0,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
    ]);

    airTemp.block(0, 0);
    airTemp.block(1, 0);
    airTemp.block(2, 0);
    expectedDisperse = 1 / 5;
    expect(airTemp.calculateDisperse(1, 1)).toEqual([
      0,
      0,
      0,
      expectedDisperse,
      0,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
    ]);

    airTemp.block(0, 1);
    airTemp.block(2, 1);
    expectedDisperse = 1 / 3;
    expect(airTemp.calculateDisperse(1, 1)).toEqual([
      0,
      0,
      0,
      0,
      0,
      0,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
    ]);

    airTemp.block(0, 2);
    airTemp.block(1, 2);
    airTemp.block(2, 2);
    airTemp.unblock(2, 1);
    expect(airTemp.calculateDisperse(1, 1)).toEqual([0, 0, 0, 0, 0, 1, 0, 0, 0]);
  });

  it("flows single points", () => {
    let airTemp = new AirTemperature(2, 1);

    airTemp.conductivity = 0.5;
    airTemp.loss = 0;

    airTemp.set(0, 0, 2);
    expect(airTemp.airTemperature).toEqual([2, 1]);

    airTemp.calculateFlow();
    expect(airTemp.airTemperatureDelta).toEqual([0, 1]);
    expect(airTemp.airTemperature).toEqual([2, 2]);
    airTemp.resetDelta();

    airTemp = new AirTemperature(2, 1);

    airTemp.conductivity = 0.25;
    airTemp.loss = 0;

    airTemp.set(0, 0, 2);
    expect(airTemp.airTemperature).toEqual([2, 1]);

    airTemp.calculateFlow();
    expect(airTemp.airTemperatureDelta).toEqual([0, 0.5]);
    expect(airTemp.airTemperature).toEqual([2, 1.5]);
    airTemp.resetDelta();

    airTemp.calculateFlow();
    expect(airTemp.airTemperatureDelta).toEqual([0, 0.5]);
    expect(airTemp.airTemperature).toEqual([2, 2]);
    airTemp.resetDelta();
  });

  it("flows multiple points", () => {
    let airTemp = new AirTemperature(3, 1);

    airTemp.conductivity = 0.5;
    airTemp.loss = 0;

    airTemp.set(0, 0, 2);
    airTemp.set(2, 0, 2);
    expect(airTemp.airTemperature).toEqual([2, 1, 2]);

    airTemp.calculateFlow();
    expect(airTemp.airTemperatureDelta).toEqual([0, 1, 0]);
    expect(airTemp.airTemperature).toEqual([2, 2, 2]);
  });

  it("flows around corners", () => {
    let airTemp = new AirTemperature(3, 2);

    airTemp.conductivity = 0.5;
    airTemp.loss = 0;

    airTemp.set(0, 0, 2);
    airTemp.block(1, 0);

    expect(airTemp.airTemperature).toEqual([2, 0, 1, 1, 1, 1]);

    airTemp.calculateFlow();
    expect(airTemp.airTemperatureDelta).toEqual([0, 0, 0, 0.5, 0.5, 0]);
    expect(airTemp.airTemperature).toEqual([2, 0, 1, 1.5, 1.5, 1]);
    airTemp.resetDelta();

    airTemp.calculateFlow();
    expect(airTemp.airTemperatureDelta).toEqual([0, 0, 0.1875, 0.5, 0.5, 0.1875]);
    expect(airTemp.airTemperature).toEqual([2, 0, 1.1875, 2, 2, 1.1875]);
    airTemp.resetDelta();

    airTemp = new AirTemperature(3, 2);

    airTemp.conductivity = 0.5;
    airTemp.loss = 0;

    airTemp.set(0, 0, 2);
    airTemp.set(2, 0, 2);
    airTemp.block(1, 0);

    expect(airTemp.airTemperature).toEqual([2, 0, 2, 1, 1, 1]);

    airTemp.calculateFlow();
    expect(airTemp.airTemperatureDelta).toEqual([0, 0, 0, 0.5, 1, 0.5]);
    expect(airTemp.airTemperature).toEqual([2, 0, 2, 1.5, 2, 1.5]);
    airTemp.resetDelta();

    airTemp.calculateFlow();
    expect(airTemp.airTemperatureDelta).toEqual([0, 0, 0, 0.5, 0, 0.5]);
    expect(airTemp.airTemperature).toEqual([2, 0, 2, 2, 2, 2]);
    airTemp.resetDelta();
  });

  it("flows around corners", () => {
    let airTemp = new AirTemperature(3, 2);

    airTemp.conductivity = 0.5;
    airTemp.loss = 0;

    airTemp.set(0, 0, 2);
    airTemp.block(1, 0);

    expect(airTemp.airTemperature).toEqual([2, 0, 1, 1, 1, 1]);

    airTemp.calculateFlow();
    expect(airTemp.airTemperatureDelta).toEqual([0, 0, 0, 0.5, 0.5, 0]);
    expect(airTemp.airTemperature).toEqual([2, 0, 1, 1.5, 1.5, 1]);
    airTemp.resetDelta();
  });

  it("dies out", () => {
    let airTemp = new AirTemperature(3, 1);

    airTemp.conductivity = 0.5;
    airTemp.loss = 1;

    airTemp.set(0, 0, 2);

    expect(airTemp.airTemperature).toEqual([2, 1, 1]);

    airTemp.calculateFlow();
    expect(airTemp.airTemperatureDelta).toEqual([-2, 1, 0]);
    expect(airTemp.airTemperature).toEqual([1, 2, 1]);
    airTemp.resetDelta();

    airTemp.calculateFlow();
    expect(airTemp.airTemperatureDelta).toEqual([0.5, -2, 0.5]);
    expect(airTemp.airTemperature).toEqual([1.5, 1, 1.5]);
    airTemp.resetDelta();
  });

  it("down corner", () => {
    let airTemp = new AirTemperature(2, 2);

    airTemp.conductivity = 0.5;
    airTemp.loss = 0.2;

    airTemp.set(1, 1, 8);
    airTemp.set(0, 0, 2.6);
    airTemp.set(0, 1, 2.6);
    airTemp.set(1, 0, 2.6);

    expect(airTemp.airTemperature).toEqual([2.6, 2.6, 2.6, 8]);

    airTemp.calculateFlow();
    //expect(airTemp.airTemperatureDelta).toEqual([2.333333333333333, 2.333333333333333, 2.333333333333333, -2]);
    //expect(airTemp.airTemperature).toEqual([3.333333333333333, 3.333333333333333, 3.333333333333333, 8]);
    console.log("delta", airTemp.airTemperatureDelta);
    console.log("temp", airTemp.airTemperature);
    airTemp.resetDelta();

    console.log("------------------------");

    airTemp.calculateFlow();
    console.log("delta", airTemp.airTemperatureDelta);
    console.log("temp", airTemp.airTemperature);
    airTemp.resetDelta();

    console.log("------------------------");

    airTemp.calculateFlow();
    console.log("delta", airTemp.airTemperatureDelta);
    console.log("temp", airTemp.airTemperature);
    airTemp.resetDelta();
  });

  it.todo("big square", () => {
    let airTemp = new AirTemperature(5, 5);
    let expectedDisperse;

    airTemp.loss = 0.2;

    airTemp.set(2, 2, 10);

    expect(airTemp.airTemperature).toEqual([
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ]);

    // 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,

    airTemp.calculateFlow();
    expectedDisperse = (10 * 0.7) / 8;
    expect(airTemp.airTemperatureDelta).toEqual([
      0,
      0,
      0,
      0,
      0,
      0,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      0,
      0,
      expectedDisperse,
      -2,
      expectedDisperse,
      0,
      0,
      expectedDisperse,
      expectedDisperse,
      expectedDisperse,
      0,
      0,
      0,
      0,
      0,
      0,
    ]);
    expect(airTemp.airTemperature).toEqual([
      1,
      1,
      1,
      1,
      1,
      1,
      1 + expectedDisperse,
      1 + expectedDisperse,
      1 + expectedDisperse,
      1,
      1,
      1 + expectedDisperse,
      8,
      1 + expectedDisperse,
      1,
      1,
      1 + expectedDisperse,
      1 + expectedDisperse,
      1 + expectedDisperse,
      1,
      1,
      1,
      1,
      1,
      1,
    ]);
    airTemp.resetDelta();

    airTemp.calculateFlow();

    console.log(airTemp.airTemperatureDelta);
    /*
    [
      0.1640625, 0.328125, 0.4921875, 0.328125, 0.1640625,
      0.328125, 0.653125, 0.32499999999999996, 0.32499999999999996, 0.328125, 
      0.4921875, 0.653125, -1.6, 0.32499999999999996, 0.4921875,
      0.328125, 0.32499999999999996, 0.32499999999999996, 0.32499999999999996, 0.328125,
      0.1640625, 0.328125, 0.4921875, 0.328125, 0.1640625,
    ];
    */

    expect(airTemp.airTemperatureDelta).toEqual([0.5, -2, 0.5]);
    expect(airTemp.airTemperature).toEqual([1.5, 1, 1.5]);
    airTemp.resetDelta();
  });
});
