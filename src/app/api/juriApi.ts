import Axios from "axios";

const juriApi = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_JURI_API_URL,
  responseType: "json",
  withCredentials: true,
});

export default juriApi;
