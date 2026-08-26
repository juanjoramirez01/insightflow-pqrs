import { createFileRoute } from '@tanstack/react-router';
import { migrarPqrsDesdeZoho } from '@/lib/zoho-migration.functions';

export const Route = createFileRoute('/api/migrate-zoho')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const resultado = await migrarPqrsDesdeZoho();

          return Response.json({
            exito: true,
            migrados: resultado.migrados,
            totalEnBase: resultado.totalEnBase,
          });
        } catch (error) {
          return Response.json(
            {
              exito: false,
              error: error instanceof Error ? error.message : 'Error desconocido',
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
