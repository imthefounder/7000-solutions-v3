'use client';

const CATEGORIES = [
  'Education',
  'Healthcare',
  'Public Safety',
  'Environment',
  'Transportation',
  'Economic Development',
  'Housing',
  'Digital Equity',
  'Food Security',
  'Youth',
  'Aging',
  'Arts & Culture',
];

type CategoryFilterProps = {
  selected: string;
  onSelect: (category: string) => void;
};

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
      <button
        onClick={() => onSelect('')}
        className={`shrink-0 px-3.5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
          selected === ''
            ? 'chip-active'
            : 'chip hover:border-primary/40 hover:text-primary'
        }`}
      >
        All
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`shrink-0 px-3.5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
            selected === c
              ? 'chip-active'
              : 'chip hover:border-primary/40 hover:text-primary'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
