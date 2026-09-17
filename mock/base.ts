import path from "path";
import { createDefineMock } from "vite-plugin-mock-dev-server";

export const defineMock = createDefineMock((mock) => {
  // 拼接url
  mock.url = path.join(import.meta.env.VITE_API_BASE + "/api/v1/", mock.url);
});
