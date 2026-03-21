# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| ≥ 1.0   | ✅ Yes    |
| < 1.0   | ❌ No     |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Email your report to: **security@Swaggies.com** (replace with your email)

Include:

1. Description of the vulnerability
2. Steps to reproduce
3. Affected service(s)
4. Potential impact
5. Suggested fix (optional)

We will respond within **48 hours** and provide a fix timeline.

---

## Security Architecture

### Secrets Management

- All secrets stored in **GCP Secret Manager**
- Injected into Kubernetes via **External Secrets Operator**
- No secrets in git, `.env` files, Kubernetes YAML, or `docker-compose.yml`
- Secrets follow principle of least privilege per service

### Authentication & Authorization

- JWT tokens signed with strong secret (RS256 recommended for production)
- Token verification in shared middleware on all protected routes
- Token blacklisting via Redis on logout
- JWT expiry: Access 15min / Refresh 7d (configurable)

### Network Security

- Zero-trust Kubernetes NetworkPolicy (deny-all default)
- Only API Gateway exposed externally (via Ingress)
- All inter-service communication internal to the cluster
- gRPC connections between services — encrypted in GKE (mTLS via Istio recommended next step)

### Container Security

- Non-root user (UID 1000, GID 1000) in all containers
- Read-only container root filesystem
- All Linux capabilities dropped (`drop: [ALL]`)
- No privilege escalation
- Multi-stage Docker builds — no dev tooling in production images

### CI/CD Security

- **TruffleHog** scans every commit/PR for accidental secret exposure
- **Trivy** blocks images with CRITICAL CVEs before any push to Artifact Registry
- Cloud Build Service Account has minimal permissions (only what is needed)

### GCP Security

- GKE Autopilot with **private nodes** (no public IPs on worker nodes)
- **Workload Identity** — no service account key files mounted
- **Binary Authorization** — only verified images can run in GKE
- GKE API server access restricted via `master_authorized_networks`

---

## Secret Rotation Procedure

```bash
# 1. Update secret in GCP Secret Manager
gcloud secrets versions add SECRET_NAME --data-file=- <<< "new-value"

# 2. ESO will automatically refresh secrets within 1h (refreshInterval)
# OR force immediate refresh by annotating the ExternalSecret:
kubectl annotate externalsecret auth-service-secrets \
  force-sync=$(date +%s) -n Swaggies

# 3. Rolling restart to pick up new secrets
kubectl rollout restart deployment/auth-service -n Swaggies
```

---

## Dependency Vulnerability Scanning

```bash
# Scan a built image
docker build -t Swaggies/auth-service:scan . -f services/auth-service/Dockerfile
trivy image --severity CRITICAL,HIGH Swaggies/auth-service:scan

# Scan npm dependencies
cd services/auth-service && npm audit
```
