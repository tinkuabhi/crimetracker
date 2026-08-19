export const K8S_MANIFESTS = {
  frontendDeployment: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: crime-tracker-frontend
  labels:
    app: crime-tracker
    tier: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: crime-tracker
      tier: frontend
  template:
    metadata:
      labels:
        app: crime-tracker
        tier: frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/crime-tracker/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: VITE_API_BASE_URL
          value: "http://crime-tracker-backend:5000"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "300m"
---
apiVersion: v1
kind: Service
metadata:
  name: crime-tracker-frontend
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: crime-tracker
    tier: frontend`,

  backendDeployment: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: crime-tracker-backend
  labels:
    app: crime-tracker
    tier: backend-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: crime-tracker
      tier: backend-api
  template:
    metadata:
      labels:
        app: crime-tracker
        tier: backend-api
    spec:
      containers:
      - name: backend-api
        image: ghcr.io/crime-tracker/backend-api:latest
        ports:
        - containerPort: 5000
        env:
        - name: PORT
          value: "5000"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongodb-atlas-secret
              key: connection-string
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: gemini-secrets
              key: api-key
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 15
          periodSeconds: 20
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: crime-tracker-backend
spec:
  type: ClusterIP
  ports:
  - port: 5000
    targetPort: 5000
  selector:
    app: crime-tracker
    tier: backend-api`,

  aiFetcherCronJob: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: india-crime-ai-fetcher
spec:
  schedule: "0 */3 * * *" # Runs every 3 hours across all regional zones
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: ai-fetcher
            image: python:3.11-slim
            command: ["python", "ai_fetcher.py"]
            env:
            - name: GEMINI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: gemini-secrets
                  key: api-key
            - name: BACKEND_API_URL
              value: "http://crime-tracker-backend:5000/records"
            resources:
              requests:
                memory: "256Mi"
                cpu: "250m"
              limits:
                memory: "512Mi"
                cpu: "600m"`,

  mongoSecret: `apiVersion: v1
kind: Secret
metadata:
  name: mongodb-atlas-secret
type: Opaque
stringData:
  connection-string: "mongodb+srv://<username>:<password>@cluster0.mongodb.net/indian_crime_tracker?retryWrites=true&w=majority"
---
apiVersion: v1
kind: Secret
metadata:
  name: gemini-secrets
type: Opaque
stringData:
  api-key: "YOUR_GEMINI_API_KEY_HERE"`
};

export const MONGO_SCHEMA_CODE = `// models/Incident.js
const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  date: { type: String, required: true, index: true },
  fetched_date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  state: { type: String, required: true, index: true },
  district: { type: String, required: true, index: true },
  city: { type: String, default: 'General' },
  type: {
    type: String,
    enum: ['road_accident', 'train_accident', 'fire', 'murder', 'theft', 'robbery', 'assault', 'cybercrime', 'industrial_hazard', 'accident'],
    required: true,
    index: true
  },
  deaths: { type: Number, default: 0, min: 0 },
  injuries: { type: Number, default: 0, min: 0 },
  source: { type: String, required: true },
  description: { type: String, required: true },
  verified: { type: Boolean, default: true },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' }
}, {
  timestamps: true
});

// Composite index for rapid query deduplication & analytics
IncidentSchema.index({ date: -1, state: 1, type: 1 });
IncidentSchema.index({ description: 'text', city: 'text', district: 'text' });

module.exports = mongoose.model('Incident', IncidentSchema);`;

export const SAFETY_TIP_SCHEMA_CODE = `// models/SafetyTip.js
const mongoose = require('mongoose');

const SafetyTipSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['road', 'public', 'cyber', 'home'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  actionPoints: [{ type: String }],
  helplines: [{
    name: { type: String },
    number: { type: String }
  }],
  importance: {
    type: String,
    enum: ['critical', 'recommended', 'essential'],
    default: 'recommended'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SafetyTip', SafetyTipSchema);`;
