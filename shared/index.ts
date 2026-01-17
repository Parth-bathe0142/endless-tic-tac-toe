type Line = [number, number, number]

/**
 * The columns, rows and diagonals that can count as a win
 */
const possibilities: Line[] = [
    // rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    // columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    // diaginals
    [0, 4, 8],
    [2, 4, 6],
]

/**
 * X - X
 * O - O
 * N - no move here
 * E - oldest move on the board, will become N
 *     the next move is made. Whether it was an
 *     X or an O does not matter as it cannot contribute
 *     to a win
 */
export enum Cell {
    X, O, E, N
}

/**
 * Returns the cell variant corresponding to the passed
 * number. In this game, even numbers are X and odd numbers
 * are O while 0 is N
 * 
 * E variant denotes the current oldest move on the board
 * which can be either even or odd and needs to be found
 * seperately
 * 
 * @param num The move number.
 * @returns The corresponding cell variant
 */
function cellFromNumber(num: number): Cell {
    switch (true) {
        case num == 0:
            return Cell.N
            
        case num % 2 == 0:
            return Cell.X
                
        case num % 2 == 1:
            return Cell.O

        default:
            return Cell.N                    
    }
}

/**
 * Returns the "opponent" of the input cell if it
 * is an X or an O, else returns the original
 * @param cell The "Player"
 * @returns the "Opponent"
 */
function opposite(cell: Cell): Cell {
    if(cell == Cell.X) return Cell.O
    if(cell == Cell.O) return Cell.X
    return cell
}

export class GameState {
    /** The latest move */
    last: number = 0
    /** 
     * The oldest move, expiry starts after 6 moves
     */
    expiring: number = 0

    /**
     * The array representation of a board. records the moves
     * in sequence, making it possible to find the oldest move
     * */
    array: number[] = []
    /**
     * The array parsed into a board for display
     */
    state: Cell[][] = [[]]

    /**
     * creates an empty game with all Ns
     */
    constructor();

    /**
     * parses the passed array into a board to play on.
     * Both the array and the board are stored in the object
     * to help calculations.
     * The array representation exists because it is easier to
     * serialise.
     * @param array 
     */
    constructor(array: number[]);
    /**
     * Copy constructor
     * @param gameState state to copy
     */
    constructor(gameState: GameState);

    constructor(state?: number[] | GameState) {
        if(state) {
            // copy
            if(state instanceof GameState) {
                const arrayCopy = state.array.slice()
                this.fromArray(arrayCopy)

            // from array
            } else {
                this.fromArray(state)
            }
        
        // new empty
        } else {
            this.fromArray(new Array(9).fill(0))
        }
    }


    private fromArray(array: number[]) {
        this.array = array

        let min = Number.MAX_SAFE_INTEGER;
        let max = 0;

        let minPos: [number, number] = [0, 0];
        this.state = new Array(3)

        // create a state from the array while also finding
        // smallest and largest moves on board
        for (let i = 0; i < 3; i++) {
            this.state[i] = new Array(3)

            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j;
                let num = array[index];
                
                this.state[i][j] = cellFromNumber(num)

                if(num != 0 && num < min) {
                    min = num
                    minPos[0] = i
                    minPos[1] = j
                }

                if(num > max) {
                    max = num
                }
            }
        }

        // if more than 6 moves have been made so far,
        // mark the expiring move
        if(max >= 6) {
            this.state[minPos[0]][minPos[1]] = Cell.E
            this.expiring = min
        } else {
            this.expiring = 0
        }

        this.last = max
    }

    get(idx: number): Cell {
        const j = idx % 3
        const i = Math.floor(idx / 3)
        
        return this.state[i][j]
    }
    
    set(idx: number, cell: Cell) {
        const j = idx % 3
        const i = Math.floor(idx / 3)

        this.state[i][j] = cell
    }

    /**
     * Makes a move on the desired array index if it is within
     * bounds. if a move already exists here, returns null.
     * Whether the move is an X or an O depends on the last move,
     * ensuring that the same same move cannot be made twice.
     * 
     * @param idx The index where a move is to be made
     * @returns updated state if it was valid, else null
     */
    turn(idx: number) {
        // return if invalid
        if(idx < 0 || idx >= 9 || this.get(idx) != Cell.N) {
            return null
        }

        // make the move
        this.last++
        let cell = cellFromNumber(this.last)

        this.array[idx] = this.last
        this.set(idx, cell)

        // If expiry has started, advance it
        if(this.expiring != 0) {
            let expired = this.array.indexOf(this.expiring)

            // oldest move decays to N
            this.set(expired!, Cell.N)
            this.array[expired!] = 0

            // the now oldest move turns to E
            this.expiring++
            let newExpiring = this.array.indexOf(this.expiring)
            this.set(newExpiring!, Cell.E)

        // if this is the 6th move, expiry starts
        } else if(this.last == 6) {
            this.expiring++
            let idx = this.array.indexOf(this.expiring)

            this.set(idx!, Cell.E)
        }

        return this
    }

    computedTurn(mistakeRate: number) {
        type opportunity = number
        type index = number

        const opponent = cellFromNumber(this.last)
        
        let emptyTiles: index[] = []
        this.state.flat().forEach((c, i) => {
            if(c == Cell.N) emptyTiles.push(i)
        })


        // JS has no BTreeMap, using an array of tuples instead
        let map: [opportunity, index][] = []

        emptyTiles.forEach(idx => {
            let candidate = new GameState(this)
            candidate = candidate.turn(idx)!

            const opportunity = candidate.calculateOpportunity(opponent, mistakeRate)
            map.push([opportunity, idx])
        })

        const [_, idx] = map.reduce((a, b) => b[0] > a[0] ? b : a)

        return idx
    }

    private calculateOpportunity(opponent: Cell, mistakeRate: number): number {
        const player = opposite(opponent)

        let playerScore = 0
        let opponentScore = 0

        for(const line of possibilities) {
            playerScore += this.calculateLineScoreFor(line, player)
            opponentScore += this.calculateLineScoreFor(line, opponent)
        }

        let mistake = 0

        if(mistakeRate > 0) {
            mistakeRate = Math.min(mistakeRate, 10)

            mistake = Math.random() * mistakeRate * 2 - mistakeRate
        }

        return playerScore - opponentScore + mistake
    }

    private calculateLineScoreFor(line: Line, player: Cell): number {
        let opponent = opposite(player)
        let same = 0
        let diff = 0

        for(const idx of line) {
            const cell = this.get(idx)

            if(cell == player) same++
            if(cell == opponent) diff++
        }

        let score = 0
        if(same > 0) {
            score += Math.pow(same, 3)

            if(same == 3 || diff == 2) {
                score += 8
            }
        }

        return score;
    }
}