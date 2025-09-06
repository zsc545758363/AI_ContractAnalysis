<script setup>
import { ref, onMounted, computed,watch} from 'vue'
import { useRoute } from 'vue-router'




// 固定审核项
const fetchedData = [
  { title: '供方资质审核', audit_content:'供方资质审核：是否存在失信情况，是否有重大负债（100万元以上）',status: '-', detail: '-', original_text: '-',highlights: [] },
  { title: '合同编号日期',audit_content:'合同编号中日期是否与签订时间一致', status: '-', detail: '-', original_text: '-' ,highlights: []},
  { title: '产品名称与金额', audit_content:'产品名称是否前后一致，合同总金额计算无误，大小写一致',status: '-', detail: '-', original_text: '-',highlights: [] },
  { title: '交货时间地点', audit_content:'交货时间和地点是否清晰明确',status: '-', detail: '-', original_text: '-',highlights: [] },
  { title: '结算方式与付款时间', audit_content:'结算方式是否为承兑付款，付款时间清晰明确',status: '-', detail: '-', original_text: '-' ,highlights: []},
  { title: '违约责任', audit_content:'违约责任是否包含逾期到货违约金和逾期到货合同解除权',status: '-', detail: '-', original_text: '-' ,highlights: []},
  { title: '争议解决的诉讼法院', audit_content:'争议解决的诉讼法院是否为需方所在地或原告方所在法院',status: '-', detail: '-', original_text: '-' ,highlights: []},
  { title: '签订时间与空白条款', audit_content:'签订时间是否已明确，无空白条款',status: '-', detail: '-', original_text: '-',highlights: [] },
  { title: '法律冲突', audit_content:'该合同是否与《民法典》及公司规章制度相冲突',status: '-', detail: '-', original_text: '-' ,highlights: []},
]

const auditResults = ref([])
const showDetails = ref([])
const fileInput = ref(null)
const selectedFile = ref(null)
const loading = ref(false)
const analysisComplete = ref(false)
const activeHighlights = ref([])



onMounted(() => {
  auditResults.value = fetchedData
  showDetails.value = fetchedData.map(() => false)
})

const triggerFileInput = () => {
  if (!loading.value) fileInput.value.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  console.log('[handleFileSelect] 文件已接收：', file) // 加这一行
  if (!file) return

  const ext = file.name.split('.').pop().toLowerCase()

  selectedFile.value = file
  analysisComplete.value = false

  if (ext === 'pdf') {
    await renderPdfFromFile(file)
  } else if (ext === 'doc' || ext === 'docx') {
    await convertWordToPdfAndRender(file)
  } else {
    alert('只支持 PDF、DOC 和 DOCX 文件预览')
  }


}

const removeSelectedFile = () => {
  // 清除文件输入框
  selectedFile.value = null
  fileInput.value.value = ''

  // 恢复审核结果为初始值
  auditResults.value = fetchedData.map(item => ({
    ...item,
    status: '-',
    detail: '-',
    original_text: '-',
    highlights: []
  }))

  // 收起所有详情
  showDetails.value = fetchedData.map(() => false)

  // 状态标记
  analysisComplete.value = false
  loading.value = false

  // 清空高亮
  activeHighlights.value = []

  // 清除 canvas 容器和映射
  if (pdfCanvasContainer.value) {
    pdfCanvasContainer.value.innerHTML = ''
  }
  canvasMap.clear()
}

