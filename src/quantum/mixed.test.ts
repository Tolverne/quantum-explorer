import {describe,expect,it} from 'vitest'
import {mixtureVector,mixedProbabilities,mixedPurity,runMixedShots} from './mixed'
describe('M4 mixed-state probabilities and Bloch vector lengths',()=>{
 it('pure extremes reach the surface and centre is fully mixed',()=>{
  expect(mixtureVector('z',1)).toEqual([0,0,1])
  expect(mixtureVector('z',0)).toEqual([0,0,-1])
  expect(mixtureVector('x',0.5)).toEqual([0,0,0])
  expect(mixtureVector('x',0.75)).toEqual([0.5,0,0])
 })
 it('maximal mixture gives 50/50 in both measurement bases',()=>{
  expect(mixedProbabilities(mixtureVector('z',0.5),'z')).toEqual([0.5,0.5])
  expect(mixedProbabilities(mixtureVector('z',0.5),'x')).toEqual([0.5,0.5])
 })
 it('a partially mixed Z state retains biased Z outcomes but unbiased X outcomes',()=>{
  const v=mixtureVector('z',0.8)
  expect(mixedProbabilities(v,'z')[0]).toBeCloseTo(0.8)
  expect(mixedProbabilities(v,'x')).toEqual([0.5,0.5])
  expect(mixedPurity(v)).toBeCloseTo(0.68)
 })
 it('an X-axis mixture swaps the certain and uncertain measurement bases',()=>{
  const v=mixtureVector('x',0.9)
  expect(mixedProbabilities(v,'x')[0]).toBeCloseTo(0.9)
  expect(mixedProbabilities(v,'z')).toEqual([0.5,0.5])
 })
 it('purity distinguishes a pure state, intermediate mixture and centre',()=>{
  expect(mixedPurity([0,0,1])).toBeCloseTo(1)
  expect(mixedPurity([0,0,0.5])).toBeCloseTo(0.625)
  expect(mixedPurity([0,0,0])).toBeCloseTo(0.5)
 })
 it('shots are independent samples from ensemble statistics',()=>{
  let i=0
  const draws=[0.05,0.95,0.15,0.85]
  const batch=runMixedShots(mixtureVector('z',0.8),'z',4,()=>draws[i++])
  expect(batch.counts).toEqual([2,2])
  expect(batch.expected[0]).toBeCloseTo(0.8)
 })
 it('rejects probabilities or vectors outside physical ranges',()=>{
  expect(()=>mixtureVector('z',-0.1)).toThrow()
  expect(()=>mixedProbabilities([0,0,1.5],'z')).toThrow()
  expect(()=>runMixedShots([0,0,0],'x',0)).toThrow()
 })
})
