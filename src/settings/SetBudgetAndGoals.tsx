import React from 'react';
import Budget from '../summaries/Budget';
import Goals from '../summaries/Goals';
import WhatIfAnalysis from '../settings/WhatIfAnalysis';

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    section: {
        marginBottom: '20px',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold' as const,
        marginBottom: '10px',
    },
    button: {
        display: 'block',
        margin: '20px 0',
        padding: '10px 20px',
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#32BC9B',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

const SetBudgetAndGoals: React.FC = () => {
    const handleEditGoals = () => {
        // Add functionality to edit Budget and Goals
        console.log('Edit Goals clicked');
    };

    return (
        <div style={styles.container}>
            <div style={styles.section}>
                <h2 style={styles.title}>Monthly Budget</h2>
                <Budget />
            </div>
            <div style={styles.section}>
                <h2 style={styles.title}>Goals Progress</h2>
                <Goals />
            </div>
            <button style={styles.button} onClick={handleEditGoals}>Edit Goals</button>
            <WhatIfAnalysis />
        </div>
    );
};

export default SetBudgetAndGoals;
