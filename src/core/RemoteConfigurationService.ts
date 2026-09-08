import { Logger } from "~/core/Logger";
import { Config } from "~/core/Config";
import { PageModuleConfig } from "~/core/ModuleConfig";
import { WebDockerOptions } from "~/core/Webdocker";

class RemoteConfigurationService {
  private readonly logger;
  private readonly configFilePath: string | undefined = undefined;

  constructor(options: WebDockerOptions) {
    this.logger = new Logger(
      "RemoteConfigurationService",
      options.logEvents ?? false,
    );
    if (!options.configFilePath) {
      this.logger.log(
        `No CONFIG_FILE_PATH has been set. Disabling web docker's remote configs.`,
      );
    } else {
      this.configFilePath = options.configFilePath;
      this.logger.log(
        `Initializing RemoteConfigurationService with CONFIG_FILE_PATH: ${this.configFilePath}.`,
      );
    }
  }

  private async fetchConfigurations(configFilePath: string): Promise<Config[]> {
    try {
      const data = await fetch(configFilePath);
      return await data.json();
    } catch (err) {
      this.logger.log(
        `Could not fetch automatic configuration from: ${configFilePath}. Returning empty array instead.`,
        err,
      );
      return [];
    }
  }

  async fetch(): Promise<Config[] | undefined> {
    if (this.configFilePath) {
      return this.fetchConfigurations(this.configFilePath);
    }
  }

  reorderPageConfigs(configs: Config[]): Config[] {
    const isPage = (config: Config): config is PageModuleConfig =>
      config.type === "page";
    const pages = configs.filter(isPage);
    const rest = configs.filter((config) => !isPage(config));
    const exposers = pages.filter((page) => page.exposes);
    const consumers = pages.filter((page) => !page.exposes);
    return [...this.sortByExposeOrder(exposers), ...consumers, ...rest];
  }

  private sortByExposeOrder(exposers: PageModuleConfig[]): PageModuleConfig[] {
    const sorted: PageModuleConfig[] = [];
    const pending = [...exposers];

    while (pending.length) {
      const next = pending.findIndex(
        (candidate) => !this.dependsOnPending(candidate, pending),
      );

      if (next === -1) {
        sorted.push(...pending);
        break;
      }

      sorted.push(...pending.splice(next, 1));
    }

    return sorted;
  }

  private dependsOnPending(
    candidate: PageModuleConfig,
    pending: PageModuleConfig[],
  ): boolean {
    for (const used in candidate.use) {
      const provider = pending.some(
        (other) => other !== candidate && other.exposes && used in other.exposes,
      );

      if (provider) {
        return true;
      }
    }

    return false;
  }
}

export { RemoteConfigurationService };
