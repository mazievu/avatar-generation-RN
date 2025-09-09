import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';


import type { Language } from '../core/types';
import { t } from '../core/localization';
import { ComicPanelModal } from './ComicPanelModal';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375; // A common base width for scaling
const scale = screenWidth / baseWidth;

const responsiveFontSize = (size: number) => Math.round(size * scale);
const responsiveSize = (size: number) => Math.round(size * scale);

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
        <ComicPanelModal visible={true} onClose={() => {}} rotate="-1deg">
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
        </ComicPanelModal>
    );
};

const loanModalStyles = StyleSheet.create({
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
