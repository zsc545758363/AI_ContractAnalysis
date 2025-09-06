<script setup>
import { ref, onMounted,computed } from 'vue'

// 固定审核项
const fetchedData = [
  { title: '供方资质审核', audit_content:'供方资质审核：是否存在失信情况，是否有重大负债（100万元以上）',status: '-', detail: '-', original_text: '-' },
  { title: '合同编号日期',audit_content:'合同编号中日期是否与签订时间一致', status: '-', detail: '-', original_text: '-' },
  { title: '产品名称与金额', audit_content:'产品名称是否前后一致，合同总金额计算无误，大小写一致',status: '-', detail: '-', original_text: '-' },
  { title: '交货时间地点', audit_content:'交货时间和地点是否清晰明确',status: '-', detail: '-', original_text: '-' },
  { title: '结算方式与付款时间', audit_content:'结算方式是否为承兑付款，付款时间清晰明确',status: '-', detail: '-', original_text: '-' },
  { title: '违约责任', audit_content:'违约责任是否包含逾期到货违约金和逾期到货合同解除权',status: '-', detail: '-', original_text: '-' },
  { title: '争议解决的诉讼法院', audit_content:'争议解决的诉讼法院是否为需方所在地或原告方所在法院',status: '-', detail: '-', original_text: '-' },
  { title: '签订时间与空白条款', audit_content:'签订时间是否已明确，无空白条款',status: '-', detail: '-', original_text: '-' },
  { title: '法律冲突', audit_content:'该合同是否与《民法典》及公司规章制度相冲突',status: '-', detail: '-', original_text: '-' },
]

const auditResults = ref([])
const showDetails = ref([])
const fileInput = ref(null)
const selectedFile = ref(null)
const loading = ref(false)
const analysisComplete = ref(false)

onMounted(() => {
  auditResults.value = fetchedData
  showDetails.value = fetchedData.map(() => false)
})

const triggerFileInput = () => {
  if (!loading.value) fileInput.value.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const allowedTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/pdf']
  if (!allowedTypes.includes(file.type)) {
    alert('请上传 .doc 、 .docx 或 .pdf 格式的 Word 文件')
    return
  }

  selectedFile.value = file
  analysisComplete.value = false
}

const removeSelectedFile = () => {
  selectedFile.value = null
  fileInput.value.value = '' // 清空 input
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

    if (!response.ok) {
      throw new Error('上传失败')
    }

    const result = await response.json()
    const mergedResults = fetchedData.map((item, idx) => ({
      title: item.title,
      audit_content: item.audit_content,
      status: result[idx]?.status || item.status,
      detail: result[idx]?.detail || item.detail,
      original_text: result[idx]?.original_text || item.original_text,
    }))

    auditResults.value = mergedResults
    showDetails.value = mergedResults.map(() => false)
    analysisComplete.value = true
    alert('分析完成！')
  } catch (error) {
    console.error(error)
    alert('分析失败，请重试')
  } finally {
    loading.value = false
  }
}

const toggleDetail = (index) => {
  if (!loading.value) {
    showDetails.value[index] = !showDetails.value[index]
  }
}


import html2pdf from 'html2pdf.js'

const pdfContent = ref(null)

const exportPDF = () => {
  const element = pdfContent.value

  const opt = {
    margin:       0.5,
    filename:     '审核结果.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  }

  html2pdf().set(opt).from(element).save()
}

const fileIcon = computed(() => {
  if (!selectedFile.value || !selectedFile.value.name) return '';
  const ext = selectedFile.value.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    return new URL('@/assets/pdf.svg', import.meta.url).href;
  } else if (ext === 'doc' || ext === 'docx') {
    return new URL('@/assets/word.svg', import.meta.url).href;
  } else {
    return ''; // 或默认图标路径
  }
});

</script>


<template>
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


    <div style="width: 70%; height: 60px; display: flex; justify-content: space-between; align-items: center; margin: 0 auto">
      <h4 style="margin: 0">审核结果</h4>
      <!-- 导出按钮 -->
      <button @click="exportPDF" style="background-color: #007aff; color: white; border: none; padding: 8px 16px; border-radius: 4px;" v-if="analysisComplete">
        导出审核结果 PDF
      </button>
    </div>


<!--结果栏-->
  <div class="result_box" ref="pdfContent">
    <div class="result_canvas">
      <div>
        <h5>审核项目</h5>
        <h5>是否符合</h5>
        <h5>分析详情</h5>
      </div>

      <div v-for="(item, index) in auditResults" :key="index">
        <div class="hover-container">
          <h4>{{ item.title }}</h4>
          <div class="hover-text">{{item.audit_content}}</div>
        </div>

        <p>{{ item.status }}</p>

        <!-- 分析详情区域 -->
        <p v-if="showDetails[index]" style="display: block">
          <span><b style="font-size: 16px">合同原文： </b> {{item.original_text}} <br></span>
          <span><b style="font-size: 16px">分析详情：</b>{{ item.detail }}</span>
          <span @click="toggleDetail(index)" style="color: #2563eb; cursor: pointer; margin-left: 10px;">收起</span>
        </p>
        <p v-else>
          <span @click="toggleDetail(index)" style="color: #2563eb; cursor: pointer;">显示详情</span>
        </p>

      </div>
    </div>
  </div>



</template>

<style scoped>
  h1{
    font-size: 30px;
    padding: 20px;
  }
  h3 {
    font-size: 16px;
    font-weight: normal;
    padding: 5px;
  }

  .body_box{
    width: 100%;
    height: 280px;
    display: flex;
    justify-content: center;
  }
  .canvas {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 70%;
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

  .result_box {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 20px 0;
  }

  .result_canvas {
    width: 80%;
    max-width: 1200px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .result_canvas > div {
    display: grid;
    grid-template-columns: minmax(80px, 10%) minmax(0, 10%) minmax(0, 80%) ;
    gap: 16px;
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
    align-items: center;
  }

  .result_canvas > div:last-child {
    border-bottom: none;
  }

  .result_canvas h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    text-align: center;
    padding: 8px;
    border-radius: 4px;
  }

  .result_canvas p {
    margin: 0;
    font-size: 14px;
    color: #4b5563;
    line-height: 1.6;
    text-align: center;
    padding: 8px;
    border-radius: 4px;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: pre-wrap;
  }

  @media (max-width: 768px) {
    .result_canvas {
      width: 95%;
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
  left: 50%;

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
  z-index: 30;

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
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70%;
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




</style>


