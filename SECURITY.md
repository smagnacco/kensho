# Security Assessment: Kenshō Dependencies

## Summary

Kenshō has **minimal external dependencies** and uses **OpenAI API exclusively for embeddings** in entropic mode. All primary and dev dependencies are secure and well-maintained.

---

## Dependencies

| Package | Version | Risk Level | Notes |
|---------|---------|-----------|-------|
| react | ^18.3.1 | ✅ NONE | Latest, regularly maintained |
| react-dom | ^18.3.1 | ✅ NONE | Latest, regularly maintained |
| typescript | ^5.5.3 | ✅ NONE | Latest, regularly maintained |
| vite | ^5.4.2 | ✅ NONE | Latest, regularly maintained |
| tailwindcss | ^3.4.10 | ✅ NONE | Latest, regularly maintained |

---

## API Security

### OpenAI API (Embeddings)

Entropic mode uses OpenAI's `text-embedding-3-small` API:
- ✅ HTTPS encrypted in transit
- ✅ No local model loading or deserialization
- ✅ Standard OAuth/API key authentication
- ✅ Compliant with OpenAI security practices

### Anthropic & OpenAI & Grok (Agent Calls)

All LLM provider calls (agents A, B, P):
- ✅ Calls made directly from browser (OpenAI, Grok) or via Vite proxy (Anthropic)
- ✅ HTTPS encrypted
- ✅ API keys managed in browser memory or environment variables
- ✅ No sensitive data persisted to disk (except .env, which is gitignored)

---

## Browser-Only Architecture

Kenshō runs entirely in the browser with no backend:
- ✅ No database or server-side data storage
- ✅ No authentication system
- ✅ Experiment results are stored locally or exported by user
- ✅ API keys are never sent to any server except their respective providers

---

## Conclusion

Kenshō is **secure for use**. The removal of local model dependencies eliminates the entire transitive vulnerability chain from onnxruntime-web and protobufjs.

**Recommendation**: Use OpenAI API key from a dedicated service account with minimal permissions (embeddings only).
