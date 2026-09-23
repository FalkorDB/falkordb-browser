# FalkorDB Browser Helm Chart

This Helm chart deploys the FalkorDB Browser application to a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- A FalkorDB database instance (can be deployed separately or use an external instance)

## Installation

### Install from OCI Registry (Recommended)

```bash
# Install the latest version
helm install falkordb-browser oci://ghcr.io/falkordb/helm-charts/falkordb-browser

# Or install a specific version
helm install falkordb-browser oci://ghcr.io/falkordb/helm-charts/falkordb-browser --version 1.6.8
```

### Install from local chart

```bash
# Clone the repository
git clone https://github.com/FalkorDB/falkordb-browser.git
cd falkordb-browser/helm

# Install the chart
helm install falkordb-browser ./falkordb-browser
```

### Install with custom values

```bash
# From OCI registry
helm install falkordb-browser oci://ghcr.io/falkordb/helm-charts/falkordb-browser \
  --set env.nextauthUrl=https://your-domain.com \
  --set env.nextauthSecret=your-secret-here \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=your-domain.com

# Or from local chart
helm install falkordb-browser ./falkordb-browser \
  --set env.nextauthUrl=https://your-domain.com \
  --set env.nextauthSecret=your-secret-here \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=your-domain.com
```

### Install from a values file

```bash
helm install falkordb-browser ./falkordb-browser -f custom-values.yaml
```

## Configuration

The following table lists the configurable parameters of the FalkorDB Browser chart and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `1` |
| `image.registry` | Image registry | `docker.io` |
| `image.repository` | Image repository | `falkordb/falkordb-browser` |
| `image.tag` | Image tag | `""` (uses chart appVersion) |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `global.imageRegistry` | Global image registry override (takes precedence over `image.registry`) | `""` |
| `encryption.key` | 64-character hex key for server-side encryption. Generated and reused from the release Secret when empty. | `""` |
| `encryption.existingSecret.name` | Existing Secret name for `ENCRYPTION_KEY`. Mutually exclusive with `encryption.key`. | `""` |
| `encryption.existingSecret.key` | Key in `encryption.existingSecret.name` that contains the encryption key. | `ENCRYPTION_KEY` |
| `service.type` | Kubernetes service type | `ClusterIP` |
| `service.port` | Service port for browser | `3000` |
| `service.restPort` | Service port for REST API | `8080` |
| `ingress.enabled` | Enable ingress | `false` |
| `ingress.className` | Ingress class name | `""` |
| `ingress.hosts` | Ingress hosts configuration | `[{host: falkordb-browser.local, paths: [{path: /, pathType: ImplementationSpecific}]}]` |
| `ingress.tls` | Ingress TLS configuration | `[]` |
| `resources` | CPU/Memory resource requests/limits | `{}` |
| `podSecurityContext` | Pod-level security context (`runAsNonRoot`, UID/GID `1001`, seccomp `RuntimeDefault`) | `{runAsNonRoot: true, runAsUser: 1001, runAsGroup: 1001, seccompProfile: {type: RuntimeDefault}}` |
| `securityContext` | Container-level security context (`allowPrivilegeEscalation: false`, drop all capabilities, run as UID/GID `1001`) | `{allowPrivilegeEscalation: false, capabilities: {drop: [ALL]}, runAsNonRoot: true, runAsUser: 1001, runAsGroup: 1001}` |
| `autoscaling.enabled` | Enable horizontal pod autoscaler | `false` |
| `autoscaling.minReplicas` | Minimum number of replicas | `1` |
| `autoscaling.maxReplicas` | Maximum number of replicas | `100` |
| `env.chatUrl` | URL for chat/text-to-cypher service | `http://localhost:8080/` |
| `env.nextauthUrl` | Base URL for the browser | `http://localhost:3000/` |
| `env.nextauthSecret` | Secret for NextAuth.js | `SECRET` |
| `env.googleAnalytics` | Google Analytics ID | `""` |
| `env.cypher` | Enable text-to-cypher feature | `"1"` |
| `persistence.enabled` | Enable persistence for API tokens | `false` |
| `persistence.size` | Size of persistent volume | `1Gi` |
| `persistence.accessMode` | Access mode for persistent volume | `ReadWriteOnce` |
| `connection.enabled` | Ship a preconfigured FalkorDB connection so the browser does not need a manual login | `false` |
| `connection.url` | `falkor://`, `falkors://`, `redis://` or `rediss://` URL; the `s` variants imply TLS | `""` |
| `connection.host` | Hostname. Required unless `connection.url` is set | `""` |
| `connection.port` | Port. Empty falls back to the URL, then `6379` | `""` |
| `connection.username` | Username. Empty falls back to the URL, then `default` | `""` |
| `connection.password` | Password. Stored in the chart-managed Secret. Omitted, empty or whitespace-only keeps the password from `connection.url`; only a value with something in it overrides it. A password that merely starts or ends with a space is kept verbatim | unset |
| `connection.tls` | `"true"`/`"false"`; empty takes TLS from the URL scheme | `""` |
| `connection.ca` | Base64-encoded CA certificate | `""` |
| `connection.autoConnect` | Sign in automatically on load. `false` only prefills the login form | `true` |
| `connection.existingSecret.name` | Existing Secret holding the connection secrets. Must not be the chart's own Secret | `""` |
| `connection.existingSecret.urlKey` | Key in that Secret for `FALKORDB_CONNECTION_URL` | `""` |
| `connection.existingSecret.passwordKey` | Key in that Secret for `FALKORDB_PASSWORD` | `""` |
| `connection.existingSecret.caKey` | Key in that Secret for `FALKORDB_CA` | `""` |

