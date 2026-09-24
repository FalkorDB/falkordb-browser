{{/*
Expand the name of the chart.
*/}}
{{- define "falkordb-browser.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}
{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "falkordb-browser.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "falkordb-browser.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "falkordb-browser.labels" -}}
helm.sh/chart: {{ include "falkordb-browser.chart" . }}
{{ include "falkordb-browser.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "falkordb-browser.selectorLabels" -}}
app.kubernetes.io/name: {{ include "falkordb-browser.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "falkordb-browser.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "falkordb-browser.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Return the full container image reference.
Honors global.imageRegistry when set and keeps backward compatibility when
image.repository already includes a registry host.
*/}}
{{- define "falkordb-browser.image" -}}
{{- $repository := .Values.image.repository -}}
{{- $registry := (default dict .Values.global).imageRegistry | default .Values.image.registry -}}
{{- $tag := .Values.image.tag | default (printf "v%s" .Chart.AppVersion) -}}
{{- $repositoryParts := splitList "/" $repository -}}
{{- $firstPart := first $repositoryParts -}}
{{- $repositoryHasRegistry := or (contains "." $firstPart) (contains ":" $firstPart) (eq $firstPart "localhost") -}}
{{- if and $registry (not $repositoryHasRegistry) -}}
{{- printf "%s/%s:%s" (trimSuffix "/" $registry) $repository $tag -}}
{{- else -}}
{{- printf "%s:%s" $repository $tag -}}
{{- end -}}
{{- end }}

{{/*
Return a valid 64-character hexadecimal ENCRYPTION_KEY.
Uses .Values.encryption.key when set, otherwise reuses the existing release
Secret value or generates a new key for first install.
*/}}
{{- define "falkordb-browser.encryptionKey" -}}
{{- $providedKey := .Values.encryption.key | default "" -}}
{{- $existingSecretName := .Values.encryption.existingSecret.name | default "" -}}
{{- if and $providedKey $existingSecretName -}}
{{- fail "set either encryption.key or encryption.existingSecret.name, not both" -}}
{{- end -}}
{{- if $providedKey -}}
{{- if not (regexMatch "^[0-9a-fA-F]{64}$" $providedKey) -}}
{{- fail "encryption.key must be 64 hexadecimal characters (32 bytes)" -}}
{{- end -}}
{{- $providedKey -}}
{{- else -}}
{{- $secretName := include "falkordb-browser.fullname" . -}}
{{- $existingSecret := lookup "v1" "Secret" .Release.Namespace $secretName -}}
{{- $existingKey := "" -}}
{{- if and $existingSecret (hasKey $existingSecret.data "ENCRYPTION_KEY") -}}
{{- $existingKey = index $existingSecret.data "ENCRYPTION_KEY" | b64dec -}}
{{- end -}}
{{- if $existingKey -}}
{{- if not (regexMatch "^[0-9a-fA-F]{64}$" $existingKey) -}}
{{- fail (printf "existing Secret %s ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes)" $secretName) -}}
{{- end -}}
{{- $existingKey -}}
{{- else -}}
{{- randBytes 32 | sha256sum -}}
{{- end -}}
{{- end -}}
{{- end }}

{{/*
Secrets that are published in this repository, its docs or its CI, and so are
known to everyone. Anyone holding one can forge a session cookie, so they are
rejected wherever a session-signing secret is accepted.
*/}}
{{- define "falkordb-browser.wellKnownSecrets" -}}
{{- list "CHANGE_ME_IN_PRODUCTION" "SECRET" "secret" "changeme" "your-secret-here" "your-secure-secret-here" "test-secret-for-ci" | join "," -}}
{{- end }}

{{/*
Return the NEXTAUTH_SECRET used to sign sessions.
Uses .Values.env.nextauthSecret when set, otherwise reuses the existing release
Secret value or generates a new secret for first install. A known placeholder is
rejected outright: anyone who knows it can forge a session cookie. The reuse path
is checked too, so a release that was first installed with a placeholder is not
allowed to keep it across an upgrade.
*/}}
{{- define "falkordb-browser.nextauthSecret" -}}
{{- $wellKnown := splitList "," (include "falkordb-browser.wellKnownSecrets" .) -}}
{{- $provided := .Values.env.nextauthSecret | default "" -}}
{{- if $provided -}}
{{- if has $provided $wellKnown -}}
{{- fail "env.nextauthSecret is a well-known placeholder; leave it empty to generate one, or set a random value (openssl rand -base64 32)" -}}
{{- end -}}
{{- $provided -}}
{{- else -}}
{{- $secretName := include "falkordb-browser.fullname" . -}}
{{- $existingSecret := lookup "v1" "Secret" .Release.Namespace $secretName -}}
{{- $existing := "" -}}
{{- if and $existingSecret (hasKey ($existingSecret.data | default dict) "NEXTAUTH_SECRET") -}}
{{- $existing = index $existingSecret.data "NEXTAUTH_SECRET" | b64dec -}}
{{- end -}}
{{- if and $existing (has $existing $wellKnown) -}}
{{- fail "the existing release Secret holds a well-known placeholder NEXTAUTH_SECRET; rotate it by setting env.nextauthSecret to a random value (openssl rand -base64 32), or delete the Secret to have one generated" -}}
{{- end -}}
{{- if $existing -}}
{{- $existing -}}
{{- else -}}
{{- randBytes 32 | sha256sum -}}
{{- end -}}
{{- end -}}
{{- end }}

{{/*
Validate existing Secret based ENCRYPTION_KEY configuration.
*/}}
{{- define "falkordb-browser.validateEncryptionKeySecret" -}}
{{- $providedKey := .Values.encryption.key | default "" -}}
{{- $existingSecretName := .Values.encryption.existingSecret.name | default "" -}}
{{- $rawExistingSecretKey := .Values.encryption.existingSecret.key -}}
{{- $chartSecretName := include "falkordb-browser.fullname" . -}}
{{- if and $providedKey $existingSecretName -}}
{{- fail "set either encryption.key or encryption.existingSecret.name, not both" -}}
{{- end -}}
{{- if and $existingSecretName (not $rawExistingSecretKey) -}}
{{- fail "encryption.existingSecret.key is required when encryption.existingSecret.name is set" -}}
{{- end -}}
{{- if and $existingSecretName (eq $existingSecretName $chartSecretName) -}}
{{- fail "encryption.existingSecret.name must reference a Secret not managed by this chart" -}}
{{- end -}}
{{- if $existingSecretName -}}
{{- $existingSecretKey := $rawExistingSecretKey | default "ENCRYPTION_KEY" -}}
{{- $existingSecret := lookup "v1" "Secret" .Release.Namespace $existingSecretName -}}
{{- if $existingSecret -}}
{{- $existingSecretData := $existingSecret.data | default dict -}}
{{- if not (hasKey $existingSecretData $existingSecretKey) -}}
{{- fail (printf "existing Secret %s must contain key %s" $existingSecretName $existingSecretKey) -}}
{{- end -}}
{{- $existingKey := index $existingSecretData $existingSecretKey | b64dec -}}
{{- if not (regexMatch "^[0-9a-fA-F]{64}$" $existingKey) -}}
{{- fail (printf "existing Secret %s key %s must be 64 hexadecimal characters (32 bytes)" $existingSecretName $existingSecretKey) -}}
{{- end -}}
{{- end -}}
{{- end -}}
{{- end }}

{{/*
Render one env entry for a secret part of the preconfigured connection.
Prefers connection.existingSecret when that key is named, falls back to the
chart-managed Secret, and renders nothing when neither supplies a value.
Call with (dict "root" $ "name" "FALKORDB_PASSWORD" "value" ... "existingKey" ...)
*/}}
{{- define "falkordb-browser.connectionSecretEnv" -}}
{{- $existingName := .root.Values.connection.existingSecret.name | default "" -}}
{{- if and .existingKey $existingName -}}
- name: {{ .name }}
  valueFrom:
    secretKeyRef:
      name: {{ $existingName | quote }}
      key: {{ .existingKey | quote }}
{{- else if (.value | default "" | toString | trim) -}}
- name: {{ .name }}
  valueFrom:
    secretKeyRef:
      name: {{ include "falkordb-browser.fullname" .root }}
      key: {{ .name }}
{{- end -}}
{{- end }}

{{/*
Validate the preconfigured connection.
Without a URL or a host the browser finds no connection at all, so an enabled
but empty connection would install cleanly and then quietly show the login
form — fail the render instead of shipping that. Values are trimmed first,
because the browser trims them too and would read "   " as unconfigured.
*/}}
{{- define "falkordb-browser.validateConnection" -}}
{{- $connection := .Values.connection -}}
{{- $existing := $connection.existingSecret | default dict -}}
{{- $existingName := $existing.name | default "" | toString -}}
{{- $chartSecretName := include "falkordb-browser.fullname" . -}}
{{- /*
Naming the chart's own Secret here points the Deployment at a key that will
never exist: secret.yaml drops every chart-managed key the existingSecret
claims, while connectionSecretEnv sends the env var to that same Secret. The
pod would then be stuck on a missing key, so refuse the name outright.
*/ -}}
{{- if eq $existingName $chartSecretName -}}
{{- fail "connection.existingSecret.name must reference a Secret not managed by this chart" -}}
{{- end -}}
{{- $externalUrl := and ($existingName | trim) ($existing.urlKey | default "" | trim) -}}
{{- if not (or ($connection.url | default "" | trim) ($connection.host | default "" | trim) $externalUrl) -}}
{{- fail "connection.enabled requires connection.url, connection.host, or connection.existingSecret.name together with connection.existingSecret.urlKey" -}}
{{- end -}}
{{- end }}
