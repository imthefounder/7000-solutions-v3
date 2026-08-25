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
        className={`chip ${selected === '' ? 'chip-active' : ''}`}
      >
        All
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`chip ${selected === category ? 'chip-active' : ''}`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
