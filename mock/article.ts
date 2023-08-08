import { MockMethod } from "vite-plugin-mock";

const article_list: any = [];
const count = 100;

for (let i = 0; i < count; i++) {
  article_list.push({
    id: i,
    timestamp: new Date().getTime(),
    author: `Author ${i}`,
    reviewer: `reviewer ${i}`,
    title: `Title ${i}`,
    importance: Math.floor(Math.random() * 3) + 1,
    type: ["CN", "US", "JP", "EU"][Math.floor(Math.random() * 4)],
    status: ["published", "draft"][Math.floor(Math.random() * 2)],
    display_time: new Date().toISOString(),
    pageviews: Math.floor(Math.random() * (5000 - 300)) + 300,
    remark: `remark ${i}`,
  });
}

export default [
  {
    url: "/api/v1/article/list",
    timeout: 200,
    method: "get",
    response: ({ query }) => {
      const { importance, type, title, page = 1, limit = 10, sort } = query;
      let mock_list = article_list.filter((item: any) => {
        if (importance && item.importance !== +importance) return false;
        if (type && item.type !== type) return false;
        if (title && item.title.indexOf(title) < 0) return false;
        if (item.status === "deleted") return false;
        return true;
      });
      if (sort === "-id") {
        mock_list = mock_list.reverse();
      }
      const page_list = mock_list.filter(
        (item: any, index: number) =>
          index < limit * page && index >= limit * (page - 1)
      );

      return {
        code: "00000",
        data: { total: mock_list.length, page: page, items: page_list },
        msg: "一切ok",
      };
    },
  },
  {
    url: "/api/v1/article/detail",
    timeout: 200,
    method: "get",
    response: ({ query }) => {
      const { id } = query;
      for (const article of article_list) {
        if (article.id === +id) {
          return {
            code: "00000",
            data: article,
            msg: "一切ok",
          };
        }
      }
    },
  },
  {
    url: "/api/v1/article/pv",
    timeout: 200,
    method: "get",
    response: ({ query }) => {
      const { id } = query;
      for (const article of article_list) {
        if (article.id === +id) {
          return {
            code: "00000",
            data: {
              pv: article.pageviews,
              pvData: [
                { key: "PC", pv: 1024 },
                { key: "mobile", pv: 1024 },
                { key: "ios", pv: 1024 },
                { key: "android", pv: 1024 },
              ],
            },
            msg: "一切ok",
          };
        }
      }
    },
  },
  {
    url: "/api/v1/article/update",
    timeout: 200,
    method: "post",
    response: ({ body }) => {
      const { id, ...updatedFields } = body;
      // 查找要更新的文章
      const articleToUpdate = article_list.find(
        (article: any) => article.id === id
      );

      // 如果找到了要更新的文章
      if (articleToUpdate) {
        // 使用 Object.assign 方法更新文章
        Object.assign(articleToUpdate, updatedFields);
        return {
          code: "00000",
          data: {
            article: articleToUpdate,
          },
          msg: "一切ok",
        };
      } else {
        console.error(`Article with id ${id} not found.`);
      }
    },
  },
  {
    url: "/api/v1/article/create",
    timeout: 200,
    method: "post",
    response: ({ body }) => {
      const { title, author, importance, type, status, remark, timestamp } =
        body;
      // article_list最大的id值;
      const maxId = article_list.reduce((maxId: number, article: any) => {
        return Math.max(maxId, article.id);
      }, -1);
      const article = {
        id: maxId + 1,
        timestamp,
        author,
        reviewer: `reviewer ${maxId + 1}`,
        title,
        importance,
        type,
        status,
        display_time: new Date(timestamp).toISOString(),
        pageviews: Math.floor(Math.random() * (5000 - 300)) + 300,
        remark,
      };
      article_list.push(article);
      return {
        code: "00000",
        data: {
          article,
        },
        msg: "一切ok",
      };
    },
  },
  {
    url: "/api/v1/article/delete",
    timeout: 200,
    method: "post",
    response: ({ body }) => {
      const { id } = body;
      const index = article_list.findIndex((article: any) => article.id === id);
      article_list.splice(index, 1);
      return {
        code: "00000",
        msg: "一切ok",
      };
    },
  },
] as MockMethod[];
