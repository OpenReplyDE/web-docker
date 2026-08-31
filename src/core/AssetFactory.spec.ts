import { describe, it, expect } from "vitest";
import AssetFactory from "~/core/AssetFactory";
import { AssetLink, AssetScript } from "~/core/Asset";

describe("AssestFactory", () => {
  it("constructs script asset", () => {
    const assetFactory = new AssetFactory();
    const asset: AssetScript = {
      src: "src/",
      type: "js",
    };

    const element = assetFactory.create([asset]);

    expect(element).not.toBeNull();

    expect(element).toMatchSnapshot();
  });

  it("constructs link asset", () => {
    const assetFactory = new AssetFactory();
    const asset: AssetLink = {
      src: "/src/",
      type: "css",
    };

    const element = assetFactory.create([asset], "head", "raffle-teasers");

    expect(element).not.toBeNull();

    expect(element).toMatchSnapshot();
  });

  it("wraps css in a @import layered by module (temporary fix)", () => {
    const assetFactory = new AssetFactory();
    const asset: AssetLink = {
      src: "/src/",
      type: "css",
    };

    const [element] = assetFactory.create([asset], "head", "raffle-teasers");

    expect(element.tagName).toBe("STYLE");
    expect(element.textContent).toBe(
      '@import url("/src/") layer(bcmf.raffle-teasers);'
    );
  });

  it("constructs multiple assets of different types", () => {
    const assetFactory = new AssetFactory();
    const asset: AssetLink = {
      src: "/src/",
      type: "css",
    };

    const asset2: AssetScript = {
      src: "/src/",
      type: "js",
    };

    const element = assetFactory.create([asset, asset2]);

    expect(element).not.toBeNull();

    expect(element).toMatchSnapshot();
  });

  it("ignores the asset if it does not match the position argument", () => {
    const assetFactory = new AssetFactory();
    const asset: AssetLink = {
      src: "/src/",
      type: "css",
      position: "head",
    };

    const asset2: AssetScript = {
      src: "/src/",
      type: "js",
      position: "body",
    };

    const element = assetFactory.create([asset, asset2], "head");

    expect(element).not.toBeNull();

    expect(element).toMatchSnapshot();
  });

  it("assumes default head position for assets if the asset does not specify", () => {
    const assetFactory = new AssetFactory();
    const asset: AssetLink = {
      src: "/src/",
      type: "css",
    };

    const element = assetFactory.create([asset], "head");

    expect(element).not.toBeNull();

    expect(element).toMatchSnapshot();
  });

  it("creates list in order of asset priority", () => {
    const assetFactory = new AssetFactory();
    const asset: AssetScript = {
      src: "/src/",
      type: "js",
      priority: 1,
    };

    const asset2: AssetLink = {
      src: "/src2/",
      type: "css",
      priority: 2,
    };

    const element = assetFactory.create([asset, asset2], "head");

    expect(element).not.toBeNull();

    expect(element).toMatchSnapshot();
  });
});
