import { chromium } from '@playwright/test'
import { join } from 'path'

const OUT = 'C:/Users/tek/tripmate/screenshots'

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 900, height: 960 } })
const page = await ctx.newPage()

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

// 1. 피드 탭 (홈)
await page.screenshot({ path: join(OUT, '01_feed.png') })

// 2. + 버튼 클릭 → 장소등록 모달 오픈
await page.click('.fab')
await page.waitForTimeout(600)
await page.screenshot({ path: join(OUT, '02_modal_step1_category.png') })

// 3. 식당 선택
await page.locator('button').filter({ hasText: '식당' }).first().click()
await page.waitForTimeout(300)
await page.screenshot({ path: join(OUT, '03_step1_selected.png') })

// 4. 다음 단계
await page.locator('button.btn-primary').click()
await page.waitForTimeout(800)
await page.screenshot({ path: join(OUT, '04_step2_map.png') })

// 5. 검색창에 입력
await page.fill('input.form-input', '홍대 맛집')
await page.waitForTimeout(300)
await page.screenshot({ path: join(OUT, '05_step2_typing.png') })

// 6. 검색 버튼 클릭 (카카오 API 응답 대기)
await page.locator('button', { hasText: '검색' }).click()
await page.waitForTimeout(2500)
await page.screenshot({ path: join(OUT, '06_step2_results.png') })

// 7. 첫번째 결과 클릭
const firstResult = page.locator('button').filter({ hasText: /.+/ }).nth(3)
try {
  await firstResult.click({ timeout: 2000 })
  await page.waitForTimeout(1000)
} catch {}
await page.screenshot({ path: join(OUT, '07_step2_selected.png') })

// 8. 이 장소로 등록할게요
try {
  await page.locator('button.btn-primary').click({ timeout: 2000 })
  await page.waitForTimeout(600)
} catch {}
await page.screenshot({ path: join(OUT, '08_step3_review.png') })

// 9. 추천포인트 태그 2개 클릭
const tags = page.locator('button').filter({ hasText: /^#/ })
const cnt = await tags.count()
if (cnt >= 2) {
  await tags.nth(0).click()
  await page.waitForTimeout(200)
  await tags.nth(2).click()
  await page.waitForTimeout(200)
}
await page.screenshot({ path: join(OUT, '09_step3_tags_selected.png') })

await browser.close()
console.log('done')
