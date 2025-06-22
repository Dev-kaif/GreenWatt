import { Request, Response } from "express";
import { supabase } from "../config/supabaseCLient";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ message: "Email is already registered." });
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      res.status(400).json({ message: authError.message });
      return;
    }

    let userInOurDb;
    if (authData.user) {
      userInOurDb = await prisma.user.create({
        data: {
          id: authData.user.id, // Use Supabase user ID as our User ID
          email: authData.user.email!,
          firstName: firstName,
          lastName: lastName,
        },
      });
    }

    res.status(201).json({
      message:
        "User registered successfully. Check your email for verification if required.",
      user: userInOurDb
        ? { id: userInOurDb.id, email: userInOurDb.email }
        : null,
      supabaseUser: authData.user
        ? { id: authData.user.id, email: authData.user.email }
        : null,
      session: authData.session,
    });
    return;
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Internal server error during signup.",
      error: error.message,
    });
    return;
  }
};

// User Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  try {
    // Authenticate user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ message: error.message });
      return;
    }

    // If login is successful, you might want to fetch or update your internal User record
    // For instance, update lastLoginAt, or ensure the user exists in your `User` table.
    // In many cases, you'd rely on Supabase's session for user identification after login.
    const userInOurDb = await prisma.user.findUnique({
      where: { id: data.user?.id },
    });

    if (!userInOurDb) {
      // This scenario means a user logged in via Supabase but isn't in our `User` table.
      // This might happen if they signed up via a different method (e.g., social login)
      // or if our `User` table creation failed during signup.
      // You might want to create the user here or handle this as an error.
      console.warn(
        `User with ID ${data.user?.id} found in Supabase Auth but not in our 'User' table.`
      );
      // Optionally create the user here if you expect them to always exist in your DB after auth
      // Or redirect to profile completion.
    }

    res.status(200).json({
      message: "Login successful",
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      session: data.session, // Crucial for frontend to maintain session
    });
    return;
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error during login.",
      error: error.message,
    });
    return;
  }
};
