import { onScopeDispose, ref, toRaw, watch } from "vue";
import type { Ref } from "vue";
import { genFileId } from "element-plus";
import type { UploadRequestOptions, UploadUserFile } from "element-plus";
import FileAPI from "@/api/file";
import type { FileInfo } from "@/api/file";

interface UploadValues<T> {
  toFile: (value: T) => FileInfo;
  toValue: (file: FileInfo) => T;
}

/**
 * 按 uid 同步上传队列与表单模型，外部替换模型时取消旧任务。
 * 自身更新的父级回写需保留数组引用，否则按外部替换处理。
 */
export function useUploadQueue<T>(model: Ref<T[]>, values: UploadValues<T>) {
  const fileList = ref<UploadUserFile[]>([]);
  const requests = new Map<number, AbortController>();
  // HTTP 结束后仍需等待组件回调，任务标记不能随控制器一起清理。
  const activeTasks = new Set<number>();
  // 暂存尚未回写的发布值，用于识别自身更新和合并连续成功的结果。
  let publishedValue: T[] | null = null;

  /**
   * 释放文件的本地预览地址。
   */
  function releasePreview(file: UploadUserFile): void {
    if (file.url?.startsWith("blob:")) URL.revokeObjectURL(file.url);
  }

  /**
   * 使全部任务失效并中断在途请求。
   */
  function abortAll(): void {
    // 先使回调失效，再中断请求，防止取消触发的回调回写模型。
    activeTasks.clear();
    requests.forEach((request) => request.abort());
    requests.clear();
  }

  /**
   * 回写文件值，并标记组件自身的模型更新。
   */
  function publish(value: T[]): void {
    publishedValue = toRaw(value);
    model.value = value;
  }

  watch(
    model,
    (items) => {
      // 同一引用是自身回写；内容相同的新数组仍视为外部替换。
      const ownUpdate = toRaw(items) === publishedValue;
      publishedValue = null;
      if (!ownUpdate) {
        abortAll();
        fileList.value.forEach(releasePreview);
      }
      // 保留待校验文件和在途 uid，供组件后续回调定位原任务。
      const pending = ownUpdate
        ? fileList.value.filter(
            (file) =>
              file.status === "ready" ||
              file.status === "uploading" ||
              (file.uid !== undefined && activeTasks.has(file.uid))
          )
        : [];
      fileList.value = [
        ...items.map((item) => {
          const info = values.toFile(item);
          return { ...info, uid: genFileId(), status: "success" as const };
        }),
        ...pending,
      ];
    },
    // 同步消费回写标记，避免延迟侦听与下一次发布混淆。
    { immediate: true, flush: "sync" }
  );

  /**
   * 提交文件并更新对应任务的上传进度。
   */
  function upload(
    options: UploadRequestOptions,
    fields: { name: string; data: Record<string, unknown> }
  ): Promise<FileInfo> {
    const uid = options.file.uid;
    const controller = new AbortController();
    activeTasks.add(uid);
    requests.set(uid, controller);
    const body = new FormData();
    body.append(fields.name, options.file);
    Object.entries(fields.data).forEach(([key, value]) => {
      body.append(key, value instanceof Blob ? value : String(value));
    });
    return FileAPI.upload(
      body,
      (percentage) => {
        const file = fileList.value.find((item) => item.uid === uid);
        if (file) file.percentage = percentage;
      },
      controller.signal
    ).finally(() => {
      if (requests.get(uid) === controller) requests.delete(uid);
    });
  }

  /**
   * 仅结算有效任务；重置、取消或重复回调返回 false。
   */
  function complete(info: FileInfo, file: UploadUserFile): boolean {
    if (file.uid === undefined || !activeTasks.delete(file.uid)) return false;
    const task = fileList.value.find((item) => item.uid === file.uid);
    if (!task) return false;
    releasePreview(task);
    task.url = info.url;
    task.status = "success";
    // 父级回写前可能连续成功，优先合并暂存结果，避免覆盖前一个文件。
    publish([...(publishedValue ?? model.value), values.toValue(info)]);
    return true;
  }

  /**
   * 移除有效的失败任务；过期、取消或重复回调返回 false。
   */
  function fail(file: UploadUserFile): boolean {
    if (file.uid === undefined || !activeTasks.delete(file.uid)) return false;
    releasePreview(file);
    fileList.value = fileList.value.filter((item) => item.uid !== file.uid);
    return true;
  }

  /**
   * 取消指定任务并释放预览资源。
   */
  function cancel(file: UploadUserFile): void {
    if (file.uid !== undefined) {
      // 中断可能同步触发回调，先使任务失效。
      activeTasks.delete(file.uid);
      requests.get(file.uid)?.abort();
      requests.delete(file.uid);
    }
    releasePreview(file);
    fileList.value = fileList.value.filter((item) => item.uid !== file.uid);
  }

  /**
   * 从表单模型中移除指定文件地址。
   */
  function remove(url: string): void {
    publish((publishedValue ?? model.value).filter((item) => values.toFile(item).url !== url));
  }

  onScopeDispose(() => {
    abortAll();
    fileList.value.forEach(releasePreview);
  });

  return { fileList, upload, complete, fail, cancel, remove };
}
