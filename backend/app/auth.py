"""
Authentication & JWT Verification Middleware for Supabase Auth
Enterprise Standards: Validates incoming Bearer JWT tokens from Supabase
"""
import logging
from typing import Optional
from dataclasses import dataclass
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.config import settings

logger = logging.getLogger("scripture_notes_api.auth")
security = HTTPBearer(auto_error=False)

@dataclass
class AuthenticatedUser:
    id: str
    email: str = ""
    role: str = "authenticated"

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> AuthenticatedUser:
    """
    FastAPI dependency that extracts and validates the Supabase JWT Bearer token.
    Enforces that requests to protected endpoints are signed by an authenticated user.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Bearer token. Please sign in to access your notes.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        if settings.SUPABASE_JWT_SECRET:
            # Cryptographically verify the token with the Supabase JWT secret
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
        else:
            # Decode claims in dev if secret is pending configuration
            payload = jwt.decode(token, options={"verify_signature": False})
        
        user_id = payload.get("sub") or payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject claim (sub)",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return AuthenticatedUser(
            id=str(user_id),
            email=payload.get("email", ""),
            role=payload.get("role", "authenticated")
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
        logger.warning(f"JWT Verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[AuthenticatedUser]:
    """
    FastAPI dependency for endpoints that can be accessed either by authenticated
    users or anonymous guests.
    """
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
