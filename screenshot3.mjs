import { chromium } from '@playwright/test'

const OUT = 'C:/Users/tek/tripmate/screenshots'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 900, height: 960 } })
const page = await ctx.newPage()

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

// 모달 열기 → 식당 선택 → 다음
await page.click('.fab')
await page.waitForTimeout(400)
await page.locator('button').filter({ hasText: '식당' }).first().click()
await page.waitForTimeout(200)
await page.locator('button.btn-primary').click()
await page.waitForTimeout(600)

// Step 2를 JS로 강제로 건너뜀 (React 내부 버튼 클릭 대신 state를 우회)
// "이 장소로 등록할게요" 버튼은 disabled이므로, 직접 리액트 이벤트를 발생시키기 어려움
// 대신 Step 2 버튼을 강제 enable 해서 클릭
await page.evaluate(() => {
  const btn = document.querySelector('button.btn-primary')
  if (btn) {
    btn.disabled = false
    btn.removeAttribute('disabled')
  }
})
await page.waitForTimeout(200)
await page.locator('button.btn-primary').click({ force: true })
await page.waitForTimeout(800)

await page.screenshot({ path: `${OUT}/step3_review.png` })

// 태그 선택
const tags = page.locator('button').filter({ hasText: /^#/ })
const tc = await tags.count()
console.log('tags:', tc)
if (tc >= 3) {
  await tags.nth(0).click(); await page.waitForTimeout(150)
  await tags.nth(2).click(); await page.waitForTimeout(150)
  await tags.nth(4).click(); await page.waitForTimeout(150)
}
await page.screenshot({ path: `${OUT}/step3_tags_selected.png` })

// 코멘트 입력
const ta = page.locator('textarea.form-textarea')
if (await ta.count() > 0) {
  await ta.fill('분위기 너무 좋고 음식도 최고예요 :)')
  await page.waitForTimeout(200)
}
await page.screenshot({ path: `${OUT}/step3_with_comment.png` })

await browser.close()
console.log('done')
