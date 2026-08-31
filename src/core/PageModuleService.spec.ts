import { describe, it, expect, beforeEach, vi } from "vitest";
import { Asset } from "~/core/Asset";
import AssetFactory from "~/core/AssetFactory";

import { PageModuleConfig } from "~/core/ModuleConfig";
import { PageModuleService } from "~/core/PageModuleService";

const asset: Asset = {
  async: false,
  name: "chunk1.js",
  position: undefined,
  priority: 1,
  src: "http://src/1",
  deferred: false,
  type: "js",
};

describe("PageModuleService", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });
  it("constructs", () => {
    window.location.href = "http://localhost/match";
    const config: PageModuleConfig = {
      assets: [asset],
      type: "page",
      module: "test-module",
      pages: [".*"],
      version: "",
    };
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };
    const service = new PageModuleService(config, assetFactoryMock);

    expect(service).toBeTruthy();
  });

  it("injects assets if URL of the page matches", async () => {
    window.location.href = "http://localhost/match";
    const config: PageModuleConfig = {
      assets: [asset],
      type: "page",
      module: "test-module",
      pages: [".*"],
      version: "",
    };
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };

    const service = new PageModuleService(config, assetFactoryMock);

    await service.load();

    expect(document.body).toMatchSnapshot();
  });

  it("injects assets without custom element if URL of the page matches", async () => {
    window.location.href = "http://localhost/match";
    const config: PageModuleConfig = {
      assets: [asset],
      type: "page",
      module: "test-module",
      pages: [".*"],
      version: "",
    };
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };

    const service = new PageModuleService(config, assetFactoryMock);

    await service.load();

    expect(document.body).toMatchSnapshot();
  });

  it("injects assets if empty page arrays was provided", async () => {
    window.location.href = "http://localhost/match";
    const config: PageModuleConfig = {
      assets: [asset],
      type: "page",
      module: "test-module",
      pages: [],
      version: "",
    };
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };

    const service = new PageModuleService(config, assetFactoryMock);

    await service.load();

    expect(document.body).toMatchSnapshot();
  });

  it("remove() removes hashchange listener when not yet loaded", () => {
    window.location.href = "http://localhost/no-match";
    const config: PageModuleConfig = {
      assets: [asset],
      type: "page",
      module: "test-module",
      pages: ["does-not-match"],
      version: "",
    };
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };

    const removeSpy = vi.spyOn(window, "removeEventListener");
    const service = new PageModuleService(config, assetFactoryMock);
    service.remove();

    expect(removeSpy).toHaveBeenCalledWith("hashchange", expect.any(Function));
    removeSpy.mockRestore();
  });

  it("remove() does not remove hashchange listener after successful load", async () => {
    window.location.href = "http://localhost/match";
    const config: PageModuleConfig = {
      assets: [asset],
      type: "page",
      module: "test-module",
      pages: ["match"],
      version: "",
    };
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };

    const service = new PageModuleService(config, assetFactoryMock);
    await service.load();

    const removeSpy = vi.spyOn(window, "removeEventListener");
    service.remove();

    expect(removeSpy).not.toHaveBeenCalledWith(
      "hashchange",
      expect.any(Function),
    );
    removeSpy.mockRestore();
  });

  it("injects assets if hash matches page pattern", async () => {
    window.location.href = "http://localhost/#/checkout";
    const config: PageModuleConfig = {
      assets: [asset],
      type: "page",
      module: "test-module",
      pages: ["#/checkout"],
      version: "",
    };
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };

    const service = new PageModuleService(config, assetFactoryMock);
    await service.load();

    expect(document.body).toMatchSnapshot();
  });

  it("injects assets on hashchange when hash matches page pattern", async () => {
    window.location.href = "http://localhost/";
    const config: PageModuleConfig = {
      assets: [asset],
      type: "page",
      module: "test-module",
      pages: ["#/checkout"],
      version: "",
    };
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };

    const service = new PageModuleService(config, assetFactoryMock);
    await service.load();

    expect(document.body.innerHTML).toBe("");

    window.location.hash = "#/checkout";
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    await new Promise((r) => setTimeout(r, 0));

    expect(document.body).toMatchSnapshot();
  });

  it("removes hashchange listener after load triggered by hashchange", async () => {
    window.location.href = "http://localhost/";
    const config: PageModuleConfig = {
      assets: [asset],
      type: "page",
      module: "test-module",
      pages: ["#/checkout"],
      version: "",
    };
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };

    const service = new PageModuleService(config, assetFactoryMock);
    await service.load();

    window.location.hash = "#/checkout";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await new Promise((r) => setTimeout(r, 0));

    const removeSpy = vi.spyOn(window, "removeEventListener");
    service.remove();

    expect(removeSpy).not.toHaveBeenCalledWith("hashchange", expect.any(Function));
    removeSpy.mockRestore();
  });

  it("does not inject assets if URL of the page does not match", async () => {
    window.location.href = "http://localhost/match";
    const config: PageModuleConfig = {
      assets: [asset],
      type: "page",
      module: "test-module",
      pages: ["does-not-match"],
      version: "",
    };
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };

    const service = new PageModuleService(config, assetFactoryMock);

    await service.load();

    expect(document.body).toMatchSnapshot();
  });

  it("injects assets if URL of the page matches the given regex pattern - as string", async () => {
    window.location.href = "http://localhost/matches/page";
    const config: PageModuleConfig = {
      assets: [asset],
      type: "page",
      module: "test-module",
      pages: ["/matches/page"],
      version: "",
    };
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };

    const service = new PageModuleService(config, assetFactoryMock);

    await service.load();

    expect(document.body).toMatchSnapshot();
  });

  it("injects assets if URL of the page matches subpath of the given regex pattern - as string", async () => {
    window.location.href = "http://localhost/matches/page";
    const config: PageModuleConfig = {
      assets: [asset],
      type: "page",
      module: "test-module",
      pages: ["/matches"],
      version: "",
    };
    const assetFactoryMock: AssetFactory = {
      create(): (HTMLLinkElement | HTMLScriptElement)[] {
        return [document.createElement("link")];
      },
    };

    const service = new PageModuleService(config, assetFactoryMock);

    await service.load();

    expect(document.body).toMatchSnapshot();
  });
});
