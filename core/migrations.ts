import { GameState } from './types';
import { CONTENT_VERSION } from './constants';

// Define a type for migration functions
type MigrationFunction = (state: GameState) => GameState;

// Map of migrations, keyed by the version they migrate *from*
const migrations: Record<number, MigrationFunction> = {
    // Migrate from version 0 (no contentVersion) to version 1
    0: (oldState: GameState): GameState => {
        const newState: GameState = {
            ...oldState,
            contentVersion: 1, // Set the new content version
            // Add any other necessary transformations for v0 to v1 here
            // For example, if old saves used event.titleKey for completedOneTimeEvents,
            // you would map them to event.id here. Based on previous analysis,
            // completedOneTimeEvents already stored event.id, so this might be a no-op for that specific field.
        };
        return newState;
    },
    // Add more migrations here as contentVersion increases
    // 1: (oldState: GameState): GameState => { /* migrate from v1 to v2 */ return newState; },
};

export function applyMigrations(savedState: GameState): GameState {
    let state = savedState;
    let currentVersion = state.contentVersion || 0; // Assume 0 if not present

    while (currentVersion < CONTENT_VERSION) {
        const migrateFn = migrations[currentVersion];
        if (migrateFn) {
            state = migrateFn(state);
            currentVersion = state.contentVersion; // Update currentVersion after migration
        } else {
            break;
        }
    }
    return state;
}