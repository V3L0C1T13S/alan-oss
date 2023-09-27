import axios from "axios";
import { reflectcordAPIURL } from "../../../constants/index.js";

interface reflectcordInstanceInfo {
    ping: string;
    revolt: {
        revolt: string,
    }
}

let info: reflectcordInstanceInfo | undefined;

export async function getReflectcordInstanceInfo() {
  if (info) return info;

  const instanceInfo = await axios.get<reflectcordInstanceInfo>(`${reflectcordAPIURL}/ping`);

  info = instanceInfo.data;

  return instanceInfo.data;
}
