import express from "express"
import cors from "cors"
import morgan from "morgan"
import { createProxyMiddleware } from "http-proxy-middleware"

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

/*
SERVICE ROUTES
*/

// Auth Service
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://auth-service:4001",
    changeOrigin: true,
    pathRewrite: {
      "^/auth": "/auth"
    }
  })
)

// Mission Service
app.use(
  "/missions",
  createProxyMiddleware({
    target: "http://mission-service:4002",
    changeOrigin: true,
    pathRewrite: {
      "^/missions": ""
    }
  })
)

// Notification Service
app.use(
  "/notifications",
  createProxyMiddleware({
    target: "http://notification-service:4003",
    changeOrigin: true,
    pathRewrite: {
      "^/notifications": ""
    }
  })
)

/*
Health Check
*/

app.get("/health", (req, res) => {
  res.json({
    service: "api-gateway",
    status: "running"
  })
})
 
/*
404 Handler
*/

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  })
})

const PORT = 4000

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`)
})