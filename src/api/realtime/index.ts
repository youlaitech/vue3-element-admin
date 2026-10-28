import { isAxiosError } from "axios";
import { ApiCodeEnum } from "@/enums/api";
import request from "@/utils/request";
import type {
  CreateRealtimeTicketRequest,
  PresenceSnapshot,
  RealtimeTicketResponse,
} from "@/utils/realtime/protocol";

const REALTIME_BASE_URL = "/api/v1/realtime";

const RealtimeAPI = {
  /**
   * 获取连接票据；服务未启用或无权连接时返回 null。
   */
  async createTicket(data: CreateRealtimeTicketRequest): Promise<RealtimeTicketResponse | null> {
    try {
      return await request<unknown, RealtimeTicketResponse>({
        url: `${REALTIME_BASE_URL}/tickets`,
        method: "post",
        data,
        timeout: 8_000,
        silentErrorStatuses: [503],
      });
    } catch (error) {
      if (
        isAxiosError<{ code?: string }>(error) &&
        (error.response?.status === 403 ||
          (error.response?.status === 503 &&
            error.response.data?.code === ApiCodeEnum.REALTIME_DISABLED))
      ) {
        return null;
      }
      throw error;
    }
  },

  /**
   * 查询当前节点的在线人数快照。
   */
  getPresenceSnapshot() {
    return request<unknown, PresenceSnapshot>({
      url: `${REALTIME_BASE_URL}/presence`,
      method: "get",
    });
  },
};

export default RealtimeAPI;
