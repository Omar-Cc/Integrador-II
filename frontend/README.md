# Marweld Perú - Frontend Monorepo

Este es el repositorio centralizado del frontend para Marweld Perú, estructurado como un monorepo utilizando **Turborepo** y **pnpm Workspaces**, e integrado con **Tailwind CSS v4** y **shadcn/ui**.

---

## 📂 Estructura del Proyecto

El monorepo está dividido en dos directorios principales: `apps/` (aplicaciones) y `packages/` (librerías/configuraciones compartidas).

```bash
├── apps/
│   ├── web/          # Aplicación Next.js 16 (React 19)
│   └── admin/        # Panel de administración en Vite 8 + React 19
├── packages/
│   ├── ui/           # Biblioteca de componentes compartidos (@marweld/ui) con shadcn/ui
│   └── config/       # Configuraciones compartidas de ESLint y TypeScript (@marweld/config)
```

---

## 🚀 Guía de Inicio Rápido (Tutorial para Nuevos Desarrolladores)

Sigue estos pasos para configurar tu entorno local y empezar a desarrollar.

### 1. Requisitos Previos

- **Node.js**: Versión `>=22` (recomendado `>=24`).
- **pnpm**: Versión `>=10.23.0` (recomendado v10). Este proyecto está configurado para ejecutarse con **pnpm**.

### 2. Instalación de Dependencias

Clona el repositorio e instala todas las dependencias del monorepo desde la raíz:

```sh
pnpm install
```

_Nota: Gracias a pnpm Catalogs, todas las dependencias externas están centralizadas en [pnpm-workspace.yaml](./pnpm-workspace.yaml). No debes usar versiones explícitas en los subproyectos; usa `"catalog:"` en su lugar._

### 3. Comandos de Desarrollo Comunes

Puedes correr comandos globales de Turborepo desde la raíz del proyecto:

- **Iniciar Entorno de Desarrollo (todas las aplicaciones)**:
  ```sh
  pnpm dev
  ```
- **Compilar Todo (Vite y Next.js)**:
  ```sh
  pnpm build
  ```
- **Comprobación de Tipos (Type-checking en TypeScript)**:
  ```sh
  pnpm check-types
  ```
- **Comprobación de Estilo y Código (ESLint)**:
  ```sh
  pnpm lint
  ```

Si deseas correr un comando en una aplicación específica, utiliza el filtro de pnpm o turbo:

```sh
pnpm --filter web dev        # Iniciar Next.js (web)
pnpm --filter admin dev      # Iniciar Vite (admin)
```

---

## 🛠️ Cómo agregar Componentes con shadcn/ui

Este monorepo centraliza los componentes de UI en el paquete `@marweld/ui` ([packages/ui](./packages/ui)). No debes instalar componentes individuales en `web` o `admin`.

### Paso 1: Agregar el Componente mediante la CLI

Para agregar componentes de **shadcn/ui**, lo recomendado es ejecutar el comando usando el parámetro `-c` indicando la carpeta de destino (`packages/ui` o `apps/web`), **siempre desde la raíz del monorepo**. Esto evita tener que cambiar de directorio manualmente:

- **Para agregar un componente a la librería de UI compartida (Recomendado)**:

  ```sh
  pnpm dlx shadcn@latest add <nombre-componente> -c packages/ui
  ```

  _(Por ejemplo: `pnpm dlx shadcn@latest add button -c packages/ui`)_

- **Para agregar un componente directamente a la aplicación web (Next.js)**:
  ```sh
  pnpm dlx shadcn@latest add <nombre-componente> -c apps/web
  ```

> [!NOTE]
> Usar el flag `-c packages/ui` o `-c apps/web` permite que el comando se ejecute desde la raíz con `pnpm dlx` sin necesidad de entrar a la carpeta correspondiente. Si utilizáramos `npx shadcn@latest add <componente>`, estaríamos obligados a cambiar previamente al directorio del subproyecto (`cd packages/ui`) para que la CLI de shadcn localice su archivo de configuración `components.json`.

