# Security Assessment: Kenshō Dependencies

## Summary

Kenshō has **4 known vulnerabilities** in transitive dependencies from `@xenova/transformers`. The risk is **LOW** for typical usage, but should be documented.

---

## Vulnerability Details

### Affected Chain
```
@xenova/transformers@2.17.2
  └─ onnxruntime-web@1.14.0
     └─ onnx-proto@4.0.4
        └─ protobufjs@6.11.6
```

### CVEs (from protobufjs)
| CVE | Severity | Title |
|-----|----------|-------|
| GHSA-xq3m-2v4x-88gg | CRITICAL | Arbitrary code execution |
| GHSA-66ff-xgx4-vchm | HIGH | Code injection through bytes field defaults |
| GHSA-75px-5xx7-5xc7 | HIGH | Prototype pollution + code generation gadget |
| GHSA-685m-2w69-288q | HIGH | Denial of service through unbounded recursion |

### Root Cause
- `protobufjs` is used to deserialize ONNX model format files in the browser
- `onnxruntime-web` hasn't updated to protobufjs 7.6.0+ (which fixes the CVEs)
- This is a known issue with the ONNX Runtime project

---

## Risk Assessment for Kenshō

### Attack Surface
Exploitation would require:
1. **Model file compromise**: Attacker intercepts/modifies the `.onnx` model file served by Hugging Face
2. **Browser execution**: Code executes in user's browser during model deserialization
3. **Untrusted data**: User loads a malicious model file

### Practical Risk: **LOW**

**Why?**
- ✅ Models are served by **Hugging Face** (trusted, well-maintained CDN)
- ✅ All model transfers use **HTTPS** (encrypted in transit)
- ✅ No untrusted/user-uploaded model files are processed
- ✅ Model loading is **opt-in** (user chooses embedding backend)
- ✅ No server-side impact (browser-only code)

**If using OpenAI API backend**: Risk is **ZERO** (no local model loading)

---

## Mitigation Strategies

### Option 1: Use OpenAI API Backend (RECOMMENDED)
```
ConfigPanel → Experiment Type: Entropic
            → Embedding Backend: OpenAI API
```
- **Pros**: No local model loading, no protobufjs code paths executed
- **Cons**: Requires OpenAI API key, minimal extra cost

### Option 2: Accept Risk with Monitoring
- Pin `@xenova/transformers@2.17.2` in package.json
- Monitor for updates to onnxruntime-web that resolve protobufjs
- Document in README that transformers.js backend is optional

### Option 3: Fork/Patch ONNX Runtime (Not Practical)
- Would require maintaining a fork of onnxruntime-web
- Too complex for marginal gain

---

## Recommended Actions

### For Users
1. **Default to OpenAI API backend** if available
2. If using transformers.js: understand the risk is **low but non-zero**
3. Keep browser/system updated

### For Developers
1. Monitor https://github.com/Microsoft/onnxruntime/issues for protobufjs updates
2. Consider adding a security notice to README.md:
   ```
   **Note on transformers.js backend:**
   The local embedding engine uses onnxruntime-web, which has known (but low-risk)
   transitive vulnerabilities in protobufjs. For production, prefer the OpenAI API backend.
   ```

---

## Other Dependencies

| Package | Version | Risk Level | Notes |
|---------|---------|-----------|-------|
| react | ^18.3.1 | ✅ NONE | Latest, regularly maintained |
| react-dom | ^18.3.1 | ✅ NONE | Latest, regularly maintained |
| typescript | ^5.5.3 | ✅ NONE | Latest, regularly maintained |
| vite | ^5.4.2 | ✅ NONE | Latest, regularly maintained |
| tailwindcss | ^3.4.10 | ✅ NONE | Latest, regularly maintained |

All primary and dev dependencies are **secure and well-maintained**.

---

## Conclusion

**Kenshō is safe for use.** The vulnerabilities are:
- In transitive dependencies
- Require a specific attack vector (model file compromise)
- Can be entirely avoided by using OpenAI API backend
- Have **LOW practical risk** due to trusted model sources (Hugging Face)

**Recommendation**: Document this in README and suggest OpenAI API as the default backend for new users.
