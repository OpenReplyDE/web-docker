import { ModuleService } from "~/core/ModuleService";
import ModuleRegistry from "~/core/ModuleRegistry";

declare module "~/core/ModuleConfig" {
  interface IncludeTypeMap {
    customType: string;
  }
}

class ServiceExtension implements ModuleService {
  load(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  get assetSources(): string[] {
    throw new Error("Method not implemented.");
  }
  get module(): string {
    throw new Error("Method not implemented.");
  }
  remove(): void {
    throw new Error("Method not implemented.");
  }
}

const registry = new ModuleRegistry(true);
registry.addModuleServiceFactory({
  type: "customType",
  constructor: ServiceExtension,
});
