export default function LoadingSpinner({ text = 'Carregando...' }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <span className="loading-text">{text}</span>
    </div>
  );
}
