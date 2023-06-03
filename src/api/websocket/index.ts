import request from "@/utils/request";

/**
 * 发送消息给所有人
 *
 * @param file
 */
export function sendToAll(message: string) {
  return request({
    url: "/websocket/sendToAll",
    method: "post",
    params: { message: message },
  });
}

/**
 * 发送消息给指定用户
 *
 * @param
 */
export function sendToUser(userId: number, message: string) {
  return request({
    url: "/websocket/sendToUser/" + userId,
    method: "post",
    params: { message: message },
  });
}
