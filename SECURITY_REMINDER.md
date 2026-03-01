# Security Reminder
## ⚠️ Important Security Practices
This repository was cleaned of API keys on March 1, 2026. To prevent future issues:
### 1. Never Commit API Keys or Secrets
- Always use environment variables (`.env` files)
- Keep `.env` files in `.gitignore`
- Use `.env.example` for templates without actual keys
### 2. Check Before Committing
```bash
# Search for potential API keys before committing
git diff | grep -E "(api_key|API_KEY|secret|token|password)" 
# Or use git-secrets tool
git secrets --scan
```
### 3. API Keys Found in This Project
The following API keys were previously exposed and have been removed:
- ❌ Groq API Key (line 64 in old `2/server/flaskserver/app.py`)
- ❌ Google API Key (line 60 in old `2/server/flaskserver/app.py`)
**Action Required:** If these keys were real and active, they should be:
1. **Revoked immediately** in the respective service dashboards
2. **Regenerated** with new keys
3. **Stored securely** in environment variables
### 4. Current Project Structure
This project (SkillVideo) properly uses environment variables:
- Backend uses `.env` file (in `.gitignore`)
- Frontend uses proper environment configuration
- See `backend/env.example` for template
### 5. Resources
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [git-secrets tool](https://github.com/awslabs/git-secrets)
- [Best Practices for API Keys](https://cloud.google.com/docs/authentication/api-keys)
---
**Remember:** Once a secret is pushed to GitHub, consider it compromised even after removal from history.
