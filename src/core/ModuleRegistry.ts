import { ModuleService } from "./ModuleService";
import AssetFactory from "~/core/AssetFactory";
import { Logger } from "~/core/Logger";
import { Config } from "~/core/Config";
import { IncludeType, ModuleConfig } from "~/core/ModuleConfig";
import { PageModuleService } from "~/core/PageModuleService";
import { ObservedModuleService } from "~/core/ObservedModuleService";

export interface ModuleRegistryInterface {
  add(config: Config): Promise<ModuleService>;
  getByModuleName(moduleName: string): ModuleService
}

export interface ModuleServiceConstructor {
  new(config: ModuleConfig,
      assetFactory: AssetFactory,
      logEvents: boolean): ModuleService;
}

class ModuleRegistry implements ModuleRegistryInterface {
  private readonly logger;
  private readonly moduleServices: ModuleService[] = [];
  private readonly moduleServiceFactories: {
    type: string;
    constructor: ModuleServiceConstructor;
  }[] = [];
  constructor(
    private readonly logEvents: boolean,
    private readonly assetFactory = new AssetFactory()
  ) {
    this.logger = new Logger("ModuleRegistry", logEvents);
  }

  getByModuleName(moduleName: string): ModuleService {
    const service = this.moduleServices.find(
      (moduleService) => moduleService.module && moduleService.module === moduleName
    );
    if (!service) {
      throw Error(`A module with name: ${moduleName} has not been registered.`);
    }

    return service;
  }

  add(config: ModuleConfig): Promise<ModuleService> {
    const registeredAssets: string[] = this.moduleServices.reduce<string[]>(
      (prev, service) => service.assetSources.concat(prev),
      []
    );

    const intersection = registeredAssets.filter((value) =>
      config.assets.map((asset) => asset.src).includes(value)
    );

    if (intersection.length > 0) {
      throw Error(
        `A module including same sources: ${intersection} has already been registered. ${JSON.stringify(
          config
        )}`
      );
    }

    if (config.module) {
      const registeredModule: string[] = this.moduleServices
        .map((service) => service.module)
        .filter((item): item is string => !!item);

      if (registeredModule.includes(config.module)) {
        throw Error(
          `A module with same name: ${
            config.module
          } has already been registered. ${JSON.stringify(config)}`
        );
      }
    }

    return this.addModule(config);
  }

  // overrides existing module service if one is already registered
  addReplace(config: ModuleConfig): Promise<ModuleService> {
    if (config.module) {
      let foundIndex = -1;
      const service = this.moduleServices.find((service, index) => {
        foundIndex = index;
        return service.module && service.module === config.module;
      });

      if (service && foundIndex > -1) {
        this.moduleServices.splice(foundIndex, 1);
        service.remove();
      }
    }

    return this.addModule(config);
  }

  private async addModule(moduleConfig: ModuleConfig): Promise<ModuleService> {
    if (moduleConfig.type === "page") {
      const service = new PageModuleService(
        moduleConfig,
        this.assetFactory,
        this.logEvents
      );
      await service.load();
      this.moduleServices.push(service);
      this.logger.log("registered page module: ", moduleConfig.module);
      return service;
    } else if (moduleConfig.type === "observed") {
      const service = new ObservedModuleService(
        moduleConfig,
        this.assetFactory,
        this.logEvents
      );
      this.moduleServices.push(service);
      this.logger.log("registered observed module: ", moduleConfig.module);
      return service;
    } else {
      const factory = this.moduleServiceFactories.find(
        (factory) => factory.type === moduleConfig.type
      );
      if (factory) {
        const service = new factory.constructor(
          moduleConfig,
          this.assetFactory,
          this.logEvents
        );
        await service.load();
        this.moduleServices.push(service);
        this.logger.log("registered module: ", moduleConfig.module);
        return service;
      }
    }
    throw Error(`No module service factory found for type: ${moduleConfig.type}`);
  }

  public destroy(): void {
    this.moduleServices.forEach((service) => service.remove());
  }

  public addModuleServiceFactory({
    type,
    constructor,
  }: {
    type: IncludeType;
    constructor: ModuleServiceConstructor;
  }): void {
    if (type === "page" || type === "observed") {
      throw Error(
        `Cannot register factory for reserved type: ${type}.`
      );
    }
    this.moduleServiceFactories.push({ type, constructor });
  }
}

export default ModuleRegistry;
