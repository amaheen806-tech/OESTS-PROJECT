import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Error</p>
      <h1 className="mt-2 text-5xl font-bold tracking-tight text-nude-800">404</h1>
      <p className="mt-3 text-nude-500">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-8 inline-block">
        <Button variant="accent">Go back home</Button>
      </Link>
    </div>
  )
}
