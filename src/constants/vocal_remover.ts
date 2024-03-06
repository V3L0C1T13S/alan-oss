import dotenv from "dotenv";
import process from "node:process";

dotenv.config();

export const vocalRemoverPythonBin = process.env.VOCAL_REMOVER_PYTHON_BIN;
export const vocalRemoverPath = process.env.VOCAL_REMOVER_PATH;
export const vocalRemoverGPU = process.env.VOCAL_REMOVER_GPU ?? "-1";
