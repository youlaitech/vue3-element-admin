import type { AxiosResponse } from "axios";
import type { ApiResult } from "@/api/common";

/**
 * 读取文件接口返回的 JSON 业务结果，保留原始文件和响应头。
 */
export async function readBinaryApiResult(
  response: AxiosResponse<unknown>,
): Promise<ApiResult | undefined> {
  if (response.config.responseType !== "blob" && response.config.responseType !== "arraybuffer") {
    return undefined;
  }

  const contentType = String(response.headers["content-type"] ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (
    contentType !== "application/json" &&
    !(contentType.startsWith("application/") && contentType.endsWith("+json"))
  ) {
    return undefined;
  }

  let text: string;
  if (response.data instanceof Blob) text = await response.data.text();
  else if (response.data instanceof ArrayBuffer) text = new TextDecoder().decode(response.data);
  else return undefined;

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (cause) {
    throw new Error("文件接口返回了无效的 JSON", { cause });
  }
  if (
    typeof value !== "object" ||
    value === null ||
    !("code" in value) ||
    typeof value.code !== "string" ||
    !("msg" in value) ||
    typeof value.msg !== "string"
  ) {
    return undefined;
  }
  return {
    ...value,
    code: value.code,
    msg: value.msg,
    data: "data" in value ? value.data : undefined,
  };
}
