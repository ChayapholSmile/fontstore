import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDatabase } from "./mongodb"
import type { User } from "./models/User"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
  const db = await getDatabase()
  const hashedPassword = await hashPassword(userData.password)

  const user: User = {
    ...userData,
    password: hashedPassword,
    wishlist: [],
    purchasedFonts: [],
    notifications: {
      wishlistPriceChanges: true,
      newFontsFromFollowed: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection("users").insertOne(user)
  return { ...user, _id: result.insertedId }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const db = await getDatabase()
  const user = (await db.collection("users").findOne({ email })) as User | null

  if (!user) return null

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) return null

  return user
}
