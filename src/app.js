import express from "express"
import cookieParser from "cookie-parser"
import authRouter from "./routes/authRoutes.js"
import helmet from "helmet"
import cors from "cors"
import rateLimit from "express-rate-limit"

const app = express()

// Helmet: Añade cabeceras HTTP de seguridad automáticamente
app.use(helmet())

// CORS: permite que el front acceda a la api y las cookies de diferente origen (nuestro back)

app.use(
  cors({
    origin: "http://localhost:5500" || "http://127.0.0.1:5500", // nos lo da live server
    credentials: true, // importante para httpOnly
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-type"],
  }),
)

// Rate limit: máximo 10 peticiones por minuto

const limiter = rateLimit({
  windowMs: 60 * 1000, // Define la ventana de tiempo
  max: 10, // número máximo de peticiones
  message: {
    ok: false,
    error: "Demasiadas peticiones. Inténtalo de nuevo en 1 minuto.",
  },
})

app.use(limiter)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(authRouter)

export default app
