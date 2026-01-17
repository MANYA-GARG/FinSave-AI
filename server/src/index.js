import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import dbConnect from "./config/dbConnect.js";
import authRoutes from "./routes/authRoutes.js"
import "./config/passportConfig.js";
import walletRoutes from "./routes/walletRoutes.js";
import sharedExpenseRoutes from "./routes/sharedExpenseRoutes.js";
import fraudRoutes from "./routes/fraudRoutes.js";
import badgeRoutes from "./routes/badgeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


dbConnect();
const app=express();

//middlewares
app.use(
cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
})
);
app.options("*", cors());

app.use(express.json({limit: "100mb"}));
app.use(express.urlencoded({limit:"100mb",extended :true}));
app.set("trust proxy", 1);
app.use(
    session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie:{
        httpOnly: true,
        maxAge:60000 * 60,
        // Only send cookies over HTTPS in production
            secure: process.env.NODE_ENV === "production", 
            // Necessary for cross-site cookies
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    }
})
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/wallet", walletRoutes);
app.use("/api/split", sharedExpenseRoutes);
app.use("/api/fraud", fraudRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/ai", aiRoutes);

//routes
app.use("/api/auth",authRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);


//listen app
const PORT= process.env.PORT || 7002;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
});
