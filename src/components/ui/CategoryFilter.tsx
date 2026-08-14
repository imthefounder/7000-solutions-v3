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
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect('')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selected === ''
            ? 'bg-primary text-white'
            : 'bg-white text-slate-700 border border-slate-300 hover:border-primary'
        }`}
      >
        All
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selected === category
              ? 'bg-primary text-white'
              : 'bg-white text-slate-700 border border-slate-300 hover:border-primary'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
