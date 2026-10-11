@echo off
rem Tự động gửi ping đến Supabase để tránh bị tạm khóa (Pause) do không hoạt động
curl.exe -s -o NUL "https://cilrlqakogxfydigdqxs.supabase.co/rest/v1/cars?select=id" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpbHJscWFrb2d4ZnlkaWdkcXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjA1NTUsImV4cCI6MjA4ODM5NjU1NX0.3hs4hVTxsN4rXt8b73kS7bnb0WD4zXo4UqwZKdFqifw"
