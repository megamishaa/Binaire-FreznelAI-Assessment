import { useEffect, useState } from "react";

import { ModelRepository } from "../models/ModelRepository";

const repository = new ModelRepository();

export function ModelsPage() {
  const [models, setModels] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    repository
      .loadModels()
      .then((result) => {
        console.log("Models loaded from:", result.source);

        setModels(result.models);
        setSource(result.source);
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h1>Loading models...</h1>;
  }

  if (error) {
    return (
      <div style={{ padding: "30px" }}>
        <h1>Models Page</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1>AI Model Selection Utility</h1>

      <p>
        Data source:{" "}
        <strong>{source === "api" ? "Online API" : "Local Cache"}</strong>
      </p>

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
          }}
        >
          <h3>{model.name}</h3>

          <p>Family: {model.family}</p>

          <p>Architecture: {model.architectureCategory}</p>

          <p>Safetensor files: {model.safetensorFileCount}</p>
        </div>
      ))}
    </div>
  );
}
