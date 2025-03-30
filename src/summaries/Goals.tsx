import React, { useState } from 'react';

interface SavingsGoal {
  category: string;
  saved: number;
  target: number;
  color: string;
}

const goalsData: SavingsGoal[] = [
  { category: 'Food', saved: 150, target: 600, color: '#FF6384' },
  { category: 'Utilities', saved: 100, target: 400, color: '#36A2EB' },
  { category: 'Entertainment', saved: 50, target: 300, color: '#FFCE56' }
];

const styles = {
  container: {
    width: '100%'
  },
  goal: {
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
  goalInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#666'
  },
  goalTitle: {
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

const Goals: React.FC = () => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ saved: number; target: number }>({ saved: 0, target: 0 });

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValues({
      saved: goalsData[index].saved,
      target: goalsData[index].target
    });
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      goalsData[editingIndex].saved = editValues.saved;
      goalsData[editingIndex].target = editValues.target;
      setEditingIndex(null);
    }
  };

  return (
    <div style={styles.container}>
      {goalsData.map((item, index) => {
        const percentage = (item.saved / item.target) * 100;
        return (
          <div key={index} style={styles.goal}>
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
            <div style={styles.goalInfo}>
              <p style={styles.goalTitle}>{item.category}</p>
              <p style={styles.amounts}>
                ${item.saved.toLocaleString()} / ${item.target.toLocaleString()} 
                ({percentage.toFixed(1)}%)
              </p>
            </div>
            {editingIndex === index && (
              <div style={styles.editContainer}>
                <input
                  type="number"
                  value={editValues.saved}
                  onChange={(e) => setEditValues({ ...editValues, saved: Number(e.target.value) })}
                  style={styles.input}
                  placeholder="Saved"
                />
                <input
                  type="number"
                  value={editValues.target}
                  onChange={(e) => setEditValues({ ...editValues, target: Number(e.target.value) })}
                  style={styles.input}
                  placeholder="Target"
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

export default Goals;