"""Regression tests for stale ``utils`` module compatibility in model metadata."""

import importlib
import sys
import types


def test_model_metadata_falls_back_when_utils_cache_is_missing_url_helpers():
    sys.modules.pop("agent.model_metadata", None)
    original_utils = sys.modules.get("utils")

    stale_utils = types.ModuleType("utils")
    sys.modules["utils"] = stale_utils
    try:
        model_metadata = importlib.import_module("agent.model_metadata")
        assert model_metadata.base_url_host_matches(
            "https://api.openrouter.ai/v1",
            "openrouter.ai",
        ) is True
        assert (
            model_metadata.base_url_hostname("https://api.openrouter.ai/v1")
            == "api.openrouter.ai"
        )
    finally:
        sys.modules.pop("agent.model_metadata", None)
        if original_utils is not None:
            sys.modules["utils"] = original_utils
        else:
            sys.modules.pop("utils", None)
