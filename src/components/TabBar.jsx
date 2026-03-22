import React from 'react'

export default function TabBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '📊' },
    { id: 'cases', label: 'Cases', icon: '📋' },
    { id: 'coding', label: 'Coding', icon: '🏫' },
    { id: 'tips', label: 'Tips', icon: '💡' },
    { id: 'cpt', label: 'CPT', icon: '🔍' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <nav className="tab-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span style={{ fontSize: 20 }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
