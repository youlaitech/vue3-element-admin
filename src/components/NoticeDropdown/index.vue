<template>
  <el-dropdown trigger="click">
    <el-badge v-if="list.length > 0" :value="list.length" :max="99">
      <div class="i-svg:bell" />
    </el-badge>

    <div v-else class="i-svg:bell" />

    <template #dropdown>
      <div class="p-5">
        <template v-if="list.length > 0">
          <div v-for="item in list" :key="item.id" class="w-500px py-3">
            <div class="flex-y-center">
              <DictTag v-model="item.type" code="notice_type" size="small" />
              <el-text
                size="small"
                class="w-200px cursor-pointer !ml-2 !flex-1"
                truncated
                @click="read(item.id)"
              >
                {{ item.title }}
              </el-text>

              <div class="text-xs text-gray">
                {{ item.publishTime }}
              </div>
            </div>
          </div>
          <el-divider />
          <div class="flex-x-between">
            <el-link type="primary" underline="never" @click="goMore">
              <span class="text-xs">查看更多</span>
              <el-icon class="text-xs">
                <ArrowRight />
              </el-icon>
            </el-link>
            <el-link v-if="list.length > 0" type="primary" underline="never" @click="readAll">
              <span class="text-xs">全部已读</span>
            </el-link>
          </div>
        </template>
        <template v-else>
          <div class="flex-center h-150px w-350px">
            <el-empty :image-size="50" description="暂无消息" />
          </div>
        </template>
      </div>
    </template>
  </el-dropdown>

  <el-dialog
    v-model="dialogVisible"
    :title="detail?.title ?? '通知详情'"
    width="800px"
    custom-class="notification-detail"
  >
    <div v-if="detail" class="p-x-20px">
      <div class="flex-y-center mb-16px text-13px text-color-secondary">
        <span class="flex-y-center">
          <el-icon><User /></el-icon>
          {{ detail.publisherName }}
        </span>
        <span class="ml-2 flex-y-center">
          <el-icon><Timer /></el-icon>
          {{ detail.publishTime }}
        </span>
      </div>

      <div class="max-h-60vh pt-16px mb-24px overflow-y-auto border-t border-solid border-color">
        <div v-html="detail.content"></div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useNotice } from "./useNotice";

const { list, detail, dialogVisible, read, readAll, goMore } = useNotice();
</script>

<style lang="scss" scoped></style>
