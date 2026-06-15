import { chromium } from '@playwright/test'

const OUT = 'C:/Users/tek/tripmate/screenshots'

const browser = await chromium.launch({ headless: false, slowMo: 200 })
const ctx = await browser.newContext({ viewport: { width: 900, height: 960 } })
const page = await ctx.newPage()

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await page.screenshot({ path: `${OUT}/s1_feed.png` })

// 모달 열기
await page.click('.fab')
await page.waitForTimeout(700)
await page.screenshot({ path: `${OUT}/s2_step1.png` })

// 식당 선택
await page.locator('button').filter({ hasText: '식당' }).first().click()
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/s3_step1_selected.png` })

// 다음
await page.locator('button.btn-primary').click()
await page.waitForTimeout(2000) // 카카오맵 로드 대기
await page.screenshot({ path: `${OUT}/s4_step2_map.png` })

// 검색
await page.fill('input.form-input', '이태원 맛집')
await page.locator('button').filter({ hasText: '검색' }).click()
await page.waitForTimeout(3000)
await page.screenshot({ path: `${OUT}/s5_step2_results.png` })

// 첫 번째 결과 클릭
const results = page.locator('.modal-sheet button').filter({ hasText: /\S{2,}/ })
const cnt = await results.count()
console.log('result count:', cnt)

// 결과 목록에서 주소가 있는 버튼 찾기
for (let i = 0; i < Math.min(cnt, 10); i++) {
  const txt = await results.nth(i).textContent()
  console.log(i, txt?.trim().slice(0, 40))
}

// 두 번째 버튼(첫 결과)
if (cnt >= 2) {
  await results.nth(1).click()
  await page.waitForTimeout(1500)
}
await page.screenshot({ path: `${OUT}/s6_step2_selected.png` })

// Step 3으로
try {
  await page.locator('button.btn-primary').click({ timeout: 2000 })
  await page.waitForTimeout(800)
} catch (e) { console.log('btn err', e.message) }
await page.screenshot({ path: `${OUT}/s7_step3.png` })

// 태그 2개 선택
const tags = page.locator('.form-section button').filter({ hasText: /^#/ })
const tc = await tags.count()
console.log('tag count:', tc)
if (tc >= 2) {
  await tags.nth(0).click(); await page.waitForTimeout(200)
  await tags.nth(2).click(); await page.waitForTimeout(200)
}
await page.screenshot({ path: `${OUT}/s8_step3_tags.png` })

// 코멘트
await page.fill('textarea.form-textarea', '분위기도 좋고 음식도 맛있어요 :)')
await page.waitForTimeout(200)
await page.screenshot({ path: `${OUT}/s9_step3_comment.png` })

await browser.close()
console.log('done')
