# Migration from OpenRouter to Google Gemini API

## Summary
Successfully migrated the SkillVideo backend from OpenRouter API to Google Gemini API.

## Changes Made

### 1. **Dependencies** (`backend/requirements.txt`)
- ✅ Added `google-generativeai>=0.3.0`
- ❌ Removed OpenRouter dependency (was using httpx directly)

### 2. **Environment Configuration**
- **`.env` and `env.example`**: Removed `OPENROUTER_API_KEY`, kept only `GOOGLE_API_KEY`

### 3. **Code Changes**

#### **`backend/app/services/chunking.py`**
- Replaced OpenRouter API configuration with Google Gemini
- Updated imports: Added `import google.generativeai as genai`
- Removed: `OPENROUTER_API_KEY` and `OPENROUTER_URL`
- Added: `GOOGLE_API_KEY` configuration with `genai.configure()`
- Modified `generate_chunks()` function:
  - Replaced OpenRouter HTTP API calls with Gemini SDK calls
  - Uses Gemini models: `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-pro`
  - Simplified code by using direct SDK instead of HTTP requests

#### **`backend/app/services/quiz.py`**
- Replaced OpenRouter API configuration with Google Gemini
- Updated imports: Added `import google.generativeai as genai`
- Removed: `OPENROUTER_API_KEY` and `OPENROUTER_URL`
- Added: `GOOGLE_API_KEY` configuration with `genai.configure()`
- Modified `generate_questions()` function:
  - Replaced OpenRouter HTTP API calls with Gemini SDK calls
  - Uses same Gemini models as chunking service
  - Simplified code structure

### 4. **Models Used**

#### Previous (OpenRouter):
- `openai/gpt-oss-120b:free`
- `meta-llama/llama-3.3-70b-instruct:free`
- `google/gemma-3-27b-it:free`

#### Current (Google Gemini):
- `gemini-1.5-flash` (primary)
- `gemini-1.5-pro` (fallback)
- `gemini-pro` (fallback)

### 5. **Fallback Behavior**
Both services retain their fallback mechanisms:
- **Chunking**: Falls back to automatic segmentation if Gemini fails
- **Quiz**: Falls back to template-based questions if Gemini fails

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure API Key
Get your Google Gemini API key from: https://makersuite.google.com/app/apikey

Update `.env` file:
```env
GOOGLE_API_KEY=your_actual_gemini_api_key_here
```

### 3. Run the Server
```bash
uvicorn main:app --reload --port 8001
```

## Benefits of Migration

### ✅ Advantages
1. **Official SDK**: Using Google's official SDK is more reliable and maintainable
2. **Better Documentation**: Gemini has comprehensive official documentation
3. **Simpler Code**: SDK calls are cleaner than HTTP API calls
4. **Free Tier**: Gemini offers a generous free tier
5. **Better Performance**: Direct SDK access is faster than proxy services
6. **Single API Key**: Only need one API key instead of multiple services

### ⚠️ Considerations
1. **Rate Limits**: Be aware of Gemini's rate limits on free tier
2. **API Key Security**: Ensure GOOGLE_API_KEY is kept secure and not committed to git

## Testing

After migration, test:
1. Video chunking functionality
2. Quiz generation from chunks
3. Error handling and fallback mechanisms

## Rollback (if needed)

If you need to rollback to OpenRouter:
1. Restore previous versions of `chunking.py` and `quiz.py` from git
2. Update `.env` to use `OPENROUTER_API_KEY`
3. Reinstall dependencies if needed

---

**Migration completed successfully on March 1, 2026**

