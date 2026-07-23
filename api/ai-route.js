const STYLE_LABELS = {
  food: '맛집탐방',
  cafe: '카페투어',
  nature: '자연/힐링',
  activity: '액티비티',
  shopping: '쇼핑',
  drink: '술/바',
}

const COMPANION_LABELS = {
  solo: '혼자',
  friends: '친구들',
  couple: '연인',
  family: '가족',
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { regions, duration, companion, styles } = req.body
  if (!regions?.length || !duration || !styles?.length) {
    return res.status(400).json({ error: '필수 입력값이 없어요' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API 키가 설정되지 않았어요' })

  const regionStr = regions.join(', ')
  const styleStr = styles.map(s => STYLE_LABELS[s] || s).join(', ')
  const companionStr = COMPANION_LABELS[companion] || companion
  const days = duration.days

  const prompt = `당신은 한국 여행 전문가입니다. 아래 조건으로 실제 여행 루트를 추천해주세요.

조건:
- 지역: ${regionStr}
- 기간: ${duration.label} (${days}일)
- 동행: ${companionStr}
- 스타일: ${styleStr}

다음 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:

{
  "routeName": "루트 이름 (예: 단양 당일치기 맛집투어)",
  "places": [
    {
      "name": "장소명",
      "category": "카테고리 (restaurant/cafe/attraction/shopping/bar 중 하나)",
      "address": "실제 도로명 주소 (정확하게)",
      "description": "이 장소를 추천하는 이유 (1-2문장)",
      "visitTime": "HH:MM 형식 방문 시각",
      "dayNumber": 1,
      "memo": "이동 방법이나 팁 (선택)"
    }
  ]
}

규칙:
- 하루에 4~6개 장소 배치
- 동선이 효율적이도록 같은 날은 가까운 장소끼리 묶기
- visitTime은 09:00부터 시작해서 합리적으로 배분
- 실제로 존재하는 유명한 장소 위주로 추천
- 뚜벅이도 갈 수 있는 장소 포함, memo에 대중교통 정보 적기
- 스타일에 맞게 카테고리 비율 조정`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || `Groq API error ${response.status}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content?.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')

    const result = JSON.parse(jsonMatch[0])
    return res.status(200).json(result)
  } catch (err) {
    console.error('AI route error:', err.message)
    return res.status(500).json({ error: err.message || 'AI 추천 중 오류가 발생했어요.' })
  }
}