> **Note:** The default security contexts require an image that runs as non-root, which the chart `appVersion` image does. Some older images (for example `v1.6.7` and `v2.0.0`) start as root and drop privileges themselves, so pinning `image.tag` to one of those also requires relaxing `podSecurityContext`/`securityContext`.

## Examples

### Basic installation with ClusterIP service

```bash
helm install falkordb-browser ./falkordb-browser
```

Access via port-forward:
```bash
kubectl port-forward svc/falkordb-browser 3000:3000
```

### Installation with Ingress

Create a values file (`ingress-values.yaml`):

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: falkordb-browser.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: falkordb-browser-tls
      hosts:
        - falkordb-browser.example.com

env:
  nextauthUrl: https://falkordb-browser.example.com
  nextauthSecret: "your-secure-secret-here"
```

Install:
```bash
helm install falkordb-browser ./falkordb-browser -f ingress-values.yaml
```

### Installation with persistence

```yaml
persistence:
  enabled: true
  size: 5Gi
  storageClass: standard

env:
  nextauthSecret: "your-secure-secret-here"
```

### Encryption key management

`ENCRYPTION_KEY` is required by the browser for server-side encryption of stored credentials and tokens. The key must be 64 hexadecimal characters (32 bytes).

By default, the chart generates a random key and stores it in the release Secret as `ENCRYPTION_KEY`. On upgrades, the chart reuses the existing Secret value so restarted or rescheduled containers keep using the same key.

Preserve or restore the same `ENCRYPTION_KEY` across upgrades, reinstalls, and chart-managed Secret recreation. If the release Secret is deleted or the chart is reinstalled without the previous key, the chart generates a new key and existing encrypted credentials and tokens become unreadable.

To supply your own key:

```bash
helm install falkordb-browser ./falkordb-browser \
  --set encryption.key="$(openssl rand -hex 32)"
```

To reference an existing Secret in the release namespace instead:

```bash
kubectl create secret generic falkordb-browser-encryption \
  --from-literal=ENCRYPTION_KEY="$(openssl rand -hex 32)"

helm install falkordb-browser ./falkordb-browser \
  --set encryption.existingSecret.name=falkordb-browser-encryption \
  --set encryption.existingSecret.key=ENCRYPTION_KEY
```

Do not rotate this key unless you are prepared to invalidate or migrate data encrypted with the previous key.

### Preconfigured connection

Ship the FalkorDB connection with the release so the browser opens straight onto the graph list instead of the login form:

```yaml
connection:
  enabled: true
  url: falkor://default:password@falkordb:6379
```

Or with discrete fields instead of a URL:

```yaml
connection:
  enabled: true
  host: falkordb
  port: "6379"
  username: default
  password: password
```

To keep the secrets out of the values file, reference an existing Secret. Read
the URL rather than typing it into the command, so the credential stays out of
the shell history and out of the argument list `ps` shows every user on the box:

```bash
read -rs -p 'FalkorDB URL: ' FALKORDB_URL
(umask 077 && printf '%s' "$FALKORDB_URL" > falkordb-url) && unset FALKORDB_URL

kubectl create secret generic falkordb-browser-connection \
  --from-file=url=falkordb-url
rm falkordb-url

helm install falkordb-browser ./falkordb-browser \
  --set connection.enabled=true \
  --set connection.existingSecret.name=falkordb-browser-connection \
  --set connection.existingSecret.urlKey=url
```

Notes:

- The discrete fields override `connection.url` field by field. Leave a field empty to keep the value from the URL.
- `connection.url` carries a host, a port and credentials and nothing else. A database selector other than `/0`, or any query string, is rejected at startup rather than dropped — the browser only ever talks to database 0.
- `connection.existingSecret.name` has to name a Secret this chart does not manage. Pointing it at `<release>-falkordb-browser` makes the chart skip the key it would have written while still referencing it, leaving the pod stuck on a key that exists nowhere; the render fails instead.
- Set `connection.autoConnect: false` to prefill the login form without signing in automatically. The password is then never handed out by the server, so leave `connection.password` unset and omit the password from `connection.url` — otherwise the form is prefilled but the credential still only lives on the server.
- Changing a Secret referenced through `connection.existingSecret` (or `encryption.existingSecret`) does **not** restart the pod: those values are resolved when the container starts and the deployment's checksum annotations only cover chart-managed objects. Roll it yourself with `kubectl rollout restart deployment/<release>-falkordb-browser`.
- **Security:** with `autoConnect` enabled, anyone who can reach the browser reaches the database with these credentials. Enable it only where the browser itself is access-controlled, and prefer a read-only FalkorDB user.

### Installation with resource limits

```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

