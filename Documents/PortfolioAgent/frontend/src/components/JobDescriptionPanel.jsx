export default function JobDescriptionPanel({ value, onChange, onAnalyze, disabled }) {
  return (
    <aside className="jd-panel">
      <h3 className="jd-panel__title">Job Description</h3>
      <p className="jd-panel__hint">Paste a JD to analyse candidate fit</p>
      <textarea
        className="jd-panel__textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste job description here…"
        rows={10}
        disabled={disabled}
      />
      <button
        className="jd-panel__btn"
        onClick={onAnalyze}
        disabled={disabled || !value.trim()}
      >
        Analyse Match
      </button>
    </aside>
  )
}
