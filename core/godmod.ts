import { GameState, Character } from './types';

type SetGameState = React.Dispatch<React.SetStateAction<GameState | null>>;

export const initGodMode = (setGameState: SetGameState) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('God Mode: Type window.god.activate() to enable cheat commands.');

        const god = {
            activate: () => {
                console.log('God Mode Activated! Available commands under window.god.set and window.god.get');

                (window as any).god.set = {
                    money: (amount: number) => {
                        setGameState(prevState => {
                            if (!prevState) return prevState;
                            console.log(`Setting family fund to ${amount}`);
                            return { ...prevState, familyFund: amount };
                        });
                    },
                    age: (characterId: string, age: number) => {
                        setGameState(prevState => {
                            if (!prevState) return prevState;
                            const updatedFamilyMembers = { ...prevState.familyMembers };
                            if (updatedFamilyMembers[characterId]) {
                                updatedFamilyMembers[characterId] = {
                                    ...updatedFamilyMembers[characterId],
                                    age: age,
                                };
                                console.log(`Setting age of character ${characterId} to ${age}`);
                                return { ...prevState, familyMembers: updatedFamilyMembers };
                            }
                            console.warn(`Character with ID ${characterId} not found.`);
                            return prevState;
                        });
                    },
                };

                (window as any).god.get = {
                    characterIds: () => {
                        setGameState(prevState => {
                            if (!prevState) {
                                console.log("Game state not available.");
                                return prevState;
                            }
                            console.log("Current Character IDs:");
                            Object.values(prevState.familyMembers).forEach(char => {
                                console.log(`- ID: ${char.id}, Name: ${char.name}`);
                            });
                            return prevState; // No state change, just logging
                        });
                    },
                    characterById: (characterId: string) => {
                        setGameState(prevState => {
                            if (!prevState) {
                                console.log("Game state not available.");
                                return prevState;
                            }
                            const character = prevState.familyMembers[characterId];
                            if (character) {
                                console.log(`Character data for ID: ${characterId}`, character);
                            } else {
                                console.warn(`Character with ID ${characterId} not found.`);
                            }
                            return prevState; // No state change, just logging
                        });
                    },
                };
            }
        };

        (window as any).god = god;
    }
};
