module.exports = {
  apps: [
    {
      name: "boper",
      script: "./dist/server/index.js",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 8080
      },
      max_memory_restart: "500M",
      watch: false,
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    }
  ]
};