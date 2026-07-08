import { expect, describe, it, vi, Mock, afterEach } from "vitest";
import { RemoteConfigurationService } from "~/core/RemoteConfigurationService";
import createFetchMock from "vitest-fetch-mock";
import { Config } from "~/core/Config";

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

describe("RemoteConfigurationService", function () {
  afterEach(() => {
    fetchMock.resetMocks();
  });

  it("should disable fetch when no file has been specified", async function () {
    fetchMock.mockResponse(JSON.stringify([{ journey: "test-journey" }]));

    const components = await new RemoteConfigurationService({}).fetch();
    expect(components).toBeUndefined();
  });

  it("should fetch configuration without specifying any CONFIG_FILE_PATH", async function () {
    fetchMock.mockResponse(JSON.stringify([{ journey: "test-journey" }]));
    const remoteConfigurationService = new RemoteConfigurationService({
      configFilePath: "/config.json",
    });
    const components = await remoteConfigurationService.fetch();
    expect((fetch as Mock).mock.calls.length).toEqual(1);
    expect((fetch as Mock).mock.calls[0][0]).toEqual("/config.json");
    expect(components).toEqual([{ journey: "test-journey" }]);
  });

  it("should fetch configuration from URL set as a parameter to fetchComponents when its present", async function () {
    fetchMock.mockResponse(JSON.stringify([{ journey: "test-journey" }]));

    const remoteConfigurationService = new RemoteConfigurationService({
      configFilePath: "/config.json",
    });
    const components = await remoteConfigurationService.fetch();
    expect((fetch as Mock).mock.calls.length).toEqual(1);
    expect((fetch as Mock).mock.calls[0][0]).toEqual("/config.json");
    expect(components).toEqual([{ journey: "test-journey" }]);
  });

  it("should return empty array as a fallback", async function () {
    fetchMock.mockReject(new Error("Test error"));

    const remoteConfigurationService = new RemoteConfigurationService({
      configFilePath: "/config.json",
    });
    const components = await remoteConfigurationService.fetch();
    expect(components).toEqual([]);
  });

  it("reorders page modules in front of other modules ", async function () {
    const configs = [
      {
        type: "observed" as const,
        version: "1.0.0",
        assets: [],
        selector: "a",
        module: "c",
        uses: { b: "c" },
      },
      {
        type: "page" as const,
        pages: [],
        version: "1.0.0",
        assets: [],
        module: "c",
        exposes: { a: "b" },
      },
    ];

    const configService = new RemoteConfigurationService({});

    const reorderedConfigs = configService.reorderPageConfigs(configs);

    expect(reorderedConfigs[0]).toEqual({
      type: "page" as const,
      pages: [],
      version: "1.0.0",
      assets: [],
      module: "c",
      exposes: { a: "b" },
    });

    expect(reorderedConfigs[1]).toEqual({
      type: "observed" as const,
      version: "1.0.0",
      assets: [],
      selector: "a",
      module: "c",
      uses: { b: "c" },
    });
  });

  it("reorders exposing modules in front of using modules", async function () {
    const configs = [
      {
        type: "page" as const,
        pages: [],
        version: "1.0.0",
        assets: [],
        module: "some-module",
        use: { vue: "vue-module" },
      },
      {
        type: "page" as const,
        module: "vue-module",
        pages: [],
        version: "1.0.0",
        assets: [],
        exposes: { vue: "vue-module" },
      },
    ];

    const configService = new RemoteConfigurationService({});

    const reorderedConfigs = configService.reorderPageConfigs(configs);

    expect(reorderedConfigs).toEqual([
      {
        type: "page" as const,
        module: "vue-module",
        pages: [],
        version: "1.0.0",
        assets: [],
        exposes: { vue: "vue-module" },
      },
      {
        type: "page" as const,
        pages: [],
        version: "1.0.0",
        assets: [],
        module: "some-module",
        use: { vue: "vue-module" },
      },
    ]);
  });

  it("reorders exposing modules in front of using modules for multiple modules", async function () {
    const configs: Config[] = [
      {
        type: "page" as const,
        pages: [],
        version: "1.0.0",
        assets: [],
        module: "vue-module",
        use: { react: "react-module" },
        exposes: { vue: "vue-module" },
      },
      {
        type: "page" as const,
        pages: [],
        version: "1.0.0",
        assets: [],
        module: "some-module",
        use: { vue: "vue-module" },
      },
      {
        type: "page" as const,
        module: "react-module",
        pages: [],
        version: "1.0.0",
        assets: [],
        exposes: { react: "react-module" },
      },
    ];

    const configService = new RemoteConfigurationService({});

    const reorderedConfigs = configService.reorderPageConfigs(configs);

    expect(reorderedConfigs[0]).toEqual({
      type: "page" as const,
      module: "react-module",
      pages: [],
      version: "1.0.0",
      assets: [],
      exposes: { react: "react-module" },
    });
    expect(reorderedConfigs[1]).toEqual({
      type: "page" as const,
      pages: [],
      version: "1.0.0",
      assets: [],
      module: "vue-module",
      use: { react: "react-module" },
      exposes: { vue: "vue-module" },
    });
    expect(reorderedConfigs[2]).toEqual({
      type: "page" as const,
      pages: [],
      version: "1.0.0",
      assets: [],
      module: "some-module",
      use: { vue: "vue-module" },
    });
  });
});
