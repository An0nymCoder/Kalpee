import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F7F1E8] text-[#332821]">
      <Sidebar />
      <MobileNav />
      <main className="md:pl-64 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 md:pt-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
