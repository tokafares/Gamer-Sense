export interface JwtPayload {
  userId: string
  email: string
  username: string
}

export interface AuthenticatedRequest {
  user: JwtPayload
}
