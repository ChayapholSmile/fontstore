import { getDatabase } from "./mongodb"
import { hashPassword, verifyPassword } from "./auth-utils"
import type { User } from "./models/User"

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
