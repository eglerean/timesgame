// game.js
// Pure game logic for a 5x2 times-table guessing game with scoring
// and dynamic difficulty (more blanks as the score increases).

export class TimesTableGame {
  constructor(table = 7, rows = 5, cols = 2) {
    this.rows = rows;
    this.cols = cols;
    this.total = rows * cols;
    this.score = 0; // cumulative correct answers across rounds
    this.setTable(table);
    this.newRound();
  }

  setTable(n) {
    this.table = Number(n) || 7;
    this.values = Array.from({ length: this.total }, (_, i) => this.table * (i + 1));
  }

  // 1 blank for score 0–5, 2 blanks for 6–10, 3 for 11–15, etc. (capped to total cells)
  computeBlanksCount() {
    const base = 1 + Math.floor(Math.max(0, this.score - 1) / 5);
    return Math.min(this.total, base);
  }

  static #shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  #pickBlankIndexes(k) {
    const allIdx = Array.from({ length: this.total }, (_, i) => i);
    TimesTableGame.#shuffle(allIdx);
    return new Set(allIdx.slice(0, k));
  }

  newRound() {
    this.blanksCount = this.computeBlanksCount();
    this.blankIndexes = this.#pickBlankIndexes(this.blanksCount); // Set<number>
    this.correctMap = new Map();
    for (let i = 0; i < this.total; i++) this.correctMap.set(i, null);
  }

  isBlank(index) { return this.blankIndexes.has(index); }
  getValue(index) { return this.values[index]; }

  /**
   * Check user's input for the given cell index.
   * Increments score ONLY if this cell becomes correct for the first time.
   * @returns {{correct: boolean, correctValue: number, scored: boolean, score: number}}
   */
  check(index, input) {
    const correctValue = this.getValue(index);
    const userNum = Number(String(input).trim());
    const ok = !Number.isNaN(userNum) && userNum === correctValue;

    const prev = this.correctMap.get(index);
    let scored = false;

    if (ok) {
      if (prev !== true) {
        this.correctMap.set(index, true);
        this.score += 1;     // rights only
        scored = true;
      }
    } else {
      this.correctMap.set(index, false); // track wrong, no penalty
    }

    return { correct: ok, correctValue, scored, score: this.score };
  }

  isRoundComplete() {
    for (const idx of this.blankIndexes) {
      if (this.correctMap.get(idx) !== true) return false;
    }
    return true;
  }

  resetScore() { this.score = 0; }

  getState() {
    return {
      table: this.table,
      rows: this.rows,
      cols: this.cols,
      total: this.total,
      values: [...this.values],
      blankIndexes: new Set(this.blankIndexes),
      correctMap: new Map(this.correctMap),
      score: this.score,
      blanksCount: this.blanksCount,
    };
  }
}

