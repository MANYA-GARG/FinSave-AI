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

const corsOptions={
    origin:"http://localhost:5173",
    credentials: true,

}
app.use(cors(corsOptions));

app.use(express.json({limit: "100mb"}));
app.use(express.urlencoded({limit:"100mb",extended :true}));
app.use(
    session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge:60000 * 60,
        
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