import * as React from 'react';
import { View, StyleSheet, ImageSourcePropType, Dimensions } from 'react-native';


import type { Character, Manifest, Language } from '../core/types';
import { RelationshipStatus } from '../core/types';
import { CharacterNode } from './CharacterNode';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

interface LocalizedProps {
  lang: Language;
}

interface FamilyTreeProps extends LocalizedProps {
  characterId: string;
  allMembers: Record<string, Character>;
  onAvatarClick: (character: Character) => void;
  images: Record<string, ImageSourcePropType>; // Changed from HTMLImageElement
  manifest: Manifest;
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({ characterId, allMembers, onAvatarClick, lang, images, manifest }) => {
    const character = allMembers[characterId];
    if (!character) return null;

    const partner = character.partnerId ? allMembers[character.partnerId] : null;
    const children = character.childrenIds.map(id => allMembers[id]).filter(Boolean);

    return (
        <View style={familyTreeStyles.familyTreeContainer}>
            {/* Parents Node */}
            <View style={familyTreeStyles.parentsNode}>
                <CharacterNode character={character} onClick={() => onAvatarClick(character)} lang={lang} images={images} manifest={manifest} />
                {partner && character.relationshipStatus === RelationshipStatus.Married && (
                    <>
                        {/* Spouse Connector */}
                        <View style={familyTreeStyles.spouseConnector}>
                            <View style={familyTreeStyles.spouseConnectorVertical} />
                        </View>
                        <CharacterNode character={partner} onClick={() => onAvatarClick(partner)} lang={lang} images={images} manifest={manifest} />
                    </>
                )}
            </View>

            {/* Children Branch */}
            {children.length > 0 && (
                <View style={familyTreeStyles.childrenBranch}>
                    {/* Vertical line from parent(s) center */}
                    <View style={familyTreeStyles.childrenVerticalLine} />

                    {/* Children nodes container */}
                    <View style={familyTreeStyles.childrenNodesContainer}>
                        {children.map((child, index) => (
                            <View key={child.id} style={familyTreeStyles.childNodeWrapper}>
                                {/* Connector from child up to horizontal line */}
                                <View style={familyTreeStyles.childConnectorVertical} />
                                {/* Horizontal line segment - this might need more complex positioning */}
                                {/* For simplicity, I'll just add a small horizontal line for now */}
                                {children.length > 1 && (
                                    <View style={[familyTreeStyles.childConnectorHorizontal, { width: index === 0 || index === children.length - 1 ? '50%' : '100%', left: index === 0 ? '50%' : 0, right: index === children.length - 1 ? '50%' : 0 }]} />
                                )}
                                <FamilyTree characterId={child.id} allMembers={allMembers} onAvatarClick={onAvatarClick} lang={lang} images={images} manifest={manifest} />
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

const familyTreeStyles = StyleSheet.create({
    familyTreeContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    parentsNode: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spouseConnector: {
        width: 20, // Horizontal line
        height: 2,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spouseConnectorVertical: {
        width: 2,
        height: 20,
        backgroundColor: '#ccc',
    },
    childrenBranch: {
        alignItems: 'center',
        marginTop: 10,
    },
    childrenVerticalLine: {
        width: 2,
        height: 20,
        backgroundColor: '#ccc',
    },
    childrenNodesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    childNodeWrapper: {
        alignItems: 'center',
        marginHorizontal: 5,
        position: 'relative',
    },
    childConnectorVertical: {
        width: 2,
        height: 20,
        backgroundColor: '#ccc',
    },
    childConnectorHorizontal: {
        height: 2,
        backgroundColor: '#ccc',
        position: 'absolute',
        top: 0,
        // These will be dynamically set based on index
    },
});
