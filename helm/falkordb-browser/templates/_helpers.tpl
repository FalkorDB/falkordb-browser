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
