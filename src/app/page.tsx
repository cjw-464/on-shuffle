import { DialPanel } from '@/components/DialPanel'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">On Shuffle</h1>
          <p className="text-gray-400">Discover music with the 7-dial filter</p>
        </header>

        <DialPanel />
      </div>
    </main>
  )
}
