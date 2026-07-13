import AssetFactory, { HtmlAsset } from "./AssetFactory";
import { Logger } from "~/core/Logger";
import type { PageInclude, PageModuleConfig } from "~/core/ModuleConfig";
import { ModuleService } from "~/core/ModuleService";
import { forEachSeries } from "~/core/utils";

export const ROUTE_CHANGE_EVENT = "webdocker:routechange";

class PageModuleService implements ModuleService {
  private readonly logger: Logger;
  private loaded = false;
  private readonly hashHandler: () => void;

  constructor(
    private readonly config: PageModuleConfig,
    private readonly assetFactory = new AssetFactory(),
    private readonly logEvents: boolean = false,
    private readonly documentBody = document.body,
    private readonly documentHead = document.head,
  ) {
    this.logger = new Logger("PageModuleService", this.logEvents);
    this.assetFactory = assetFactory;
    this.hashHandler = this.handleHashChange.bind(this);
    this.loadListeners();
  }

  private async addLoadEventListeners(asset: HtmlAsset): Promise<void> {
    return new Promise((resolve, reject) => {
      asset.addEventListener("load", () => {
        resolve();
      });
      asset.addEventListener("error", (err: unknown) => {
        reject(err);
      });
    });
  }

  public async load(): Promise<void> {
    if (
      this.config.pages.length === 0 ||
      this.config.pages.some(this.matches)
    ) {
      const headAssets = this.assetFactory.create(this.config.assets, "head");
      const bodyAssets = this.assetFactory.create(this.config.assets, "body");

      if (this.config.exposes) {
        await forEachSeries(headAssets, async (asset) => {
          const loadEventPromise = this.addLoadEventListeners(asset);
          this.documentHead.appendChild(asset);
          await loadEventPromise;
        });

        await forEachSeries(bodyAssets, async (asset) => {
          const loadEventPromise = this.addLoadEventListeners(asset);
          this.documentBody.appendChild(asset);
          await loadEventPromise;
        });
      } else {
        headAssets.forEach((asset) => this.documentHead.appendChild(asset));
        bodyAssets.forEach((asset) => this.documentBody.appendChild(asset));
      }

      this.loaded = true;
      this.cleanupListeners();

      this.logger.log("injected assets in head", headAssets);
      this.logger.log("injected assets in body", bodyAssets);
    }
  }

  private handleHashChange(): void {
    if (this.loaded) return;
    if (this.config.pages.some(this.matches)) {
      this.load();
    }
  }

  private matches = (page: string | PageInclude): boolean => {
    if (this.isPageIncludeSemantics(page)) {
      console.warn(
        "PageInclude semantics are not implemented yet, please use a RegExp instead",
      );
      return false;
    } else {
      return this.matchesPathname(page) || this.matchesHash(page);
    }
  };

  private matchesPathname = (page: string): boolean =>
    !!window.location.pathname.match(new RegExp(page));

  private matchesHash = (page: string): boolean =>
    !!window.location.hash.match(new RegExp(page));

  isPageIncludeSemantics = (
    page: string | PageInclude,
  ): page is PageInclude => {
    return (page as PageInclude).include !== undefined;
  };

  get assetSources(): string[] {
    return this.config.assets.map((asset) => asset.src);
  }

  get module(): string {
    return this.config.module;
  }

  remove(): void {
    if (!this.loaded) {
      this.cleanupListeners();
    }
  }

  private loadListeners() {
    window.addEventListener("hashchange", this.hashHandler);
    // Custom event, Vue does not fire `hashchange` on Hash History Mode, event triggers on custom handler added to vue frontend
    window.addEventListener(ROUTE_CHANGE_EVENT, this.hashHandler);
  }

  private cleanupListeners() {
    window.removeEventListener("hashchange", this.hashHandler);
    window.removeEventListener(ROUTE_CHANGE_EVENT, this.hashHandler);
  }
}
export { PageModuleService };