## Sticky Sessions

When running multiple replicas of FalkorDB Browser, you may need to configure sticky sessions (session affinity) to ensure users consistently connect to the same pod. This is important for maintaining session state and authentication.

### Service-Level Sticky Sessions

Enable session affinity at the service level by adding the following to your values file:

```yaml
replicaCount: 2

service:
  type: ClusterIP
  port: 3000
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800  # 3 hours
```

**Note**: Service-level session affinity uses client IP, which works well for internal services but may have limitations with proxies or load balancers.

### Ingress-Level Sticky Sessions

For production deployments with ingress, configure sticky sessions using ingress annotations. The configuration varies by ingress controller:

#### NGINX Ingress Controller

```yaml
replicaCount: 3

ingress:
  enabled: true
  className: nginx
  annotations:
    # Enable sticky sessions
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/affinity-mode: "persistent"
    nginx.ingress.kubernetes.io/session-cookie-name: "falkordb-browser-session"
    nginx.ingress.kubernetes.io/session-cookie-max-age: "10800"
    # Optional: secure cookie settings
    nginx.ingress.kubernetes.io/session-cookie-secure: "true"
    nginx.ingress.kubernetes.io/session-cookie-samesite: "Lax"
  hosts:
    - host: falkordb-browser.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: falkordb-browser-tls
      hosts:
        - falkordb-browser.example.com
```

#### Traefik Ingress Controller

```yaml
replicaCount: 3

ingress:
  enabled: true
  className: traefik
  annotations:
    # Enable sticky sessions
    traefik.ingress.kubernetes.io/service.sticky.cookie: "true"
    traefik.ingress.kubernetes.io/service.sticky.cookie.name: "falkordb-browser-session"
    traefik.ingress.kubernetes.io/service.sticky.cookie.secure: "true"
    traefik.ingress.kubernetes.io/service.sticky.cookie.httponly: "true"
    traefik.ingress.kubernetes.io/service.sticky.cookie.samesite: "lax"
  hosts:
    - host: falkordb-browser.example.com
      paths:
        - path: /
          pathType: Prefix
```

#### AWS ALB Ingress Controller

```yaml
replicaCount: 3

ingress:
  enabled: true
  className: alb
  annotations:
    # Enable sticky sessions
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/load-balancer-attributes: stickiness.enabled=true,stickiness.lb_cookie.duration_seconds=10800
    alb.ingress.kubernetes.io/healthcheck-path: /
  hosts:
    - host: falkordb-browser.example.com
      paths:
        - path: /
          pathType: Prefix
```

### Verifying Sticky Sessions

After deployment, verify sticky sessions are working:

1. **Check the service** (if using service-level affinity):
   ```bash
   kubectl get svc falkordb-browser -o yaml | grep -A 5 sessionAffinity
   ```

2. **Test with curl** (for ingress-based sticky sessions):
   ```bash
   # Make multiple requests and check the session cookie
   curl -i https://falkordb-browser.example.com/ | grep -i set-cookie
   
   # Save cookie and reuse it
   curl -c cookies.txt https://falkordb-browser.example.com/
   curl -b cookies.txt https://falkordb-browser.example.com/api/auth/session
   ```

3. **Monitor pod distribution**:
   ```bash
   # Check which pods are receiving requests
   kubectl logs -l app.kubernetes.io/name=falkordb-browser --tail=100 -f
   ```

### Recommendations

- **For production**: Use ingress-level sticky sessions with HTTPS and secure cookie settings
- **Session timeout**: Set to match your application's session duration (default: 3 hours / 10800 seconds)
- **Cookie security**: Always enable `secure` and `httponly` flags in production
- **Health checks**: Ensure health check endpoints don't require session affinity

## Upgrading

```bash
helm upgrade falkordb-browser ./falkordb-browser
```

## Uninstalling

```bash
helm uninstall falkordb-browser
```

## Connecting to FalkorDB

After deploying the browser, you'll need to configure it to connect to your FalkorDB instance. You can:

1. Use the browser UI to add connection details
2. Deploy FalkorDB separately using its Helm chart (if available)
3. Connect to an external FalkorDB instance

## Publishing and CI/CD

This chart is automatically packaged into the FalkorDB Helm charts repository via GitHub Actions.

The [FalkorDB/helm-charts](https://github.com/FalkorDB/helm-charts) repository publishes packaged charts to the GitHub Container Registry. The OCI chart path is `oci://ghcr.io/falkordb/helm-charts/falkordb-browser`.

The workflow requires a `GHCR_TOKEN` or `GITHUB_TOKEN` secret with write access to the FalkorDB/helm-charts repository.

## Support

For issues and questions:
- GitHub Issues: https://github.com/FalkorDB/falkordb-browser/issues
- Discord: https://discord.gg/6M4QwDXn2w

## License

This chart is licensed under the same license as the FalkorDB Browser project.
