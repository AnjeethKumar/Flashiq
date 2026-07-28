export function InputForm({ onSubmit, loading, disabled }) {
  return (
    <form
      className="input-form"
      onSubmit={(e) => {
        e.preventDefault();
        const notes = e.target.notes.value.trim();
        if (notes) onSubmit(notes);
      }}
    >
      <label htmlFor="notes" className="input-label">
        Paste your notes or enter a topic
      </label>
      <textarea
        id="notes"
        name="notes"
        rows={6}
        placeholder="e.g. Photosynthesis: plants convert light energy into chemical energy. Chlorophyll absorbs light. Outputs: glucose + oxygen..."
        disabled={loading || disabled}
        required
      />
      <button type="submit" className="btn btn-primary" disabled={loading || disabled}>
        {loading ? 'Generating…' : 'Generate flashcards & quiz'}
      </button>
    </form>
  );
}
