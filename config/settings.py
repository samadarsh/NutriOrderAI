import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


@dataclass
class Settings:
    use_mock_mcp: bool
    swiggy_base_url: str
    swiggy_token: str


def get_settings() -> Settings:
    return Settings(
        use_mock_mcp=os.getenv("USE_MOCK_MCP", "true").lower() == "true",
        swiggy_base_url=os.getenv("SWIGGY_BASE_URL", "https://mcp-staging.swiggy.com/food"),
        swiggy_token=os.getenv("SWIGGY_TOKEN", ""),
    )
