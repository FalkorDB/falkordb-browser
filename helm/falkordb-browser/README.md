# FalkorDB Browser Helm Chart

This Helm chart deploys the FalkorDB Browser application to a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- A FalkorDB database instance (can be deployed separately or use an external instance)

## Installation

### Install from Helm Repository (Recommended)

```bash
# Add the FalkorDB Helm repository
helm repo add falkordb https://falkordb.github.io/helm-charts
helm repo update

# Install the latest version
helm install falkordb-browser falkordb/falkordb-browser

# Or install a specific version
helm install falkordb-browser falkordb/falkordb-browser --version 1.6.7
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
# From Helm repository
helm install falkordb-browser falkordb/falkordb-browser \
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
| `image.repository` | Image repository | `falkordb/falkordb-browser` |
| `image.tag` | Image tag | `""` (uses chart appVersion) |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Kubernetes service type | `ClusterIP` |
| `service.port` | Service port for browser | `3000` |
| `service.restPort` | Service port for REST API | `8080` |
| `service.mcpPort` | Service port for MCP | `3001` |
| `ingress.enabled` | Enable ingress | `false` |
| `ingress.className` | Ingress class name | `""` |
| `ingress.hosts` | Ingress hosts configuration | `[{host: falkordb-browser.local, paths: [{path: /, pathType: ImplementationSpecific}]}]` |
| `ingress.tls` | Ingress TLS configuration | `[]` |
| `resources` | CPU/Memory resource requests/limits | `{}` |
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

This chart is automatically published to the FalkorDB Helm charts repository via GitHub Actions.

The workflow publishes charts to the [FalkorDB/helm-charts](https://github.com/FalkorDB/helm-charts) repository, which is served via GitHub Pages at `https://falkordb.github.io/helm-charts`.

The workflow requires a `GHCR_TOKEN` or `GITHUB_TOKEN` secret with write access to the FalkorDB/helm-charts repository.

## Support

For issues and questions:
- GitHub Issues: https://github.com/FalkorDB/falkordb-browser/issues
- Discord: https://discord.gg/6M4QwDXn2w

## License

This chart is licensed under the same license as the FalkorDB Browser project.
