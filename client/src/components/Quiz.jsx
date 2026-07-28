import { useMemo, useState } from 'react';

function QuizQuestion({ question, options, correctIndex, onAnswer, answered, selectedIndex }) {
  return (
    <fieldset className="quiz-question">
      <legend>{question}</legend>
      <div className="options">
        {options.map((opt, i) => {
          let className = 'option-btn';
          if (answered) {
            if (i === correctIndex) className += ' correct';
            else if (i === selectedIndex) className += ' wrong';
          } else if (selectedIndex === i) {
            className += ' selected';
          }

          return (
            <button
              key={i}
              type="button"
              className={className}
              disabled={answered}
              onClick={() => onAnswer(i)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function QuizRunner({ questions, retestOnly, wrongIds, onComplete }) {
  const filtered = useMemo(() => {
    if (!retestOnly || wrongIds.length === 0) return questions;
    return questions.filter((q) => wrongIds.includes(q.id));
  }, [questions, retestOnly, wrongIds]);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  const total = filtered.length;
  const q = filtered[current];

  if (total === 0) {
    return (
      <section className="quiz">
        <p className="quiz-empty">No wrong answers to retest — nice work!</p>
      </section>
    );
  }

  const handleAnswer = (selectedIndex) => {
    const isCorrect = selectedIndex === q.correctIndex;
    const nextAnswers = {
      ...answers,
      [q.id]: { selectedIndex, isCorrect },
    };
    setAnswers(nextAnswers);

    if (current < total - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 500);
    } else {
      setTimeout(() => {
        setFinished(true);
        if (!retestOnly && onComplete) {
          const wrong = Object.entries(nextAnswers)
            .filter(([, a]) => !a.isCorrect)
            .map(([id]) => id);
          onComplete(wrong);
        }
      }, 500);
    }
  };

  if (finished) {
    const score = Object.values(answers).filter((a) => a.isCorrect).length;
    return (
      <section className="quiz">
        <div className="quiz-results">
          <h2>{retestOnly ? 'Retest complete' : 'Quiz complete'}</h2>
          <p className="score">{score} / {total} correct</p>
          {!retestOnly && score < total && (
            <p className="retest-hint">Switch to &quot;Retest wrong&quot; to try missed questions again.</p>
          )}
        </div>
      </section>
    );
  }

  const answered = answers[q.id] != null;

  return (
    <section className="quiz" aria-label="Quiz">
      <div className="section-header">
        <h2>{retestOnly ? 'Retest wrong answers' : 'Quiz'}</h2>
        <span className="badge">{current + 1} / {total}</span>
      </div>

      <QuizQuestion
        key={q.id}
        question={q.question}
        options={q.options}
        correctIndex={q.correctIndex}
        onAnswer={handleAnswer}
        answered={answered}
        selectedIndex={answers[q.id]?.selectedIndex ?? null}
      />
    </section>
  );
}

export function QuizWithRetest({ questions }) {
  const [mode, setMode] = useState('quiz');
  const [wrongIds, setWrongIds] = useState([]);
  const [quizKey, setQuizKey] = useState(0);

  return (
    <div>
      <div className="tab-row">
        <button
          type="button"
          className={`tab ${mode === 'quiz' ? 'active' : ''}`}
          onClick={() => { setMode('quiz'); setQuizKey((k) => k + 1); }}
        >
          Full quiz
        </button>
        <button
          type="button"
          className={`tab ${mode === 'retest' ? 'active' : ''}`}
          disabled={wrongIds.length === 0}
          onClick={() => { setMode('retest'); setQuizKey((k) => k + 1); }}
        >
          Retest wrong ({wrongIds.length})
        </button>
      </div>
      <QuizRunner
        key={`${mode}-${quizKey}`}
        questions={questions}
        retestOnly={mode === 'retest'}
        wrongIds={wrongIds}
        onComplete={setWrongIds}
      />
    </div>
  );
}
