import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Course from './pages/Course'
import { ToastProvider } from './components/ui/Toaster'

function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/course/:taskId" element={<Course />} />
        </Routes>
      </Layout>
    </ToastProvider>
  )
}

export default App