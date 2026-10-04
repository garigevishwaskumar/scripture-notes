"""
Convenience script to start the FastAPI server with uvicorn
"""
import sys
import uvicorn

# Fix utf-8 stdout on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from app.config import settings

if __name__ == "__main__":
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"Swagger Docs: http://localhost:{settings.PORT}/docs")
    print(f"Health Check: http://localhost:{settings.PORT}/healthz")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
