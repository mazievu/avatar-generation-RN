// syncContent.ts

const fs = require('fs');
const path = require('path');
// KHÔNG CẦN IMPORT CLUB_EVENT_DRAFTS Ở ĐÂY NỮA, script sẽ tự đọc
// const { CLUB_EVENT_DRAFTS } = require('../core/clubsAndEventsData');
import { Project, SyntaxKind, ObjectLiteralExpression, ArrayLiteralExpression } from 'ts-morph';
import { generateId } from './utils/idFactory';

const ROOT_DIR = process.cwd();
const CORE_DIR = path.join(ROOT_DIR, 'core'); // Đường dẫn tới thư mục core
const LOCKFILE_DIR = path.join(ROOT_DIR, 'game_content', 'locks');
const EVENTS_LOCKFILE = path.join(LOCKFILE_DIR, 'events-lock.json');
const GENERATED_DIR = path.join(ROOT_DIR, 'src', 'generated');
const EVENT_IDS_FILE = path.join(GENERATED_DIR, 'eventIds.ts');
const STAT_KEYS_FILE = path.join(GENERATED_DIR, 'statKeys.ts');

interface LockFileContent {
    [key: string]: string;
}

interface ParsedEvent {
    id: string;
    choices: { textKey: string }[];
    sourceFile: string;
}

