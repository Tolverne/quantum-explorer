import {describe,expect,it} from 'vitest'
import {LESSONS,allActivityIds,completedCount,progressPercent,canComplete,courseSummary,type StudentEntry} from './lessons'
describe('M5 curriculum content and learning records',()=>{
 it('has three lessons of four activities of approximately an hour',()=>{
  expect(LESSONS.map(l=>l.id)).toEqual(['qubits','measurement','entanglement'])
  expect(allActivityIds()).toHaveLength(12)
  expect(new Set(allActivityIds()).size).toBe(12)
  LESSONS.forEach(l=>{
   expect(l.activities).toHaveLength(4)
   expect(l.activities.reduce((t,a)=>t+a.minutes,0)).toBeGreaterThanOrEqual(50)
  })
 })
 it('all predictions have valid distinct choices and teacher explanations',()=>{
  LESSONS.forEach(l=>l.activities.forEach(a=>{
   expect(a.options).toHaveLength(3)
   expect(new Set(a.options).size).toBe(3)
   expect(a.correct).toBeGreaterThanOrEqual(0)
   expect(a.correct).toBeLessThan(3)
   expect(a.experiment.trim()).not.toBe('')
   expect(a.reflection.trim()).not.toBe('')
   expect(a.teacherNote.trim()).not.toBe('')
  }))
 })
 it('tool routing is appropriate to each lesson',()=>{
  expect(LESSONS[0].activities.every(a=>a.tool==='challenge'||a.tool==='explore')).toBe(true)
  expect(LESSONS[1].activities.every(a=>a.tool==='measurement')).toBe(true)
  expect(LESSONS[2].activities.every(a=>a.tool==='entanglement')).toBe(true)
 })
 it('requires a prediction, observation and reflection before completion',()=>{
  expect(canComplete(undefined)).toBe(false)
  expect(canComplete({prediction:0,observation:'  ',reflection:'reason'})).toBe(false)
  expect(canComplete({prediction:0,observation:'observation',reflection:'  '})).toBe(false)
  expect(canComplete({prediction:0,observation:'observation',reflection:'reason'})).toBe(true)
 })
 it('tracks progress without grading predictions as failures',()=>{
  const l=LESSONS[0]
  const entries:Record<string,StudentEntry>={[l.activities[0].id]:{prediction:1,observation:'observed',reflection:'explained',completed:true}}
  expect(completedCount(l,entries)).toBe(1)
  expect(progressPercent(l,entries)).toBe(25)
 })
 it('exports an anonymous journal including incomplete tasks',()=>{
  const id=LESSONS[1].activities[0].id
  const report=courseSummary({[id]:{prediction:0,observation:'100 zeros',reflection:'certain',completed:true}})
  expect(report).toContain('100 zeros')
  expect(report).toContain('Not recorded')
  expect(report).toContain('Student investigation journal')
  expect(report).not.toContain('Student name:')
 })
})
