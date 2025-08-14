import router from "@/router";
import { ElButton } from "element-plus";

export default defineComponent({
  name: "ToDetail",
  setup() {
    // 跳转详情
    const navigateToDetail = async (id: number) => {
      await router.push({
        path: "/detail/" + id,
        query: { message: `msg${id}` },
      });
    };
    return () =>
      h("div", null, [
        h(
          ElButton,
          {
            type: "primary",
            onClick: () => navigateToDetail(1),
          },
          { default: () => "跳转详情1" }
        ),
        h(
          ElButton,
          {
            type: "success",
            onClick: () => navigateToDetail(2),
          },
          { default: () => "跳转详情2" }
        ),
      ]);
  },
});
