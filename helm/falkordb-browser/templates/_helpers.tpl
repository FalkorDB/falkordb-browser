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
Normalize the optional browser base path used when hosting the app under a subpath.
*/}}
{{- define "falkordb-browser.basePath" -}}
{{- $rawBasePath := default "" .Values.browser.basePath -}}
{{- $basePath := trim $rawBasePath -}}
{{- if and $basePath (ne $basePath "/") -}}
{{- if or (ne $basePath $rawBasePath) (regexMatch "\\s" $basePath) -}}
{{- fail "browser.basePath must not contain whitespace" -}}
{{- end -}}
{{- if not (hasPrefix "/" $basePath) -}}
{{- fail "browser.basePath must start with /" -}}
{{- end -}}
{{- $basePath = trimSuffix "/" $basePath -}}
{{- if contains "//" $basePath -}}
{{- fail "browser.basePath must not contain empty path segments" -}}
{{- end -}}
{{- $basePath -}}
{{- end -}}
{{- end }}

{{/*
Validate that env.nextauthUrl path matches browser.basePath if set.
*/}}
{{- define "falkordb-browser.validateNextAuthUrl" -}}
{{- $basePath := include "falkordb-browser.basePath" . -}}
{{- $nextauthUrl := .Values.env.nextauthUrl | default "" -}}
{{- if and $basePath $nextauthUrl (ne $basePath "") (ne $basePath "/") -}}
  {{- $requiredMessage := printf "env.nextauthUrl must be an absolute http(s) URL whose path matches browser.basePath (%s), for example https://host%s" $basePath $basePath -}}
  {{- if not (regexMatch "^https?://[^/?#]+(/[^?#]*)?([?#].*)?$" $nextauthUrl) -}}
    {{- fail $requiredMessage -}}
  {{- end -}}
  {{- $urlPath := regexReplaceAll "^https?://[^/?#]+([^?#]*).*$" $nextauthUrl "${1}" | trimSuffix "/" -}}
  {{- if eq $urlPath "" -}}
    {{- fail $requiredMessage -}}
  {{- end -}}
  {{- if ne $urlPath $basePath -}}
    {{- fail (printf "env.nextauthUrl path (%s) must match browser.basePath (%s) when basePath is set" $urlPath $basePath) -}}
  {{- end -}}
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
Validate existing Secret based ENCRYPTION_KEY configuration.
*/}}
{{- define "falkordb-browser.validateEncryptionKeySecret" -}}
{{- $providedKey := .Values.encryption.key | default "" -}}
{{- $existingSecretName := .Values.encryption.existingSecret.name | default "" -}}
{{- $existingSecretKey := .Values.encryption.existingSecret.key | default "ENCRYPTION_KEY" -}}
{{- $chartSecretName := include "falkordb-browser.fullname" . -}}
{{- if and $providedKey $existingSecretName -}}
{{- fail "set either encryption.key or encryption.existingSecret.name, not both" -}}
{{- end -}}
{{- if and $existingSecretName (not $existingSecretKey) -}}
{{- fail "encryption.existingSecret.key is required when encryption.existingSecret.name is set" -}}
{{- end -}}
{{- if and $existingSecretName (eq $existingSecretName $chartSecretName) -}}
{{- fail "encryption.existingSecret.name must reference a Secret not managed by this chart" -}}
{{- end -}}
{{- if $existingSecretName -}}
{{- $existingSecret := lookup "v1" "Secret" .Release.Namespace $existingSecretName -}}
{{- if and $existingSecret (hasKey $existingSecret.data $existingSecretKey) -}}
{{- $existingKey := index $existingSecret.data $existingSecretKey | b64dec -}}
{{- if not (regexMatch "^[0-9a-fA-F]{64}$" $existingKey) -}}
{{- fail (printf "existing Secret %s key %s must be 64 hexadecimal characters (32 bytes)" $existingSecretName $existingSecretKey) -}}
{{- end -}}
{{- end -}}
{{- end -}}
{{- end }}
