import { Request, Response } from "express"
import UserServices from "../services/UserServices"

export class UserController {
  async create(req: Request, res: Response) {
    const { name, email, password } = req.body
    const { status, message } = await new UserServices().create(
      name,
      email,
      password
    )
    return res.status(status).json({ message })
  }

  async read(req: Request, res: Response) {
    const result = await new UserServices().read(req.id)
    return res.json(result)
  }

  async update(req: Request, res: Response) {
    const { email, password } = req.body

    const { user, accessToken, refreshToken } = await new UserServices().update(
      email,
      password
    )

    return res
      .cookie("r_token", refreshToken, {
        httpOnly: true,
        maxAge: Number(process.env.MAX_REFRESH),
        secure: process.env.NODE_ENV === "production",
      })
      .json({ user, accessToken })
  }

  async delete(req: Request, res: Response) {
    const { password } = req.body
    const result = await new UserServices().delete(req.id, password)
    return res
      .clearCookie("access_token")
      .clearCookie("r_token")
      .status(result.status)
      .json(result)
  }
}
