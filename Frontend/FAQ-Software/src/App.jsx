import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Page1_FAQ from './pages/Page1_FAQ';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/faq' replace />} />
        <Route path='/faq' element={<Page1_FAQ />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
