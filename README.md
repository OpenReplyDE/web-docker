# README

The Webdocker is a central registry or [Subject](https://en.wikipedia.org/wiki/Observer_pattern)
to which fragments(web components) can subscribe. Subscribed fragments declare their resources (js or CSS scripts) to the
registry. The registry is responsible for loading the resources.

It is mostly used for delivery of microfrontends to the overall project, providing multiple ways to trigger the assets injection.

### Summary of setup

1. fragment: Next to Web Docker, this repo contains a fragment folder, which mocks the behavior of a fragment
2. test-Host: A vue application that registers the web docker and loads the fragment
3. web docker: contains the docker code responsible for registry and event handling. This is the actual asset that
   is uploaded as a build artifact.
4. tests: A folder containing end-to-end tests for fragment, test-host and web docker (using playwright)

### Observed Modules

Assets for observed modules are initially not injected in page. An observation mechanism examines the page for frequent updates
and injects the assets only if the custom elements associated with the module are present on the page

### Page Modules

These are modules which are injected into the page as soon as the first render is finished.

### Global Modules

These are particular types of page modules which can be used by other modules as shared dependency.   

### Local development

1. run following build commands to create the test fragments
   ```bash
      nvm use
      npm run build:page-module
      npm run build:observed-module
   ```
2. Serve the fragments
   ```bash
      nvm use
      npm run serve:fragments
   ```
3. Serve the test host
   ```bash
      nvm use
      npm run dev:test-host
   ```
4. on the browser, navigate to `http://localhost:5173/test-host.html` to see the test host and the loaded page fragment
NOTE: navigating to `http://localhost:5173` will not show the fragment as the test host is not loaded on the root path

#### Environment variables
logging is disabled by default. To enable logging, set the following environment variable
   
   ```bash
    VITE_APP_LOG_EVENTS=true
   ```

### Configuration

Web Docker loads modules dynamically based on a JSON configuration file. The configuration defines which modules to load, when to load them, and what assets they require.

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for detailed configuration guide.

### Running the Web Docker as NPM package

1. Install the package
   ```bash
      npm install @web-docker/web-docker
   ```
2. Import the package in your project
   ```javascript
      import { WebDocker } from '@openreplyde/web-docker'
   ```
3. Initialize the Web Docker- the default construction does not require any parameters and fetches remote configs per default
   ```javascript
      const webDocker = new WebDocker()
   ```

### Extending the Web Docker with custom Services
Webdocker is designed to be extensible. You can extend the Web Docker with custom services by implementing the `ModuleService` interface.
The custom service can be added to the Web Docker by calling the `addService` method.

```typescript
import { WebDocker, ModuleService } from '@openreplyde/web-docker'

declare module '@openreplyde/web-docker' {
  interface IncludeTypeMap {
    customType: string;
  }
}

class CustomService implements ModuleService {
    constructor(
      private readonly config: { events: {} },
      private readonly assetFactory = new AssetFactory(),
      private readonly logEvents: boolean = false) {
        // initialize the service
    }

    async load(): Promise<void> {
        // load the module
    }
    
   get assetSources(): string[] {
        // return the asset sources
   }
   
   get module(): string {
        // return the module name
   }
   
   remove(): void {
        // remove the module
   }
}

const registry = new ModuleRegistry(true);
registry.addModuleServiceFactory({ type: 'customType', constructor: ServiceExtension });

const options = {
   configFilePath: "https://your-config-url.com",
   logEvents: false,
   scope: "webdocker"
}

const moduleConfigService = new ModuleConfigService();
const remoteConfigService = new RemoteConfigService(options);

const webDocker = new Webdocker(options, registry, moduleConfigService, remoteConfigService);
```

moduleConfigService and remoteConfigService are optional parameters. If not provided, the default services are used.


