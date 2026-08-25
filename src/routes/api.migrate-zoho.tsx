import { createFileRoute } from '@tanstack/react-router';
import { migrarPqrsDesdeZoho } from '../../server/zoho-migration.functions';

export const Route = createFileRoute('/api/migrate-zoho')({
  loader: async () => {
    try {
      const resultado = await migrarPqrsDesdeZoho();
      
      return new Response(
        JSON.stringify({ 
          exito: true, 
          migrados: resultado.migrados, 
          totalEnBase: resultado.totalEnBase 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          exito: false, 
          error: (error as Error).message 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
});
