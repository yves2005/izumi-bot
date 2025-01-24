const getApiConfig = () => {
    return {
        baseUrl: "https://api.betabotz.eu.org/", // Your base API URL
        apiKey: "eypz-izumi", // Your API key
        proxy: {
            host: '2402:3a80:1e6f:5c1::2', // Your IPv6 address
            port: 8080  // Proxy port (use the correct port)
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' // Chrome User-Agent
    };
};

module.exports = { getApiConfig };
