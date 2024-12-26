module.exports = {
  apps : [{
    name: "sp-extractor",
    script: "src/test-final.js",
    autorestart: false,
    max_restarts: 0,
    kill_timeout: 5000,
    env: {
      NODE_ENV: "production"
    }
  }]
}