async function syncEvents() {
    let existingLockFile: LockFileContent = {};
    if (fs.existsSync(EVENTS_LOCKFILE)) {
        try { existingLockFile = JSON.parse(fs.readFileSync(EVENTS_LOCKFILE, 'utf-8')); } 
        catch (error) { console.error(`Error reading or parsing lockfile ${EVENTS_LOCKFILE}:`, error); existingLockFile = {}; }
    }

    const allParsedEvents: ParsedEvent[] = [];
    const errors: string[] = [];
    
    // === SỬA LỖI Ở ĐÂY: Quét toàn bộ thư mục /core ===
    const project = new Project();
    // Thêm tất cả các file .ts trong thư mục core và các thư mục con của nó
    project.addSourceFilesAtPaths(`${CORE_DIR}/**/*.ts`);
    
    // Lấy tất cả các file nguồn, trừ index.ts nếu có
    const sourceFiles = project.getSourceFiles().filter(f => !f.getBaseName().includes('index.ts'));

    console.log('--- Đang xử lý các file sự kiện sau: ---');
    console.log(sourceFiles.map(f => f.getBaseName()));
    console.log('------------------------------------');

    for (const sourceFile of sourceFiles) {
        console.log(`\n>>> Đang quét file: ${sourceFile.getBaseName()}`);
        let eventCount = 0;

        // Tìm tất cả các biến được khai báo trong file
        const variableDeclarations = sourceFile.getVariableDeclarations();
        for (const decl of variableDeclarations) {
            const varName = decl.getName();
            const typeText = decl.getType().getText();

            // Chỉ xử lý các biến là mảng EventDraft hoặc ClubEventDraft
            if (decl.isExported() && (typeText.includes('EventDraft[]') || typeText.includes('ClubEventDraft[]'))) {
                const initializer = decl.getInitializer();
                if (initializer && initializer.getKind() === SyntaxKind.ArrayLiteralExpression) {
                    const eventsArray = (initializer as ArrayLiteralExpression).getElements();

                    for (const eventNode of eventsArray) {
                        if (eventNode.getKind() === SyntaxKind.ObjectLiteralExpression) {
                            const eventObject = eventNode as ObjectLiteralExpression;
                            const idProperty = eventObject.getProperty('id');
                            const choicesProperty = eventObject.getProperty('choices');

                            if (idProperty && choicesProperty) {
                                eventCount++;
                                const eventId = idProperty.getDescendantsOfKind(SyntaxKind.StringLiteral)[0].getLiteralValue();
                                const parsedChoices: { textKey: string }[] = [];
                                
                                const choicesArray = choicesProperty.getDescendantsOfKind(SyntaxKind.ArrayLiteralExpression)[0];
                                if(choicesArray) {
                                    for (const choiceObject of choicesArray.getElements()) {
                                        if (choiceObject.getKind() === SyntaxKind.ObjectLiteralExpression) {
                                            const textKeyProp = (choiceObject as ObjectLiteralExpression).getProperty('textKey');
                                            if (textKeyProp) {
                                                const choiceTextKey = textKeyProp.getDescendantsOfKind(SyntaxKind.StringLiteral)[0].getLiteralValue();
                                                parsedChoices.push({ textKey: choiceTextKey });
                                            }
                                        }
                                    }
                                }
                                allParsedEvents.push({ id: eventId, choices: parsedChoices, sourceFile: sourceFile.getBaseName() });
                            }
                        }
                    }
                }
            }
        }
        if (eventCount > 0) {
            console.log(`>>> Đã tìm thấy ${eventCount} event trong file ${sourceFile.getBaseName()}.`);
        }
    }

    // === PHẦN XỬ LÝ CLUB_EVENT_DRAFTS CŨ BỊ XÓA BỎ VÌ ĐÃ ĐƯỢC XỬ LÝ Ở TRÊN ===

    const newLockFile: LockFileContent = {};
    const allEventDraftIds: Set<string> = new Set();
    const allChoiceLockKeys: Set<string> = new Set();

    for (const parsedEvent of allParsedEvents) {
        const { id: eventId, choices, sourceFile } = parsedEvent;
        if (allEventDraftIds.has(eventId)) { errors.push(`Duplicate event ID found: '${eventId}' in source: ${sourceFile}`); }
        allEventDraftIds.add(eventId);
        newLockFile[eventId] = existingLockFile[eventId] || generateId('ev');
        for (const choice of choices) {
            const choiceLockKey = `${eventId}|${choice.textKey}`;
            if (allChoiceLockKeys.has(choiceLockKey)) { errors.push(`Duplicate choice lock key found: '${choiceLockKey}' for event '${eventId}' in source: ${sourceFile}`); }
            allChoiceLockKeys.add(choiceLockKey);
            newLockFile[choiceLockKey] = existingLockFile[choiceLockKey] || generateId('ch');
        }
    }
    
    if (errors.length > 0) { console.error("\nValidation Errors Found:"); errors.forEach(err => console.error(`- ${err}`)); process.exit(1); }
    const sortedNewLockFile: LockFileContent = {};
    Object.keys(newLockFile).sort().forEach(key => { sortedNewLockFile[key] = newLockFile[key]; });
    try { fs.writeFileSync(EVENTS_LOCKFILE, JSON.stringify(sortedNewLockFile, null, 2), 'utf-8'); console.log(`Updated ${EVENTS_LOCKFILE}`); } catch (error) { console.error(`Error writing lockfile ${EVENTS_LOCKFILE}:`, error); process.exit(1); }
    
    const eventIdByKey: { [key: string]: string } = {};
    const choiceIdByKey: { [key:string]: string } = {};
    for (const key in sortedNewLockFile) { if (key.includes('|')) { choiceIdByKey[key] = sortedNewLockFile[key]; } else { eventIdByKey[key] = sortedNewLockFile[key]; } }
    
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
    try { fs.writeFileSync(EVENT_IDS_FILE, eventIdsContent, 'utf-8'); console.log(`Generated ${EVENT_IDS_FILE}`); } catch (error) { console.error(`Error generating ${EVENT_IDS_FILE}:`, error); process.exit(1); }
}

async function generateStatKeys() {
    const statKeys = ["iq", "happiness", "eq", "health", "skill"];
    const statKeysContent = `
export const StatKey = {
${statKeys.map(key => `  ${key}: ${JSON.stringify(key)},`).join('\n')}
} as const;

export type StatKey = typeof StatKey[keyof typeof StatKey];
`;
    try { fs.writeFileSync(STAT_KEYS_FILE, statKeysContent, 'utf-8'); console.log(`Generated ${STAT_KEYS_FILE}`); } catch (error) { console.error(`Error generating ${STAT_KEYS_FILE}:`, error); process.exit(1); }
}

syncEvents().then(() => {
    generateStatKeys();
});