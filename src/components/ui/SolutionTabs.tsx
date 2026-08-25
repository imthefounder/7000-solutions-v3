'use client';

import { useState } from 'react';

export type TabKey = 'overview' | 'guide' | 'impact';

type SolutionTabsProps = {
  children: (active: TabKey) => React.ReactNode;
};

export default function SolutionTabs({ children }: SolutionTabsProps) {
  const [active, setActive] = useState<TabKey>('overview');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'guide', label: 'Build Guide' },
    { key: 'impact', label: 'Impact & Track' },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap" role="tablist" aria-label="Solution sections">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={`chip ${active === tab.key ? 'chip-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}
