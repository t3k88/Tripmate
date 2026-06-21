export const CATEGORIES = [
  { id: 'restaurant', label: '식당', icon: '🍽️' },
  { id: 'cafe', label: '카페', icon: '☕' },
  { id: 'bar', label: '술집', icon: '🍺' },
  { id: 'attraction', label: '관광지', icon: '🏞️' },
  { id: 'etc', label: '기타', icon: '📌' },
]

// 카테고리별 추천 메뉴/액티비티 섹션 설정
export const EXTRA_SECTION = {
  restaurant: { label: '추천 메뉴', placeholder: '예) 된장찌개, 삼겹살 2인분', icon: '🍽️' },
  cafe:       { label: '추천 메뉴', placeholder: '예) 아이스 아메리카노, 딸기케이크', icon: '☕' },
  bar:        { label: '추천 메뉴', placeholder: '예) 골뱅이소면, 참이슬', icon: '🍺' },
  attraction: { label: '추천 액티비티', placeholder: '예) 일출 보기, 트레킹 코스', icon: '🏃' },
}

export const RECOMMENDATION_POINTS = {
  restaurant: ['#맛집', '#가성비', '#뷰맛집', '#혼밥가능', '#단체모임', '#웨이팅없음', '#주차편함', '#친절한서비스'],
  cafe: ['#분위기굿', '#공부하기좋음', '#뷰맛집', '#디저트맛있음', '#넓은좌석', '#반려동물가능', '#주차편함', '#감성카페'],
  bar: ['#안주맛있음', '#분위기굿', '#가성비', '#혼술가능', '#단체모임', '#새벽영업', '#조용한분위기', '#라이브있음'],
  attraction: ['#포토스팟', '#자연경관', '#역사문화', '#무료입장', '#아이와함께', '#주차편함', '#숨은명소', '#야경맛집'],
  etc: ['#추천해요', '#또가고싶음', '#특별한경험', '#숨은명소', '#가성비', '#분위기굿'],
}

export function getCategoryInfo(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[4]
}

export function Tag({ category }) {
  const info = getCategoryInfo(category)
  return (
    <span className={`tag tag-${category}`}>
      {info.icon} {info.label}
    </span>
  )
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function getRegion(address) {
  if (!address) return '기타'
  return address.split(' ')[0] || '기타'
}

// 주소를 시/도 > 구/시 > 동/읍/면 단계로 분리
export function getAddressLevels(address) {
  if (!address) return ['기타']
  const parts = address.split(' ').filter(Boolean)
  const levels = []
  if (parts[0]) levels.push(parts[0])
  if (parts[1]) levels.push(parts[1])
  if (parts[2]) levels.push(parts[2])
  return levels.length > 0 ? levels : ['기타']
}
