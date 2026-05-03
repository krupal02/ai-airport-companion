import React from 'react';
import { navigationSteps } from '../../utils/mockData';

export default function NavigationModal({ onClose }) {
  const totalTime = navigationSteps.filter(s => s.time).reduce((a, s) => a + parseInt(s.time), 0);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Navigation route">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🗺️ Route to Gate 5B</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <div className="nav-summary">
            <div>
              <div className="nav-summary-label">Estimated Time</div>
              <div className="nav-summary-value">~{totalTime} min</div>
            </div>
            <div>
              <div className="nav-summary-label">Distance</div>
              <div className="nav-summary-value">450m</div>
            </div>
          </div>
          <div className="nav-stepper">
            {navigationSteps.map((step, i) => (
              <div
                key={step.id}
                className={`nav-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`}
              >
                <div className="step-indicator">
                  {step.completed ? '✓' : i + 1}
                </div>
                <div className="step-content">
                  <div className="step-label">{step.label}</div>
                  <div className="step-detail">{step.detail}</div>
                  {step.time && <div className="step-time">⏱ {step.time}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary">🧭 Start Navigation</button>
        </div>
      </div>
    </div>
  );
}
