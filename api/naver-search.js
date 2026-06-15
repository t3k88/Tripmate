export default async function handler(req, res) {
  const { query } = req.query
  if (!query) return res.status(400).json({ error: 'query required' })

  const response = await fetch(
    `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=6`,
    {
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
      },
    }
  )

  const data = await response.json()
  res.status(200).json(data)
}
