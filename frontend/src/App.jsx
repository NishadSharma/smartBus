import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LiveMap from "./pages/LiveMap";
import BusDetails from "./pages/BusDetails";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LiveMap />} />
        <Route path="/bus/:busId" element={<BusDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

