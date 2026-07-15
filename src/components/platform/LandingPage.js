import {
    HOMEPAGE_FAQS,
    HOMEPAGE_FEATURES,
    HOMEPAGE_HERO,
    HOMEPAGE_PIPELINE,
    HOMEPAGE_SHOWCASE,
    HOMEPAGE_VALUE_CARDS,
    HOMEPAGE_SOCIAL_PROOF,
    HOMEPAGE_AUDIENCES,
    HOMEPAGE_DEMO_CASES
} from '../../data/homepageBrandContent.mjs'
import { html, useCallback, useContext, useMemo } from '../../deps.js'
import { getLandingPrimaryAction } from '../../lib/homepageState.mjs?v8'
import { AppContext, STEPS } from '../../store/appContext.js'
import DemoShowcaseSection from './homepage/DemoShowcaseSection.js'
import FaqSection from './homepage/FaqSection.js'
import FeatureCardsSection from './homepage/FeatureCardsSection.js'
import FinalCtaSection from './homepage/FinalCtaSection.js'
import HeroStage from './homepage/HeroStage.js'
import PipelineSection from './homepage/PipelineSection.js'
import CommunityFeaturedSection from './homepage/CommunityFeaturedSection.js'
import ShowcaseWallSection from './homepage/ShowcaseWallSection.js'
import StageSelectSection from './homepage/StageSelectSection.js'
import ValueCardsSection from './homepage/ValueCardsSection.js'
import SocialProofSection from './homepage/SocialProofSection.js'
import AudiencesSection from './homepage/AudiencesSection.js'
import { Footer, NavBar } from './PlatformCommon.js?v=nav2'
import InfiniteCanvas from './homepage/InfiniteCanvas.js'

export default function LandingPage() {
  const { state, dispatch } = useContext(AppContext)
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const go = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [dispatch, prefersReducedMotion])

  const primaryAction = getLandingPrimaryAction(state)

  const triggerPrimaryAction = useCallback(() => {
    if (primaryAction.step) {
      go(primaryAction.step)
      return
    }
    // 未选学段 → 滚动到学段选择区域
    const gradeSection = document.getElementById('grade-select')
    if (gradeSection) {
      gradeSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' })
    } else {
      // 找不到锚点则回退到协议演示
      go(STEPS.PROTOCOL)
    }
  }, [go, primaryAction, prefersReducedMotion])

  const handleSelectGrade = useCallback((stage) => {
    dispatch({ type: 'SET_GRADE', payload: stage.id })
  }, [dispatch])

  const handleSelectSubject = useCallback(() => {
    // 选学科后进入上传教材页（新流程跳过模式选择）
    go(STEPS.SUBJECT)
  }, [go])

  const triggerSecondaryAction = useCallback(() => {
    if (state.designDoc) {
      go(STEPS.PREVIEW)
      return
    }
    go(STEPS.COMMUNITY)
  }, [go, state.designDoc])

  return html`
    <${InfiniteCanvas}>
      <div class="brand-page-root min-h-screen">
        <${NavBar} />

        <${HeroStage}
          hero=${HOMEPAGE_HERO}
          primaryAction=${'INITIATE_ENGINE'}
          secondaryAction=${'VIEW_DEMO'}
          onPrimary=${triggerPrimaryAction}
          onSecondary=${triggerSecondaryAction}
        />

        <${DemoShowcaseSection} cases=${HOMEPAGE_DEMO_CASES} />

        <${ValueCardsSection} items=${HOMEPAGE_VALUE_CARDS} />

        <${StageSelectSection} onSelectSubject=${handleSelectSubject} onSelectGrade=${handleSelectGrade} />

        <${PipelineSection} items=${HOMEPAGE_PIPELINE} />

        <${FeatureCardsSection} />

        <${SocialProofSection} data=${HOMEPAGE_SOCIAL_PROOF} />

        <${ShowcaseWallSection} items=${HOMEPAGE_SHOWCASE} />

        <${CommunityFeaturedSection} />

        <${AudiencesSection} items=${HOMEPAGE_AUDIENCES} />

        <${FaqSection} items=${HOMEPAGE_FAQS} />

        <${FinalCtaSection}
          onPrimary=${triggerPrimaryAction}
        />

        <${Footer} />
      </div>
    <//>
  `
}
