import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import type { Language } from '../core/types';
import { t } from '../core/localization';

interface LocalizedProps {
    lang: Language;
}

interface LoanModalProps extends LocalizedProps {
    onLoanChoice: (amount: number, term: number) => void;
}
export const LoanModal: React.FC<LoanModalProps> = ({ onLoanChoice, lang }) => {
    const amounts = [1000, 10000, 100000, 1000000];
    const terms = [2, 5, 7, 10];
    const [selectedAmount, setSelectedAmount] = React.useState(amounts[0]);
    const [selectedTerm, setSelectedTerm] = React.useState(terms[0]);

    return (
        <View style={loanModalStyles.overlay} >
            <BlurView
                style={loanModalStyles.absolute}
                blurType="dark"
                blurAmount={10}
            />
            <View style={loanModalStyles.comicPanelWrapper}>
                <View style={loanModalStyles.comicPanel}>
                    <Text style={loanModalStyles.title}>{t('modal_loan_title', lang)}</Text>
                    <Text style={loanModalStyles.description}>{t('modal_loan_desc', lang)}</Text>
                    
                    <View style={loanModalStyles.optionsContainer}>
                        <View>
                            <Text style={loanModalStyles.label}>{t('loan_amount_label', lang)}</Text>
                            <View style={loanModalStyles.grid}>
                                {amounts.map(amount => (
                                    <TouchableOpacity 
                                        key={amount}
                                        onPress={() => setSelectedAmount(amount)}
                                        style={[
                                            loanModalStyles.gridButton,
                                            selectedAmount === amount ? loanModalStyles.gridButtonSelected : loanModalStyles.gridButtonNormal
                                        ]}
                                    >
                                        <Text style={loanModalStyles.gridButtonText}>
                                            ${amount.toLocaleString()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <View>
                             <Text style={loanModalStyles.label}>{t('loan_term_label', lang)}</Text>
                             <View style={loanModalStyles.grid}>
                                {terms.map(term => (
                                    <TouchableOpacity 
                                        key={term}
                                        onPress={() => setSelectedTerm(term)}
                                        style={[
                                            loanModalStyles.gridButton,
                                            selectedTerm === term ? loanModalStyles.gridButtonSelected : loanModalStyles.gridButtonNormal
                                        ]}
                                    >
                                        <Text style={loanModalStyles.gridButtonText}>
                                            {term}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                    
                    <TouchableOpacity onPress={() => onLoanChoice(selectedAmount, selectedTerm)} style={[loanModalStyles.chunkyButton, loanModalStyles.chunkyButtonGreen]}>
                        <Text style={loanModalStyles.chunkyButtonText}>
                            {t('accept_loan_button', lang)}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const loanModalStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
        padding: 16,
    },
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    comicPanelWrapper: {
        // transform: [{ rotate: '-1deg' }],
    },
    comicPanel: {
        backgroundColor: 'white',
        padding: 24,
        maxWidth: 500,
        width: '100%',
        borderRadius: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#475569', // slate-600
        marginBottom: 24,
        textAlign: 'center',
    },
    optionsContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#334155', // slate-700
        marginBottom: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    gridButton: {
        flexGrow: 1,
        minWidth: '45%', // for 2-column layout
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridButtonSelected: {
        backgroundColor: '#dbeafe', // blue-100
        borderColor: '#60a5fa', // blue-400
    },
    gridButtonNormal: {
        backgroundColor: '#f1f5f9', // slate-100
        borderColor: '#e2e8f0', // slate-200
    },
    gridButtonText: {
        fontWeight: 'bold',
        color: '#1e293b', // slate-800
    },
    chunkyButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 4,
    },
    chunkyButtonGreen: {
        backgroundColor: '#22c55e', // green-500
        borderColor: '#16a34a', // green-600
    },
    chunkyButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
