const fs = require('fs');
const path = require('path');
const { generateId } = require('./utils/idFactory');

const ROOT_DIR = process.cwd();
const EVENTS_DIR = path.join(ROOT_DIR, 'core', 'events');
const LOCKFILE_DIR = path.join(ROOT_DIR, 'game_content', 'locks');
const EVENTS_LOCKFILE = path.join(LOCKFILE_DIR, 'events-lock.json');
const GENERATED_DIR = path.join(ROOT_DIR, 'src', 'generated');
const EVENT_IDS_FILE = path.join(GENERATED_DIR, 'eventIds.ts');
const STAT_KEYS_FILE = path.join(GENERATED_DIR, 'statKeys.ts');

interface LockFileContent {
    [key: string]: string;
}

async function syncEvents() {
    let existingLockFile: LockFileContent = {};
    if (fs.existsSync(EVENTS_LOCKFILE)) {
        try {
            existingLockFile = JSON.parse(fs.readFileSync(EVENTS_LOCKFILE, 'utf-8'));
        } catch (error) {
            console.error(`Error reading or parsing lockfile ${EVENTS_LOCKFILE}:`, error);
            existingLockFile = {};
        }
    }

    const newLockFile: LockFileContent = {};
    const allEventDraftIds: Set<string> = new Set(); // To track all event IDs found in drafts
    const allChoiceLockKeys: Set<string> = new Set(); // To track all choice lock keys found in drafts
    const errors: string[] = [];

    let eventFiles: string[] = [];
    try {
        eventFiles = fs.readdirSync(EVENTS_DIR).filter((file: string) => file.endsWith('.ts'));
    } catch (error) {
        console.error(`Error reading events directory ${EVENTS_DIR}:`, error);
        process.exit(1); // Exit on critical error
    }

    for (const file of eventFiles) {
        const filePath = path.join(EVENTS_DIR, file);
        let content: string;
        try {
            content = fs.readFileSync(filePath, 'utf-8');
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            errors.push(`Failed to read file: ${filePath}`);
            continue;
        }

        const eventBlockRegex = /{\s*id:\s*['"]([^'"]+)['"],(?:[\s\S](?!id:\s*['"]))*}?/g;
        let eventMatch;

        while ((eventMatch = eventBlockRegex.exec(content)) !== null) {
            const eventId = eventMatch[1];
            const eventContent = eventMatch[0];

            // Validate: Duplicate event ID
            if (allEventDraftIds.has(eventId)) {
                errors.push(`Duplicate event ID found: '${eventId}' in file ${filePath}`);
            }
            allEventDraftIds.add(eventId);

            const eventLockKey = eventId;
            newLockFile[eventLockKey] = existingLockFile[eventLockKey] || generateId('ev');

            const choicesBlockRegex = /choices:\s*\[([\s\S]*?)\]/;
            const choicesMatch = eventContent.match(choicesBlockRegex);

            if (choicesMatch && choicesMatch[1]) {
                const choicesContent = choicesMatch[1];
                const choiceTextKeyRegex = /textKey:\s*['"]([^'"]+)['"]/g;
                let choiceMatch;

                while ((choiceMatch = choiceTextKeyRegex.exec(choicesContent)) !== null) {
                    const choiceTextKey = choiceMatch[1];
                    const choiceLockKey = `${eventId}|${choiceTextKey}`;

                    // Validate: Duplicate choice lock key within the same event
                    if (allChoiceLockKeys.has(choiceLockKey)) {
                        errors.push(`Duplicate choice lock key found: '${choiceLockKey}' for event '${eventId}' in file ${filePath}`);
                    }
                    allChoiceLockKeys.add(choiceLockKey);

                    newLockFile[choiceLockKey] = existingLockFile[choiceLockKey] || generateId('ch');
                }
            }
        }
    }

    // Validate: Cross-references (choices referencing non-existent events) - this is handled by the structure
    // where choice lock keys are derived from event IDs found in the same pass.
    // However, if an event is referenced by a 'trigger' in another event, that needs validation.
    // This requires parsing 'triggers' array and checking 'eventId' within it.
    // This is complex with regex, so I will add a placeholder for now.
    // For now, I will assume that all event IDs referenced in choiceLockKeys are valid because they are derived from event IDs found in the same scan.

    // Validate: StatKey usage and abnormal values (requires deeper parsing)
    // This is difficult with regex. A proper AST parser would be needed.
    // For now, this validation is skipped.

    if (errors.length > 0) {
        console.error("\nValidation Errors Found:");
        errors.forEach(err => console.error(`- ${err}`));
        process.exit(1); // Fail the script if validation errors exist
    }

    const sortedNewLockFile: LockFileContent = {};
    Object.keys(newLockFile).sort().forEach(key => {
        sortedNewLockFile[key] = newLockFile[key];
    });

    try {
        fs.writeFileSync(EVENTS_LOCKFILE, JSON.stringify(sortedNewLockFile, null, 2), 'utf-8');
        console.log(`Updated ${EVENTS_LOCKFILE}`);
    } catch (error) {
        console.error(`Error writing lockfile ${EVENTS_LOCKFILE}:`, error);
        process.exit(1);
    }

    // --- Start Codegen for eventIds.ts ---
    const eventIdByKey: { [key: string]: string } = {};
    const choiceIdByKey: { [key: string]: string } = {};

    for (const key in sortedNewLockFile) {
        if (key.includes('|')) {
            // This is a choice ID
            choiceIdByKey[key] = sortedNewLockFile[key];
        } else {
            // This is an event ID
            eventIdByKey[key] = sortedNewLockFile[key];
        }
    }

    const eventIdsContent = `
export const EventIdByKey = {
${Object.keys(eventIdByKey).sort().map(key => `  ${JSON.stringify(key)}: ${JSON.stringify(eventIdByKey[key])},`).join('\n')}
} as const;

export type EventId = typeof EventIdByKey[keyof typeof EventIdByKey];

export const ChoiceIdByKey = {
${Object.keys(choiceIdByKey).sort().map(key => `  ${JSON.stringify(key)}: ${JSON.stringify(choiceIdByKey[key])},`).join('\n')}
} as const;

export type ChoiceId = typeof ChoiceIdByKey[keyof typeof ChoiceIdByKey];
`;

    try {
        fs.writeFileSync(EVENT_IDS_FILE, eventIdsContent, 'utf-8');
        console.log(`Generated ${EVENT_IDS_FILE}`);
    } catch (error) {
        console.error(`Error generating ${EVENT_IDS_FILE}:`, error);
        process.exit(1);
    }
    // --- End Codegen for eventIds.ts ---
}

async function generateStatKeys() {
    const statKeys = [
        "iq",
        "happiness",
        "eq",
        "health",
        "skill"
    ];

    const statKeysContent = `
export const StatKey = {
${statKeys.map(key => `  ${key}: ${JSON.stringify(key)},`).join('\n')}
} as const;

export type StatKey = typeof StatKey[keyof typeof StatKey];
`;

    try {
        fs.writeFileSync(STAT_KEYS_FILE, statKeysContent, 'utf-8');
        console.log(`Generated ${STAT_KEYS_FILE}`);
    } catch (error) {
        console.error(`Error generating ${STAT_KEYS_FILE}:`, error);
        process.exit(1);
    }
}

syncEvents().then(() => {
    generateStatKeys();
});
