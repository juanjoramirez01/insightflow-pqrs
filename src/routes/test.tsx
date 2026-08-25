import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/test')({
  loader: () => {
    return new Response('¡Funciona!', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  },
});
