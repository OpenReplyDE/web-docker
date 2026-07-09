import { describe, it, expect, vi, afterEach } from "vitest";
import AssetFactory from "~/core/AssetFactory";
import { ObservedModuleConfig } from "~/core/ModuleConfig";
import { ObservedModuleService } from "~/core/ObservedModuleService";
import { Asset } from "~/core/Asset";

const asset: Asset = {
  async: false,
  name: "chunk1.js",
  position: undefined,
  priority: 1,
  src: "http://src/1",
  deferred: false,
  type: "js",
};

const config: ObservedModuleConfig = {
  assets: [asset],
  type: "observed",
  module: "test-module",
  selector: ".my-element",
  version: "",
};

const assetFactoryMock: AssetFactory = {
  create(): (HTMLLinkElement | HTMLScriptElement)[] {
    return [document.createElement("link")];
  },
};

afterEach(() => {
  document.body.innerHTML = "";
  document.head.innerHTML = "";
});

describe("ObservedModuleService", () => {
  it("constructs", () => {
    const service = new ObservedModuleService(config, assetFactoryMock, false);
    expect(service).toBeTruthy();
  });

  it("remove() disconnects MutationObserver", () => {
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, "disconnect");
    const service = new ObservedModuleService(config, assetFactoryMock, false);

    service.remove();

    expect(disconnectSpy).toHaveBeenCalledOnce();
    disconnectSpy.mockRestore();
  });

  it("remove() is idempotent — second call does not throw", () => {
    const service = new ObservedModuleService(config, assetFactoryMock, false);
    service.remove();
    expect(() => service.remove()).not.toThrow();
  });
});
