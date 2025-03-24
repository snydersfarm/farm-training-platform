import { notFound } from 'next/navigation'
import Link from 'next/link'

export default function ModuleDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const id = params.id;

  return (
    <div>
      <h1>Module {id}</h1>
      <Link href="/modules">Back to modules</Link>
    </div>
  )
}