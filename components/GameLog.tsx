import * as React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import type { Character, GameLogEntry, Stats, Language } from '../core/types';
import { IqIcon, HappinessIcon, EqIcon, HealthIcon, SkillIcon, MoneyIcon } from './icons';
import { getCharacterDisplayName } from '../core/utils';
import { t } from '../core/localization';

interface LocalizedProps {
  lang: Language;
}

interface GameLogProps extends LocalizedProps {
  log: GameLogEntry[];
  familyMembers: Record<string, Character>;
}

const LogStatChanges: React.FC<{ entry: GameLogEntry, lang: Language }> = ({ entry, lang }) => {
    const { statChanges, fundChange } = entry;
    const allChanges: React.ReactNode[] = [];

    if (fundChange && fundChange !== 0) {
        const value = Math.round(fundChange);
        const sign = value > 0 ? '+' : '';
        const colorStyle = value > 0 ? logStatChangesStyles.positiveChange : logStatChangesStyles.negativeChange;
        allChanges.push(
            <View key="fund" style={logStatChangesStyles.changeItem}>
                <MoneyIcon color={colorStyle.color} style={logStatChangesStyles.icon} />
                <Text style={[logStatChangesStyles.changeText, colorStyle]}>{sign}${Math.abs(value).toLocaleString()}</Text>
            </View>
        );
    }

    if (statChanges) {
        const statIconMap: Record<keyof Stats, React.ElementType> = {
            iq: IqIcon,
            happiness: HappinessIcon,
            eq: EqIcon,
            health: HealthIcon,
            skill: SkillIcon,
        };

        for (const [stat, change] of Object.entries(statChanges)) {
            if (change === 0 || change === undefined) continue;
            const Icon = statIconMap[stat as keyof Stats];
            if (!Icon) continue;

            const value = Math.round(change);
            const sign = value > 0 ? '+' : '';
            const colorStyle = value > 0 ? logStatChangesStyles.positiveChange : logStatChangesStyles.negativeChange;
            allChanges.push(
                <View key={stat} style={logStatChangesStyles.changeItem}>
                    <Icon color={colorStyle.color} style={logStatChangesStyles.icon} />
                    <Text style={[logStatChangesStyles.changeText, colorStyle]}>{sign}{value}</Text>
                </View>
            );
        }
    }

    if (allChanges.length === 0) {
        return null;
    }

    return (
        <View style={logStatChangesStyles.container}>
            {allChanges}
        </View>
    );
};

const LogEntry: React.FC<{ entry: GameLogEntry; lang: Language; familyMembers: Record<string, Character> }> = ({ entry, lang, familyMembers }) => {
    // New detailed format
    if (entry.eventTitleKey && entry.characterId) {
        const character = familyMembers[entry.characterId];
        const characterName = character ? getCharacterDisplayName(character, lang) : (entry.replacements?.name || 'Unknown');
        const eventName = t(entry.eventTitleKey, lang);

        return (
            <View style={gameLogStyles.logEntry}>
                <Text style={gameLogStyles.logEntryYear}>{t('year_label', lang)} {entry.year}</Text>
                <View style={gameLogStyles.logEntryContent}>
                    <Text style={gameLogStyles.logEntryText}>
                        <Text style={gameLogStyles.logEntryCharacterName}>{characterName}:</Text>
                        <Text style={gameLogStyles.logEntryEventName}> {eventName}</Text>
                    </Text>
                    <Text style={gameLogStyles.logEntryMessage}>↳ {t(entry.messageKey, lang, entry.replacements)}</Text>
                    <LogStatChanges entry={entry} lang={lang} />
                </View>
            </View>
        );
    }

    // Fallback for old format
    return (
        <View style={gameLogStyles.logEntry}>
            <Text style={gameLogStyles.logEntryText}>
                <Text style={gameLogStyles.logEntryYear}>{t('year_label', lang)} {entry.year}:</Text>
                <Text style={gameLogStyles.logEntryMessage}> {t(entry.messageKey, lang, entry.replacements)}</Text>
            </Text>
            <LogStatChanges entry={entry} lang={lang} />
        </View>
    );
};

const GameLogInternal: React.FC<GameLogProps> = ({ log, lang, familyMembers }) => {
  return (
    <FlatList
        data={log}
        renderItem={({ item }) => <LogEntry entry={item} lang={lang} familyMembers={familyMembers} />}
        keyExtractor={(item, index) => item.id || `${item.year}-${index}`} // Assuming log entries have a unique 'id'
        ListHeaderComponent={<Text style={gameLogStyles.title}>{t('family_log_title', lang)}</Text>}
        style={gameLogStyles.scrollView}
    />
  );
};
export const GameLog = React.memo(GameLogInternal);

const logStatChangesStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
        alignItems: 'center',
    },
    changeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        width: 14,
        height: 14,
        marginRight: 2,
    },
    changeText: {
        fontSize: 12,
    },
    positiveChange: {
        color: '#22c55e', // green-600
    },
    negativeChange: {
        color: '#ef4444', // red-600
    },
});

const gameLogStyles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1e293b', // slate-800
    },
    logContainer: {
        // space-y-4
    },
    logEntry: {
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0', // slate-200
    },
    logEntryYear: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748b', // slate-500
        marginBottom: 4,
    },
    logEntryContent: {
        marginLeft: 8,
    },
    logEntryText: {
        fontSize: 16,
        color: '#333',
    },
    logEntryCharacterName: {
        fontWeight: 'bold',
    },
    logEntryEventName: {
        fontStyle: 'italic',
    },
    logEntryMessage: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
});
