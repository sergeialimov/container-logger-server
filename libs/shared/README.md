# Shared library

This library contains a collection of general-purpose functions that can be used across various
projects. The library does not contain any business logic and is intended to be used as a utility
library for common functionality.

To prevent bloat and pollution of the library, it's important to only include general functions
that have not yet been implemented in widely used libraries like lodash. If a function already
exists in a popular library, it's better to use that library instead of adding it to the shared
library.

When adding new functions, it's a good idea to first do a search to see if similar functions already
exist in widely used libraries.

## Categories

The library is organized into three categories based on their intended use:

### Backend-shared

The `backend-shared` category contains code that can only be used in backend applications. These functions typically interact with backend services, databases, or perform other server-side operations.
To import a function from the `backend-shared` category, use the following syntax:

```typescript
import { RegistryService } from '@libs/shared/backend';
```

### Universal-shared

The `universal-shared` category contains code that can be used in both frontend and backend applications. These functions are typically general-purpose utilities that do not have any dependencies on the client or server environment.
To import a function from the `universal-shared` category, use the following syntax:

```typescript
import { getEnumKey } from '@libs/shared';
```

## Adding new code

To export new code from the shared library, follow these steps:

1. Identify the appropriate category for your code: `backend-shared`, `frontend-shared`, or `universal-shared`.
2. Export your function or functions using the export keyword in appropriate file:
  - [backend.index.ts](./src/backend.index.ts) - index file for backend-shared code
  - [index.ts](./src/index.ts) - index file for frontend-shared code
