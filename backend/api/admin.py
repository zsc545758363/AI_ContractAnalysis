from django.contrib import admin

# Register your models here.
from .models import ContractAnalysis  # 导入你的模型

admin.site.register(ContractAnalysis)  # 注册模型