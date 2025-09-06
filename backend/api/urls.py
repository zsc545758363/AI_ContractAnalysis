# backend/api/urls.py
from django.urls import path
from .views import MaterialContract
from .views import ConvertToPdf
from .views import save_analysis
from .views import get_analysis_history
from .views import get_analysis_by_id

urlpatterns = [
    path('upload/', MaterialContract),
    path('convert-to-pdf/', ConvertToPdf),
    path('save_analysis/', save_analysis),
    path('get_analysis_history/', get_analysis_history),
    path('get_analysis_by_id/<int:session_id>/', get_analysis_by_id),

]
