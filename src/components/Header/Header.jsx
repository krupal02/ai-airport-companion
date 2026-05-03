import React, { useState } from 'react';
import Dropdown from '../Common/Dropdown';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { AIRPORTS, LANGUAGES } from '../../utils/constants';

export default function Header() {
  const { airport, updateAirport, language, updateLanguage, userMode, updateUserMode } = useApp();
  const { fontSize, highContrast, updateFontSize, toggleHighContrast } = useAccessibility();
  const [search, setSearch] = useState('');

  const filtered = AIRPORTS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <header className="header" role="banner">
      <div className="header-logo">
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="14" r="13" fill="#E3F2FD" stroke="#60A5FA" strokeWidth="1.5"/>
          <path d="M8 17L14 7L20 17" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 15H18" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className="logo-text">Airport Companion</span>
      </div>

      <div className="header-center">
        <Dropdown
          trigger={<><span>📍</span> {airport.name} ({airport.code})</>}
        >
          {(close) => (
            <>
              <div className="dropdown-search">
                <input
                  type="text"
                  placeholder="Search airports..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search airports"
                />
              </div>
              {filtered.map(a => (
                <div
                  key={a.code}
                  className={`dropdown-item ${a.code === airport.code ? 'active' : ''}`}
                  role="menuitem"
                  onClick={() => { updateAirport(a); close(); setSearch(''); }}
                >
                  <span>✈️</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.city} ({a.code})</div>
                    <div style={{ fontSize: '.78rem', color: '#6C757D' }}>{a.name}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </Dropdown>
      </div>

      <div className="header-right">
        <Dropdown trigger={<>{language.flag} {language.code}</>} align="right">
          {(close) => (
            LANGUAGES.map(l => (
              <div
                key={l.code}
                className={`dropdown-item ${l.code === language.code ? 'active' : ''}`}
                role="menuitem"
                onClick={() => { updateLanguage(l); close(); }}
              >
                {l.flag} {l.name}
              </div>
            ))
          )}
        </Dropdown>

        <div className="mode-toggle" role="tablist" aria-label="User mode">
          <button
            className={userMode === 'first-time' ? 'active' : ''}
            onClick={() => updateUserMode('first-time')}
            role="tab"
            aria-selected={userMode === 'first-time'}
          >
            🌱 First Time
          </button>
          <button
            className={userMode === 'frequent' ? 'active' : ''}
            onClick={() => updateUserMode('frequent')}
            role="tab"
            aria-selected={userMode === 'frequent'}
          >
            ⭐ Frequent
          </button>
        </div>

        <Dropdown trigger={<span style={{ fontSize: '1.2rem' }}>♿</span>} align="right">
          {() => (
            <div className="a11y-menu" onClick={e => e.stopPropagation()}>
              <label>
                Font Size ({fontSize}px)
              </label>
              <input
                type="range"
                className="a11y-slider"
                min="16"
                max="20"
                step="1"
                value={fontSize}
                onChange={e => updateFontSize(Number(e.target.value))}
                aria-label="Font size"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: '#6C757D', marginBottom: 16 }}>
                <span>Small</span><span>Medium</span><span>Large</span>
              </div>
              <label>
                High Contrast
                <div
                  className={`a11y-toggle ${highContrast ? 'on' : ''}`}
                  onClick={toggleHighContrast}
                  role="switch"
                  aria-checked={highContrast}
                  tabIndex={0}
                />
              </label>
            </div>
          )}
        </Dropdown>
      </div>
    </header>
  );
}
