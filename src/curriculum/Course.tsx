import {useEffect,useState} from 'react'
import {
 LESSONS,canComplete,completedCount,progressPercent,
 type Lesson,type LessonId,type LabMode,type StudentEntry
} from './lessons'

type Entries=Readonly<Record<string,StudentEntry>>
const totals=LESSONS.reduce((n,l)=>n+l.activities.length,0)
export function CourseHome({entries,onStart,onExport}:{
 entries:Entries;onStart:(id:LessonId)=>void;onExport:()=>void
}){
 const allCompleted=LESSONS.reduce((n,l)=>n+completedCount(l,entries),0)
 return <div className="course-home">
  <section className="course-hero">
   <span className="overline">A STANDALONE YEAR 10 LEARNING MODULE</span>
   <h2>Explore quantum physics</h2>
   <p>Three hands-on lessons. No equations or previous quantum knowledge needed. Make a prediction, use the simulator to experiment, and explain what you discover.</p>
   <div className="course-stats">
    <div><strong>3</strong><span>60-minute lessons</span></div>
    <div><strong>12</strong><span>guided investigations</span></div>
    <div><strong>{allCompleted} / {totals}</strong><span>recorded this session</span></div>
   </div>
   <p className="course-privacy">No account required. Answers stay in this open browser tab; refreshing the page clears them. Export your journal before leaving.</p>
   <button type="button" className="course-export" onClick={onExport}>Download my journal (.md)</button>
   <div className="course-resource-links"><a href="./resources/student-workbook.html" target="_blank" rel="noopener noreferrer">Printable student workbook</a><a href="./resources/teacher-guide.html" target="_blank" rel="noopener noreferrer">Teacher lesson guide</a></div>
  </section>
  <div className="course-cards">
   {LESSONS.map(l=><article className="course-lesson-card" key={l.id}>
    <div className="course-card-meta"><span>LESSON {l.number}</span><span>{l.duration}</span></div>
    <h3>{l.title}</h3>
    <p className="course-subtitle">{l.subtitle}</p>
    <p>{l.essentialQuestion}</p>
    <div className="course-card-progress">
     <div className="course-progress-track"><div style={{width:progressPercent(l,entries)+'%'}}/></div>
     <span>{completedCount(l,entries)} of {l.activities.length} activities recorded</span>
    </div>
    <button type="button" onClick={()=>onStart(l.id)}>
     {completedCount(l,entries)>0?'Continue lesson':'Start lesson'} →
    </button>
   </article>)}
  </div>
  <section className="course-resource-panel">
   <h3>For teachers</h3>
   <p>Each activity includes a prediction, an experiment, a scientific explanation, a reflection question and optional teaching notes. Use the integrated guide below or the downloadable resources in the GitHub repository.</p>
   <details><summary>Lesson sequence and learning outcomes</summary>
    {LESSONS.map(l=><div className="course-teacher-lesson" key={l.id}>
     <h4>Lesson {l.number}: {l.title}</h4>
     <ul>{l.outcomes.map(item=><li key={item}>{item}</li>)}</ul>
     <p><b>Timing:</b> {l.activities.map(a=>a.minutes+' min '+a.title).join(' · ')}</p>
    </div>)}
   </details>
   <p className="course-small-note">All simulations are idealised. The entanglement laboratory is not a Bell-test demonstration; the module complements, rather than replaces, experiments on real quantum hardware.</p>
  </section>
 </div>
}

