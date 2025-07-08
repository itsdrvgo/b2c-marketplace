import { env } from "@/../env";
import _axios from "axios";

export const axios = _axios.create({
    baseURL: env.NEXT_PUBLIC_BACKEND_URL,
});
