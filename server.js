import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/index.js';
import { connectDB } from './db/sqlServer.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);
const openApiPath = path.join(__dirname, 'docs', 'openapi.json');

app.get('/openapi.json', (req, res) => {
  res.sendFile(openApiPath);
});

app.get('/docs', (req, res) => {
  res.send(`<!DOCTYPE html>
  <html>
    <head>
      <title>Library API Docs</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .banner { background: #0b3954; color: white; padding: 12px 18px; font-weight: 600; }
        .banner a { color: #f6d32d; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="banner">Library Book Backend API · <a href="/openapi.json" target="_blank" rel="noopener noreferrer">ดาวน์โหลดสเปค</a></div>
      <redoc spec-url="/openapi.json" suppress-warnings></redoc>
      <script src="https://cdn.jsdelivr.net/npm/redoc/bundles/redoc.standalone.js"></script>
    </body>
  </html>`);
});

app.get('/swagger', (req, res) => {
  res.send(`<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Library API Swagger</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
      <style>
        body { margin: 0; padding: 0; }
        .topbar { display: none; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/openapi.json',
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis],
          });
        };
      </script>
    </body>
  </html>`);
});

connectDB().then(() => {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to start server:', err);
});
