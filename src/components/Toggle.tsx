import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

const styles = {
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  switch: {
    position: 'relative' as const,
    display: 'inline-block',
    width: '48px',
    height: '24px',
  },
  input: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  slider: {
    position: 'absolute' as const,
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    border: '2px solid #32BC9B',
    transition: 'all 0.4s ease',
    borderRadius: '34px',
  },
  sliderKnob: {
    position: 'absolute' as const,
    content: '""',
    height: '16px',
    width: '16px',
    left: '2px',
    bottom: '2px',
    backgroundColor: '#32BC9B',
    transition: 'all 0.4s ease',
    borderRadius: '50%',
  },
  checkedSlider: {
    backgroundColor: '#32BC9B',
  },
  checkedKnob: {
    backgroundColor: '#fff',
    transform: 'translateX(24px)',
  },
  label: {
    fontSize: '16px',
    color: '#333',
  },
};

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <label style={styles.toggleContainer}>
      {label && <span style={styles.label}>{label}</span>}
      <div style={styles.switch}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={styles.input}
        />
        <span
          style={{
            ...styles.slider,
            ...(checked && styles.checkedSlider),
          }}
        >
          <span
            style={{
              ...styles.sliderKnob,
              ...(checked && styles.checkedKnob),
            }}
          />
        </span>
      </div>
    </label>
  );
};

export default Toggle;