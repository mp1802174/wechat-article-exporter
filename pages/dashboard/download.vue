<template>
  <div class="flex flex-col h-full">
    <Teleport defer to="#title">
      <h1 class="text-[28px] leading-[34px] text-slate-12 font-bold">文章导出 <span class="text-sm text-slate-10">导出本地已缓存的文章</span>
      </h1>
    </Teleport>
    <div class="flex flex-1 overflow-hidden">

      <!-- 公众号列表 -->
      <ul class="flex flex-col h-full w-fit overflow-y-scroll divide-y">
        <li v-for="accountInfo in sortedAccountInfos" :key="accountInfo.fakeid"
            class="relative px-4 pr-16 py-4 hover:bg-slate-3 hover:cursor-pointer transition"
            :class="{'bg-slate-3': selectedAccount === accountInfo.fakeid}" @click="toggleSelectedAccount(accountInfo)">
          <p>公众号:
            <span v-if="accountInfo.nickname" class="text-xl font-medium">{{ accountInfo.nickname }}</span>
          </p>
          <p>ID: <span class="font-mono">{{ accountInfo.fakeid }}</span></p>
          <UBadge variant="subtle" color="green" class="absolute top-4 right-2">{{ accountInfo.articles }}</UBadge>
        </li>
      </ul>

      <!-- 文章列表 -->
      <main class="flex-1 h-full overflow-y-scroll">
        <div v-if="loading" class="flex justify-center items-center mt-5">
          <Loader :size="28" class="animate-spin text-slate-500"/>
        </div>
        <div class="relative" v-else-if="selectedAccount">
          <div class="sticky top-0 z-50 bg-white flex justify-between items-center  px-4 h-[40px]">
            <div class="flex items-center space-x-4">
              <span>过滤条件:</span>
              <UInput v-model="query.title" placeholder="请输入标题过滤" color="blue"/>

              <UButton color="gray" variant="solid" @click="search">搜索</UButton>
            </div>
            <div class="space-x-2">
              <UButton color="black" variant="solid" class="disabled:bg-slate-4 disabled:text-slate-12"
                       :disabled="selectedArticles.length === 0 || batchDownloadLoading" @click="doBatchDownload">
                <Loader v-if="batchDownloadLoading" :size="20" class="animate-spin"/>
                <span v-if="batchDownloadLoading">{{ batchDownloadPhase }}:
                  <span
                      v-if="batchDownloadPhase === '下载文章内容'">{{ batchDownloadedCount }}/{{
                      selectedArticleCount
                    }}</span>
                  <span
                      v-if="batchDownloadPhase === '打包'">{{ batchPackedCount }}/{{ batchDownloadedCount }}</span>
                </span>
                <span v-else>打包下载</span>
              </UButton>
            </div>
          </div>
          <table class="w-full border-collapse">
            <thead class="sticky top-[40px] z-10 h-[40px] bg-white">
            <tr>
              <th>
                <UCheckbox class="justify-center" :indeterminate="isIndeterminate" v-model="checkAll"
                           @change="onCheckAllChange" color="blue"/>
              </th>
              <th class="w-14">序号</th>
              <th>标题</th>
              <th class="w-52">发布日期</th>
              <th class="w-12">原文</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(article, index) in displayedArticles" :key="article.aid">
              <td class="text-center" @click="toggleArticleCheck(article)">
                <UCheckbox class="justify-center" v-model="article.checked" color="blue"/>
              </td>
              <td class="text-center font-mono">{{ index + 1 }}</td>
              <td class="px-4 font-mono">{{ maxLen(article.title) }}</td>
              <td class="text-center font-mono">{{ formatTimeStamp(article.update_time) }}</td>
              <td class="text-center">
                <a class="text-blue-500 underline" :href="article.link" target="_blank">
                  <UIcon name="i-heroicons-link-16-solid" class="w-5 h-5"/>
                </a>
              </td>
            </tr>
            </tbody>
          </table>
          <!-- 状态栏 -->
          <div class="sticky bottom-0 h-[40px] bg-white flex items-center px-4 space-x-10 border-t-2 font-mono">
            <span class="text-green-500">已选 {{ selectedArticles.length }} / {{ displayedArticles.length }}</span>
            <span class="text-rose-300"
                  v-if="deletedArticlesCount > 0">已隐藏 {{ deletedArticlesCount }} 条删除文章</span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {getAllInfo, type Info} from '~/store/info'
import {getArticleCache} from "~/store/article";
import type {AppMsgEx, DownloadableArticle} from "~/types/types";
import {formatTimeStamp} from "~/utils";
import {Loader} from "lucide-vue-next";
import {sleep} from "@antfu/utils";
import {useBatchDownload} from "~/composables/useBatchDownload";
import {saveAs} from 'file-saver'


