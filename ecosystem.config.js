module.exports = {
  apps: [
    {
      name: 'Izumi-v3',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '450M',
    },
  ],
};
