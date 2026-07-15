import assert from 'node:assert/strict'
import {
  HALL_PLAZA_HERO,
  HALL_PLAZA_STATS,
  HALL_LIVE_RAIL,
  HALL_STAGE_WORLDS,
  HALL_UNIVERSE_CARDS,
  HALL_RECOMMENDED_WORLDS,
  HALL_TEAM_STRIP,
} from './hallPlazaContent.mjs'

assert.equal(HALL_PLAZA_HERO.eyebrow, '协作进行中')
assert.equal(HALL_PLAZA_HERO.title, 'AI 正在共同制作一款游戏')
assert.equal(HALL_PLAZA_HERO.primaryCta.label, '开始制作')
assert.equal(HALL_PLAZA_HERO.secondaryCta.label, '查看样例')
assert.equal(HALL_PLAZA_HERO.tertiaryCta.label, '邀请 AI 团队')
assert.equal(HALL_PLAZA_STATS.length, 4)
assert.equal(HALL_LIVE_RAIL.length >= 6, true)
assert.equal(HALL_STAGE_WORLDS.length >= 5, true)
assert.equal(HALL_UNIVERSE_CARDS.length >= 4, true)
assert.equal(HALL_RECOMMENDED_WORLDS.length >= 3, true)
assert.equal(HALL_TEAM_STRIP.length >= 8, true)

console.log('hallPlazaContent tests passed')
