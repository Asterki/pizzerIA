import { WhiteboardCanvas } from '#/features/whiteboard/components/Canvas'
import { PizzerIALayout } from '#/layouts/Main'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <PizzerIALayout activeKey="/">
      <WhiteboardCanvas />
    </PizzerIALayout>
  )
}
