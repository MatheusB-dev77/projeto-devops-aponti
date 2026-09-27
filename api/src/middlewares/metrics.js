const client = require('prom-client');

const register = new client.Registry();
register.setDefaultLabels({ app: 'ecommerce-api' });

// Métricas padrão do Node: CPU, memória, event loop, GC...
client.collectDefaultMetrics({ register });

// Total de requisições (base para "requisições por segundo")
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Duração das requisições (base para "tempo de resposta")
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

// Mede cada requisição que passa pela API
function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') return next();
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    // Troca IDs numéricos por :id (/api/v1/products/7 -> /api/v1/products/:id)
    // para não criar uma série nova por ID. Rotas inexistentes viram "unmatched".
    const route = req.route
      ? req.originalUrl.split('?')[0].replace(/\/\d+(?=\/|$)/g, '/:id')
      : 'unmatched';
    const labels = { method: req.method, route, status_code: res.statusCode };
    httpRequestsTotal.inc(labels);
    end(labels);
  });

  next();
}

// Endpoint lido pelo Prometheus
async function metricsHandler(req, res) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}

module.exports = { metricsMiddleware, metricsHandler, register };