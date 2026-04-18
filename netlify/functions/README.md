# The 1% Protocol — fase fácil con WHOOP

## Qué quedó resuelto
- UI limpia sin panel derecho.
- Header normal, no sticky.
- Pestaña Semana con fecha real por día.
- Caché del clima por 15 min.
- Service Worker básico.
- Botón `Conectar WHOOP`.
- Netlify Functions listas para OAuth y lectura de recovery/sleep/strain.

## Qué te falta hacer
1. Sube **todos** estos archivos al repo:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `netlify.toml`
   - carpeta `netlify/functions/`
2. En WHOOP Developer Dashboard:
   - crea una app
   - scopes: `read:recovery read:sleep read:cycles read:profile offline`
   - Redirect URI: `https://TU-SITIO.netlify.app/.netlify/functions/whoop-callback`
3. En Netlify > Site configuration > Environment variables:
   - `WHOOP_CLIENT_ID`
   - `WHOOP_CLIENT_SECRET`
   - `WHOOP_REDIRECT_URI`
4. Haz redeploy.
5. Entra a tu sitio y pulsa `Conectar WHOOP`.

## Test rápido
- `/.netlify/functions/health`
- luego `Conectar WHOOP`
