import { describe, expect, it } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { createStudentWorkStorage, emptyStudentWork, normaliseStudentWork } from './studentWork'
import { LESSONS } from '../curriculum/lessons'
import { CHALLENGES } from '../challenges/challenges'

describe('IndexedDB student journal persistence', () => {
  const activity = LESSONS[0].activities[0].id
  const challenge = CHALLENGES[0].id

  it('starts with a blank record, then restores answers and challenge progress', async () => {
    const factory = new IDBFactory()
    const first = createStudentWorkStorage(factory, 'test-persist')
    expect(await first.load()).toEqual(emptyStudentWork())
    const saved = {
      journal: { [activity]: { prediction: 0, observation: 'The arrow moved', reflection: 'X flips the pole', completed: true } },
      completedChallenges: [challenge]
    }
    await first.save(saved)
    const reopened = createStudentWorkStorage(factory, 'test-persist')
    expect(await reopened.load()).toEqual(saved)
  })

  it('uses a new version of the complete journal for each save', async () => {
    const store = createStudentWorkStorage(new IDBFactory(), 'test-edit')
    await store.save({journal: {[activity]: {observation: 'first'}}, completedChallenges: []})
    await store.save({journal: {[activity]: {observation: 'latest', reflection:'updated'}}, completedChallenges: []})
    expect((await store.load()).journal[activity].observation).toBe('latest')
  })

  it('clearing answers writes a blank record and removes previous work', async () => {
    const store = createStudentWorkStorage(new IDBFactory(), 'test-clear')
    await store.save({journal: {[activity]: {reflection:'my work'}}, completedChallenges:[challenge]})
    await store.save(emptyStudentWork())
    expect(await store.load()).toEqual(emptyStudentWork())
  })

  it('ignores unrecognised and malformed record data', () => {
    expect(normaliseStudentWork({schemaVersion:99,journal:{[activity]:{observation:'a'}}}))
      .toEqual(emptyStudentWork())
    expect(normaliseStudentWork({
      schemaVersion:1,
      journal: {
        [activity]: {prediction:99,observation:'A',reflection:123,completed:true},
        '__proto__':{observation:'bad'},
        notAnActivity:{observation:'discard'}
      },
      completedChallenges:[challenge,challenge,'not-a-challenge',123]
    })).toEqual({
      journal: {[activity]: {observation:'A',completed:true}},
      completedChallenges:[challenge]
    })
  })

  it('keeps previous lesson answers and accepts new mixed-state activities in the same database', async () => {
    const storage = createStudentWorkStorage(new IDBFactory(),'test-four-lessons')
    const mixedActivity = LESSONS.find(lesson => lesson.id === 'mixed')!.activities[0].id
    const old = {journal: {[activity]: {reflection:'Saved before the new lesson'}}, completedChallenges:[challenge]}
    await storage.save(old)
    const restored = await storage.load()
    expect(restored.journal[activity].reflection).toBe('Saved before the new lesson')
    await storage.save({journal: {...restored.journal, [mixedActivity]: {prediction:0,observation:'At the surface'}},completedChallenges:restored.completedChallenges})
    const both = await storage.load()
    expect(both.journal[activity].reflection).toBe('Saved before the new lesson')
    expect(both.journal[mixedActivity].observation).toBe('At the surface')
  })

  it('reports absence of IndexedDB so users can use the Markdown export', async () => {
    const store = createStudentWorkStorage(undefined, 'unavailable')
    await expect(store.load()).rejects.toThrow('IndexedDB is unavailable')
    await expect(store.save(emptyStudentWork())).rejects.toThrow('IndexedDB is unavailable')
  })
})
