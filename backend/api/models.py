# Create your models here.
# models.py
from django.db import models

class ContractAnalysis(models.Model):
    file_name = models.CharField(max_length=255)
    pdf_file = models.FileField(upload_to='uploads/contracts/')
    audit_results = models.JSONField()  # Django >= 3.1 原生支持 SQLite JSONField
    analysis_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name

