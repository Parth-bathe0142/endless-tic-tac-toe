import { GameState } from "shared"


test("creating an empty state", () => {
    const state = new GameState()

    const { array, expiring, last } = state

    expect(array).toEqual(new Array(9).fill(0))
    expect(expiring).toBe(0)
    expect(last).toBe(0)
})


test("creating a state from an array, without an expiring cell", () => {
    const arr = [0, 1, 0, 0, 0, 0, 0, 0, 0]
    
    const state = new GameState(arr)

    const { array, expiring, last } = state
    
    expect(array).toEqual(arr)
    expect(expiring).toBe(0)
    expect(last).toBe(1)
})

test("creating a state from an array, with an expiring cell", () => {
    const arr = [6, 1, 2, 5, 4, 0, 3, 7, 8]
    
    const state = new GameState(arr)

    const { array, expiring, last } = state
    
    expect(array).toEqual(arr)
    expect(expiring).toBe(1)
    expect(last).toBe(8)
})