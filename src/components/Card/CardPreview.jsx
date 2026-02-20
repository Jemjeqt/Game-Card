import React from 'react';
import Card from './Card';
import useUIStore from '../../stores/useUIStore';

export default function CardPreview() {
  const showCardPreview = useUIStore((s) => s.showCardPreview);
  const setShowCardPreview = useUIStore((s) => s.setShowCardPreview);

  if (!showCardPreview) return null;

  return (
    <div
      className="card-preview-overlay"
      onClick={() => setShowCardPreview(null)}
    >
      <Card card={showCardPreview} size="preview" />
    </div>
  );
}
