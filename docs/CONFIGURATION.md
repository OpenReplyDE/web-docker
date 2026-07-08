### Configuration Structure

Web Docker loads modules dynamically based on a JSON configuration file. The configuration defines which modules to load, when to load them, what assets they require, and how they communicate.

#### Configuration Format

The config file is an array of module configurations:

```json
[
  {
    "version": "1.0.0",
    "type": "page",
    "module": "page-fragment",
    "assets": [
      {
        "type": "js",
        "src": "http://localhost:3010/page-module/assets/page-module.js"
      },
      {
        "type": "css",
        "src": "http://localhost:3010/page-module/assets/style.css"
      }
    ],
    "pages": ["/test-host.html", "/about"],
    "exposes": {
      "pageData": "data"
    },
    "use": {
      "sharedService": "shared-module"
    }
  },
  {
    "version": "1.0.0",
    "type": "observed",
    "module": "observed-fragment",
    "assets": [
      {
        "type": "js",
        "src": "http://localhost:3010/observed-module/assets/observed-module.js"
      }
    ],
    "selector": "observed-fragment"
  }
]
```

#### Required Fields (All Modules)

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Semantic version of the module config (e.g., "1.0.0") |
| `type` | string | Module type: `"page"`, `"observed"`, or custom type |
| `module` | string | Unique module identifier used in the registry |
| `assets` | Array | List of JS/CSS files to load |

#### Asset Structure

Each asset in the `assets` array:

```json
{
  "type": "js" | "css",
  "src": "string (URL to the asset)"
}
```

- `type`: Either `"js"` for scripts or `"css"` for stylesheets
- `src`: Absolute or relative URL to the asset file

#### Page Module Configuration

**Type:** `"page"`

Modules are injected automatically when the current page URL matches patterns in the `pages` array.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pages` | Array | Yes | Array of page path patterns to match |
| `exposes` | Object | No | Key-value pairs of exports for inter-module communication |
| `use` | Object | No | Key-value pairs of module dependencies to import |

**Pages Array:**
- Can contain RegExp strings (e.g., `"/test-host.html"`, `".*about.*"`)
- Empty array `[]` injects on all pages
- Uses `window.location.pathname.match(new RegExp(page))` for matching

**Example:**
```json
{
  "type": "page",
  "module": "header",
  "pages": ["/", "/home", ".*product.*"],
  "assets": [...],
  "exposes": {
    "headerTitle": "title",
    "headerMenu": "menu"
  },
  "use": {
    "authService": "auth-module"
  }
}
```

#### Observed Module Configuration

**Type:** `"observed"`

Modules are injected only when a DOM element matching the CSS selector appears in the page. Uses `MutationObserver` to detect element insertion.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `selector` | string | Yes | CSS selector for the custom element to observe |

**Example:**
```json
{
  "type": "observed",
  "module": "modal-dialog",
  "selector": "modal-dialog",
  "assets": [
    {
      "type": "js",
      "src": "http://localhost:3010/modal/assets/modal.js"
    }
  ]
}
```

#### User-Defined Module Types

Custom module types can be registered with `registry.addModuleServiceFactory()`:

```json
{
  "version": "1.0.0",
  "type": "custom-type",
  "module": "my-module",
  "assets": [...],
  "customField": "custom-value"
}
```

#### Validation

Web Docker validates all configs and throws errors if:
- `version` field is missing
- `assets` array is missing or empty
- `module` field is missing
- `type` field is missing
- `pages` array is missing for page modules
- Same asset source is registered twice
- Same module name is registered twice