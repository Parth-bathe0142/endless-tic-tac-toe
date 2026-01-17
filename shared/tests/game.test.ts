import { Cell, GameState } from "shared"


test("creating an empty state", () => {
    const state = new GameState()

    const { array, expiring, last } = state

    expect(array).toEqual(new Array(9).fill(0))
    expect(expiring).toBe(0)
    expect(last).toBe(0)
})


test("creating a state from an array, without an expiring cell", () => {
    const arr = [
        0, 1, 0,
        0, 0, 0,
        0, 0, 0
    ]
    
    const state = new GameState(arr)

    const { array, expiring, last } = state
    
    expect(array).toEqual(arr)
    expect(expiring).toBe(0)
    expect(last).toBe(1)
})

test("creating a state from an array, with an expiring cell", () => {
    const arr = [
        6, 1, 2,
        5, 4, 0,
        3, 7, 8
    ]
    
    const state = new GameState(arr)

    const { array, expiring, last } = state
    
    expect(array).toEqual(arr)
    expect(expiring).toBe(1)
    expect(last).toBe(8)
})

test("test making a move, when nothing is expiring", () => {
    const arr = [
        0, 1, 0,
        0, 0, 2,
        3, 0, 0
    ]
    const expected = [
        0, 1, 0,
        0, 0, 2,
        3, 4, 0
    ]
    
    let state = new GameState(arr)
    state = state.turn(7)!

    const { array, expiring, last } = state
    
    expect(array).toEqual(expected)
    expect(expiring).toBe(0)
    expect(last).toBe(4)
})

test("test making a move, when a move is expiring", () => {
    const arr = [
        0, 0, 0,       
        4, 5, 2,
        3, 6, 7
    ]
    const expected = [
        0, 0, 8,
        4, 5, 0,
        3, 6, 7
    ]
    
    const { X, O, N, E } = Cell
    const expectedBoard = [
        [N, N, X,],
        [X, O, N,],
        [E, X, O],
    ]
    
    let gameState = new GameState(arr)
    gameState = gameState.turn(2)!

    const { array, state, expiring, last } = gameState
    
    expect(last).toBe(8)
    expect(expiring).toBe(3)

    expect(state).toEqual(expectedBoard)
    expect(array).toEqual(expected)
})

test("test computedTurn 1", () => {
    const arr = [
        0, 1, 0,
        2, 0, 0,
        0, 3, 0
    ]
    
    const expected = [
        0, 1, 0,
        2, 4, 0,
        0, 3, 0
    ]

    let gameState = new GameState(arr)
    let turn = gameState.computedTurn(0)
    gameState = gameState.turn(turn)!

    const { array } = gameState
    
    expect(array).toEqual(expected)
})

test("test computedTurn 2", () => {
    const arr = [
        0, 1, 0,
        2, 4, 0,
        0, 3, 0
    ]
    
    const expected = [
        0, 1, 0,
        2, 4, 5,
        0, 3, 0
    ]

    let gameState = new GameState(arr)
    let turn = gameState.computedTurn(0)
    gameState = gameState.turn(turn)!

    const { array } = gameState
    
    expect(array).toEqual(expected)
})