import { chromium } from '@playwright/test'

const OUT = 'C:/Users/tek/tripmate/screenshots'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 900, height: 960 } })
const page = await ctx.newPage()

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

// Step1: 모달 → 카페 선택
await page.click('.fab')
await page.waitForTimeout(400)
await page.locator('button').filter({ hasText: '카페' }).first().click()
await page.waitForTimeout(200)
await page.locator('button.btn-primary').click()
await page.waitForTimeout(800)

// Step2: 개발용 건너뛰기
await page.locator('#dev-skip').click()
await page.waitForTimeout(600)

// Step3 스크린샷
await page.screenshot({ path: `${OUT}/A_step3_empty.png` })

// 추천태그 클릭
const tags = page.locator('button').filter({ hasText: /^#/ })
const tc = await tags.count()
console.log('tag count:', tc)
for (let i = 0; i < Math.min(tc, 3); i += 2) {
  await tags.nth(i).click()
  await page.waitForTimeout(150)
}
await page.screenshot({ path: `${OUT}/B_step3_tags.png` })

// 코멘트 입력
await page.locator('textarea.form-textarea').fill('루프탑이 있고 분위기 너무 좋아요! 커피도 맛있음 ☕')
await page.waitForTimeout(200)

// 그룹 선택
const groupOptions = page.locator('button').filter({ hasText: '제주도 여행단' })
if (await groupOptions.count() > 0) await groupOptions.first().click()
await page.waitForTimeout(200)
await page.screenshot({ path: `${OUT}/C_step3_complete.png` })

await browser.close()
console.log('done')