const startAnalysis = async () => {
  if (!selectedFile.value) return

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  loading.value = true

  try {
    const response = await fetch('/api/upload/', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('上传失败')

    const result = await response.json()
    const mergedResults = fetchedData.map((item, idx) => ({
      title: item.title,
      audit_content: item.audit_content,
      status: result[idx]?.status || item.status,
      detail: result[idx]?.detail || item.detail,
      original_text: result[idx]?.original_text || item.original_text,
      highlights: result[idx]?.highlights || item.highlights,
    }))

    auditResults.value = mergedResults
    showDetails.value = mergedResults.map(() => false)
    analysisComplete.value = true
    alert('分析完成！')
    await saveToHistory()
  } catch (error) {
    console.error(error)
    alert('分析失败，请重试')
  } finally {
    loading.value = false
  }

}

const toggleDetail = (index) => {
  if (loading.value) return

  showDetails.value[index] = !showDetails.value[index]

  const highlightsToAdd = auditResults.value[index].highlights || []

  if (showDetails.value[index]) {
    // 在添加高亮时，也携带每个高亮框的 status
    activeHighlights.value.push(...highlightsToAdd.map(h => ({
      ...h,
      status: auditResults.value[index].status,  // 将 status 添加到高亮框
      _sourceIndex: index
    })))
    drawAllHighlights()

    // ✅ 自动滚动到第一个 highlight
    if (highlightsToAdd.length > 0) {
      scrollToHighlight(highlightsToAdd[0])
    }

  } else {
    activeHighlights.value = activeHighlights.value.filter(h => h._sourceIndex !== index)
    drawAllHighlights()
  }
}



import html2pdf from 'html2pdf.js'
const pdfContent = ref(null)
const exportPDF = () => {
  const element = pdfContent.value

  const opt = {
    margin: 0.5,
    filename: '审核结果.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }

  html2pdf().set(opt).from(element).save()
}

const fileIcon = computed(() => {
  if (!selectedFile.value || !selectedFile.value.name) return ''
  const ext = selectedFile.value.name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return new URL('@/assets/pdf.svg', import.meta.url).href
  if (ext === 'doc' || ext === 'docx') return new URL('@/assets/word.svg', import.meta.url).href
  return ''
})

// 引入 PDF 渲染
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker?worker'
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker()

const pdfCanvasContainer = ref(null)

const renderPdfFromFile = async (file) => {
  loading.value = true
  try {
    const arrayBuffer = await file.arrayBuffer()
    await renderPdfFromArrayBuffer(arrayBuffer)
  } catch (e) {
    alert('PDF 渲染失败')
    console.error(e)
  }
  loading.value = false
}

const convertWordToPdfAndRender = async (file) => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/convert-to-pdf/', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('转换失败')

    const pdfBlob = await response.blob()
    const arrayBuffer = await pdfBlob.arrayBuffer()
    await renderPdfFromArrayBuffer(arrayBuffer)
  } catch (e) {
    alert('文件转换或渲染失败')
    console.error(e)
  }
  loading.value = false
}


const canvasMap = new Map()

const renderPdfFromArrayBuffer = async (arrayBuffer) => {
  const container = pdfCanvasContainer.value
  if (!container) return

  container.innerHTML = ''
  canvasMap.clear()

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const unscaledViewport = page.getViewport({ scale: 1 })

    const containerWidth = container.clientWidth
    const scale = containerWidth / unscaledViewport.width
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height

    canvas.style.width = viewport.width + 'px'
    canvas.style.height = viewport.height + 'px'
    canvas.style.display = 'block'
    canvas.style.marginBottom = '20px'

    // 创建高亮图层
    const highlightCanvas = document.createElement('canvas')
    highlightCanvas.width = canvas.width
    highlightCanvas.height = canvas.height
    highlightCanvas.style.position = 'absolute'
    highlightCanvas.style.left = '0'
    highlightCanvas.style.top = canvas.style.marginBottom
    highlightCanvas.style.pointerEvents = 'none'

    const wrapper = document.createElement('div')
    wrapper.style.position = 'relative'
    wrapper.id = `pdf-page-${pageNum}` // ✅ 添加 ID
    wrapper.appendChild(canvas)
    wrapper.appendChild(highlightCanvas)
    container.appendChild(wrapper)

    canvasMap.set(pageNum, { scale, highlightCanvas })

    await page.render({ canvasContext: context, viewport }).promise
  }

  drawAllHighlights()
}


const drawAllHighlights = () => {
  // 清空所有高亮层
  for (const { highlightCanvas } of canvasMap.values()) {
    const ctx = highlightCanvas.getContext('2d')
    ctx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height)
  }

  // 绘制每一个 activeHighlight，根据 status 设置颜色
  activeHighlights.value.forEach(rect => {
    const canvasEntry = canvasMap.get(rect.page)
    if (!canvasEntry) return

    const { highlightCanvas, scale } = canvasEntry
    const ctx = highlightCanvas.getContext('2d')

    // 还原坐标（归一化 -> 真实像素）
    const box = denormalizeBox(rect, highlightCanvas.width, highlightCanvas.height)

    // 设置颜色：绿色（符合）、黄色（风险）、红色（不符），默认灰色
    let fillColor = 'rgba(128, 128, 128, 0.3)' // 默认灰色
    if (rect.status === '符合') {
      fillColor = 'rgba(0, 255, 0, 0.4)' // 绿色
    } else if (rect.status === '风险') {
      fillColor = 'rgba(255, 255, 0, 0.4)' // 黄色
    } else if (rect.status === '不符') {
      fillColor = 'rgba(255, 0, 0, 0.4)' // 红色
    }

    ctx.fillStyle = fillColor
    ctx.fillRect(
      box.x,
      box.y,
      box.width,
      box.height
    )
  })
}



