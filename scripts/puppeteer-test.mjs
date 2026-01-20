import puppeteer from 'puppeteer'

const BASE_URL = 'http://localhost:3000'

// Helper to wait
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// Helper to drag vertically (for faders)
async function dragVertical(page, element, startY, endY, steps = 10) {
  const box = await element.boundingBox()
  const x = box.x + box.width / 2
  const startPx = box.y + box.height * (1 - startY / 10) // Convert value to position
  const endPx = box.y + box.height * (1 - endY / 10)

  await page.mouse.move(x, startPx)
  await page.mouse.down()

  for (let i = 1; i <= steps; i++) {
    const y = startPx + (endPx - startPx) * (i / steps)
    await page.mouse.move(x, y)
    await sleep(20)
  }

  await page.mouse.up()
  await sleep(100)
}

// Helper to perform circular drag on iPod wheel
async function dragCircular(page, wheelElement, clockwise = true, degrees = 60) {
  const box = await wheelElement.boundingBox()
  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  const radius = box.width * 0.35 // Drag in the wheel ring area

  // Start from top of wheel
  const startAngle = -90 * (Math.PI / 180)
  const direction = clockwise ? 1 : -1
  const angleChange = degrees * (Math.PI / 180) * direction

  const startX = centerX + radius * Math.cos(startAngle)
  const startY = centerY + radius * Math.sin(startAngle)

  await page.mouse.move(startX, startY)
  await page.mouse.down()

  const steps = Math.max(10, Math.floor(degrees / 5))
  for (let i = 1; i <= steps; i++) {
    const angle = startAngle + (angleChange * i / steps)
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    await page.mouse.move(x, y)
    await sleep(15)
  }

  await page.mouse.up()
  await sleep(200)
}

