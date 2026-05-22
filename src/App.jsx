import { useState, useCallback, useId, useRef } from 'react'
import styles from './App.module.css'

const PRESET_TIPS = [10, 15, 20]
const MAX_TIP = 100
const MAX_BILL = 9_999_999
const MAX_PEOPLE = 100

// Rounding policy: round each person's share UP to nearest paisa (2 decimal places)
// so the group never underpays. Minor reconciliation differences (<1 paisa) are accepted.
function calcSplit(bill, tipPct, people) {
  const tip = bill * (tipPct / 100)
  const grand = bill + tip
  const raw = grand / people
  const perPerson = Math.ceil(raw * 100) / 100
  return {
    tip: +tip.toFixed(2),
    grand: +grand.toFixed(2),
    perPerson,
  }
}

function validate(bill, tip, people) {
  const errors = {}
  const billNum = parseFloat(bill)
  const tipNum = parseFloat(tip)
  const peopleNum = parseInt(people, 10)

  if (bill === '' || bill === null) {
    errors.bill = 'Bill amount is required.'
  } else if (isNaN(billNum) || !/^\d*\.?\d*$/.test(bill)) {
    errors.bill = 'Enter a valid number.'
  } else if (billNum <= 0) {
    errors.bill = 'Bill must be greater than Rs 0.'
  } else if (billNum > MAX_BILL) {
    errors.bill = `Max bill is Rs ${MAX_BILL.toLocaleString()}.`
  }

  if (tip === '' || tip === null) {
    // blank custom tip is fine — 0 when preset is active
  } else if (isNaN(tipNum) || tipNum < 0) {
    errors.tip = 'Tip must be 0% or more.'
  } else if (tipNum > MAX_TIP) {
    errors.tip = `Tip can't exceed ${MAX_TIP}%.`
  }

  if (people === '' || people === null) {
    errors.people = 'Number of people is required.'
  } else if (!/^\d+$/.test(String(people).trim()) || isNaN(peopleNum)) {
    errors.people = 'Must be a whole number.'
  } else if (peopleNum < 1) {
    errors.people = 'At least 1 person required.'
  } else if (peopleNum > MAX_PEOPLE) {
    errors.people = `Max ${MAX_PEOPLE} people.`
  }

  return errors
}