const scrollToHighlight = (highlight) => {
  const entry = canvasMap.get(highlight.page)
  if (!entry) return

  const { highlightCanvas } = entry
  const container = pdfCanvasContainer.value
  if (!container) return

  // 找到页面 DOM 元素
  const pageWrapper = document.getElementById(`pdf-page-${highlight.page}`)
  if (!pageWrapper) return

  const box = denormalizeBox(highlight, highlightCanvas.width, highlightCanvas.height)

  const highlightTopInPage = box.y
  const scrollTop = pageWrapper.offsetTop + highlightTopInPage - 100 // 留 100px 顶部空隙

  container.scrollTo({
    top: scrollTop,
    behavior: 'smooth'
  })
}


// 还原归一化坐标
function denormalizeBox(normalizedBox, canvasWidth, canvasHeight) {
  return {
    page: normalizedBox.page,
    x: normalizedBox.x * canvasWidth,
    y: normalizedBox.y * canvasHeight,
    width: normalizedBox.width * canvasWidth,
    height: normalizedBox.height * canvasHeight
  };
}


// 保存历史数据
const saveToHistory = async () => {
  const reader = new FileReader()
  reader.onload = async () => {
    const base64 = reader.result.split(',')[1]

    const payload = {
      file_name: selectedFile.value.name,
      audit_results: JSON.stringify(auditResults.value),
      pdf_base64: base64
    }

    try {
      const response = await fetch('/api/save_analysis/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      console.log('保存成功，历史记录ID:', data.id)
      emit('analysis-finished')

    } catch (err) {
      console.error('保存失败', err)
    }
  }
  reader.readAsDataURL(selectedFile.value)
}




const props = defineProps({
  historicalSession: Object
})

watch(
  () => props.historicalSession,
  (newSession) => {
    if (newSession) {
      // 用 newSession.audit_results 来复现分析结果
      console.log('加载历史记录:', newSession)
    }
  },
  { immediate: true }
)


const route = useRoute()
const selectedFileName = ref('')

// 加载历史数据
const loadHistoricalSession = async (id) => {
  loading.value = true  // 进入加载状态
  try {
    const res = await fetch(`/api/get_analysis_by_id/${id}/`)
    if (!res.ok) throw new Error('获取历史数据失败')
    const data = await res.json()

    // 1. 解析 audit_results（后端保存的是 JSON 字符串）
    auditResults.value = data.audit_results

    // 2. 设置文件名
    selectedFileName.value = data.file_name

    // 3. 恢复 PDF 文件并渲染
    console.log('[loadHistoricalSession] 后端响应数据：', data)
    if (data.pdf_file && data.file_name) {
      console.log('进入if了')
      const simulatedFile = await fetchFileFromUrl(data.pdf_file, data.file_name)
      selectedFile.value = simulatedFile
      console.log('[loadHistoricalSession] handleFileSelect 函数是：', handleFileSelect)
      await handleFileSelect({ target: { files: [simulatedFile] } })
      console.error('渲染完成')
    }

    // 4. 初始化详情显示状态（全部收起）
    showDetails.value = auditResults.value.map(() => false)

    // 5. 清空并重新绘制高亮
    activeHighlights.value = []
    drawAllHighlights()

    // 6. 标记分析已完成
    analysisComplete.value = true

    // 7. 清除当前选中的文件（历史数据没有 File 对象）
    if (fileInput.value) fileInput.value.value = ''

  } catch (error) {
    console.error('加载历史数据出错:', error)
    alert('加载历史数据失败，请重试')
  } finally {
    loading.value = false  // 结束加载状态
  }
}


// 如果用户点击了其他历史记录
watch(() => route.params.sessionId, (newId) => {
  if (newId) loadHistoricalSession(newId)
})


const fetchFileFromUrl = async (url, fileName) => {
  const response = await fetch(url)
  const blob = await response.blob()
  return new File([blob], fileName, { type: blob.type })
}


//计算审核结果数量
const num1 = computed(() => auditResults.value.filter(item => item.status === '符合').length)
const num2 = computed(() => auditResults.value.filter(item => item.status === '风险').length)
const num3 = computed(() => auditResults.value.filter(item => item.status === '不符').length)

import { defineEmits } from 'vue'

const emit = defineEmits(['analysis-finished'])


</script>



<template>
<div class="main_container">
  <div class="part1">
      <!--  标题-->
    <h1>AI零星材料合同审核</h1>
    <h3>基于业界领先的 AI 模型，智能分析，按要求审核，节省人力资源</h3>

      <!-- 上传栏 -->
    <div class="body_box">
      <div class="canvas">
        <input
          ref="fileInput"
          type="file"
          accept=".doc,.docx,.pdf"
          style="display: none"
          @change="handleFileSelect"
        />

        <div class="DottedLineBox">
              <!-- 未选择文件时显示上传框 -->
          <div v-if="!selectedFile" style="display: flex;justify-content: center;align-items: center;flex-direction: column;">
            <div class="AddBox" @click="triggerFileInput" >+</div>
            <p>* 请上传合同的 Word 文件，暂时只支持同时上传一份合同，支持 doc、docx、pdf</p>
          </div>

          <!-- 选择文件后显示文件图标 -->
          <div class="file-icon-wrapper" v-else>
            <div class="file-icon">
              <img :src="fileIcon" alt="文件图标" />
              <p class="file-name">{{ selectedFile.name }}</p>
              <button class="remove-button" @click="removeSelectedFile" :disabled="loading">×</button>
            </div>
          </div>

        </div>

      </div>

    </div>


        <!-- 分析按钮 -->
    <div v-if="selectedFile && !analysisComplete" class="uploaded-box">
      <button @click="startAnalysis" :disabled="loading">
        {{ loading ? '分析中...' : '开始分析' }}
      </button>
    </div>


        <!-- 文件内容展示 -->

    <div v-show="selectedFile" ref="pdfCanvasContainer" class="content_box" >
      <p style="color: red;">PDF区域渲染中...</p>
    </div>


  </div>


<!--结果栏-->
    <div class="part2" ref="pdfContent">
      <div class="result_canvas">
        <div style="display: flex; align-items: center;font-size: 14px;border: none">
          <span style="height: 25px; line-height: 25px;">审查结果:</span>
          <span style="margin-left: 20px; width: 50px; height: 25px; background-color: #bbf7d0; color: #065f46; text-align: center; line-height: 25px; border-radius: 5px;">
            符合{{ num1}}
          </span>
          <span style="margin-left: 20px; width: 50px; height: 25px; background-color: #fef08a; color: #92400e; text-align: center; line-height: 25px; border-radius: 5px;">
            风险{{ num2 }}
          </span>
          <span style="margin-left: 20px; width: 50px; height: 25px; background-color: #fecaca; color: #991b1b; text-align: center; line-height: 25px; border-radius: 5px;">
            不符{{ num3 }}
          </span>
        </div>


        <div
          class="result-item"
          v-for="(item, index) in auditResults"
          :key="index"
          @click="toggleDetail(index)"
        >

          <div class="result-header">
            <span class="arrow" :class="{ expanded: showDetails[index] }">▶</span>
            <p
              class="status-badge"
              :class="{
                blue: item.status === '-',
                red: item.status === '不符',
                yellow: item.status === '风险',
                green: item.status === '符合'
              }"
            >
              {{ item.status }}
            </p>

            <div class="title-box">
              <div class="hover-container">
                <p>{{ item.title }}</p>
                <div class="hover-text">{{ item.audit_content }}</div>
              </div>

            </div>
          </div>

          <div v-show="showDetails[index]" class="result-detail">
            <p><b>合同原文：</b>{{ item.original_text }}</p>
            <p><b>分析详情：</b>{{ item.detail }}</p>
          </div>
        </div>

        <!-- 导出按钮 -->
        <div style="margin-top: 40px;border: none" v-if="analysisComplete">
          <button
            @click="exportPDF"
            style="width: 150px; height: 30px; margin: 0 auto;border: none;background-color: #007aff; color: white;border-radius: 4px;font-size: 14px;"
          >
            导出审核结果 PDF
          </button>
        </div>
      </div>
    </div>


