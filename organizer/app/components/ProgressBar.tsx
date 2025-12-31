'use client';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div style={{
      width: '100%',
      marginBottom: '20px',
    }}>
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: '#FF6B35',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <div style={{
        textAlign: 'center',
        marginTop: '8px',
        fontSize: '14px',
        color: '#666',
      }}>
        {currentStep} / {totalSteps}
      </div>
    </div>
  );
}

