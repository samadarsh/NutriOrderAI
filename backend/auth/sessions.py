from fastapi import Request, HTTPException
from fastapi.security import APIKeyCookie

# Secure session cookie setup
SESSION_COOKIE = APIKeyCookie(name="nutriorder_session", auto_error=False)

def encrypt_token(plain_token: str) -> bytes:
    """
    TODO: Encrypt a plaintext token using AES-256-GCM before persistence.
    This scaffold intentionally fails closed until real encryption is wired.
    """
    _ = plain_token
    raise NotImplementedError("Token encryption is not implemented yet.")

def decrypt_token(encrypted_token: bytes) -> str:
    """
    TODO: Decrypt an encrypted token back into plaintext.
    This scaffold intentionally fails closed until real encryption is wired.
    """
    _ = encrypted_token
    raise NotImplementedError("Token decryption is not implemented yet.")

async def get_current_user_id(request: Request) -> str:
    """
    Dependency helper to resolve user session from HTTP-only secure cookie.
    """
    session_id = request.cookies.get("nutriorder_session")
    if not session_id:
        raise HTTPException(status_code=401, detail="Session expired or unauthenticated.")
    
    # TODO: Verify session validity in Redis/DB
    return "user_1"
