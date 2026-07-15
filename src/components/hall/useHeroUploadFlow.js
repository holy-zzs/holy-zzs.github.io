import { useState, useCallback } from '../../react.js'
import { parseFile, parseText } from '../../lib/parser.js'
import { DEMO_MATERIALS, matchTopic } from '../../data/community.js'
import { getUploadDropState } from '../../lib/homepageState.mjs'

export function useHeroUploadFlow({
  dispatch,
  toast,
  user,
  goStep,
  STEPS,
  triggerAuth,
  showShareCard,
}) {
  const [dropState, setDropState] = useState('idle')
  const [parsing, setParsing] = useState(false)
  const [topicInput, setTopicInput] = useState('')
  const [mindPhase, setMindPhase] = useState(null)
  const [dialogueIdx, setDialogueIdx] = useState(0)
  const [topicResult, setTopicResult] = useState(null)
  const [displayedText, setDisplayedText] = useState('')

  const finalizeMaterial = useCallback((material, successMessage) => {
    dispatch({ type: 'SET_MATERIAL', payload: material })
    toast(successMessage, 'success')

    if (!user) {
      triggerAuth?.('保存你的教材，让AI团队开始工作', 'after_upload')
      return
    }

    goStep?.(STEPS.AGENTS)
  }, [dispatch, toast, user, triggerAuth, goStep, STEPS])

  const handleFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const nextState = getUploadDropState(file.name)

    if (nextState === 'hover-reject') {
      toast('请上传 PDF、Word、TXT 或 MD 文件', 'error')
      setDropState('error')
      return
    }

    setParsing(true)
    setDropState('parsing')

    try {
      const material = await parseFile(file)
      finalizeMaterial(
        material,
        `教材《${material.filename}》解析成功 · ${material.stats.sections} 章节 · ${material.stats.concepts} 概念`
      )
      setDropState('success')
    } catch (err) {
      toast(`解析失败：${err.message || '未知错误'}`, 'error')
      setDropState('error')
    } finally {
      setParsing(false)
    }
  }, [toast, finalizeMaterial])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer?.items?.[0]
    const name = file?.getAsFile?.()?.name || ''
    setDropState(getUploadDropState(name))
  }, [])

  const onDragLeave = useCallback((e) => {
    e.preventDefault()
    if (e.currentTarget === e.target) setDropState('idle')
  }, [])

  const onDrop = useCallback(async (e) => {
    e.preventDefault()
    setDropState('idle')
    await handleFiles(e.dataTransfer?.files)
  }, [handleFiles])

  const tryDemo = useCallback(() => {
    const demo = DEMO_MATERIALS[Math.floor(Math.random() * DEMO_MATERIALS.length)]
    const material = parseText(demo.rawText, demo.title + '.txt')
    finalizeMaterial(
      material,
      `已载入示例教材：${demo.title} · ${material.stats.sections} 章节 · ${material.stats.concepts} 概念`
    )
    setDropState('success')
  }, [finalizeMaterial])

  const submitTopic = useCallback(() => {
    const input = topicInput.trim()
    if (!input || input.length < 2) {
      toast('请输入至少 2 个字的主题', 'warning')
      return
    }

    const result = matchTopic(input)
    setTopicResult(result)
    setMindPhase('thinking')
    setDialogueIdx(0)
    setDisplayedText('')
  }, [topicInput, toast])

  const resetMind = useCallback(() => {
    setMindPhase(null)
    setTopicInput('')
    setTopicResult(null)
    setDisplayedText('')
    setDialogueIdx(0)
  }, [])

  const createFromTopic = useCallback(() => {
    if (!topicResult) return

    const conceptList = topicResult.concepts.join('、')
    const topicText = `# ${topicResult.key || topicInput}

## 一、核心概念
本章涉及的核心概念包括：${conceptList}。

## 二、知识结构
${topicResult.concepts.map((c) => `### ${c}
**${c}**是${topicResult.key || topicInput}中的重要概念，需要理解其定义、性质和应用。`).join('\n\n')}

## 三、应用
${topicResult.gameTitle}建议将以上知识转化为${topicResult.gameType}，让学习者在游戏中掌握这些概念。`

    const material = parseText(topicText, (topicResult.key || topicInput) + '.txt')
    finalizeMaterial(
      material,
      `已从“${topicResult.key || topicInput}”创建教材 · ${material.stats.sections} 章节 · ${material.stats.concepts} 概念`
    )
    resetMind()
  }, [topicResult, topicInput, finalizeMaterial, resetMind])

  const shareTopic = useCallback(() => {
    if (topicResult) showShareCard?.(topicResult)
  }, [topicResult, showShareCard])

  return {
    dropState,
    parsing,
    topicInput,
    setTopicInput,
    mindPhase,
    setMindPhase,
    dialogueIdx,
    setDialogueIdx,
    topicResult,
    setTopicResult,
    displayedText,
    setDisplayedText,
    onDragOver,
    onDragLeave,
    onDrop,
    handleFiles,
    tryDemo,
    submitTopic,
    resetMind,
    createFromTopic,
    shareTopic,
  }
}
