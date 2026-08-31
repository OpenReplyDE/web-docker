import { Asset, AssetLink, AssetPosition, AssetScript } from "~/core/Asset";

export type HtmlAsset =
  | HTMLLinkElement
  | HTMLScriptElement
  | HTMLStyleElement;
export default class AssetFactory {
  private static buildTagScript(attr: AssetScript): HTMLScriptElement {
    const script = document.createElement("script");
    script.src = attr.src;
    if (attr.buildType === "modern") {
      script.type = "module";
      script.setAttribute("crossorigin", "");
    } else {
      script.type = "text/javascript";
      if (attr.async) script.setAttribute("async", "");
    }

    if (attr.priority)
      script.setAttribute("data-priority", attr.priority.toString());

    return script;
  }

  // TEMPORARY FIX: fragment CSS is injected via `@import ... layer(bcmf.<module>)`
  // inside a <style> instead of a plain <link>, so every fragment's styles land
  // in a cascade layer that ranks below the shell's own styles. This lets the
  // shell (Tailwind v4) win over fragments (mix of Tailwind v3 and v4) without
  // cross-pollution, while still sharing styles. Done at runtime here so already
  // deployed fragments need no rebuild. Requires the shell to pre-declare the
  // layer order first: `@layer bcmf, theme, base, components, utilities;`.
  private static buildTagLink(
    attr: AssetLink,
    module: string
  ): HTMLStyleElement {
    const style = document.createElement("style");
    const media = attr.media ? ` ${attr.media}` : "";
    style.textContent = `@import url("${attr.src}") layer(bcmf.${module})${media};`;

    if (attr.priority)
      style.setAttribute("data-priority", attr.priority.toString());

    return style;
  }

  public create(
    assets: Asset[],
    position: AssetPosition = "head",
    module = "",
    countryCode?: string
  ): HtmlAsset[] {
    return (
      countryCode
        ? assets.filter(
            (asset) =>
              typeof asset.countries !== "object" ||
              asset.countries.includes(countryCode)
          )
        : assets
    )
      .filter((asset) => (asset.position ?? "head") === position)
      .sort((a, b) => {
        if (!a.priority || !b.priority) return 0;
        if (a.priority < b.priority) {
          return 1;
        } else if (a.priority > b.priority) {
          return -1;
        }
        return 0;
      })
      .map((entry) => {
        switch (entry.type) {
          case "css":
            return AssetFactory.buildTagLink(entry, module);
          case "js":
            return AssetFactory.buildTagScript(entry);
        }
      })
      .filter((item): item is HtmlAsset => !!item);
  }
}
