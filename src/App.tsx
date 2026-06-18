import Footer from './components/footer/Footer';
import Header from './components/header/Header';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="flex min-h-screen flex-col font-sans antialiased">
      <Header />

      <main className="flex w-full flex-1 flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default App;
