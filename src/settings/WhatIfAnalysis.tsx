import React, { useState } from 'react';

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '20px',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold' as const,
        marginBottom: '10px',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        marginBottom: '10px',
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#32BC9B',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '20px',
    },
    resultsList: {
        listStyle: 'none',
        padding: 0,
    },
    resultItem: {
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '10px',
    },
};

const WhatIfAnalysis: React.FC = () => {
    const [expense, setExpense] = useState('');
    const [results, setResults] = useState<string[]>([]);

    const handleAnalyze = () => {
        // Add functionality to analyze the expense
        const newResults = [...results, `Analysis result for ${expense}`];
        setResults(newResults);
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>What If Analysis Tool</h2>
            <input
                type="text"
                placeholder="Enter potential expense"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
                style={styles.input}
            />
            <button onClick={handleAnalyze} style={styles.button}>Analyze</button>
            <ul style={styles.resultsList}>
                {results.map((result, index) => (
                    <li key={index} style={styles.resultItem}>{result}</li>
                ))}
            </ul>
        </div>
    );
};

export default WhatIfAnalysis;
