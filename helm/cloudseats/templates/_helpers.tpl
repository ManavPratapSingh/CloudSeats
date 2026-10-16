{{- define "cloudseats.name" -}}
{{- .Chart.Name -}}
{{- end }}

{{- define "cloudseats.labels" -}}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: cloudseats
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}