interface Article extends AppMsgEx {
  checked: boolean
  display: boolean
}

useHead({
  title: '数据导出 | 微信公众号文章导出'
})

// 已缓存的公众号信息
const cachedAccountInfos = await getAllInfo()
const sortedAccountInfos = computed(() => {
  cachedAccountInfos.sort((a, b) => {
    return a.articles > b.articles ? -1 : 1
  })
  return cachedAccountInfos
})

const selectedAccount = ref('')
const selectedAccountName = ref('')

async function toggleSelectedAccount(info: Info) {
  if (info.fakeid !== selectedAccount.value) {
    selectedAccount.value = info.fakeid
    selectedAccountName.value = info.nickname || info.fakeid
    switchTableData(info.fakeid).catch(() => {
    })
  }
}

const articles = reactive<Article[]>([])
const loading = ref(false)

const checkAll = ref(false)
const isIndeterminate = ref(false)

const displayedArticles = computed(() => {
  return articles.filter(article => article.display)
})
const selectedArticles = computed(() => {
  return articles.filter(article => article.checked && article.display)
})
const deletedArticlesCount = ref(0)

async function switchTableData(fakeid: string) {
  checkAll.value = false
  isIndeterminate.value = false

  loading.value = true
  articles.length = 0
  const data = await getArticleCache(fakeid, Date.now())
  deletedArticlesCount.value = data.filter(article => article.is_deleted).length
  articles.push(...data.filter(article => !article.is_deleted).map(article => ({
    ...article,
    checked: false,
    display: true,
  })))
  await sleep(500)
  loading.value = false

  query.title = ''
  query.albums = []
}

function maxLen(text: string, max = 35): string {
  if (text.length > max) {
    return text.slice(0, max) + '...'
  }
  return text
}

function toggleArticleCheck(article: Article) {
  article.checked = !article.checked

  if (articles.every(article => article.checked)) {
    // 全部选中
    checkAll.value = true
    isIndeterminate.value = false
  } else if (articles.every(article => !article.checked)) {
    // 全部取消选中
    checkAll.value = false
    isIndeterminate.value = false
  } else {
    //
    isIndeterminate.value = true
    checkAll.value = false
  }
}

function onCheckAllChange() {
  if (checkAll.value) {
    articles.forEach(article => {
      article.checked = true
      isIndeterminate.value = false
    })
  } else {
    articles.forEach(article => {
      article.checked = false
      isIndeterminate.value = false
    })
  }
}

const articleAlbums = computed(() => {
  return [...new Set(articles.flatMap(article => article.appmsg_album_infos).map(album => album.title))]
})

interface ArticleQuery {
  title: string
  albums: string[]
}

const query = reactive<ArticleQuery>({
  title: '',
  albums: [],
})

function search() {
  checkAll.value = false;
  isIndeterminate.value = false;

  articles.forEach(article => {
    article.display = true;
    article.checked = false;

    if (query.title && !article.title.toLowerCase().includes(query.title.toLowerCase())) {
      article.display = false
    }
    if (query.albums.length > 0 && !article.appmsg_album_infos.some(album => query.albums.includes(album.title))) {
      article.display = false
    }
  })
}

const { 
  loading: batchDownloadLoading, 
  phase: batchDownloadPhase, 
  downloadedCount: batchDownloadedCount, 
  packedCount: batchPackedCount, 
  download: actualBatchDownload 
} = useBatchDownload();

const selectedArticleCount = ref(0);

async function doBatchDownload() {
  if (!selectedArticles.value.length) return;

  const articlesToDownload: DownloadableArticle[] = selectedArticles.value.map(article => ({
    title: article.title,
    url: article.link,
    date: +article.update_time,
  }));

  selectedArticleCount.value = articlesToDownload.length;
  const filename = selectedAccountName.value || 'wechat_articles_export';
  
  // Reset counts from composable before starting
  downloadedCount.value = 0;
  packedCount.value = 0;

  await actualBatchDownload(articlesToDownload, filename);
}
</script>

<style scoped>
table th {
  padding: 0.5rem 0.25rem;
}


table td {
  border: 1px solid #00002d17;
  padding: 0.25rem 0.5rem;
}

td:first-child,
th:first-child {
  border-left: none;
}

td:last-child,
th:last-child {
  border-right: none;
}

th {
  border: 1px solid #00002d17;
  border-top: none;
}

tr:nth-child(even) {
  background-color: #00005506;
}

tr:hover {
  background-color: #00005506;
}
</style>
