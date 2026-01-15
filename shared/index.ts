export enum Cell {
    X, O, E, N
}

export class GameState {
    array: number[] = []
    state: Cell[][] = [[]]
    last: number = 0
    expiring: number = 0

    constructor();
    constructor(array: number[]);
    
    constructor(array?: number[]) {
        if(array) {
            this.fromArray(array)
        } else {
            this.fromArray(new Array(9).fill(0))
        }
    }

    fromArray(array: number[]) {
        this.array = array

        let min = Number.MAX_SAFE_INTEGER;
        let minPos: [number, number] = [0, 0];
        let max = 0;
        this.state = new Array(3)

        for (let i = 0; i < 3; i++) {
            this.state[i] = new Array(3)
            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j;
                let num = array[index];
                
                switch (true) {
                    case num == 0:
                        this.state[i][j] = Cell.N
                        break
                        
                    case num % 2 == 0:
                        this.state[i][j] = Cell.X
                        break
                            
                    case num % 2 == 1:
                        this.state[i][j] = Cell.O
                        break

                    default:
                        this.state[i][j] = Cell.N                    
                }

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

    turn(idx: number) {
        if(this.get(idx) == Cell.N) {
            return null
        }

        this.last++

        let cell
        if(this.last % 2 == 0) {
            cell = Cell.X
        } else {
            cell = Cell.O
        }

        this.array[idx] = this.last
        this.set(idx, cell)

        if(this.expiring != 0) {
            let expired

            for (let i = 0; i < this.array.length; i++) {
                const c = this.array[i];
                
                if(c == this.expiring) {
                    expired = c
                    break
                }
            }

            this.set(expired!, Cell.N)
            this.array[expired!] = 0

            this.expiring++
            let newExpiring

            for (let i = 0; i < this.array.length; i++) {
                const c = this.array[i];
                
                if(c == this.expiring) {
                    newExpiring = c
                    break
                }
            }
            
            this.set(newExpiring!, Cell.E)
        } else if(this.last == 6) {
            this.expiring++
            let idx

            for (let i = 0; i < this.array.length; i++) {
                const c = this.array[i];
                
                if(c == this.expiring) {
                    idx = c
                    break
                }
            }

            this.set(idx!, Cell.E)
        }

        return this
    }
}