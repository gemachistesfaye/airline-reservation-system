import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { User, Plane, BarChart2, Settings, LogOut } from 'lucide-react';

// Helper component for metric cards
function StatCard({ icon: Icon, label, value, change }) {
  return (
    <div className="bg-neutral-800 rounded-xl p-4 flex items-center space-x-4">
      <div className="p-2 bg-neutral-700 rounded-lg text-primary-500">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="text-base text-neutral-400">{label}</p>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-xl font-medium text-neutral-100">{value}</span>
          {change && <span className="text-sm text-neutral-300">{change}</span>}
        </div>
      </div>
    </div>
  );
}

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: BarChart2 },
  { to: '/admin/flights', label: 'Flights', icon: Plane },
  { to: '/admin/users', label: 'Users', icon: User },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminDashboardLayout() {
  const location = useLocation();

  // Page title derived from current route
  const pageTitle =
    sidebarLinks.find((l) => location.pathname.startsWith(l.to))?.label || 'Admin';

  // Mock stats – replace with real API data later
  const stats = [
    { icon: User, label: 'Total Users', value: '1,254', change: '+5% w/k' },
    { icon: Plane, label: 'Active Flights', value: '87', change: '+2% today' },
    { icon: BarChart2, label: 'Bookings', value: '3,421', change: '-1% today' },
    { icon: Settings, label: 'Revenue', value: '$128,340', change: '+8% M' },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      {/* ----- Fixed Sidebar ----- */}
      <aside className="hidden lg:flex flex-col w-64 bg-neutral-900 p-6 fixed h-full overflow-y-auto">
        <div className="flex items-center space-x-2 mb-10">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white">
            <User size={20} />
          </div>
          <span className="text-base font-medium">Admin</span>
        </div>
        <nav className="flex-1 space-y-2">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 py-3 px-4 rounded-lg text-base transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-neutral-300 hover:bg-neutral-800'
                }`
              }
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          className="mt-6 flex items-center space-x-3 py-3 px-4 rounded-lg text-base text-neutral-300 hover:bg-neutral-800"
          onClick={() => console.log('Logout')}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* ----- Main Content Area ----- */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Top Header */}
        <header className="flex justify-between items-center bg-neutral-900 rounded-b-xl p-4">
          <h1 className="text-xl font-display">{pageTitle}</h1>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center">
              <User size={20} className="text-primary-500" />
            </div>
            <span className="text-base font-medium">Admin</span>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </section>

        {/* Main Content (Outlet) */}
        <main className="flex-1 p-6 overflow-y-auto bg-neutral-950">
          {/* Example split area – replace with <Outlet/> in real routes */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column – Recent Activity */}
            <div className="bg-neutral-900 rounded-xl p-4 shadow-soft h-full">
              <h2 className="text-base font-medium text-neutral-200 mb-4">Recent Activity</h2>
              <ul className="divide-y divide-neutral-700">
                <li className="flex items-start space-x-3 py-2">
                  <div className="p-2 bg-neutral-700 rounded-lg text-primary-500 mt-1">
                    <CheckCircle size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base text-neutral-100 font-medium">User verification approved</p>
                    <p className="text-base text-neutral-400">Jane Doe (ID: 572) was verified.</p>
                  </div>
                  <span className="text-sm text-neutral-500 whitespace-nowrap">2 min ago</span>
                </li>
                {/* Add more items as needed */}
              </ul>
            </div>

            {/* Right Column – Quick Actions */}
            <div className="bg-neutral-800/40 rounded-xl p-6 h-full flex flex-col space-y-3">
              <h2 className="text-base font-medium text-neutral-200 mb-2">Quick Actions</h2>
              <button className="btn-primary flex items-center space-x-2">
                <Plane size={16} />
                <span>Create Flight</span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <User size={16} />
                <span>Add User</span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <Settings size={16} />
                <span>System Settings</span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
