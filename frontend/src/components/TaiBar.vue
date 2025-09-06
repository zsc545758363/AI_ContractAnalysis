<template>
  <footer class="TaiBar">
    <div class="container">
      <!-- 上部：链接区域 -->
      <div class="footer-links">
        <div class="footer-column">
          <h3 class="footer-title">关于我们</h3>
          <ul class="footer-list">
            <li><a href="#" class="footer-link">公司简介</a></li>
            <li><a href="#" class="footer-link">发展历程</a></li>
            <li><a href="#" class="footer-link">团队介绍</a></li>
            <li><a href="#" class="footer-link">加入我们</a></li>
          </ul>
        </div>

        <div class="footer-column">
          <h3 class="footer-title">产品服务</h3>
          <ul class="footer-list">
            <li><a href="#" class="footer-link">解决方案</a></li>
            <li><a href="#" class="footer-link">技术支持</a></li>
            <li><a href="#" class="footer-link">API文档</a></li>
            <li><a href="#" class="footer-link">合作伙伴</a></li>
          </ul>
        </div>

        <div class="footer-column">
          <h3 class="footer-title">帮助中心</h3>
          <ul class="footer-list">
            <li><a href="#" class="footer-link">常见问题</a></li>
            <li><a href="#" class="footer-link">联系我们</a></li>
            <li><a href="#" class="footer-link">隐私政策</a></li>
            <li><a href="#" class="footer-link">服务条款</a></li>
          </ul>
        </div>

        <div class="footer-column">
          <h3 class="footer-title">关注我们</h3>
          <div class="social-icons">
            <a href="#" class="social-icon">
              <i class="fa fa-weixin"></i>
            </a>
            <a href="#" class="social-icon">
              <i class="fa fa-weibo"></i>
            </a>
            <a href="#" class="social-icon">
              <i class="fa fa-github"></i>
            </a>
            <a href="#" class="social-icon">
              <i class="fa fa-linkedin"></i>
            </a>
          </div>
          <p class="contact-info">客服电话：400-123-4567</p>
          <p class="contact-info">工作时间：周一至周五 9:00-18:00</p>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="footer-divider"></div>

      <!-- 下部：备案信息区域 -->
      <div class="footer-bottom">
        <div class="copyright">
          <p>© 2025 AI赋能科技有限公司. 保留所有权利.</p>
        </div>

        <div class="footer-links-bottom">
          <a href="#" class="footer-link-bottom">隐私政策</a>
          <a href="#" class="footer-link-bottom">服务条款</a>
          <a href="#" class="footer-link-bottom">网站地图</a>
        </div>

        <div class="备案号">
          <a href="http://beian.miit.gov.cn" target="_blank" class="beian-link">
            <i class="fa fa-gov"></i>
            <span>粤ICP备12345678号</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 组件逻辑（如果有）
</script>

<style scoped>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 容器样式 */
.TaiBar {
  background-color: #1e293b;
  color: #f8fafc;
  padding: 60px 20px 30px;
  height: 400px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 上部链接区域样式 */
.footer-links {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 40px;
  justify-content: space-between;
}

.footer-column {
  flex: 1;
  min-width: 200px;
  margin-bottom: 30px;
}

.footer-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #3b82f6;
  position: relative;
  padding-bottom: 10px;
}


.footer-list {
  list-style: none;
}

.footer-link {
  color: #cbd5e1;
  text-decoration: none;
  display: block;
  padding: 8px 0;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #3b82f6;
  padding-left: 5px;
}

/* 社交媒体图标样式 */
.social-icons {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.social-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #334155;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-icon:hover {
  background-color: #3b82f6;
  color: #ffffff;
  transform: translateY(-3px);
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.social-icon i {
  font-size: 20px;
}

.contact-info {
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 5px;
}

/* 分隔线样式 */
.footer-divider {
  border-top: 1px solid #334155;
  margin: 30px 0;
}

/* 下部备案信息区域样式 */
.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  flex: 1;
  min-width: 300px;
  margin-bottom: 20px;
}

.copyright p {
  color: #94a3b8;
  font-size: 13px;
}

.footer-links-bottom {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.footer-link-bottom {
  color: #94a3b8;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.3s ease;
}

.footer-link-bottom:hover {
  color: #3b82f6;
}

.beian-box {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.beian-link {
  display: flex;
  align-items: center;
  color: #94a3b8;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.3s ease;
}

.beian-link i {
  margin-right: 5px;
  color: #3b82f6;
}

.beian-link:hover {
  color: #3b82f6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-links {
    flex-direction: column;
  }

  .footer-column {
    margin-bottom: 30px;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .copyright,
  .footer-links-bottom,
  .beian-box {
    margin-bottom: 15px;
    min-width: auto;
  }

  .footer-links-bottom {
    justify-content: center;
  }

  .beian-box {
    justify-content: center;
  }
}
</style>