import { RemoteConfigurationService } from "~/core/RemoteConfigurationService";
import ModuleRegistry from "~/core/ModuleRegistry";
import { ModuleConfigService } from "~/core/ModuleConfig";
import { forEachSeries } from "~/core/utils";
import { Config } from "~/core/Config";
import Scope from "~/core/Scope";

export type WebDockerOptions = {
  configFilePath?: string;
  logEvents?: boolean;
  scope?: string;
};

export class Webdocker {
  constructor(
    options: WebDockerOptions,
    readonly registry: ModuleRegistry = new ModuleRegistry(
      options.logEvents ?? false,
    ),
    readonly moduleConfigService: ModuleConfigService = new ModuleConfigService(),
    readonly remoteConfigurationService: RemoteConfigurationService = new RemoteConfigurationService(
      options,
    ),
    readonly scopeRegistry: Scope = new Scope(options.scope ?? "webdocker"),
  ) {}

  private init() {
    window.addEventListener("pagehide", () => this.registry.destroy(), {
      once: true,
    });
  }

  async run() {
    this.init();
    const remoteConfigurations = await this.remoteConfigurationService.fetch();

    if (remoteConfigurations) {
      const reorderedPageConfigs =
        this.remoteConfigurationService.reorderPageConfigs(
          remoteConfigurations,
        );

      await forEachSeries(reorderedPageConfigs, async (config: Config) => {
        const moduleConfig = this.moduleConfigService.getModuleConfig(config);
        await this.registry.add(moduleConfig);
      });
    }
  }
}
export default Webdocker;