async function runTests() {
  console.log('Starting Puppeteer UI tests...\n')

  const browser = await puppeteer.launch({
    headless: false, // Show browser for visual feedback
    defaultViewport: { width: 1280, height: 900 },
    slowMo: 50, // Slow down for visibility
  })

  const page = await browser.newPage()

  try {
    // Navigate to app
    console.log('1. Loading app...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' })
    await sleep(1000)
    console.log('   App loaded\n')

    // ========== FADER TESTS ==========
    console.log('2. Testing Faders (Mixing Board)...')

    const faderIds = ['production', 'craft', 'groove', 'sonic_roots', 'mood', 'intensity', 'vibe']

    for (const faderId of faderIds) {
      const fader = await page.$(`#${faderId}`)
      if (!fader) {
        console.log(`   WARNING: Fader #${faderId} not found`)
        continue
      }

      // Get initial value
      const initialValue = await page.$eval(`#${faderId}`, el => el.getAttribute('aria-valuenow'))
      console.log(`   Testing ${faderId} fader (initial: ${initialValue})`)

      // Drag to top (value 10)
      await dragVertical(page, fader, parseInt(initialValue), 10)
      const topValue = await page.$eval(`#${faderId}`, el => el.getAttribute('aria-valuenow'))
      console.log(`     -> Dragged to top: ${topValue}`)

      await sleep(200)

      // Drag to bottom (value 0)
      await dragVertical(page, fader, 10, 0)
      const bottomValue = await page.$eval(`#${faderId}`, el => el.getAttribute('aria-valuenow'))
      console.log(`     -> Dragged to bottom: ${bottomValue}`)

      await sleep(200)

      // Return to middle
      await dragVertical(page, fader, 0, 5)
      console.log(`     -> Reset to middle`)

      await sleep(300)
    }

    console.log('   Fader tests complete\n')

    // ========== iPod TESTS ==========
    console.log('3. Testing iPod Click Wheel...')

    // Find the iPod wheel - it's the large circular div
    // The wheel has specific dimensions, we'll target it by its approximate size
    const wheel = await page.evaluateHandle(() => {
      // Find the wheel by looking for the circular drag area
      const allDivs = document.querySelectorAll('div')
      for (const div of allDivs) {
        const rect = div.getBoundingClientRect()
        // Wheel should be roughly 150-200px square
        if (rect.width > 140 && rect.width < 220 &&
            Math.abs(rect.width - rect.height) < 10 &&
            div.style.cursor === 'grab') {
          return div
        }
      }
      return null
    })

    if (wheel) {
      console.log('   Found iPod wheel')

      // Test circular scroll - clockwise (should go forward/down in menu)
      console.log('   Testing clockwise scroll (60 degrees)...')
      await dragCircular(page, wheel, true, 60)
      await sleep(500)

      // Test circular scroll - counter-clockwise (should go back/up in menu)
      console.log('   Testing counter-clockwise scroll (60 degrees)...')
      await dragCircular(page, wheel, false, 60)
      await sleep(500)
    } else {
      console.log('   WARNING: iPod wheel not found by cursor style')
    }

    // ========== iPod BUTTON TESTS ==========
    console.log('\n4. Testing iPod Buttons...')

    // Click MENU button (top of wheel)
    const menuBtn = await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('button')
      for (const btn of buttons) {
        if (btn.textContent?.includes('MENU')) return btn
      }
      return null
    })

    if (menuBtn) {
      console.log('   Clicking MENU button to open Views menu...')
      await menuBtn.click()
      await sleep(500)

      // Check if menu opened - look for "Views" header
      const menuOpen = await page.evaluate(() => {
        return document.body.innerText.includes('Views')
      })
      console.log(`   Menu opened: ${menuOpen}`)

      if (menuOpen) {
        // Test scrolling in menu
        console.log('   Testing menu navigation with wheel scroll...')

        // Re-get wheel reference
        const wheelInMenu = await page.evaluateHandle(() => {
          const allDivs = document.querySelectorAll('div')
          for (const div of allDivs) {
            const rect = div.getBoundingClientRect()
            if (rect.width > 140 && rect.width < 220 &&
                Math.abs(rect.width - rect.height) < 10 &&
                div.style.cursor === 'grab') {
              return div
            }
          }
          return null
        })

        if (wheelInMenu) {
          // Scroll down in menu (clockwise)
          console.log('   Scrolling clockwise in menu (should highlight next item)...')
          await dragCircular(page, wheelInMenu, true, 45)
          await sleep(400)

          await dragCircular(page, wheelInMenu, true, 45)
          await sleep(400)

          // Scroll back up (counter-clockwise)
          console.log('   Scrolling counter-clockwise (should highlight previous item)...')
          await dragCircular(page, wheelInMenu, false, 45)
          await sleep(400)
        }

        // Click center button to select
        console.log('   Clicking center button to select menu item...')
        const centerBtn = await page.$('button[aria-label="Select"]')
        if (centerBtn) {
          await centerBtn.click()
          await sleep(500)
          console.log('   Selected menu item')
        }
      }
    }

    // Test Skip Forward button
    console.log('\n5. Testing Skip Forward/Back...')
    const skipForward = await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('button')
      for (const btn of buttons) {
        // Find by position (right side of wheel) and SVG content
        const svg = btn.querySelector('svg')
        if (svg) {
          const rect = btn.getBoundingClientRect()
          const parent = btn.closest('div[style*="cursor"]')
          if (parent) {
            const parentRect = parent.getBoundingClientRect()
            // Right side of wheel
            if (rect.left > parentRect.left + parentRect.width / 2) {
              return btn
            }
          }
        }
      }
      return null
    })

    if (skipForward) {
      console.log('   Clicking Skip Forward...')
      await skipForward.click()
      await sleep(1000)
    }

    // ========== MOOD PRESET TEST ==========
    console.log('\n6. Testing Mood Presets...')
    const presetButtons = await page.$$('button')
    let foundPreset = false

    for (const btn of presetButtons) {
      const text = await page.evaluate(el => el.textContent, btn)
      if (text && ['Chill', 'Party', 'Focus', 'Workout', 'Sleep'].some(p => text.includes(p))) {
        console.log(`   Clicking preset: ${text.trim()}`)
        await btn.click()
        foundPreset = true
        await sleep(600)
        break
      }
    }

    if (!foundPreset) {
      console.log('   No mood presets found')
    }

    // ========== FINAL STATE ==========
    console.log('\n7. Capturing final state...')

    // Get current dial values
    const finalValues = {}
    for (const faderId of faderIds) {
      const val = await page.$eval(`#${faderId}`, el => el.getAttribute('aria-valuenow'))
      finalValues[faderId] = val
    }
    console.log('   Final fader values:', finalValues)

    // Screenshot
    await page.screenshot({ path: 'puppeteer-test-result.png', fullPage: true })
    console.log('   Screenshot saved: puppeteer-test-result.png')

    console.log('\n========================================')
    console.log('Tests complete! Browser will stay open for 10 seconds...')
    await sleep(10000)

  } catch (error) {
    console.error('\nError during tests:', error)
  } finally {
    await browser.close()
  }
}

// Run tests
runTests().catch(console.error)
