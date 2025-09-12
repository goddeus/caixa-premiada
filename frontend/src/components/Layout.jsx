import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import BottomNavbar from './BottomNavbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top Navigation */}
      <TopNavbar />
      
      {/* Main Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default Layout;
