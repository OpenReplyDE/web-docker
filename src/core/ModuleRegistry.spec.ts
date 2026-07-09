import { describe, it, expect, afterEach, vi } from "vitest";
import ModuleRegistry from "~/core/ModuleRegistry";
import { Asset } from "~/core/Asset";
import AssetFactory from "~/core/AssetFactory";
import { ModuleConfig } from "~/core/ModuleConfig";

const asset: Asset = {
  async: false,
  name: "chunk1.js",
  position: undefined,
  priority: 1,
  src: "http://src/1",
  deferred: false,
  type: "js",
};

const config: ModuleConfig = {
  pages: [],
  module: "test-module",
  type: "page",
  version: "1.0.0",
  assets: [asset],
};

afterEach(() => {
  document.body.innerHTML = "";
  document.head.innerHTML = "";
});

describe("ModuleRegistry", () => {
  it("constructs", async () => {
    const moduleRegistry = new ModuleRegistry(false);

    expect(moduleRegistry).toBeTruthy();
  });
  it("adds new component service", async () => {
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };
    const moduleRegistry = new ModuleRegistry(false, assetFactoryMock);

    const service = await moduleRegistry.add(config);

    expect(service.module).toBe("test-module");
  });

  it("does not allow services with similar custom component names", async () => {
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };
    const moduleRegistry = new ModuleRegistry(false, assetFactoryMock);

    await moduleRegistry.add(config);

    await expect(
      async () => await moduleRegistry.add(config),
    ).rejects.toThrow();
  });

  it("does not allow services with similar journey names", async () => {
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };
    const moduleRegistry = new ModuleRegistry(false, assetFactoryMock);

    await moduleRegistry.add(config);

    await expect(
      async () => await moduleRegistry.add(config),
    ).rejects.toThrow();
  });

  it("does not allow services with duplicate assets", async () => {
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };
    const moduleRegistry = new ModuleRegistry(false, assetFactoryMock);

    const assetB: Asset = {
      async: false,
      name: "chunk2.js",
      position: undefined,
      priority: 1,
      src: "http://src/1",
      deferred: false,
      type: "js",
    };

    const configA: ModuleConfig = {
      pages: [],
      module: "test",
      type: "page",
      version: "1.0.0",
      assets: [asset, assetB],
    };

    await moduleRegistry.add(config);

    await expect(
      async () => await moduleRegistry.add(configA),
    ).rejects.toThrow();
  });

  it("overrides service with similar module names", () => {
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };
    const moduleRegistry = new ModuleRegistry(false, assetFactoryMock);

    const initialConfig: ModuleConfig = {
      pages: [],
      type: "page",
      version: "1.0.0",
      assets: [asset],
      module: "test-module",
    };

    moduleRegistry.add(initialConfig);

    const configOverride: ModuleConfig = {
      pages: [],
      version: "1.0.0",
      type: "page",
      assets: [asset],
      module: "test-module",
    };

    moduleRegistry.addReplace(configOverride);

    expect(document.body).toMatchSnapshot();
  });

  it("does return service by name", async () => {
    // Setup test
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };
    const moduleRegistry = new ModuleRegistry(false, assetFactoryMock);

    const service = await moduleRegistry.add(config);
    // End test setup

    expect(moduleRegistry.getByModuleName(config.module)).toEqual(service);
  });

  it("destroy() calls remove() on all registered services", async () => {
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };
    const moduleRegistry = new ModuleRegistry(false, assetFactoryMock);
    const service = await moduleRegistry.add(config);
    const removeSpy = vi.spyOn(service, "remove");

    moduleRegistry.destroy();

    expect(removeSpy).toHaveBeenCalledOnce();
  });

  it("throws when requested service does not exist in registry", async () => {
    // Setup test
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };
    const moduleRegistry = new ModuleRegistry(false, assetFactoryMock);
    // End test setup

    expect(() =>
      moduleRegistry.getByModuleName("invalid-module-name"),
    ).toThrowError(
      "A module with name: invalid-module-name has not been registered.",
    );
  });
});
