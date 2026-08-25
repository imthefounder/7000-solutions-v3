'use client';

import { useState } from 'react';

export type TabKey = 'overview' | 'guide' | 'impact';

type TabDef = {
  key: TabKey;
  label: string;
  content: React.ReactNode;
};

type SolutionTabsProps = {
  tabs: TabDef[];
};

export default function SolutionTabs({ tabs }: SolutionTabsProps) {
  const [active, setActive] = useState<TabKey>(tabs[0]?.key ?? 'overview');
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

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
      {activeTab?.content}
    </div>
  );
}
