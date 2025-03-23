import axios, { AxiosError } from "axios"
import { saveHeader } from "../utils/datafetching"

const baseURL =
  import.meta.env?.MODE === "production"
    ? "https://crypton-services.marcosandrade.dev"
    : "http://localhost:3000"
const api = axios.create({
  baseURL,
  withCredentials: true,
})

api.interceptors.response.use(null, async (error: AxiosError) => {
  if (error.response.data !== "TokenExpiredError") return Promise.reject(error)

  const { data } = await api.post("/user/token")
  const config = error.config
  config.headers.authorization = `Bearer ${data.accessToken}`
  saveHeader(data.accessToken)
  return axios.request(config)
})

export default api