export function LessonGuide({lesson,stepIndex,entries,onSetEntry,onNavigate,onLaunchTool,onExit,onExport}:{
 lesson:Lesson;stepIndex:number;entries:Entries
 onSetEntry:(id:string,changes:Partial<StudentEntry>)=>void
 onNavigate:(index:number)=>void
 onLaunchTool:(tool:LabMode,challengeIndex?:number)=>void
 onExit:()=>void;onExport:()=>void
}){
 const activity=lesson.activities[stepIndex]
 const entry=entries[activity.id]||{}
 const [showExplanation,setShowExplanation]=useState(false)
 const [showTeacher,setShowTeacher]=useState(false)
 useEffect(()=>{setShowExplanation(false);setShowTeacher(false)},[activity.id])
 const canFinish=canComplete(entry)
 const activityCompleted=entry.completed===true
 const done=completedCount(lesson,entries)
 function update(changes:Partial<StudentEntry>){
   onSetEntry(activity.id,{...changes,completed:false})
 }
 function next(){
   onNavigate(Math.min(stepIndex+1,lesson.activities.length-1))
 }
 return <section className="course-guide" aria-label={'Guided lesson '+lesson.number}>
  <div className="course-guide-top">
   <button type="button" className="guide-back" onClick={onExit}>← All lessons</button>
   <span className="overline">LESSON {lesson.number} · {lesson.duration}</span>
   <button type="button" className="guide-export" onClick={onExport}>Export journal</button>
  </div>
  <div className="course-guide-heading">
   <div><h2>{lesson.title}</h2><p>{lesson.essentialQuestion}</p></div>
   <span>{done}/{lesson.activities.length} complete</span>
  </div>
  <div className="guide-step-nav" role="group" aria-label="Choose investigation">
   {lesson.activities.map((a,i)=><button key={a.id} type="button"
    aria-current={i===stepIndex?'step':undefined}
    className={(i===stepIndex?'active ':'')+(entries[a.id]?.completed?'finished':'')}
    onClick={()=>onNavigate(i)}>
    {entries[a.id]?.completed?'✓':i+1}<span>{a.title}</span>
   </button>)}
  </div>
  <div className="guided-work">
   <div className="guide-heading-row">
    <div><span className="overline">INVESTIGATION {stepIndex+1} OF {lesson.activities.length} · ABOUT {activity.minutes} MINUTES</span><h3>{activity.title}</h3></div>
    {activityCompleted&&<span className="guide-complete-label">✓ Recorded</span>}
   </div>
   <div className="guide-inquiry-grid">
    <section className="guide-stage">
     <h4><span>1</span> Make a prediction</h4>
     <p>{activity.prediction}</p>
     <fieldset className="guide-predictions">
      <legend className="visually-hidden">Choose your prediction</legend>
      {activity.options.map((option,i)=><label key={i} className={entry.prediction===i?'chosen':''}>
       <input type="radio" name={'predict-'+activity.id} checked={entry.prediction===i}
        onChange={()=>update({prediction:i})}/>
       <span>{option}</span>
      </label>)}
     </fieldset>
     <small className="guide-small">Your prediction is for learning, not marks. It's fine to revise your understanding after experimenting.</small>
    </section>
    <section className="guide-stage">
     <h4><span>2</span> Experiment</h4>
     <p>{activity.experiment}</p>
     <button className="guide-lab-link" type="button"
      onClick={()=>onLaunchTool(activity.tool,activity.challengeIndex)}>Open the experiment ↓</button>
     <label htmlFor={'observation-'+activity.id}>What did you observe?</label>
     <textarea id={'observation-'+activity.id} rows={3}
      placeholder="Record actual observations, including outcomes, pulse sequences or approximate frequencies..."
      value={entry.observation||''} onChange={e=>update({observation:e.target.value})}/>
    </section>
    <section className="guide-stage">
     <h4><span>3</span> Explain</h4>
     <p>{activity.reflection}</p>
     <label htmlFor={'reflection-'+activity.id}>Your explanation</label>
     <textarea id={'reflection-'+activity.id} rows={4}
      placeholder="Use your own words to explain the physics..."
      value={entry.reflection||''} onChange={e=>update({reflection:e.target.value})}/>
     <button type="button" className="guide-explain"
      disabled={!entry.observation?.trim()}
      onClick={()=>setShowExplanation(v=>!v)}
      aria-expanded={showExplanation}>
      {showExplanation?'Hide scientific explanation':'Reveal scientific explanation'}
     </button>
     {showExplanation&&<div className="guide-science">
      <strong>Scientific explanation</strong>
      <p>{activity.explanation}</p>
      {entry.prediction!==undefined&&<p><b>Your original prediction:</b> {activity.options[entry.prediction]}.</p>}
     </div>}
    </section>
   </div>
   <div className="guide-controls">
    <button type="button" disabled={stepIndex===0} onClick={()=>onNavigate(stepIndex-1)}>← Previous</button>
    <div>
     <button type="button" className="guide-complete" disabled={!canFinish||activityCompleted}
      onClick={()=>onSetEntry(activity.id,{completed:true})}>
      {activityCompleted?'✓ Activity recorded':'Mark activity complete'}
     </button>
     {stepIndex<lesson.activities.length-1&&
      <button type="button" className="guide-next" onClick={next}>Next investigation →</button>}
     {stepIndex===lesson.activities.length-1&&
      <button type="button" className="guide-next" onClick={onExit}>Return to course home</button>}
    </div>
   </div>
   {!canFinish&&<p className="guide-small">To mark the activity complete, make a prediction and write an observation and an explanation.</p>}
   <details className="guide-teacher-details" open={showTeacher}
    onToggle={event=>setShowTeacher((event.currentTarget as HTMLDetailsElement).open)}>
    <summary>Teacher notes / suggested facilitation</summary>
    <p>{activity.teacherNote}</p>
    <p>Expected prediction: <strong>{activity.options[activity.correct]}</strong>.</p>
   </details>
  </div>
  <p className="guide-underlab">The interactive experiment is directly below this guide. You can return to this section to record your observations and reasoning.</p>
 </section>
}
