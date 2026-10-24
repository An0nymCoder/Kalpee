import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-transparent text-[#332821] relative">
      <Sidebar />
      <MobileNav />
      <main className="md:pl-64 pb-24 md:pb-12">
        <div
          key={location.pathname}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 md:pt-10 animate-fade-up"
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
