// Server Component — no 'use client' directive
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import Header from '../components/Header/Header'
import Sidebar from '../components/Sidebar/Sidebar'
import Canvas from '../components/Canvas/Canvas'
import Inspector from '../components/Inspector/Inspector'

export default async function HomePage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  return (
    <>
      <Header />
      <div style={{ display: 'flex', height: '100vh', paddingTop: '48px' }}>
        <Sidebar />
        <Canvas />
        <Inspector />
      </div>
    </>
  )
}
