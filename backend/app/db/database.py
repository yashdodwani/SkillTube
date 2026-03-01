import os
import ssl
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


def _build_async_url(raw: str) -> tuple[str, dict]:
    """
    Convert a standard postgres URL to an asyncpg-compatible one.
    - Replaces scheme with postgresql+asyncpg
    - Strips query params asyncpg doesn't understand (sslmode, channel_binding, etc.)
    - Returns (async_url, connect_args)
    """
    if raw.startswith("postgres://"):
        raw = raw.replace("postgres://", "postgresql://", 1)

    parsed = urlparse(raw)
    params = parse_qs(parsed.query)

    # Decide SSL
    sslmode = params.pop("sslmode", ["disable"])[0]
    params.pop("channel_binding", None)   # asyncpg doesn't support this

    connect_args: dict = {}
    if sslmode in ("require", "verify-ca", "verify-full"):
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        connect_args["ssl"] = ctx

    clean_query = urlencode({k: v[0] for k, v in params.items()})
    clean_parsed = parsed._replace(scheme="postgresql+asyncpg", query=clean_query)
    return urlunparse(clean_parsed), connect_args


_raw_url = os.getenv("DATABASE_URL", "")
ASYNC_DATABASE_URL, _connect_args = _build_async_url(_raw_url)

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args=_connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    """FastAPI dependency – yields an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables if they don't exist yet."""
    from app.db import models  # noqa: F401 – ensures models are registered
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialised.")

