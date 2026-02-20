import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import MainPage from "@/components/MainPage";
import AdminPage from "@/components/AdminPage";

function App() {
  return (
    <div className="min-h-screen bg-[#1a0a0a] dragon-pattern">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default App;
