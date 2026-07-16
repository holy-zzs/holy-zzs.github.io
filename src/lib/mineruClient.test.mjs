import assert from 'node:assert/strict'
import {
  buildMineruApiBase,
  buildMineruStatusUrl,
  buildMineruResultUrl,
} from './mineruClient.js'

assert.equal(
  buildMineruApiBase('https:', 'https://frontend.example.com'),
  'https://101.35.114.5:9004'
)

assert.equal(
  buildMineruApiBase('http:', 'http://localhost:5173'),
  'http://101.35.114.5:8004'
)

assert.equal(
  buildMineruStatusUrl('http://101.35.114.5:8004', 'job_123'),
  'http://101.35.114.5:8004/jobs/job_123'
)

assert.equal(
  buildMineruResultUrl('http://101.35.114.5:8004', 'job_123'),
  'http://101.35.114.5:8004/jobs/job_123/result'
)

console.log('mineruClient tests passed')
