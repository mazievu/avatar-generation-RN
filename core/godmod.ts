import { GameState } from './types';

type SetGameState = React.Dispatch<React.SetStateAction<GameState | null>>;

export const initGodMode = (setGameState: SetGameState) => {
    if (process.env.NODE_ENV === 'development') {

        const god = {
            activate: () => {

                (window as Window).god.set = {
                    money: (amount: number) => {
                        setGameState(prevState => {
                            if (!prevState) return prevState;
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
                                return { ...prevState, familyMembers: updatedFamilyMembers };
                            }
                            return prevState;
                        });
                    },
                };

                (window as Window).god.get = {
                    characterIds: () => {
                        setGameState(prevState => {
                            if (!prevState) {
                                return prevState;
                            }
                            return prevState; // No state change, just logging
                        });
                    },
                    characterById: (characterId: string) => {
                        setGameState(prevState => {
                            if (!prevState) {
                                return prevState;
                            }
                            return prevState; // No state change, just logging
                        });
                    },
                };
            }
        };

        (window as Window).god = god;
    }
};