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

async function fetchNaverBlogContext(region, styles) {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) return ''

  const queries = [
    `${region} 여행 코스 추천`,
    `${region} 맛집`,
    `${region} 가볼만한곳`,
  ]
  if (styles.includes('cafe')) queries.push(`${region} 카페`)
  if (styles.includes('nature')) queries.push(`${region} 자연 관광지`)
  if (styles.includes('activity')) queries.push(`${region} 액티비티`)

  const results = await Promise.all(
    queries.map(q =>
      fetch(`https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(q)}&display=3&sort=sim`, {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      })
        .then(r => r.json())
        .catch(() => ({ items: [] }))
    )
  )

  const snippets = results
    .flatMap(r => r.items || [])
    .map(item => {
      const title = item.title?.replace(/<[^>]*>/g, '').trim()
      const desc = item.description?.replace(/<[^>]*>/g, '').trim()
      return `• ${title}: ${desc}`
    })
    .filter(Boolean)
    .slice(0, 12)

  if (snippets.length === 0) return ''
  return `\n\n[네이버 블로그 실제 여행 후기 참고 자료]\n${snippets.join('\n')}\n위 후기에 언급된 실제 장소명을 우선적으로 활용하세요.`
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

  // 네이버 블로그 컨텍스트 수집 (병렬)
  const blogContext = await fetchNaverBlogContext(regionStr, styles)

  const prompt = `당신은 한국 여행 전문가입니다.

[절대 규칙] 반드시 "${regionStr}" 지역에 실제로 존재하는 장소만 추천하세요. 다른 지역 장소는 절대 포함하면 안 됩니다.

여행 조건:
- 여행 지역: ${regionStr} (이 지역 장소만 포함할 것)
- 기간: ${duration.label} (${days}일)
- 동행: ${companionStr}
- 스타일: ${styleStr}
${blogContext}

아래 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 절대 쓰지 마세요:

{
  "routeName": "${regionStr} ${duration.label} ${styleStr} 여행",
  "places": [
    {
      "name": "장소명",
      "category": "restaurant 또는 cafe 또는 attraction 또는 shopping 또는 bar 중 하나",
      "address": "${regionStr} 내 실제 도로명 주소",
      "description": "추천 이유 1-2문장",
      "visitTime": "09:00",
      "dayNumber": 1,
      "memo": "대중교통 이용법 또는 팁"
    }
  ]
}

규칙:
- 모든 장소는 반드시 ${regionStr} 내에 위치해야 함
- 하루 4~6개 장소
- visitTime은 09:00부터 시작, 합리적으로 배분
- 동선이 효율적이도록 가까운 장소끼리 같은 날 배치
- 스타일(${styleStr})에 맞는 장소 위주로 선택`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a Korean travel expert with deep knowledge of local Korean travel destinations. You MUST only recommend places located in the specific region the user requests. Use the provided blog references to recommend real, well-known local places. NEVER suggest places from other regions. Always respond in Korean. Always respond with valid JSON only, no other text.`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
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
