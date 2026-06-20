import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Footer from './components/footer/Footer';
import Header from './components/header/Header';
import { Sidebar } from './components/layout/Sidebar';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col lg:pl-72">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex w-full flex-1 flex-col">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
