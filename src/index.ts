import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import session from "express-session";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import axios from "axios";
import router from "./route";

export const prismadb = new PrismaClient();

const app = express();

dotenv.config();

app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in database
        let user = await prismadb.user.findUnique({
          where: { email: profile.emails![0].value },
        });

        // If user does not exist, create a new user
        if (!user) {
          user = await prismadb.user.create({
            data: {
              name: profile.displayName!,
              email: profile.emails![0].value,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// GitHub authentication
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/auth/github/callback`,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        // Check if user already exists in database
        let user = await prismadb.user.findUnique({
          where: { email: profile.username + "@github.com" },
        });

        // If user does not exist, create a new user
        if (!user) {
          user = await prismadb.user.create({
            data: {
              name: profile.displayName || profile.username,
              email: profile.username + "@github.com",
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google authentication route
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google authentication callback route
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

// GitHub authentication route
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// GitHub authentication callback route
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/", (_, res) => {
  res.json({ message: "Use the endpoints" });
});

// Authentication Google callback route
app.post("/auth/callback", async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange authorization code for user information
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      grant_type: "authorization_code",
    });

    const userData = response.data;

    // Save the user data to your database or perform other actions

    res
      .status(200)
      .json({ message: "User authenticated successfully", userData });
  } catch (error) {
    console.error("Error handling authentication callback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Authentication Github callback route
app.post("/auth/callback", async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange authorization code for user information
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = response.data.access_token;

    // Fetch user information using the access token
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = userResponse.data;

    // Save the user data to your database or perform other actions

    res
      .status(200)
      .json({ message: "User authenticated successfully", userData });
  } catch (error) {
    console.error("Error handling authentication callback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use("/api", router());

const server = http.createServer(app);

server.listen(8000, () => {
  console.log("🚀 Pluto is active at: http://localhost:8000");
});
