<template>
  <div class="min-h-screen bg-gray-100 p-2 sm:p-4 md:p-6 font-sans text-gray-800">
    <div class="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-2rem)] sm:h-auto sm:min-h-[800px]">
      
      <div class="bg-indigo-600 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            新化國中排課系統
          </h1>
          <p class="text-indigo-200 text-sm mt-1 flex items-center gap-1">
            <span class="inline-block w-2 h-2 rounded-full bg-green-400"></span>
            {{ statusMessage }}
          </p>
        </div>
        <div class="flex w-full sm:w-auto gap-2">
          <button @click="triggerJsonInput" class="flex-1 sm:flex-none px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-sm font-medium transition-colors">
            手動匯入
          </button>
          <input type="file" ref="jsonInput" class="hidden" accept=".json" @change="importJson" />
          <button @click="loadScheduleData" class="flex-1 sm:flex-none px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-bold shadow transition-colors">
            還原預設
          </button>
        </div>
      </div>

      <div class="flex overflow-x-auto bg-gray-50 border-b border-gray-200 hide-scrollbar">
        <button 
          v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          :class="[
            'whitespace-nowrap px-6 py-3 text-sm font-medium transition-colors border-b-2',
            activeTab === tab.id 
              ? 'border-indigo-600 text-indigo-600 bg-white' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="p-4 sm:p-6 flex-grow overflow-auto bg-white">
        
        <div v-show="activeTab === 'teacher'" class="animate-fade-in">
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <label class="font-medium text-gray-700">選擇老師:</label>
            <select v-model="selectedTeacher" class="form-select w-full sm:w-64">
              <option v-for="name in teacherNames" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>
          <div class="overflow-x-auto ring-1 ring-gray-200 rounded-lg">
            <table class="w-full min-w-[600px] text-center border-collapse">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="py-2 px-3 w-16 border-r border-gray-200 text-gray-500 font-medium">節次</th>
                  <th v-for="d in daysOptions" :key="d" class="py-2 px-3 border-r border-gray-200 font-medium">{{ d.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in 8" :key="p" class="border-b border-gray-200 last:border-0">
                  <td class="bg-gray-50 border-r border-gray-200 py-3 text-gray-600 font-medium">{{ p }}</td>
                  <td v-for="d in 5" :key="d" class="border-r border-gray-200 p-2 h-16 sm:h-20 align-middle transition-colors" :class="getTeacherCell(d, p) ? 'bg-indigo-50/70 hover:bg-indigo-100/80' : 'bg-white'">
                    <div class="whitespace-pre-line text-sm sm:text-base text-gray-800 leading-tight">{{ getTeacherCell(d, p) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-show="activeTab === 'class'" class="animate-fade-in">
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <label class="font-medium text-gray-700">選擇班級:</label>
            <select v-model="selectedClass" class="form-select w-full sm:w-64">
              <option v-for="cls in classesList" :key="cls" :value="cls">{{ cls }}</option>
            </select>
          </div>
          <div class="overflow-x-auto ring-1 ring-gray-200 rounded-lg">
            <table class="w-full min-w-[600px] text-center border-collapse">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="py-2 px-3 w-16 border-r border-gray-200 text-gray-500 font-medium">節次</th>
                  <th v-for="d in daysOptions" :key="d" class="py-2 px-3 border-r border-gray-200 font-medium">{{ d.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in 8" :key="p" class="border-b border-gray-200 last:border-0">
                  <td class="bg-gray-50 border-r border-gray-200 py-3 text-gray-600 font-medium">{{ p }}</td>
                  <td v-for="d in 5" :key="d" class="border-r border-gray-200 p-2 h-16 sm:h-20 align-middle transition-colors" :class="getClassCell(d, p) ? 'bg-amber-50/70 hover:bg-amber-100/80' : 'bg-white'">
                    <div class="whitespace-pre-line text-sm sm:text-base text-gray-800 leading-tight">{{ getClassCell(d, p) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-show="activeTab === 'free'" class="animate-fade-in">
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 flex flex-col sm:flex-row gap-4">
            <div class="flex-1 flex flex-col">
              <label class="text-xs text-gray-500 mb-1">星期</label>
              <select v-model="searchDay" class="form-select w-full"><option v-for="d in daysOptions" :value="d.val">星期{{ d.label }}</option></select>
            </div>
            <div class="flex-1 flex flex-col">
              <label class="text-xs text-gray-500 mb-1">節次</label>
              <select v-model="searchPeriod" class="form-select w-full"><option v-for="p in 8" :value="p">第 {{ p }} 節</option></select>
            </div>
          </div>
          <div class="overflow-x-auto ring-1 ring-gray-200 rounded-lg">
            <table class="w-full text-left border-collapse">
              <thead class="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <tr><th class="p-3 font-medium">姓名</th><th class="p-3 font-medium">職稱</th><th class="p-3 font-medium">基本節數</th></tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="t in freeTeachers" :key="t.name" class="hover:bg-gray-50">
                  <td class="p-3 text-gray-900 font-medium">{{ t.name }}</td>
                  <td class="p-3 text-gray-600">{{ t.title }}</td>
                  <td class="p-3 text-gray-600">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{{ t.base_load }}</span>
                  </td>
                </tr>
                <tr v-if="freeTeachers.length === 0">
                  <td colspan="3" class="p-8 text-center text-gray-500">該時段沒有空堂的老師</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-show="activeTab === 'overview'" class="animate-fade-in">
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 flex flex-col sm:flex-row gap-4">
            <div class="flex-1 flex flex-col">
              <label class="text-xs text-gray-500 mb-1">星期</label>
              <select v-model="searchDay" class="form-select w-full"><option v-for="d in daysOptions" :value="d.val">星期{{ d.label }}</option></select>
            </div>
            <div class="flex-1 flex flex-col">
              <label class="text-xs text-gray-500 mb-1">節次</label>
              <select v-model="searchPeriod" class="form-select w-full"><option v-for="p in 8" :value="p">第 {{ p }} 節</option></select>
            </div>
          </div>
          <div class="overflow-x-auto ring-1 ring-gray-200 rounded-lg">
            <table class="w-full text-left border-collapse">
              <thead class="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <tr><th class="p-3 font-medium">班級</th><th class="p-3 font-medium">科目</th><th class="p-3 font-medium">授課教師</th></tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="s in periodOverview" :key="s.teacher + s.class_name" class="hover:bg-gray-50">
                  <td class="p-3 font-medium text-gray-900">{{ s.grade }}{{ s.class_name }}</td>
                  <td class="p-3 text-gray-600">{{ s.subject }}</td>
                  <td class="p-3 text-gray-600 flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">{{ s.teacher.charAt(0) }}</div>
                    {{ s.teacher }}
                  </td>
                </tr>
                <tr v-if="periodOverview.length === 0">
                  <td colspan="3" class="p-8 text-center text-gray-500">該時段沒有課程記錄</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-show="activeTab === 'stats'" class="animate-fade-in">
          <div class="overflow-x-auto ring-1 ring-gray-200 rounded-lg">
            <table class="w-full min-w-[500px] text-center border-collapse">
              <thead class="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <tr>
                  <th class="p-3 font-medium text-left sticky left-0 bg-gray-50 shadow-[1px_0_0_0_#e5e7eb]">教師姓名</th>
                  <th v-for="d in daysOptions" :key="d" class="p-3 font-medium">{{ d.label }}</th>
                  <th class="p-3 font-bold text-indigo-600">總計</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="stat in teacherStats" :key="stat.name" class="hover:bg-gray-50 text-sm">
                  <td class="p-3 text-left font-medium text-gray-900 sticky left-0 bg-white shadow-[1px_0_0_0_#e5e7eb] group-hover:bg-gray-50">{{ stat.name }}</td>
                  <td class="p-3 text-gray-500">{{ stat[1] || '-' }}</td>
                  <td class="p-3 text-gray-500">{{ stat[2] || '-' }}</td>
                  <td class="p-3 text-gray-500">{{ stat[3] || '-' }}</td>
                  <td class="p-3 text-gray-500">{{ stat[4] || '-' }}</td>
                  <td class="p-3 text-gray-500">{{ stat[5] || '-' }}</td>
                  <td class="p-3 font-bold text-indigo-600 text-base">{{ stat.total }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-show="activeTab === 'swap'" class="animate-fade-in flex flex-col md:flex-row gap-6">
          
          <div class="w-full md:w-1/2 flex flex-col gap-4">
            <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">1. 尋找互調對象</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">發起老師 (A)</label>
                  <select v-model="swapA" class="form-select w-full"><option v-for="name in teacherNames" :value="name">{{ name }}</option></select>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                  <div class="col-span-2 text-sm font-bold text-gray-600 mt-2">原時段 <span class="text-xs font-normal text-red-500">(A有課的時段)</span></div>
                  <select v-model="swapSrcDay" class="form-select w-full"><option v-for="d in daysOptions" :value="d.val">星期{{ d.label }}</option></select>
                  <select v-model="swapSrcPeriod" class="form-select w-full"><option v-for="p in 8" :value="p">第{{ p }}節</option></select>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                  <div class="col-span-2 text-sm font-bold text-gray-600 mt-2">目標時段 <span class="text-xs font-normal text-green-600">(A目前的空堂)</span></div>
                  <select v-model="swapDstDay" class="form-select w-full"><option v-for="d in daysOptions" :value="d.val">星期{{ d.label }}</option></select>
                  <select v-model="swapDstPeriod" class="form-select w-full"><option v-for="p in 8" :value="p">第{{ p }}節</option></select>
                </div>

                <button @click="findSwapCandidates" class="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98]">
                  搜尋可互調對象
                </button>
              </div>
            </div>
            
            <div class="bg-blue-50 text-blue-800 text-xs p-4 rounded-lg border border-blue-100 leading-relaxed">
              <strong class="block mb-1 text-sm">互調規則：</strong>
              1. 老師 A 在原時段必須有課，目標時段必須空堂。<br>
              2. 老師 B 在目標時段必須有「同一班級」的課。<br>
              3. 老師 B 在原時段必須空堂。
            </div>
          </div>

          <div class="w-full md:w-1/2 flex flex-col">
            <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex-grow flex flex-col">
              <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">2. 選擇並執行</h3>
              
              <div v-if="swapMessage" :class="swapCandidates.length > 0 ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'" class="p-3 mb-4 rounded-lg text-sm font-medium border">
                {{ swapMessage }}
              </div>

              <div class="overflow-y-auto max-h-[300px] border border-gray-200 rounded-lg mb-4 flex-grow">
                <table v-if="swapCandidates.length > 0" class="w-full text-left">
                  <thead class="bg-gray-50 sticky top-0">
                    <tr><th class="p-3 text-sm text-gray-500 font-medium">選擇</th><th class="p-3 text-sm text-gray-500 font-medium">老師 B</th><th class="p-3 text-sm text-gray-500 font-medium">科目 (班級)</th></tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="c in swapCandidates" :key="c.name" @click="selectedSwapB = c.name" class="cursor-pointer hover:bg-indigo-50 transition-colors">
                      <td class="p-3 text-center">
                        <input type="radio" :value="c.name" v-model="selectedSwapB" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300">
                      </td>
                      <td class="p-3 font-medium text-gray-900">{{ c.name }}</td>
                      <td class="p-3 text-gray-600">{{ c.subject }} <span class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 ml-1">{{ c.grade }}{{ c.class_name }}</span></td>
                    </tr>
                  </tbody>
                </table>
                <div v-else class="flex items-center justify-center h-full p-8 text-gray-400 text-sm">
                  請先在左側輸入條件並點擊搜尋
                </div>
              </div>

              <button :disabled="!selectedSwapB" @click="executeSwap" class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98]">
                確認執行互調
              </button>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
// ---------- 這裡的 Script setup 邏輯與上一個版本 100% 相同 ----------
// 因為我們只改動了 UI 介面，沒有動到任何邏輯！
import { ref, computed, onMounted } from 'vue'

const tabs = [
  { id: 'teacher', name: '教師課表' }, { id: 'class', name: '班級課表' },
  { id: 'free', name: '空堂查詢' }, { id: 'overview', name: '該節總覽' },
  { id: 'stats', name: '課數排行' }, { id: 'swap', name: '同班互調' }
]
const activeTab = ref('teacher')
const statusMessage = ref('初始化中...')
const daysOptions = [
  { val: 1, label: '一' }, { val: 2, label: '二' }, 
  { val: 3, label: '三' }, { val: 4, label: '四' }, { val: 5, label: '五' }
]

const dbTeachers = ref({}) 
const dbSchedules = ref([])

onMounted(() => { 
  loadScheduleData() 
  
  // 背景觸發訪客紀錄 API (使用 POST 且忽略錯誤，避免影響使用者體驗)
  fetch('/api/log', { method: 'POST' }).catch(() => {})
})

const loadScheduleData = async () => {
  statusMessage.value = '載入中...'
  try {
    const res = await fetch('/data.json')
    if (!res.ok) throw new Error('找不到檔案')
    const data = await res.json()
    dbTeachers.value = data.teachers || {}
    dbSchedules.value = data.schedules || []
    statusMessage.value = `預設載入成功 (${Object.keys(dbTeachers.value).length}人, ${dbSchedules.value.length}堂)`
    if (teacherNames.value.length > 0) selectedTeacher.value = teacherNames.value[0]
    if (classesList.value.length > 0) selectedClass.value = classesList.value[0]
  } catch (err) {
    statusMessage.value = '讀取失敗，請確認 public/data.json 是否存在！'
    console.error(err)
  }
}

const jsonInput = ref(null)
const triggerJsonInput = () => jsonInput.value.click()
const importJson = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      dbTeachers.value = data.teachers || {}
      dbSchedules.value = data.schedules || []
      statusMessage.value = `自訂匯入成功 (${Object.keys(dbTeachers.value).length}人, ${dbSchedules.value.length}堂)`
      if (teacherNames.value.length > 0) selectedTeacher.value = teacherNames.value[0]
      if (classesList.value.length > 0) selectedClass.value = classesList.value[0]
    } catch (err) { statusMessage.value = "JSON 格式錯誤！" }
    event.target.value = ''
  }
  reader.readAsText(file)
}

const teacherNames = computed(() => Object.keys(dbTeachers.value).sort())
const selectedTeacher = ref('')
const getTeacherCell = (d, p) => {
  if (!selectedTeacher.value) return ""
  const course = dbSchedules.value.find(s => s.teacher === selectedTeacher.value && s.day === d && s.period === p)
  if (!course) return ""
  return `${course.grade === 'Unknown' ? '' : course.grade}${course.class_name}\n${course.subject}`
}

const classesList = computed(() => {
  const clsSet = new Set()
  dbSchedules.value.forEach(s => {
    if (s.grade && s.grade !== "Unknown" && s.class_name) clsSet.add(`${s.grade} ${s.class_name}`)
  })
  return Array.from(clsSet).sort()
})
const selectedClass = ref('')
const getClassCell = (d, p) => {
  if (!selectedClass.value) return ""
  const [grade, cls] = selectedClass.value.split(" ")
  const course = dbSchedules.value.find(s => s.grade === grade && s.class_name === cls && s.day === d && s.period === p)
  if (!course) return ""
  return `${course.subject}\n${course.teacher}`
}

const searchDay = ref(1)
const searchPeriod = ref(1)
const freeTeachers = computed(() => {
  const busyTeachers = new Set(dbSchedules.value.filter(s => s.day === searchDay.value && s.period === searchPeriod.value).map(s => s.teacher))
  return Object.values(dbTeachers.value).filter(t => !busyTeachers.has(t.name))
})
const periodOverview = computed(() => {
  return dbSchedules.value.filter(s => s.day === searchDay.value && s.period === searchPeriod.value)
    .sort((a, b) => a.grade.localeCompare(b.grade) || a.class_name.localeCompare(b.class_name))
})

const teacherStats = computed(() => {
  const stats = {}
  Object.keys(dbTeachers.value).forEach(name => { stats[name] = { name, 1:0, 2:0, 3:0, 4:0, 5:0, total:0 } })
  dbSchedules.value.forEach(s => {
    if (stats[s.teacher] && s.day >= 1 && s.day <= 5) {
      stats[s.teacher][s.day] += 1
      stats[s.teacher].total += 1
    }
  })
  return Object.values(stats).sort((a, b) => b.total - a.total)
})

const swapA = ref('')
const swapSrcDay = ref(1)
const swapSrcPeriod = ref(1)
const swapDstDay = ref(1)
const swapDstPeriod = ref(1)
const swapMessage = ref('')
const swapCandidates = ref([])
const selectedSwapB = ref('')

const findSwapCandidates = () => {
  swapMessage.value = ''; swapCandidates.value = []; selectedSwapB.value = ''
  if (!swapA.value) { swapMessage.value = "請先選擇發起老師 A"; return; }

  const courseA_src = dbSchedules.value.find(s => s.teacher === swapA.value && s.day === swapSrcDay.value && s.period === swapSrcPeriod.value)
  if (!courseA_src) { swapMessage.value = `老師 ${swapA.value} 在原時段沒有課！`; return; }
  
  const targetGrade = courseA_src.grade; const targetClass = courseA_src.class_name
  if (targetGrade === 'Unknown' || !targetClass) { swapMessage.value = "無法識別該課程的班級，無法互調。"; return; }

  const hasClassA_dst = dbSchedules.value.some(s => s.teacher === swapA.value && s.day === swapDstDay.value && s.period === swapDstPeriod.value)
  if (hasClassA_dst) { swapMessage.value = `老師 ${swapA.value} 在目標時段已經有課了！`; return; }

  const candidates = []
  Object.keys(dbTeachers.value).forEach(tB => {
    if (tB === swapA.value) return
    const courseB_dst = dbSchedules.value.find(s => s.teacher === tB && s.day === swapDstDay.value && s.period === swapDstPeriod.value)
    if (!courseB_dst || courseB_dst.grade !== targetGrade || courseB_dst.class_name !== targetClass) return

    const hasClassB_src = dbSchedules.value.some(s => s.teacher === tB && s.day === swapSrcDay.value && s.period === swapSrcPeriod.value)
    if (!hasClassB_src) candidates.push({ name: tB, subject: courseB_dst.subject, grade: targetGrade, class_name: targetClass })
  })

  if (candidates.length === 0) swapMessage.value = "沒有找到符合條件的老師。"
  else { swapCandidates.value = candidates; swapMessage.value = `找到 ${candidates.length} 位可互調老師！` }
}

const executeSwap = () => {
  const tA = swapA.value; const tB = selectedSwapB.value
  const idxA = dbSchedules.value.findIndex(s => s.teacher === tA && s.day === swapSrcDay.value && s.period === swapSrcPeriod.value)
  const idxB = dbSchedules.value.findIndex(s => s.teacher === tB && s.day === swapDstDay.value && s.period === swapDstPeriod.value)
  
  if (idxA === -1 || idxB === -1) { alert("交換失敗：找不到對應課程。"); return }
  
  dbSchedules.value[idxA].day = swapDstDay.value; dbSchedules.value[idxA].period = swapDstPeriod.value
  dbSchedules.value[idxB].day = swapSrcDay.value; dbSchedules.value[idxB].period = swapSrcPeriod.value

  alert("互調成功！\n資料已更新（重整網頁或點擊還原預設會恢復）。")
  swapCandidates.value = []; swapMessage.value = ''; selectedSwapB.value = ''
}
</script>

<style scoped>
/* 將原本客製化的 CSS 類別，用 Tailwind 的 @apply 轉化為現代風格 */
.form-select {
  @apply border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow appearance-none cursor-pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* 隱藏捲軸但保留滑動功能 (用於手機版的 Tabs) */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 淡入動畫，讓切換 Tab 時有流暢感 */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>