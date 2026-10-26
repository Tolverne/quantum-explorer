import { describe, expect, it } from 'vitest'
import {
  preparePair, jointProbabilities, marginalBloch, purity, trace, samplePair,
  measureAlice, measureBob, runPairShots, correlation, outcomeLabel
} from './entanglement'
const near=(actual:readonly number[],expected:readonly number[])=>{
  actual.forEach((p,i)=>expect(p).toBeCloseTo(expected[i],10))
}
describe('M4: quantum and classical two-qubit correlations',()=>{
  it('all preparations are physical normalised density matrices',()=>{
    for(const key of ['independent','random-independent','classical','bell-plus','bell-minus'] as const) {
      const rho=preparePair(key)
      expect(trace(rho)).toBeCloseTo(1,12)
      near(rho.flat(),rho.map((row,i)=>row.map((_,j)=>rho[j][i])).flat())
    }
  })
  it('independent |++> is random and uncorrelated in ZZ, deterministic in XX',()=>{
    const rho=preparePair('independent')
    near(jointProbabilities(rho,'z','z'),[0.25,0.25,0.25,0.25])
    near(jointProbabilities(rho,'x','x'),[1,0,0,0])
    near(marginalBloch(rho,'alice'),[1,0,0])
    near(marginalBloch(rho,'bob'),[1,0,0])
  })
  it('two independently random classical bits give all four combinations and locally mixed qubits',()=>{
    const rho=preparePair('random-independent')
    for(const x of ['z','x'] as const)for(const y of ['z','x'] as const){
      near(jointProbabilities(rho,x,y),[0.25,0.25,0.25,0.25])
    }
    near(marginalBloch(rho,'alice'),[0,0,0])
    near(marginalBloch(rho,'bob'),[0,0,0])
  })
  it('classical 00/11 mixture: correlated in ZZ but uncorrelated in XX',()=>{
    const rho=preparePair('classical')
    near(jointProbabilities(rho,'z','z'),[0.5,0,0,0.5])
    near(jointProbabilities(rho,'x','x'),[0.25,0.25,0.25,0.25])
    expect(purity(rho)).toBeCloseTo(0.5)
  })
  it('Bell Phi+: correlated in both ZZ and XX, with locally mixed qubits',()=>{
    const rho=preparePair('bell-plus')
    near(jointProbabilities(rho,'z','z'),[0.5,0,0,0.5])
    near(jointProbabilities(rho,'x','x'),[0.5,0,0,0.5])
    near(jointProbabilities(rho,'z','x'),[0.25,0.25,0.25,0.25])
    near(jointProbabilities(rho,'x','z'),[0.25,0.25,0.25,0.25])
    near(marginalBloch(rho,'alice'),[0,0,0])
    near(marginalBloch(rho,'bob'),[0,0,0])
    expect(purity(rho)).toBeCloseTo(1)
  })
  it('Bell Phi−: correlated in ZZ but anticorrelated in XX',()=>{
    const rho=preparePair('bell-minus')
    near(jointProbabilities(rho,'z','z'),[0.5,0,0,0.5])
    near(jointProbabilities(rho,'x','x'),[0,0.5,0.5,0])
    expect(correlation(jointProbabilities(rho,'x','x'))).toBeCloseTo(-1)
  })
  it('Alice measurement updates Bob conditional state only for Bell pair',()=>{
    const a=measureAlice(preparePair('bell-plus'),'z',()=>0.2)
    expect(a.outcome).toBe(0)
    near(marginalBloch(a.post,'bob'),[0,0,1])
    const b=measureBob(a.post,'z',()=>0.99)
    expect(b.outcome).toBe(0)
    const other=measureAlice(preparePair('classical'),'x',()=>0.2)
    near(marginalBloch(other.post,'bob'),[0,0,0])
    const bellX=measureAlice(preparePair('bell-plus'),'x',()=>0.2)
    near(marginalBloch(bellX.post,'bob'),[1,0,0])
  })
  it('Alice results stay 50/50 regardless of the other party measuring',()=>{
    for(const key of ['classical','bell-plus','bell-minus'] as const) {
      const rho=preparePair(key)
      const zz=jointProbabilities(rho,'z','z')
      const zx=jointProbabilities(rho,'z','x')
      expect(zz[0]+zz[1]).toBeCloseTo(0.5)
      expect(zx[0]+zx[1]).toBeCloseTo(0.5)
    }
  })
  it('batch prepares an independent pair every shot',()=>{
    const sequence=[0.1,0.1, 0.9,0.9, 0.1,0.9, 0.9,0.1]
    let i=0
    const batch=runPairShots(preparePair('independent'),'z','z',4,()=>sequence[i++])
    expect(batch.count).toBe(4)
    expect(batch.outcomes).toEqual([1,1,1,1])
    expect(batch.outcomes.reduce((a,b)=>a+b,0)).toBe(4)
  })
  it('deterministic impossible outcome combinations never occur in Bell ZZ',()=>{
    const bell=preparePair('bell-plus')
    for(const r of [0,0.1,0.49,0.51,0.9,0.999]) {
      const shot=samplePair(bell,'z','z',()=>r)
      expect(shot[0]).toBe(shot[1])
    }
  })
  it('prints basis-specific outcome labels',()=>{
    expect(outcomeLabel([0,1],'z','x')).toBe('0−')
    expect(outcomeLabel([1,0],'x','z')).toBe('−0')
  })
  it('rejects invalid random draws and batch sizes',()=>{
    expect(()=>samplePair(preparePair('bell-plus'),'z','z',()=>1)).toThrow()
    expect(()=>runPairShots(preparePair('bell-plus'),'z','z',0)).toThrow()
    expect(()=>runPairShots(preparePair('bell-plus'),'z','z',10001)).toThrow()
  })
})
