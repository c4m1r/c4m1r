// Original Minesweeper implementation adapted from OnlineWinXP-master
// Based on: https://github.com/ShizukuIchi/winXP/tree/master/src/WinXP/apps/Minesweeper

class OriginalMinesweeper {
    constructor(windowId) {
        this.windowId = windowId;
        this.config = {
            Beginner: { rows: 9, columns: 9, mines: 10 },
            Intermediate: { rows: 16, columns: 16, mines: 40 },
            Expert: { rows: 16, columns: 30, mines: 99 }
        };
        this.difficulty = 'Beginner';
        this.status = 'new';
        this.rows = 9;
        this.columns = 9;
        this.mines = 10;
        this.ceils = [];
        this.gameConfig = null;

        this.init();
    }

    init() {
        this.resetGame();
        this.render();
    }

    resetGame(difficulty = this.difficulty) {
        this.difficulty = difficulty;
        this.status = 'new';
        this.gameConfig = this.config[difficulty];
        this.rows = this.gameConfig.rows;
        this.columns = this.gameConfig.columns;
        this.mines = this.gameConfig.mines;
        this.ceils = this.generateCeils();
    }

    generateCeils() {
        const ceils = [];
        for (let i = 0; i < this.rows * this.columns; i++) {
            ceils.push({
                state: 'cover',
                minesAround: 0,
                opening: false
            });
        }
        return ceils;
    }

    insertMines(excludeIndex) {
        const ceils = [...this.ceils];
        let minesPlaced = 0;

        while (minesPlaced < this.mines) {
            const randomIndex = Math.floor(Math.random() * ceils.length);

            // Skip if already has mine or is in exclude area
            if (ceils[randomIndex].minesAround === -1 ||
                (excludeIndex !== undefined && this.isAdjacent(randomIndex, excludeIndex))) {
                continue;
            }

            ceils[randomIndex] = { ...ceils[randomIndex], minesAround: -1 };
            minesPlaced++;
        }

        // Calculate numbers
        for (let i = 0; i < ceils.length; i++) {
            if (ceils[i].minesAround !== -1) {
                ceils[i] = { ...ceils[i], minesAround: this.countAdjacentMines(i, ceils) };
            }
        }

        this.ceils = ceils;
    }

    isAdjacent(index1, index2) {
        const row1 = Math.floor(index1 / this.columns);
        const col1 = index1 % this.columns;
        const row2 = Math.floor(index2 / this.columns);
        const col2 = index2 % this.columns;

        return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1;
    }

    countAdjacentMines(index, ceils) {
        let count = 0;
        const row = Math.floor(index / this.columns);
        const col = index % this.columns;

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.columns) {
                    const adjacentIndex = newRow * this.columns + newCol;
                    if (ceils[adjacentIndex].minesAround === -1) {
                        count++;
                    }
                }
            }
        }

        return count;
    }

    autoCeils(state, clickedIndex) {
        const indexes = [clickedIndex];
        const ceils = [...state.ceils];

        for (let i = 0; i < indexes.length; i++) {
            const index = indexes[i];
            const ceil = ceils[index];

            if (ceil.minesAround === -1) {
                this.status = 'died';
                break;
            }

            if (ceil.minesAround === 0) {
                const row = Math.floor(index / this.columns);
                const col = index % this.columns;

                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const newRow = row + dr;
                        const newCol = col + dc;
                        if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.columns) {
                            const adjacentIndex = newRow * this.columns + newCol;
                            if (!indexes.includes(adjacentIndex) && ceils[adjacentIndex].state === 'cover') {
                                indexes.push(adjacentIndex);
                            }
                        }
                    }
                }
            }
        }

        return indexes;
    }

    handleClick(index) {
        if (this.status === 'died' || this.status === 'won') return;

        const ceil = this.ceils[index];

        if (ceil.state !== 'cover') return;

        if (this.status === 'new') {
            this.insertMines(index);
            this.status = 'started';
        }

        const indexes = this.autoCeils({ ceils: this.ceils }, index);
        const newCeils = [...this.ceils];

        indexes.forEach(i => {
            newCeils[i] = { ...newCeils[i], state: 'open' };
        });

        this.ceils = newCeils;

        // Check win condition
        const coveredCeils = this.ceils.filter(c => c.state === 'cover').length;
        if (coveredCeils === this.mines) {
            this.status = 'won';
        }
    }

    handleRightClick(index) {
        if (this.status === 'died' || this.status === 'won') return;

        const ceil = this.ceils[index];
        const newState = ceil.state === 'flag' ? 'cover' :
                        ceil.state === 'cover' ? 'flag' : 'cover';

        this.ceils[index] = { ...ceil, state: newState };
    }

    render() {
        const board = document.getElementById(`minesweeper-board-${this.windowId}`);
        if (!board) return;

        board.style.gridTemplateColumns = `repeat(${this.columns}, 16px)`;
        board.style.gridTemplateRows = `repeat(${this.rows}, 16px)`;
        board.innerHTML = '';

        this.ceils.forEach((ceil, index) => {
            const cell = document.createElement('div');
            cell.className = 'minesweeper-cell';
            cell.dataset.index = index;

            let content = '';
            let className = 'minesweeper-cell';

            switch (ceil.state) {
                case 'open':
                    className += ' revealed';
                    if (ceil.minesAround === -1) {
                        className += ' mine';
                        content = '💣';
                    } else if (ceil.minesAround > 0) {
                        content = ceil.minesAround.toString();
                        className += ` number-${ceil.minesAround}`;
                    }
                    break;
                case 'flag':
                    content = '🚩';
                    break;
                case 'unknown':
                    content = '?';
                    break;
                default:
                    // covered
                    break;
            }

            cell.className = className;
            cell.textContent = content;
            cell.addEventListener('click', () => this.handleClick(index));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.handleRightClick(index);
            });

            board.appendChild(cell);
        });

        this.updateUI();
    }

    updateUI() {
        // Update mine counter
        const mineCount = this.mines - this.ceils.filter(c => c.state === 'flag').length;
        const mineDisplay = document.getElementById(`minesweeper-mine-count-${this.windowId}`);
        if (mineDisplay) {
            mineDisplay.textContent = mineCount.toString().padStart(3, '0');
        }

        // Update smile
        const smile = document.getElementById(`minesweeper-smile-${this.windowId}`);
        if (smile) {
            switch (this.status) {
                case 'died':
                    smile.textContent = '😵';
                    break;
                case 'won':
                    smile.textContent = '😎';
                    break;
                default:
                    smile.textContent = '🙂';
            }
        }
    }
}

// Export for use in apps.js
window.OriginalMinesweeper = OriginalMinesweeper;
