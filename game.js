// game.js
// Pure game state/logic for a 5x2 times-table guessing game.

export class TimesTableGame {
  /**
   * @param {number} table - times-table base (e.g., 7)
   * @param {number} rows
   * @param {number} cols
   * @param {number} blanks - how many blank (editable) cells per round
   */
  constructor(table = 7, rows = 5, cols = 2, blanks = 1) {
    this.rows = rows;
    this.cols = cols;
    this.total = rows * cols;
    this.setTable(table);
    this.setBlanks(blanks);
    this.newRound();
  }

  setTable(n) {
    this.table = Number(n) || 7;
    this.values = Array.from({ length: this.total }, (_, i) => this.table * (i + 1));
  }

  setBlanks(k) {
    this.blanksCount = Math.max(1, Math.min(this.total, Number(k) || 1));
  }

  // Fisher-Yates shuffle helper
  static #shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Return a new Set of blank indexes
  #pickBlankIndexes() {
    const allIdx = Array.from({ length: this.total }, (_, i) => i);
    TimesTableGame.#shuffle(allIdx);
    return new Set(allIdx.slice(0, this.blanksCount));
  }

  newRound() {
    this.blankIndexes = this.#pickBlankIndexes(); // Set<number>
    // Track per-cell correctness (null=not answered yet, true/false = last check)
    this.correctMap = new Map();
    for (let i = 0; i < this.total; i++) this.correctMap.set(i, null);
  }

  isBlank(index) {
    return this.blankIndexes.has(index);
  }

  getValue(index) {
    return this.values[index];
  }

  /**
   * Check user's input for the given cell index.
   * @param {number} index
   * @param {string|number} input
   * @returns {{correct: boolean, correctValue: number}}
   */
  check(index, input) {
    const correctValue = this.getValue(index);
    const userNum = Number(String(input).trim());
    const ok = !Number.isNaN(userNum) && userNum === correctValue;
    this.correctMap.set(index, ok);
    return { correct: ok, correctValue };
  }

  /**
   * Whether the round is completed (all blanks correct).
   * @returns {boolean}
   */
  isRoundComplete() {
    for (const idx of this.blankIndexes) {
      if (this.correctMap.get(idx) !== true) return false;
    }
    return true;
  }

  /**
   * A snapshot useful for rendering.
   */
  getState() {
    return {
      table: this.table,
      rows: this.rows,
      cols: this.cols,
      total: this.total,
      values: [...this.values],
      blankIndexes: new Set(this.blankIndexes),
      correctMap: new Map(this.correctMap),
    };
  }
}