Esto creará el componente directamente en `packages/ui/src/components/ui/<nombre-componente>.tsx` y actualizará automáticamente las dependencias correspondientes (como primitivos de Radix) en su `package.json`.

_Nota: Después de agregar un componente, corre `pnpm install` desde la raíz para asegurar que cualquier nueva dependencia externa sea debidamente enlazada en el lockfile del monorepo._

### Paso 2: Importar y Usar el Componente en tus Apps

Una vez que el componente está en `@marweld/ui`, puedes importarlo directamente en `apps/web` o `apps/admin`:

```tsx
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@marweld/ui/components/ui/dialog";
import { Button } from "@marweld/ui/components/ui/button";

export default function MiComponente() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir modal</Button>
      </DialogTrigger>
      <DialogContent>{/* Contenido del modal */}</DialogContent>
    </Dialog>
  );
}
```

---

## 📦 Cómo agregar nuevas dependencias (pnpm Catalogs)

En este monorepo administramos las dependencias de forma centralizada utilizando la característica de **Catalogs** de pnpm. Para añadir cualquier nueva librería o devDependency:

### Paso 1: Registrar en el catálogo global

Abre el archivo [pnpm-workspace.yaml](./pnpm-workspace.yaml) y registra el paquete y su versión en el bloque `catalog:`:

```yaml
catalog:
  nombre-dependencia: ^1.0.0
```

### Paso 2: Instalar en la aplicación o paquete destino

Una vez registrada en el catálogo global, ejecuta la instalación usando el protocolo `@catalog:` en el subproyecto donde lo necesites:

- **Para una dependencia de producción (dependencies) en una aplicación**:
  ```sh
  pnpm --filter web add nombre-dependencia@catalog:
  ```
- **Para una dependencia de desarrollo (devDependencies) en una aplicación o paquete**:
  ```sh
  pnpm --filter admin add -D nombre-dependencia@catalog:
  ```
- **Para instalar una dependencia en la librería de UI compartida**:
  ```sh
  pnpm --filter @marweld/ui add nombre-dependencia@catalog:
  ```

_(Alternativamente, puedes añadirla manualmente al `package.json` del subproyecto indicando `"nombre-dependencia": "catalog:"` y luego correr `pnpm install` en la raíz)._

### Paso 3: Enlazar dependencias internas del Monorepo (Workspace)

Si necesitas usar un paquete local interno (como `@marweld/ui`) dentro de otro paquete o aplicación (como `apps/admin` o `apps/web`), debes enlazarlo usando la especificación `workspace:*`:

- **Agregar `@marweld/ui` a la aplicación Admin (Vite)**:
  ```sh
  pnpm --filter admin add @marweld/ui@workspace:*
  ```
- **Agregar `@marweld/ui` a la aplicación Web (Next.js)**:
  ```sh
  pnpm --filter web add @marweld/ui@workspace:*
  ```

---

## 💅 Estilos y Formateo de Código

### 🎨 Tailwind CSS v4

Este proyecto utiliza **Tailwind CSS v4**. La configuración del diseño y los temas visuales de shadcn está centralizada en la hoja de estilos global [packages/ui/src/globals.css](packages/ui/src/globals.css). Cualquier modificación de tema, variables CSS o colores base debe hacerse en ese archivo dentro de la directiva `@theme`.

### ✒️ Formateo con Prettier

Hemos centralizado las reglas de código con **Prettier** a nivel de la raíz en [.prettierrc](.prettierrc).

- Además, está integrado con `prettier-plugin-tailwindcss` para ordenar automáticamente tus clases CSS de Tailwind al guardar tus archivos.
- Asegúrate de tener activa la opción **"Format on Save"** en tu editor de código preferido (como VS Code).
- Puedes formatear manualmente todo el proyecto corriendo:
  ```sh
  pnpm format
  ```
