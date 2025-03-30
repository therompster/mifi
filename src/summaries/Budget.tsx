import React, { useState } from 'react';

interface BudgetCategory {
  category: string;
  spent: number;
  budget: number;
  color: string;
}

const budgetData: BudgetCategory[] = [
  { category: 'Food', spent: 450, budget: 600, color: '#FF6384' },
  { category: 'Utilities', spent: 300, budget: 400, color: '#36A2EB' },
  { category: 'Entertainment', spent: 200, budget: 300, color: '#FFCE56' }
];

const styles = {
  container: {
    width: '100%'
  },
  category: {
    marginBottom: '20px'
  },
  progressBarContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
    position: 'relative' as const,
    marginBottom: '8px'
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  categoryInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#666'
  },
  categoryTitle: {
    margin: 0
  },
  amounts: {
    margin: 0
  },
  editButton: {
    position: 'absolute' as const,
    left: '-24px',
    top: '-4px',
    padding: '2px 6px',
    fontSize: '12px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#666'
  },
  editContainer: {
    marginTop: '10px',
    display: 'flex',
    gap: '10px'
  },
  input: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    width: '100px'
  }
};

const Budget: React.FC = () => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ spent: number; budget: number }>({ spent: 0, budget: 0 });

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValues({
      spent: budgetData[index].spent,
      budget: budgetData[index].budget
    });
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      budgetData[editingIndex].spent = editValues.spent;
      budgetData[editingIndex].budget = editValues.budget;
      setEditingIndex(null);
    }
  };

  return (
    <div style={styles.container}>
      {budgetData.map((item, index) => {
        const percentage = (item.spent / item.budget) * 100;
        return (
          <div key={index} style={styles.category}>
            <div style={styles.progressBarContainer}>
              <button 
                style={styles.editButton}
                onClick={() => handleEdit(index)}
              >
                ✎
              </button>
              <div
                style={{
                  ...styles.progressBar,
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
            <div style={styles.categoryInfo}>
              <p style={styles.categoryTitle}>{item.category}</p>
              <p style={styles.amounts}>
                ${item.spent.toLocaleString()} / ${item.budget.toLocaleString()} 
                ({percentage.toFixed(1)}%)
              </p>
            </div>
            {editingIndex === index && (
              <div style={styles.editContainer}>
                <input
                  type="number"
                  value={editValues.spent}
                  onChange={(e) => setEditValues({ ...editValues, spent: Number(e.target.value) })}
                  style={styles.input}
                  placeholder="Spent"
                />
                <input
                  type="number"
                  value={editValues.budget}
                  onChange={(e) => setEditValues({ ...editValues, budget: Number(e.target.value) })}
                  style={styles.input}
                  placeholder="Budget"
                />
                <button onClick={handleSave}>Save</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Budget;