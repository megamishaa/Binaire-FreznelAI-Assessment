import { useEffect, useState } from "react";

export function ModelsPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("ModelsPage mounted");
    console.log("Starting API request...");

    fetch("/api/models")
      .then((response) => {
        console.log("API status:", response.status);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        console.log("API response received");
        console.log("Number of models:", data.models?.length);

        if (!data || !Array.isArray(data.models)) {
          throw new Error("Invalid API response.");
        }

        setModels(data.models);
      })
      .catch((err) => {
        console.error("API ERROR:", err);
        setError(err.message);
      })
      .finally(() => {
        console.log("API request finished");
        setLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>AI Model Selection Utility</h1>

      {loading && <p>Loading models from API...</p>}

      {error && <p style={{ color: "red" }}>ERROR: {error}</p>}

      {!loading && !error && (
        <>
          <p>API loaded successfully.</p>

          <p>
            Models found: <strong>{models.length}</strong>
          </p>

          {models.slice(0, 10).map((model) => (
            <div
              key={model.id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "6px",
              }}
            >
              <h3>{model.display_name || model.id}</h3>

              <p>
                <strong>Family:</strong> {model.family || "Unknown"}
              </p>

              <p>
                <strong>Architecture:</strong>{" "}
                {model.architecture_category || "Unknown"}
              </p>

              <p>
                <strong>Weight format:</strong>{" "}
                {model.weight_format || "Unknown"}
              </p>

              <p>
                <strong>Safetensor files:</strong>{" "}
                {model.safetensor_file_count || 0}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
