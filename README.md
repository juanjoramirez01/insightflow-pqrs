# PQRS Insight Hub

Dashboard PQRS — Plataforma Analítica Empresarial

Construye una aplicación web completa, moderna y funcional para un Dashboard de Indicadores PQRS orientado a una organización del sector salud.

El objetivo es permitir que usuarios de negocio puedan analizar las PQRS, identificar causas raíz, detectar oportunidades de mejora y tomar decisiones basadas en datos.

1. Objetivo principal

La aplicación debe permitir analizar las PQRS mediante una estructura jerárquica:

Causa Principal → Subcausa → Detalle

La experiencia principal debe ser interactiva. Cuando el usuario seleccione una Causa Principal, los gráficos deben actualizarse mostrando únicamente sus Subcausas. Cuando seleccione una Subcausa, deben mostrarse únicamente sus Detalles.

No quiero una landing page meramente promocional. Quiero una experiencia de dashboard real, navegable y visualmente convincente, acompañada de una portada ejecutiva.

2. Estructura de la aplicación

Crea las siguientes secciones:

A. Sidebar / navegación

Diseña un sidebar corporativo con:

Logo / nombre de la organización

Inicio

Dashboard PQRS

Análisis de causas

Prestadores

Regionales

Reportes

En mobile debe convertirse en un menú responsive.

La opción activa debe ser claramente identificable.

3. Header del Dashboard

En la parte superior mostrar:

Dashboard de Indicadores PQRS

Subtítulo:

Análisis integral de causas, subcausas y detalles de las PQRS

Agregar:

Selector de periodo

Selector de Regional

Selector de Tipo de servicio

Selector de Prestador / IPS

Botón "Limpiar filtros"

Los filtros deben funcionar sobre los datos mock y actualizar los indicadores y gráficos.

4. KPI Cards

Crear una primera fila de indicadores con tarjetas modernas:

Total PQRS

PQRS abiertas

PQRS cerradas

% de recurrencia

Tiempo promedio de gestión

Utiliza datos ficticios realistas.

IMPORTANTE: los datos son únicamente demostrativos y no deben presentarse como información real.

Cada KPI debe incluir:

Valor principal

Variación porcentual

Indicador visual de tendencia

Icono relacionado

5. ANÁLISIS JERÁRQUICO — FUNCIÓN PRINCIPAL

Esta es la funcionalidad más importante de toda la aplicación.

Crear una sección titulada:

Análisis de causas raíz

Mostrar un breadcrumb dinámico:

Todas las causas → Causa Principal → Subcausa → Detalle

Inicialmente mostrar el nivel:

Causa Principal

Utilizar una gráfica de barras horizontal o barras verticales para mostrar la cantidad de PQRS por causa.

Ejemplos de causas principales:

Problemas relacionados con la prestación del servicio

Problemas relacionados con autorizaciones

Al hacer clic sobre una Causa Principal:

Actualizar la gráfica.

Mostrar únicamente las Subcausas relacionadas.

Actualizar el breadcrumb.

Mostrar un botón para regresar al nivel anterior.

Ejemplo:

Problemas relacionados con la prestación del servicio

Subcausas:

Oportunidad

IPS no presta el servicio

Entrega de medicamentos, dispositivos e insumos

Después, cuando el usuario seleccione:

Oportunidad

mostrar únicamente sus detalles:

Sin agenda

Agenda lejana

No contacto

No devolución de llamada

Reprogramación

Cancelación

Error de agenda

Otro ejemplo:

Problemas relacionados con autorizaciones

Subcausas:

Error en autorización

Sin autorización

Para Error en autorización, mostrar:

Error en CUPS

Error en direccionamiento

Cantidad incorrecta

Datos faltantes

Separación de servicios

Para Sin autorización, mostrar:

Soportes insuficientes

Sin justificación

Orden médica o fórmula vencida

Inconveniente con MIPRES

SAS cerrado

SAS pendiente

Exclusión PBS

Otros definidos por la operación

La navegación debe ser realmente interactiva, no simulada.

6. Gráficas adicionales

Crear una sección de análisis multidimensional.

Incluir:

PQRS por tipo de servicio

Gráfico de barras mostrando la distribución de PQRS por tipo de servicio.

PQRS por regional

Gráfico comparativo entre regionales.

Top de prestadores

Ranking de IPS con mayor número de PQRS.

Tendencia temporal

Gráfico de líneas mostrando evolución de PQRS durante el periodo seleccionado.

Distribución de causas

Gráfico donut o equivalente mostrando la participación porcentual de las principales causas.

Todos los gráficos deben reaccionar a los filtros globales.

7. Homologación de prestadores

Crear una sección específica llamada:

Homologación de Prestadores

Explicar visualmente el proceso:

Registros CRM
→ Detección de duplicados
→ Unificación de nomenclatura
→ Homologación
→ IPS consolidada

Mostrar una tabla demostrativa:

Registro CRMIPS homologadaClínica ABC SASClínica ABCCLINICA ABCClínica ABCClínica ABC S.A.S.Clínica ABCIPS ABCClínica ABC

Mostrar métricas como:

Prestadores registrados

Registros duplicados detectados

Prestadores homologados

