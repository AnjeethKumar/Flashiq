import { useState } from 'react';

export function Flashcards({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];
  const total = cards.length;

  const goTo = (next) => {
    setIndex(next);
    setFlipped(false);
  };

  return (
    <section className="flashcards" aria-label="Flashcards">
      <div className="section-header">
        <h2>Flashcards</h2>
        <span className="badge">{index + 1} / {total}</span>
      </div>

      <button
        type="button"
        className={`flashcard ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        aria-label={flipped ? 'Show question' : 'Show answer'}
      >
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">
            <span className="face-label">Question</span>
            <p>{card.front}</p>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="face-label">Answer</span>
            <p>{card.back}</p>
          </div>
        </div>
      </button>

      <p className="hint">Tap card to flip</p>

      <div className="nav-row">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
        >
          ← Previous
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={index === total - 1}
          onClick={() => goTo(index + 1)}
        >
          Next →
        </button>
      </div>
    </section>
  );
}
