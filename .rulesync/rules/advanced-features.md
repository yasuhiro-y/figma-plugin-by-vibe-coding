# Advanced Features & Complex API Usage

> **For API details**: Reference `plugin-api.d.ts` (the Figma Plugin API type definitions) for method signatures, interfaces, and type information. This file covers architectural patterns and gotchas only.

---

## Vector Network

**VectorNetwork is Figma's proprietary format** and is significantly different from SVG paths. Treat it as read-only unless you have a very specific reason to modify it — complex path manipulation is fragile and error-prone.

## SVG Import

`figma.createNodeFromSvg()` does not support all SVG features. Filters, complex masks, and embedded text frequently fail or produce incorrect results. Always validate the imported node's dimensions and provide a fallback strategy (e.g., a placeholder rectangle or prompting the user to simplify the SVG).

---

## Versioned Data Storage

When storing plugin data on nodes (via `setPluginData` / `setSharedPluginData`), plan for schema evolution from the start. Wrap stored data in a version envelope so you can migrate old data forward automatically when your schema changes.

### Pattern: VersionedStorage with Sequential Migrations

```typescript
// Wrap all persisted data with a version number
interface VersionedData<T> {
  version: number;
  data: T;
  createdAt: number;
  updatedAt: number;
}

class VersionedStorage<T> {
  constructor(
    private namespace: string,
    private currentVersion: number,
    private migrations: Map<number, (oldData: any) => T>
  ) {}

  setData(node: SceneNode, key: string, data: T): void {
    const versionedData: VersionedData<T> = {
      version: this.currentVersion,
      data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const serialized = JSON.stringify(versionedData);
    node.setSharedPluginData(this.namespace, key, serialized);
  }

  getData(node: SceneNode, key: string, defaultValue: T): T {
    const raw = node.getSharedPluginData(this.namespace, key);
    if (!raw) return defaultValue;

    const versionedData: VersionedData<T> = JSON.parse(raw);

    // Migrate old versions forward automatically
    if (versionedData.version < this.currentVersion) {
      const migrated = this.migrateData(versionedData);
      this.setData(node, key, migrated); // Persist upgraded data
      return migrated;
    }

    return versionedData.data;
  }

  private migrateData(oldVersionedData: VersionedData<any>): T {
    let data = oldVersionedData.data;

    // Apply each migration sequentially: v1 -> v2 -> v3 -> ...
    for (let v = oldVersionedData.version + 1; v <= this.currentVersion; v++) {
      const migration = this.migrations.get(v);
      if (migration) {
        data = migration(data);
      }
    }

    return data;
  }
}

// Usage: define migrations as a Map from target version to transform function
const userSettingsStorage = new VersionedStorage<UserSettings>(
  'user-settings',
  2, // Current version
  new Map([
    [2, (oldData: any) => ({
      ...oldData,
      newFeature: true // Added in version 2
    })]
  ])
);
```

### Key principles

- **Always version from day one** — retrofitting versioning onto unversioned data is painful.
- **Migrations must be pure functions** from old shape to new shape. Keep them simple.
- **Apply migrations sequentially** so each step only needs to know about the immediately prior version.
- **Use reverse-domain namespaces** (e.g., `com.company.plugin-name`) for shared plugin data to avoid collisions with other plugins.
- **Wrap reads/writes in try/catch** — `JSON.parse` can throw if data is corrupted.
