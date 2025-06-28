export default function PolygonDrawButton({ drawing, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: drawing ? "#f87171" : "#4ade80",
        color: "#fff",
        padding: "8px 12px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        marginBottom: "6px"
      }}
    >
      {drawing ? "Cancel Drawing" : "Draw Polygon"}
    </button>
  );
}