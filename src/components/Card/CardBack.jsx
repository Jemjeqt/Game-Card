import React from 'react';

export default function CardBack({ small = false }) {
  return (
    <div className={`card-back ${small ? 'card-back--small' : ''}`}>
      <div className="card-back__pattern">⚜️</div>
    </div>
  );
}
