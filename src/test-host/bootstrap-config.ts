import { Config } from "@testing-library/dom";

(function () {
  const config: Config[] = [];

  window.addEventListener("web-docker:register", (event: Event) => {
    const customEvent = event as CustomEvent;
    config.push(customEvent.detail);
    if (config.length === 2) {
      window.dispatchEvent(new Event("web-docker:load-ready"));
    }
  });

  window.getDockerConfigUrl = function () {
    const jsonConfig = JSON.stringify(config);

    const blob = new Blob([jsonConfig], { type: "application/json" });

    return URL.createObjectURL(blob);
  };
})();
