import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { JwtPayload } from '../types/index'

const SALT_ROUNDS = 12

function signToken(payload: JwtPayload): string {
  const secret = process.env['JWT_SECRET']
  if (!secret) throw new Error('JWT_SECRET not configured')
  const expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '7d') as jwt.SignOptions['expiresIn']
  return jwt.sign(payload, secret, { expiresIn })
}

export async function register(username: string, email: string, password: string) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })
  if (existing) {
    const field = existing.email === email ? 'email' : 'username'
    const err = new Error(`${field} already in use`) as Error & { statusCode: number }
    err.statusCode = 409
    throw err
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await prisma.user.create({
    data: { username, email, passwordHash },
  })

  await prisma.userStats.create({ data: { userId: user.id } })

  const payload: JwtPayload = { userId: user.id, email: user.email, username: user.username, role: user.role }
  const token = signToken(payload)

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      level: user.level,
      membershipTier: user.membershipTier,
      role: user.role,
    },
  }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    const err = new Error('Invalid email or password') as Error & { statusCode: number }
    err.statusCode = 401
    throw err
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    const err = new Error('Invalid email or password') as Error & { statusCode: number }
    err.statusCode = 401
    throw err
  }

  const payload: JwtPayload = { userId: user.id, email: user.email, username: user.username, role: user.role }
  const token = signToken(payload)

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      level: user.level,
      membershipTier: user.membershipTier,
      role: user.role,
    },
  }
}