</div>





</template>

<style scoped>

  .main_container{
    display: flex;
    height: 100%;
  }

  .part1{
    width: 70%;
    background-color: white;
    margin: 10px;
    border-radius: 10px;
    overflow-y: auto;
  }

  .part1 h1{
    font-size: 30px;
    margin-top: 50px;
  }

  .part1 h3 {
    font-size: 16px;
    font-weight: normal;
    margin-top: 40px;
  }

  .body_box{
    width: 100%;
    height: 230px;
    display: flex;
    justify-content: center;
    margin-top: 40px;
  }
  .canvas {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80%;
    height: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    border-radius: 5px;
    background: linear-gradient(90deg, #007aff, #2563eb);
    background-size: 200% 200%;
    animation: gradientMove 8s ease infinite;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  .DottedLineBox{
    border: 1px dashed #ffffff;      /* 1px宽的白色虚线 */
    border-radius: 5px;             /* 圆角边框 */
    width: 98%;
    height: 94%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .DottedLineBox p {
    font-size: 15px;
    padding-top: 25px;
  }
  .AddBox{
    width: 50px;
    height: 50px;
    border: 1px dashed #ffffff;      /* 1px宽的白色虚线 */
    border-radius: 5px;             /* 圆角边框 */
    font-weight: lighter;
    font-size: 30px;
  }

  .part2 {
    width: 30%;
    margin: 10px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
  }


  .result_canvas {
    width: 100%;
    background-color: white;
    padding: 10px;
    border-radius: 10px;
    max-height: 640px;
    overflow-y: auto;        /* 启用垂直滚动 */
  }

  .result_canvas > div {
    min-height: 40px;
    margin-top: 10px;
    align-items: center;
    border-radius: 5px;
    border: 1px solid #ddd;
  }



  .result_canvas p {
    font-size: 13px;
    text-align: left;
    color: black;
  }

  @media (max-width: 768px) {
    .result_canvas {
      width: 100%;
    }

    .result_canvas > div {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .result_canvas > div > * {
      grid-column: 1;
    }

    .result_canvas h4,
    .result_canvas p {
      text-align: left;
      min-height: auto;
    }
  }

  .hover-container {
  position: relative; /* 为绝对定位提供参考 */
  display: inline-block;
}

.hover-text {
  /* 基础定位 */
  display: none;
  position: absolute;
  bottom: 100%;
  left: 90%;

  white-space: nowrap; /* 禁止换行 */
  max-width: none; /* 移除最大宽度限制 */

  /* 视觉样式 */
  background-color: #333;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 12px;
  line-height: 1.3;
  z-index: 100;

  /* 动画效果 */
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.hover-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-top-color: #333;
}

.hover-container:hover .hover-text {
  display: block;
  font-size: 10px;
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.uploaded-box{
 padding-top: 20px;
}


.uploaded-box button {
  background-color: #007aff;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
}

.uploaded-box button:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}

/* 上传后的文件图标外壳 */
.file-icon-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 仿 Windows 桌面图标 */
.file-icon {
  position: relative;
  width: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: white;
  text-align: center;
  cursor: default;
}

.file-icon img {
  width: 80px;
  height: 80px;
  background-color: #ffffff;
  border-radius: 5px;
}


.file-name {
  margin-top: 6px;
  white-space: nowrap;
}

/* 删除按钮（红色圆形 ×） */
.remove-button {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 14px;
  line-height: 16px;
  text-align: center;
  padding: 0;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.remove-button:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}

/* 防止 canvas 背景切换 */
.canvas {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  height: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  border-radius: 5px;
  background: linear-gradient(90deg, #007aff, #2563eb);
  background-size: 200% 200%;
  animation: gradientMove 8s ease infinite;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
}


.result-item {
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.result-header {
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 10px;
}

.status-badge {
  height: 20px;
  width: 40px;
  text-align: center;
  line-height: 20px;
  border-radius: 5px;
  font-size: 13px;
  font-weight: bold;
}

/* 状态颜色 */
.status-badge.blue {
  background-color: #3b82f6;
  color: #000000;
  text-align: center;
}

.status-badge.red {
  background-color: #fecaca;
  color: #991b1b;
  text-align: center;
}

.status-badge.yellow {
  background-color: #fef08a;
  color: #92400e;
  text-align: center;
}

.status-badge.green {
  background-color: #bbf7d0;
  color: #065f46;
  text-align: center;
}

.title-box {
  display: flex;
  align-items: center;
  gap: 8px;

}

/* 展开箭头样式 */
.arrow {
  display: inline-block;
  transition: transform 0.3s ease;
  font-size: 14px;
  color: #666;
}
.arrow.expanded {
  transform: rotate(90deg); /* 变为向下 */
}

/* 展开区域 */
.result-detail {
  background-color: #f9f9f9;
  border-top: 1px solid #ddd;
  font-size: 13px;
  color: #333;
  width: 100%;
  padding: 10px;
}

.content_box{
  margin-top: 100px;
  width: 97%;
}

.content_box canvas {
  width: 100% !important;      /* 让 canvas 自适应容器宽度 */
  height: auto !important;     /* 保持纵横比 */
  display: block;
  max-width: 100%;             /* 不超出容器 */
  box-sizing: border-box;
}

</style>


