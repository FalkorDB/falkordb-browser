# FalkorDB Browser Helm Chart

This Helm chart deploys the FalkorDB Browser application to a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- A FalkorDB database instance (can be deployed separately or use an external instance)

## Installation

### Add the repository (if published)

```bash
# If published to a Helm repository
helm repo add falkordb https://charts.falkordb.com
helm repo update
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

## Support

For issues and questions:
- GitHub Issues: https://github.com/FalkorDB/falkordb-browser/issues
- Discord: https://discord.gg/6M4QwDXn2w

## License

This chart is licensed under the same license as the FalkorDB Browser project.
