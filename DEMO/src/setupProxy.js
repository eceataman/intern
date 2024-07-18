const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://demo-api-capital.backend-capital.com',
            changeOrigin: true,
            pathRewrite: {
                '^/api': '/api/v1', // '/api' ile başlayan istekleri '/api/v1' ile yönlendirin
            },
        })
    );
};
