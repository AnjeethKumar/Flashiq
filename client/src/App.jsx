import { useRef, useState } from 'react';
import { useStudyGenerator } from './hooks/useStudyGenerator';
import { InputForm } from './components/InputForm';
import { LoadingState } from './components/LoadingState';
import { ErrorBanner } from './components/ErrorBanner';
import { EmptyState } from './components/EmptyState';
import { Flashcards } from './components/Flashcards';
import { QuizWithRetest } from './components/Quiz';

export default function App() {
  const { status, studySet, error, generate, reset } = useStudyGenerator();
  const lastNotesRef = useRef('');
  const [activeTab, setActiveTab] = useState('flashcards');

  const loading = status === 'loading';
  const hasResult = status === 'success' && studySet;

  const handleSubmit = (notes) => {
    lastNotesRef.current = notes;
    generate(notes);
  };

  const handleRetry = () => {
    if (lastNotesRef.current) generate(lastNotesRef.current);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Study Assistant</h1>
        <p className="subtitle">Turn notes into flashcards and quizzes</p>
      </header>

      <main className="main">
        <InputForm onSubmit={handleSubmit} loading={loading} />

        {status === 'error' && (
          <ErrorBanner message={error} onRetry={handleRetry} />
        )}

        {loading && <LoadingState />}

        {status === 'idle' && !loading && <EmptyState />}

        {hasResult && (
          <div className="results">
            <div className="results-toolbar">
              <h2 className="set-title">{studySet.title}</h2>
              <button type="button" className="btn btn-ghost" onClick={reset}>
                Start over
              </button>
            </div>

            <div className="tab-row">
              <button
                type="button"
                className={`tab ${activeTab === 'flashcards' ? 'active' : ''}`}
                onClick={() => setActiveTab('flashcards')}
              >
                Flashcards ({studySet.flashcards.length})
              </button>
              <button
                type="button"
                className={`tab ${activeTab === 'quiz' ? 'active' : ''}`}
                onClick={() => setActiveTab('quiz')}
              >
                Quiz ({studySet.quiz.length})
              </button>
            </div>

            {activeTab === 'flashcards' && (
              <Flashcards cards={studySet.flashcards} />
            )}
            {activeTab === 'quiz' && (
              <QuizWithRetest questions={studySet.quiz} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