function fmt(n) {
  return n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const INITIAL = {
  bill: '',
  customTip: '',
  presetTip: 15,
  useCustom: false,
  people: '1',
}

export default function App() {
  const [bill, setBill] = useState(INITIAL.bill)
  const [customTip, setCustomTip] = useState(INITIAL.customTip)
  const [presetTip, setPresetTip] = useState(INITIAL.presetTip)
  const [useCustom, setUseCustom] = useState(INITIAL.useCustom)
  const [people, setPeople] = useState(INITIAL.people)
  const [touched, setTouched] = useState({})

  const billId = useId()
  const customTipId = useId()
  const peopleId = useId()

  const billRef = useRef(null)
  const customTipRef = useRef(null)
  const peopleRef = useRef(null)

  const activeTipPct = useCustom ? (customTip === '' ? 0 : parseFloat(customTip) || 0) : presetTip
  const errors = validate(bill, useCustom ? customTip : String(presetTip), people)

  const billNum = parseFloat(bill)
  const peopleNum = parseInt(people, 10)
  const ready = !Object.keys(errors).length && bill !== '' && people !== '' && billNum > 0 && peopleNum >= 1

  const result = ready ? calcSplit(billNum, activeTipPct, peopleNum) : null

  const handleBlur = useCallback((field) => {
    setTouched(t => ({ ...t, [field]: true }))
  }, [])

  const handleReset = () => {
    setBill(INITIAL.bill)
    setCustomTip(INITIAL.customTip)
    setPresetTip(INITIAL.presetTip)
    setUseCustom(INITIAL.useCustom)
    setPeople(INITIAL.people)
    setTouched({})
    billRef.current?.focus()
  }

  // Enter key moves focus to next logical field
  const handleEnter = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      nextRef?.current?.focus()
    }
  }

  const showErr = (field) => touched[field] && errors[field]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.wordmark}>Tip<em>Split</em></h1>
        <p className={styles.tagline}>Bill splitter · Live calculator</p>
      </header>

      <main className={styles.shell} role="main">
        {/* ── LEFT: Inputs ── */}
        <section className={styles.inputs} aria-label="Calculator inputs">

          {/* Bill Amount */}
          <div className={styles.fieldGroup}>
            <label htmlFor={billId} className={styles.label}>
              Bill amount
              <span className={styles.currency}>PKR · Rs</span>
            </label>
            <div className={`${styles.inputWrap} ${showErr('bill') ? styles.inputError : ''}`}>
              <span className={styles.prefix} aria-hidden="true">Rs</span>
              <input
                id={billId}
                ref={billRef}
                type="text"
                inputMode="decimal"
                className={styles.input}
                placeholder="0.00"
                value={bill}
                onChange={e => setBill(e.target.value)}
                onBlur={() => handleBlur('bill')}
                onKeyDown={e => handleEnter(e, customTipRef)}
                aria-describedby={showErr('bill') ? `${billId}-err` : undefined}
                aria-invalid={!!showErr('bill')}
                autoComplete="off"
              />
            </div>
            {showErr('bill') && (
              <p id={`${billId}-err`} className={styles.errorMsg} role="alert">
                {errors.bill}
              </p>
            )}
          </div>

          {/* Tip % */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Tip percentage</label>
            <div className={styles.presetRow} role="group" aria-label="Tip percentage presets">
              {PRESET_TIPS.map(pct => (
                <button
                  key={pct}
                  type="button"
                  className={`${styles.presetBtn} ${!useCustom && presetTip === pct ? styles.presetActive : ''}`}
                  onClick={() => { setPresetTip(pct); setUseCustom(false) }}
                  aria-pressed={!useCustom && presetTip === pct}
                >
                  {pct}%
                </button>
              ))}
              <div className={`${styles.inputWrap} ${styles.customWrap} ${useCustom ? styles.customActive : ''} ${showErr('tip') ? styles.inputError : ''}`}>
                <input
                  id={customTipId}
                  ref={customTipRef}
                  type="text"
                  inputMode="decimal"
                  className={`${styles.input} ${styles.customInput}`}
                  placeholder="Custom"
                  value={customTip}
                  onChange={e => { setCustomTip(e.target.value); setUseCustom(true) }}
                  onFocus={() => setUseCustom(true)}
                  onBlur={() => handleBlur('tip')}
                  onKeyDown={e => handleEnter(e, peopleRef)}
                  aria-label="Custom tip percentage"
                  aria-describedby={showErr('tip') ? `${customTipId}-err` : undefined}
                  aria-invalid={!!showErr('tip')}
                  autoComplete="off"
                />
                <span className={styles.suffix} aria-hidden="true">%</span>
              </div>
            </div>
            {showErr('tip') && (
              <p id={`${customTipId}-err`} className={styles.errorMsg} role="alert">
                {errors.tip}
              </p>
            )}
          </div>

          {/* Number of People */}
          <div className={styles.fieldGroup}>
            <label htmlFor={peopleId} className={styles.label}>Number of people</label>
            <div className={styles.stepperRow}>
              <button
                type="button"
                className={styles.stepBtn}
                onClick={() => {
                  const n = Math.max(1, (parseInt(people, 10) || 1) - 1)
                  setPeople(String(n))
                  setTouched(t => ({ ...t, people: true }))
                }}
                aria-label="Decrease people"
              >−</button>
              <div className={`${styles.inputWrap} ${styles.stepperInput} ${showErr('people') ? styles.inputError : ''}`}>
                <input
                  id={peopleId}
                  ref={peopleRef}
                  type="text"
                  inputMode="numeric"
                  className={`${styles.input} ${styles.centred}`}
                  value={people}
                  onChange={e => {
                    const val = e.target.value
                    if (val === '' || /^\d+$/.test(val)) setPeople(val)
                  }}
                  onBlur={() => handleBlur('people')}
                  onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }}
                  aria-describedby={showErr('people') ? `${peopleId}-err` : undefined}
                  aria-invalid={!!showErr('people')}
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                className={styles.stepBtn}
                onClick={() => {
                  const n = Math.min(MAX_PEOPLE, (parseInt(people, 10) || 0) + 1)
                  setPeople(String(n))
                  setTouched(t => ({ ...t, people: true }))
                }}
                aria-label="Increase people"
              >+</button>
            </div>
            {showErr('people') && (
              <p id={`${peopleId}-err`} className={styles.errorMsg} role="alert">
                {errors.people}
              </p>
            )}
          </div>

          {/* Reset */}
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
            aria-label="Reset all fields"
          >
            Reset
          </button>
        </section>

        {/* ── RIGHT: Results ── */}
        <section className={styles.results} aria-label="Calculation results" aria-live="polite">
          <div className={styles.resultInner}>

            <div className={styles.resultRow}>
              <div className={styles.resultLabel}>Tip amount</div>
              <div className={`${styles.resultValue} ${!result ? styles.dimmed : ''}`}>
                Rs {result ? fmt(result.tip) : '—'}
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.resultRow}>
              <div className={styles.resultLabel}>Grand total</div>
              <div className={`${styles.resultValue} ${!result ? styles.dimmed : ''}`}>
                Rs {result ? fmt(result.grand) : '—'}
              </div>
            </div>

            <div className={styles.divider} />

            <div className={`${styles.resultRow} ${styles.heroRow}`}>
              <div>
                <div className={styles.heroLabel}>Per person</div>
                <div className={styles.heroSub}>
                  {result && peopleNum > 1 ? `split ${peopleNum} ways` : '\u00a0'}
                </div>
              </div>
              <div className={`${styles.heroValue} ${!result ? styles.dimmed : ''}`}>
                Rs {result ? fmt(result.perPerson) : '0.00'}
              </div>
            </div>

            <div className={styles.rounding}>
              Rounded up to nearest paisa — group never underpays.
            </div>

            {!ready && (
              <div className={styles.placeholder}>
                Fill in the inputs to see your split
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Tip % · Bill · People → Live split</p>
      </footer>
    </div>
  )
}
