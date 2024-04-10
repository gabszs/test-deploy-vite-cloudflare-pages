import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import AuthForm from "../../../../AuthForm"

import { UserData } from "shared/usertypes"
import api from "../../../../../services/api"
import { saveHeader } from "../../../../../utils/datafetching"
import { InputData } from "../../../../../utils/helpers"

export default function SignIn() {
  const navigate = useNavigate()

  const signIn = async (input: InputData) => {
    const { data } = await api.put<UserData | string>("/user", {
      email: input.email,
      password: input.password,
    })

    if (typeof data === "string") {
      return navigate("/register/validate", {
        state: {
          email: input.email,
          id: data,
        },
      })
    }

    saveHeader(data.accessToken)
    navigate("/dashboard")
  }

  return (
    <AuthForm submit={signIn} action="Sign in">
      <Link to="/register/reset_password" className="redirLink">
        Forgot password?
      </Link>
      <Link to="/register/signup" className="redirLink">
        Dont have an account?
      </Link>
    </AuthForm>
  )
}
