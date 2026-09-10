import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<h1>Login Page</h1>} />

      <Route path="/signup" element={<h1>Signup Page</h1>} />

      <Route path="/models" element={<h1>Models Page</h1>} />
    </Routes>
  );
}

export default App;
