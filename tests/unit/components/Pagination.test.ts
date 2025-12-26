import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import Pagination from "@/components/Pagination/index.vue";
import ElementPlus from "element-plus";

describe("Pagination 组件", () => {
  const createWrapper = (props = {}) => {
    return mount(Pagination, {
      props: {
        page: 1,
        limit: 10,
        total: 100,
        ...props,
      },
      global: {
        plugins: [ElementPlus],
      },
    });
  };

  describe("渲染", () => {
    it("应该正确渲染分页组件", () => {
      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find(".pagination").exists()).toBe(true);
    });

    it("应该在 hidden 为 true 时隐藏分页", () => {
      const wrapper = createWrapper({ hidden: true });
      expect(wrapper.find(".pagination").classes()).toContain("hidden");
    });

    it("应该在 hidden 为 false 时显示分页", () => {
      const wrapper = createWrapper({ hidden: false });
      expect(wrapper.find(".pagination").classes()).not.toContain("hidden");
    });
  });

  describe("Props", () => {
    it("应该接收 total 属性", () => {
      const wrapper = createWrapper({ total: 200 });
      expect(wrapper.props("total")).toBe(200);
    });

    it("应该接收 pageSizes 属性", () => {
      const pageSizes = [5, 10, 20, 50];
      const wrapper = createWrapper({ pageSizes });
      expect(wrapper.props("pageSizes")).toEqual(pageSizes);
    });

    it("应该使用默认的 pageSizes", () => {
      const wrapper = createWrapper();
      expect(wrapper.props("pageSizes")).toEqual([10, 20, 30, 50]);
    });

    it("应该接收 layout 属性", () => {
      const layout = "prev, pager, next";
      const wrapper = createWrapper({ layout });
      expect(wrapper.props("layout")).toBe(layout);
    });

    it("应该接收 background 属性", () => {
      const wrapper = createWrapper({ background: false });
      expect(wrapper.props("background")).toBe(false);
    });
  });

  describe("事件", () => {
    it("应该在页码改变时触发 pagination 事件", async () => {
      const wrapper = createWrapper();

      // 模拟页码改变
      await wrapper.vm.handleCurrentChange(2);

      expect(wrapper.emitted("pagination")).toBeTruthy();
      expect(wrapper.emitted("pagination")?.[0]).toEqual([{ page: 2, limit: 10 }]);
    });

    it("应该在每页条数改变时触发 pagination 事件", async () => {
      const wrapper = createWrapper();

      // 模拟每页条数改变
      await wrapper.vm.handleSizeChange(20);

      expect(wrapper.emitted("pagination")).toBeTruthy();
      expect(wrapper.emitted("pagination")?.[0]).toEqual([{ page: 1, limit: 20 }]);
    });

    it("应该在每页条数改变时重置页码为 1", async () => {
      const wrapper = createWrapper({ page: 3 });

      await wrapper.vm.handleSizeChange(20);

      expect(wrapper.emitted("pagination")?.[0]).toEqual([{ page: 1, limit: 20 }]);
    });
  });

  describe("边界情况", () => {
    it("应该在 total 为 0 时正常工作", () => {
      const wrapper = createWrapper({ total: 0 });
      expect(wrapper.exists()).toBe(true);
    });

    it("应该在当前页超出范围时自动调整", async () => {
      const wrapper = createWrapper({ page: 5, limit: 10, total: 100 });

      // 修改 total 使当前页超出范围
      await wrapper.setProps({ total: 20 });

      // 应该触发 pagination 事件，页码调整为最后一页
      expect(wrapper.emitted("pagination")).toBeTruthy();
    });
  });
});