% de homologación

La finalidad es comunicar que la homologación evita la dispersión de los indicadores debido a diferentes nombres para una misma institución.

8. Panel de filtros

Crear un panel de filtros moderno y fácil de utilizar.

Filtros:

Periodo

Causa Principal

Subcausa

Detalle

Tipo de servicio

Prestador / IPS

Regional

Los filtros jerárquicos deben depender entre sí.

Ejemplo:

Si selecciono una Causa Principal, el filtro Subcausa debe mostrar únicamente las subcausas correspondientes.

Si selecciono una Subcausa, el filtro Detalle debe mostrar únicamente sus detalles.

9. Resumen ejecutivo

Agregar una sección superior o accesible desde Inicio con el título:

Resumen ejecutivo

Mostrar visualmente:

Principales causas

Regional con mayor cantidad de PQRS

Prestador con mayor cantidad de PQRS

Tipo de servicio con mayor recurrencia

Tendencia de PQRS

Principales oportunidades de mejora

Usar tarjetas y visualizaciones compactas.

10. Flujo de valor

Crear una sección visual que comunique:

PQRS
↓
Clasificación
↓
Análisis
↓
Identificación de causa raíz
↓
Oportunidad de mejora
↓
Plan de acción
↓
Seguimiento

Debe transmitir que el dashboard sirve para convertir información operativa en decisiones de mejora continua.

11. Diseño visual

Utiliza una estética de:

Business Intelligence

Data Analytics

Enterprise SaaS

Sector salud

Corporativo

Premium

Profesional

Evitar un diseño genérico de dashboard.

Paleta

Utilizar principalmente:

Navy / azul oscuro

Azul

Cyan como color de interacción

Blanco

Grises neutros

Estados:

Verde: positivo

Amarillo: advertencia

Rojo: crítico

No abusar de colores saturados.

Utilizar tarjetas con:

Bordes sutiles

Sombras muy ligeras

Border radius moderado

Excelente separación visual

La interfaz debe sentirse limpia y sofisticada.

12. UX

Prioriza:

Jerarquía visual clara.

Lectura rápida.

Excelente contraste.

Tooltips para gráficos.

Hover states.

Estados activos.

Feedback al aplicar filtros.

Breadcrumbs.

Navegación hacia atrás.

Empty states.

Loading states.

Mensajes claros cuando no existan datos.

No sobrecargar la pantalla.

13. Datos mock

Genera un dataset ficticio pero coherente para que toda la aplicación funcione.

Los datos deben incluir como mínimo:

Fecha

Causa Principal

Subcausa

Detalle

Tipo de servicio

Prestador

IPS homologada

Regional

Estado

Tiempo de gestión

Utiliza suficientes registros mock para que los gráficos y filtros tengan sentido.

Mantén siempre la relación:

Causa Principal → Subcausa → Detalle

Nunca permitas combinaciones inválidas.

14. Tecnología

Utiliza:

React

TypeScript

Tailwind CSS

Componentes reutilizables

Lucide React para iconos

Recharts para visualizaciones

Organiza el código de manera modular.

Separar claramente:

componentes UI

datos mock

lógica de filtros

lógica de navegación jerárquica

gráficos

layouts

15. Responsive

La aplicación debe funcionar perfectamente en:

Desktop

Laptop

Tablet

Mobile

En mobile:

Sidebar colapsable

KPI cards apiladas

Filtros en panel desplegable

Gráficos adaptables

Tablas con scroll horizontal cuando sea necesario

16. Interacciones obligatorias

Implementa realmente:

Filtros globales funcionales.

Drill-down Causa Principal → Subcausa → Detalle.

Breadcrumbs dinámicos.

Botón para regresar de nivel.

Filtros dependientes.

Actualización de KPI.

Actualización de gráficas.

Tooltips.

Hover states.

Botón para limpiar filtros.

No crear botones o controles que parezcan funcionales pero no hagan nada.

17. Experiencia inicial

Al abrir la aplicación, mostrar una página de inicio ejecutiva con:

Dashboard de Indicadores PQRS

Mensaje:

Convierte los datos de PQRS en decisiones para la mejora continua.

Mostrar una vista previa atractiva del dashboard y CTA:

Explorar dashboard

Al entrar al dashboard, llevar directamente al análisis de indicadores.

18. Criterios de calidad

El resultado final debe parecer una aplicación empresarial real lista para ser presentada a stakeholders.

Debe transmitir:

Confianza

Calidad de datos

Inteligencia analítica

Toma de decisiones

Mejora continua

No utilizar lorem ipsum.

No crear una simple maqueta estática.

Construye la experiencia completa con datos mock funcionales y navegación real.

Antes de finalizar, verifica que:

Todos los filtros funcionen.

Los gráficos respondan a los filtros.

La jerarquía Causa → Subcausa → Detalle sea consistente.

El drill-down funcione.

El breadcrumb funcione.

El botón de regresar funcione.

La interfaz sea responsive.

No existan botones principales sin funcionalidad.

Prioriza primero la funcionalidad del dashboard y después los detalles visuales.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://insightflow-pqrs.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/76fced0b-50bd-4fff-b665-8ae4acf1f0c0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
