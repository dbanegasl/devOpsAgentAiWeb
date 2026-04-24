# User Explorer

> **Documentación completa:** [`docs/index.html`](./docs/index.html) — referencia de módulos, casos de prueba, cobertura y guía de despliegue.

Mini aplicación web en **JavaScript vanilla** que consume
[`jsonplaceholder`](https://jsonplaceholder.typicode.com/), valida los datos
recibidos y muestra los usuarios en una tabla con modal de detalle. Diseño
oscuro con acentos violeta, inspirado en la identidad de Claude AI.

## Estructura

```
project/
├── index.html
├── src/
│   ├── app.js
│   ├── api.js
│   └── validator.js
├── tests/
│   ├── validator.test.js
│   └── api.test.js
├── package.json
└── README.md
```

## Ejecutar en local

El proyecto no requiere build step: se puede abrir directamente en un navegador
moderno. Como usa módulos ES (`<script type="module">`), debe servirse por HTTP
(no desde `file://`).

Una opción rápida:

```bash
cd project
python3 -m http.server 8080
# http://localhost:8080
```

## Pruebas unitarias

```bash
cd project
npm install
npm test          # modo interactivo (watch)
npm run test:ci   # una pasada con cobertura (--coverage --ci)
```

Cobertura generada en `coverage/`.

### Casos cubiertos

- `validator.test.js` → usuario válido, email inválido, nombre vacío/ausente,
  ciudad vacía/ausente, `geo` ausente o incompleto, `user` `null`/`undefined`.
- `api.test.js` → red caída, HTTP 500, cuerpo vacío, JSON malformado,
  usuarios parcialmente inválidos (comportamiento: se devuelven solo los
  válidos; si ninguno es válido se lanza error) y casos de `fetchUserById`.

## Despliegue en GitHub Pages

1. Sube el contenido de `project/` a tu repositorio (puedes hacerlo en `main`
   o en una rama `gh-pages`).
2. En GitHub → **Settings → Pages**, selecciona la rama y la carpeta:
   - Si subes el proyecto en la raíz del repo: branch `main`, folder `/ (root)`.
   - Si lo subes como subcarpeta `project/`, usa la acción oficial
     `actions/deploy-pages` o mueve el contenido a la raíz.
3. GitHub publicará el sitio en `https://<usuario>.github.io/<repo>/`.

Como las rutas son relativas (`./src/app.js`) y todas las dependencias (Bootstrap,
FontAwesome) se cargan vía CDN, no hace falta ningún paso de compilación.

## Restricciones técnicas respetadas

- Solo JavaScript vanilla (sin React/Vue/Angular).
- Sin bundlers (Webpack, Vite, etc.).
- Bootstrap 5 y FontAwesome 6 desde CDN.
- Dependencias de desarrollo limitadas al ecosistema Jest (`jest`, `babel-jest`,
  `@babel/preset-env`, necesario para transpilar ES modules en el test runner).
