# Coding Standards & Guidelines

Maintaining a clean and standardized codebase is crucial for developer onboarding and codebase scalability. Below are the coding standards enforced across Rarenest.

## General JavaScript Guidelines

*   **Variables**: Use `const` by default. Only use `let` if re-assignment is explicitly required. Never use `var`.
*   **Arrow Functions**: Use arrow functions (`const myFunc = () => {}`) for callbacks and React functional components. Use standard `function` declarations when hoisting is intentionally required.
*   **Asynchronous Code**: Favor `async/await` syntax over raw Promise chaining (`.then()/.catch()`). Wrap asynchronous operations in `try/catch` blocks.
*   **Semicolons**: Always end statements with semicolons.

## Naming Conventions

*   **Files & Folders**:
    *   Backend: CamelCase for controller/service/repository files (e.g. `userRepository.js`, `authController.js`).
    *   Frontend Component Files: PascalCase (e.g. `PropertyCard.jsx`, `Layout.jsx`).
    *   Frontend Helper Files: camelCase (e.g. `useAuth.js`, `apiClient.js`).
*   **Variables & Constants**:
    *   Use `camelCase` for variable names and function names.
    *   Use `PascalCase` for class names, components, and React custom hooks.
    *   Use `UPPER_CASE_SNAKE` for global constants and environment variables (e.g. `JWT_SECRET`, `MAX_FILE_SIZE`).
*   **Database Objects**:
    *   Tables are named in plural PascalCase or uppercase (e.g. `Users`, `BuilderProfiles`, `Properties`).
    *   Primary keys: `id` (generally `UNIQUEIDENTIFIER` using `DEFAULT NEWID()`).
    *   Foreign keys: `snake_case` pointing to table IDs (e.g., `user_id`, `property_id`).

## Architectural Integrity Rules

*   **No DB Queries in Controllers**: Controllers must never execute queries directly or interface with the database. They must delegate entirely to Services.
*   **No HTTP awareness in Repositories**: Repositories must handle database execution only and return standard JavaScript arrays/objects or throw clean exceptions. They must not reference `req` or `res` objects.
*   **Encapsulation of Services**: Services should wrap a single cohesive feature. Avoid tightly coupling services to one another; use interfaces or cross-repository invocations where possible.
