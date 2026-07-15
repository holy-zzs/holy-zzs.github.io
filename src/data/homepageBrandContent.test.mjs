import assert from 'node:assert/strict'
import {
    HOMEPAGE_AUDIENCES,
    HOMEPAGE_COMPARISON,
    HOMEPAGE_FAQS,
    HOMEPAGE_FEATURES,
    HOMEPAGE_HERO,
    HOMEPAGE_SHOWCASE,
    HOMEPAGE_TRUST_STRIP,
} from './homepageBrandContent.mjs'
assert.equal(HOMEPAGE_HERO.title, '把任何内容与创意，编排成真正的游戏体验')
assert.equal(HOMEPAGE_HERO.primaryCta.label, '立即开始生成')
assert.equal(HOMEPAGE_HERO.secondaryCta.label, '观看演示 / 试玩样例')
assert.equal(HOMEPAGE_TRUST_STRIP.length, 4)
assert.equal(HOMEPAGE_FEATURES.length, 4)
assert.equal(HOMEPAGE_SHOWCASE.length >= 3, true)
assert.equal(HOMEPAGE_AUDIENCES.length, 4)
assert.equal(HOMEPAGE_COMPARISON.length >= 4, true)
assert.equal(HOMEPAGE_FAQS.length >= 6, true)
assert.equal(
  HOMEPAGE_FAQS.some((item) => item.answer.includes('HTML5 游戏')),
  false
)

console.log('homepageBrandContent tests passed')
