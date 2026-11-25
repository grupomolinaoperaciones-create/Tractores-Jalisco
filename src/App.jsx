import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from './supabase'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

/* ─── Auth ─── */
const ROLES = {
  admin:    { password: 'jalisco-admin26',   label: 'Administrador', color: '#534AB7' },
  programador: { password: 'jalisco-programador26', label: 'Programador', color: '#1D9E75' },
  consulta: { password: 'jalisco-consulta26', label: 'Consulta',      color: '#378ADD' },
}
const ROL_NAV = {
  admin:    ['dashboard','diesel','vales','taller','presupuesto','reporte','actividades','mtto','autorizaciones','analisis','flotilla','qrcodes'],
  programador: ['reporte','taller','actividades','mtto','autorizaciones'],
  consulta: ['dashboard','diesel','reporte','vales','taller','analisis'],
}

function LoginScreen({onLogin}){
  const [nombreIn,setNombreIn]=useState(()=>{try{return localStorage.getItem('flotilla_nombre')||''}catch(e){return ''}})
  const [pass,setPass]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const handleLogin=()=>{
    setLoading(true)
    setTimeout(()=>{
      const rol=Object.entries(ROLES).find(([,v])=>v.password===pass)?.[0]
      if(rol&&nombreIn.trim()){localStorage.setItem('flotilla_rol',rol);localStorage.setItem('flotilla_nombre',nombreIn.trim());onLogin(rol,nombreIn.trim());setError('')}
      else if(rol)setError('Escribe tu nombre para continuar.')
      else setError('Contraseña incorrecta. Intenta de nuevo.')
      setLoading(false)
    },400)
  }
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0F6E56 0%,#1D9E75 50%,#378ADD 100%)'}}>
      <div style={{background:'#fff',borderRadius:16,padding:'40px 48px',width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:12}}>🚜</div>
          <h1 style={{fontSize:24,fontWeight:700,margin:'0 0 4px',color:'#1a1a18'}}>FlotillaJAL</h1>
          <p style={{fontSize:13,color:'#5F5E5A',margin:0}}>Grupo Molina · Tractores Jalisco</p>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',fontSize:12,fontWeight:600,color:'#5F5E5A',marginBottom:8}}>Tu nombre</label>
          <input type="text" placeholder="Nombre y apellido" value={nombreIn} onChange={e=>setNombreIn(e.target.value)}
            style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'1.5px solid #E5E5E5',fontSize:14,outline:'none',boxSizing:'border-box'}} autoFocus/>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',fontSize:12,fontWeight:600,color:'#5F5E5A',marginBottom:8}}>Contraseña de acceso</label>
          <input type="password" placeholder="Ingresa tu contraseña..." value={pass}
            onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
            style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'1.5px solid #E5E5E5',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
        </div>
        {error&&<div style={{background:'#FCEBEB',border:'1px solid #F09595',borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:13,color:'#A32D2D'}}>{error}</div>}
        <button onClick={handleLogin} disabled={loading||!pass||!nombreIn.trim()}
          style={{width:'100%',padding:'12px',borderRadius:10,background:'#1D9E75',color:'#fff',border:'none',fontSize:14,fontWeight:600,cursor:'pointer',opacity:loading||!pass||!nombreIn.trim()?0.6:1}}>
          {loading?'Verificando...':'Ingresar'}
        </button>
        <p style={{marginTop:16,textAlign:'center',fontSize:11,color:'#bbb'}}>Contacta al administrador si olvidaste tu contraseña.</p>
      </div>
    </div>
  )
}

const CAMPOS_BASE = ['MJ1-2','MJ3','MJ4','MJ5','MJ6','MJ8','MJ Varios']
// Lista dinámica: base + cualquier campo nuevo usado por algún tractor (se actualiza en App)
const CAMPOS = [...CAMPOS_BASE]
const NUEVO_CAMPO = '__nuevo__'
const ACTIVIDADES = ['Aplicación','Rastrillo','Fumigación','Batanga','Transporte','Mantenimiento','Remolque','Otro']
const TIPOS_MTTO = ['Preventivo','Correctivo','Emergencia']
const COLORS = ['#1D9E75','#378ADD','#D85A30','#BA7517','#534AB7','#D4537E','#639922','#E24B4A']
const CAMPO_COLORS = {'MJ1-2':'#1D9E75',MJ3:'#378ADD',MJ4:'#D85A30',MJ5:'#534AB7',MJ6:'#BA7517',MJ8:'#D4537E','MJ Varios':'#639922',MJ9:'#0E7C86',MJ10:'#A0522D'}
const ESTADOS_AUTORIZACION = ['Pendiente','Autorizado','Rechazado']

const NAV = [
  {id:'dashboard',    label:'Dashboard',       emoji:'📊'},
  {id:'diesel',       label:'Diesel',          emoji:'⛽'},
  {id:'vales',        label:'Vales',           emoji:'🎫'},
  {id:'taller',       label:'Programación Taller', emoji:'🛠️'},
  {id:'presupuesto',  label:'Presupuesto',     emoji:'📋'},
  {id:'reporte',      label:'Reporte',         emoji:'📑'},
  {id:'actividades',  label:'Actividades',     emoji:'📝'},
  {id:'mtto',         label:'Mantenimientos',  emoji:'🔧'},
  {id:'autorizaciones',label:'Autorizaciones', emoji:'📋'},
  {id:'analisis',     label:'Análisis',        emoji:'📈'},
  {id:'flotilla',     label:'Flotilla',        emoji:'🚜'},
  {id:'qrcodes',      label:'Códigos QR',      emoji:'🔲'},
]

const CULTIVOS = ['Uva','Hortaliza','Pepino','Tomate','Otro']
const ACTIVIDADES_CAMPO = ['Aplicación','Rastrillo','Tablón','Batanga Agua','Rastra','Cortaguía','Tera Cinta','Tera Plástico','Subsuelo','Fumigación','Remolque','Otro']
const TURNOS = ['DIA','NOCHE']

/* ── Upload helper ── */
async function uploadFotos(files){
  const urls=[]
  for(const file of files){
    const ext=file.name.split('.').pop()
    const path=`mtto/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const {error}=await supabase.storage.from('mtto-fotos').upload(path,file)
    if(error){ urls.push(URL.createObjectURL(file)); continue }
    const {data}=supabase.storage.from('mtto-fotos').getPublicUrl(path)
    urls.push(data.publicUrl)
  }
  return urls
}

/* ── UI Primitives ── */
function Badge({color='info',children}){
  const m={success:{bg:'#E1F5EE',c:'#0F6E56'},warning:{bg:'#FAEEDA',c:'#854F0B'},danger:{bg:'#FCEBEB',c:'#A32D2D'},info:{bg:'#E6F1FB',c:'#185FA5'},gray:{bg:'#F1EFE8',c:'#5F5E5A'},purple:{bg:'#EEEDFE',c:'#3C3489'}}
  const s=m[color]||m.info
  return <span style={{background:s.bg,color:s.c,fontSize:11,fontWeight:500,padding:'2px 8px',borderRadius:4,whiteSpace:'nowrap'}}>{children}</span>
}
function Stat({label,value,sub,color='#1D9E75'}){
  return <div style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:10,padding:'14px 16px',flex:1,minWidth:130}}>
    <p style={{fontSize:11,color:'var(--text2)',margin:'0 0 4px'}}>{label}</p>
    <p style={{fontSize:22,fontWeight:600,margin:0,color}}>{value}</p>
    {sub&&<p style={{fontSize:11,color:'var(--text3)',margin:'2px 0 0'}}>{sub}</p>}
  </div>
}
function Card({title,children}){
  return <div style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:12,padding:'14px 16px'}}>
    {title&&<p style={{margin:'0 0 12px',fontSize:13,fontWeight:600,color:'var(--text)'}}>{title}</p>}
    {children}
  </div>
}
function Modal({title,onClose,children,wide}){
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}>
    <div style={{background:'var(--bg)',borderRadius:14,padding:'20px 24px',width:'100%',maxWidth:wide?680:560,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 8px 32px rgba(0,0,0,0.18)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:600}}>{title}</h3>
        <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,color:'var(--text2)',lineHeight:1,padding:'0 4px'}}>×</button>
      </div>
      {children}
    </div>
  </div>
}
function Field({label,children}){
  return <div style={{marginBottom:12}}>
    {label&&<label style={{display:'block',fontSize:12,color:'var(--text2)',marginBottom:4,fontWeight:500}}>{label}</label>}
    {children}
  </div>
}
function Btn({onClick,color='#1D9E75',outline,children,small,disabled}){
  return <button onClick={onClick} disabled={disabled} style={{background:outline?'transparent':color,color:outline?color:'#fff',border:`0.5px solid ${outline?color:'transparent'}`,borderRadius:8,padding:small?'5px 12px':'8px 18px',fontSize:small?12:13,fontWeight:500,opacity:disabled?0.5:1,transition:'opacity 0.15s'}}>{children}</button>
}
function Spinner(){return <div style={{display:'flex',justifyContent:'center',padding:40,color:'var(--text3)',fontSize:13}}>Cargando...</div>}
function EmptyState({msg}){return <div style={{textAlign:'center',padding:'40px 20px',color:'var(--text3)',fontSize:13}}>🌾 {msg}</div>}

/* ── Dashboard ── */
function Dashboard({diesel,tractores,mtto}){
  const totalLts=diesel.reduce((s,r)=>s+Number(r.litros),0)
  const totalHrs=diesel.reduce((s,r)=>s+Number(r.horas||0),0)
  const totalHas=diesel.reduce((s,r)=>s+Number(r.hectareas||0),0)
  const rendHr=totalHrs>0?(totalLts/totalHrs).toFixed(1):'-'
  const rendHa=totalHas>0?(totalLts/totalHas).toFixed(1):'-'
  const costMtto=mtto.reduce((s,m)=>s+Number(m.mano_obra||0)+Number(m.refacciones||0),0)
  const byTractor=useMemo(()=>{
    const m={}
    diesel.forEach(r=>{
      if(!m[r.tractor_id])m[r.tractor_id]={litros:0,horas:0,hectareas:0}
      m[r.tractor_id].litros+=Number(r.litros)
      m[r.tractor_id].horas+=Number(r.horas||0)
      m[r.tractor_id].hectareas+=Number(r.hectareas||0)
    })
    return Object.entries(m).map(([id,d])=>({id,litros:d.litros,lts_hr:d.horas>0?+(d.litros/d.horas).toFixed(1):0,lts_ha:d.hectareas>0?+(d.litros/d.hectareas).toFixed(1):0})).sort((a,b)=>b.litros-a.litros).slice(0,12)
  },[diesel])
  const byCampo=useMemo(()=>{const m={};diesel.forEach(r=>{if(!m[r.campo])m[r.campo]=0;m[r.campo]+=Number(r.litros)});return Object.entries(m).map(([campo,litros])=>({campo,litros}))},[diesel])
  const byAct=useMemo(()=>{const m={};diesel.forEach(r=>{if(!m[r.actividad])m[r.actividad]=0;m[r.actividad]+=Number(r.litros)});return Object.entries(m).map(([name,value])=>({name,value}))},[diesel])
  const tendencia=useMemo(()=>{const m={};diesel.forEach(r=>{const k=`Sem ${r.semana}`;if(!m[k])m[k]={semana:k,litros:0,horas:0,n:r.semana};m[k].litros+=Number(r.litros);m[k].horas+=Number(r.horas||0)});return Object.values(m).sort((a,b)=>a.n-b.n)},[diesel])
  if(diesel.length===0)return <div><h2 style={{fontSize:18,fontWeight:600,margin:'0 0 20px'}}>Dashboard general</h2><EmptyState msg="Sin datos aún. Registra consumo de diesel para ver el análisis."/></div>
  return <div>
    <h2 style={{fontSize:18,fontWeight:600,margin:'0 0 16px'}}>Dashboard general</h2>
    <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
      <Stat label="Total litros diesel" value={totalLts.toLocaleString()} sub="consumo registrado" color="#1D9E75"/>
      <Stat label="Total horas" value={Number(totalHrs).toFixed(0)} sub="horas trabajadas" color="#378ADD"/>
      <Stat label="Rend. lts/hr" value={rendHr} sub="promedio flotilla" color="#534AB7"/>
      <Stat label="Rend. lts/ha" value={rendHa} sub="promedio flotilla" color="#D85A30"/>
      <Stat label="Tractores activos" value={tractores.filter(t=>t.activo).length} sub={`de ${tractores.length} total`} color="#BA7517"/>
      <Stat label="Costo mantenimientos" value={`$${costMtto.toLocaleString()}`} sub="mano obra + refacciones" color="#D4537E"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
      <Card title="Consumo por tractor (lts)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byTractor} layout="vertical" margin={{left:20,right:20,top:4,bottom:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
            <XAxis type="number" tick={{fontSize:11}}/><YAxis dataKey="id" type="category" tick={{fontSize:11}} width={42}/>
            <Tooltip formatter={v=>[`${v} lts`,'Diesel']}/><Bar dataKey="litros" fill="#1D9E75" radius={[0,4,4,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Rendimiento lts/hr por tractor">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byTractor} layout="vertical" margin={{left:20,right:20,top:4,bottom:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
            <XAxis type="number" tick={{fontSize:11}}/><YAxis dataKey="id" type="category" tick={{fontSize:11}} width={42}/>
            <Tooltip formatter={v=>[`${v} lts/hr`,'Rend.']}/><Bar dataKey="lts_hr" fill="#378ADD" radius={[0,4,4,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:16,marginBottom:16}}>
      <Card title="Tendencia semanal">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={tendencia}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
            <XAxis dataKey="semana" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip/><Legend/>
            <Line type="monotone" dataKey="litros" stroke="#1D9E75" strokeWidth={2} dot={{r:3}} name="Litros"/>
            <Line type="monotone" dataKey="horas" stroke="#378ADD" strokeWidth={2} dot={{r:3}} name="Horas"/>
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Consumo por actividad">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={byAct} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({name,percent})=>`${name.substring(0,6)} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
              {byAct.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
            </Pie>
            <Tooltip formatter={v=>[`${v} lts`,'']}/>
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
    <Card title="Consumo por campo">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={byCampo}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
          <XAxis dataKey="campo" tick={{fontSize:12}}/><YAxis tick={{fontSize:11}}/>
          <Tooltip formatter={v=>[`${v} lts`,'Diesel']}/>
          <Bar dataKey="litros" radius={[4,4,0,0]}>{byCampo.map(e=><Cell key={e.campo} fill={CAMPO_COLORS[e.campo]||'#1D9E75'}/>)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  </div>
}

/* ── Presupuesto mensual de diesel ── */
function Presupuesto({tractores,diesel,presupuestos,setPresupuestos,loading,puedeEditar=true}){
  const [saving,setSaving]=useState(false)
  const [mes,setMes]=useState(new Date().toISOString().substring(0,7))
  const [editId,setEditId]=useState(null)
  const [litros,setLitros]=useState('')
  const mesLabel=new Date(mes+'-02').toLocaleDateString('es-MX',{month:'long',year:'numeric'})
  const presMap=Object.fromEntries(presupuestos.filter(p=>p.mes===mes).map(p=>[p.tractor_id,p]))
  const consumoMes=useMemo(()=>{
    const m={}
    diesel.filter(r=>r.fecha?.startsWith(mes)).forEach(r=>{m[r.tractor_id]=(m[r.tractor_id]||0)+Number(r.litros||0)})
    return m
  },[diesel,mes])
  const savePres=async(tractorId)=>{
    if(!litros)return
    setSaving(true)
    const existing=presMap[tractorId]
    if(existing){
      const {error}=await supabase.from('presupuesto_diesel').update({litros_asignados:+litros}).eq('id',existing.id)
      if(!error)setPresupuestos(p=>p.map(x=>x.id===existing.id?{...x,litros_asignados:+litros}:x))
    }else{
      const {data,error}=await supabase.from('presupuesto_diesel').insert([{tractor_id:tractorId,mes,litros_asignados:+litros}]).select()
      if(!error)setPresupuestos(p=>[...p,data[0]])
    }
    setEditId(null)
    setLitros('')
    setSaving(false)
  }
  const getAlert=(consumido,asignado)=>{
    if(!asignado)return null
    const pct=consumido/asignado
    if(pct>=1)return{bar:'#E24B4A',badge:'danger',label:'Excedido'}
    if(pct>=0.8)return{bar:'#BA7517',badge:'warning',label:'Por agotarse'}
    return{bar:'#1D9E75',badge:'success',label:'Normal'}
  }
  const tractoresConRegistros=tractores.filter(t=>diesel.some(r=>r.tractor_id===t.id)||presMap[t.id])
  const todos=tractores
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <div>
        <h2 style={{fontSize:18,fontWeight:600,margin:'0 0 2px'}}>Presupuesto de diesel</h2>
        <p style={{fontSize:12,color:'var(--text3)',margin:0,textTransform:'capitalize'}}>{mesLabel}</p>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <label style={{fontSize:12,color:'var(--text2)'}}>Mes:</label>
        <input type="month" value={mes} onChange={e=>setMes(e.target.value)} style={{width:'auto',padding:'6px 10px'}}/>
      </div>
    </div>
    {loading?<Spinner/>:<div style={{display:'flex',flexDirection:'column',gap:10}}>
      {todos.map(t=>{
        const pres=presMap[t.id]
        const consumido=consumoMes[t.id]||0
        const asignado=pres?.litros_asignados||0
        const pct=asignado>0?Math.min(consumido/asignado,1):0
        const alert=getAlert(consumido,asignado)
        const isEditing=editId===t.id
        return <div key={t.id} style={{background:'var(--bg)',border:`0.5px solid ${alert?alert.bar+'40':'var(--border)'}`,borderRadius:10,padding:'12px 16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <span style={{fontWeight:700,fontSize:14}}>{t.id}</span>
              <Badge color="gray">{t.campo}</Badge>
              {alert&&<Badge color={alert.badge}>{alert.label}</Badge>}
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:13,color:'var(--text2)'}}><strong style={{color:alert?.bar||'var(--text)'}}>{consumido.toFixed(0)}</strong>{asignado>0&&<> / {asignado} lts</>}</span>
              {isEditing?(
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <input type="number" value={litros} onChange={e=>setLitros(e.target.value)} placeholder="Lts asignados" style={{width:130,padding:'4px 8px',fontSize:12}} autoFocus onKeyDown={e=>{if(e.key==='Enter')savePres(t.id)}}/>
                  <Btn small color="#1D9E75" onClick={()=>savePres(t.id)} disabled={saving}>Guardar</Btn>
                  <Btn small outline color="#888" onClick={()=>{setEditId(null);setLitros('')}}>✕</Btn>
                </div>
              ):(
                <button onClick={()=>{setEditId(t.id);setLitros(asignado||'')}} style={{fontSize:11,padding:'3px 10px',borderRadius:6,border:'0.5px solid var(--border2)',background:'none',cursor:'pointer',color:'var(--text2)'}}>
                  {asignado?'✏️ Editar':'+ Asignar litros'}
                </button>
              )}
            </div>
          </div>
          {asignado>0&&<div style={{marginTop:10}}>
            <div style={{height:8,borderRadius:4,background:'var(--bg2)',overflow:'hidden'}}>
              <div style={{height:'100%',width:`${pct*100}%`,background:alert?.bar||'#1D9E75',borderRadius:4,transition:'width 0.4s'}}/>
            </div>
            <p style={{fontSize:10,color:'var(--text3)',margin:'3px 0 0',textAlign:'right'}}>{(pct*100).toFixed(0)}% consumido · {Math.max(0,asignado-consumido).toFixed(0)} lts disponibles</p>
          </div>}
        </div>
      })}
    </div>}
  </div>
}

/* ── Reporte de diesel ── */
function ReporteDiesel({diesel,setDiesel,setVales,tractores,puedeEditar=false}){
  const [edit,setEdit]=useState(null)
  const [savingE,setSavingE]=useState(false)
  const guardarEdit=async()=>{
    if(edit.litros===''||Number(edit.litros)<=0){alert('Los litros deben ser mayores a 0');return}
    const num=v=>v===''||v==null?null:Number(v)
    const patch={fecha:edit.fecha,campo:edit.campo,actividad:edit.actividad,litros:Number(edit.litros),horas:num(edit.horas),hectareas:num(edit.hectareas),operador:edit.operador||null,turno:edit.turno||null}
    setSavingE(true)
    const {error}=await supabase.from('diesel_registros').update(patch).eq('id',edit.id)
    if(error){alert('Error: '+error.message);setSavingE(false);return}
    if(edit.vale_id){
      await supabase.from('vales_diesel').update({litros_cargados:patch.litros}).eq('id',edit.vale_id)
      if(setVales)setVales(vs=>vs.map(v=>v.id===edit.vale_id?{...v,litros_cargados:patch.litros}:v))
    }
    setDiesel(d=>d.map(x=>x.id===edit.id?{...x,...patch}:x))
    setSavingE(false);setEdit(null)
  }
  const [filterTractor,setFilterTractor]=useState('Todos')
  const [filterCampo,setFilterCampo]=useState('Todos')
  const [filterActividad,setFilterActividad]=useState('Todos')
  const [filterDesde,setFilterDesde]=useState('')
  const [filterHasta,setFilterHasta]=useState('')
  const tractorMap=Object.fromEntries(tractores.map(t=>[t.id,t]))
  const ids=[...new Set(tractores.map(t=>t.id))].sort()
  const rows=useMemo(()=>diesel.filter(r=>{
    if(filterTractor!=='Todos'&&r.tractor_id!==filterTractor)return false
    if(filterCampo!=='Todos'&&r.campo!==filterCampo)return false
    if(filterActividad!=='Todos'&&r.actividad!==filterActividad)return false
    if(filterDesde&&r.fecha<filterDesde)return false
    if(filterHasta&&r.fecha>filterHasta)return false
    return true
  }),[diesel,filterTractor,filterCampo,filterActividad,filterDesde,filterHasta])
  const rendimiento=useMemo(()=>{
    const m={}
    rows.forEach(r=>{
      const id=r.tractor_id;if(!id)return
      if(!m[id])m[id]={id,litros:0,horas:0,hectareas:0,regs:0}
      m[id].litros+=Number(r.litros||0)
      m[id].horas+=Number(r.horas||0)
      m[id].hectareas+=Number(r.hectareas||0)
      m[id].regs++
    })
    return Object.values(m).sort((a,b)=>b.litros-a.litros).map(x=>({
      ...x,
      lts_hr:x.horas>0?(x.litros/x.horas).toFixed(1):'-',
      lts_ha:x.hectareas>0?(x.litros/x.hectareas).toFixed(1):'-',
      campo:tractorMap[x.id]?.campo||'-'
    }))
  },[rows,tractorMap])
  const totalLts=rows.reduce((s,r)=>s+Number(r.litros||0),0)
  const totalHrs=rows.reduce((s,r)=>s+Number(r.horas||0),0)
  const totalHas=rows.reduce((s,r)=>s+Number(r.hectareas||0),0)
  const exportCSV=()=>{
    const header=['Fecha','Tractor','Campo','Actividad','Litros','Horas','Hectareas','Lts/Hr','Lts/Ha','Operador','Semana','Turno']
    const data=rows.map(r=>[r.fecha,r.tractor_id,r.campo,r.actividad,r.litros||0,r.horas||0,r.hectareas||0,r.horas>0?(r.litros/r.horas).toFixed(1):'',r.hectareas>0?(r.litros/r.hectareas).toFixed(1):'',r.operador||'',r.semana||'',r.turno||''])
    const csv=[[...header],...data,[''],['TOTALES','','','',totalLts.toFixed(0),totalHrs.toFixed(1),totalHas.toFixed(1)]].map(r=>r.join(',')).join('\n')
    const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a');a.href=url;a.download=`reporte_diesel_${new Date().toISOString().split('T')[0]}.csv`;a.click()
    URL.revokeObjectURL(url)
  }
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <div>
        <h2 style={{fontSize:18,fontWeight:600,margin:'0 0 2px'}}>Reporte de diesel</h2>
        <p style={{fontSize:12,color:'var(--text3)',margin:0}}>{rows.length} registros · {totalLts.toFixed(0)} lts · {totalHrs.toFixed(1)} hrs</p>
      </div>
      <div style={{display:'flex',gap:8}}>
        <button onClick={()=>window.print()} style={{padding:'7px 14px',borderRadius:8,background:'#378ADD',color:'#fff',border:'none',fontSize:12,cursor:'pointer',fontWeight:500}}>🖨️ Imprimir</button>
        <button onClick={exportCSV} style={{padding:'7px 14px',borderRadius:8,background:'#1D9E75',color:'#fff',border:'none',fontSize:12,cursor:'pointer',fontWeight:500}}>📥 Exportar CSV</button>
      </div>
    </div>
    <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',background:'var(--bg)',padding:'12px 14px',borderRadius:10,border:'0.5px solid var(--border)'}}>
      {[
        {label:'Tractor',val:filterTractor,set:setFilterTractor,opts:['Todos',...ids]},
        {label:'Campo',val:filterCampo,set:setFilterCampo,opts:['Todos',...CAMPOS]},
        {label:'Actividad',val:filterActividad,set:setFilterActividad,opts:['Todos',...ACTIVIDADES]},
      ].map(f=><div key={f.label} style={{display:'flex',flexDirection:'column',gap:3}}>
        <label style={{fontSize:11,color:'var(--text3)'}}>{f.label}</label>
        <select value={f.val} onChange={e=>f.set(e.target.value)} style={{width:'auto',padding:'6px 10px',fontSize:12}}>
          {f.opts.map(o=><option key={o}>{o}</option>)}
        </select>
      </div>)}
      <div style={{display:'flex',flexDirection:'column',gap:3}}>
        <label style={{fontSize:11,color:'var(--text3)'}}>Desde</label>
        <input type="date" value={filterDesde} onChange={e=>setFilterDesde(e.target.value)} style={{width:'auto',padding:'6px 10px',fontSize:12}}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:3}}>
        <label style={{fontSize:11,color:'var(--text3)'}}>Hasta</label>
        <input type="date" value={filterHasta} onChange={e=>setFilterHasta(e.target.value)} style={{width:'auto',padding:'6px 10px',fontSize:12}}/>
      </div>
      {(filterTractor!=='Todos'||filterCampo!=='Todos'||filterActividad!=='Todos'||filterDesde||filterHasta)&&
        <button onClick={()=>{setFilterTractor('Todos');setFilterCampo('Todos');setFilterActividad('Todos');setFilterDesde('');setFilterHasta('')}} style={{alignSelf:'flex-end',padding:'6px 12px',borderRadius:6,border:'0.5px solid var(--border2)',background:'none',fontSize:12,cursor:'pointer',color:'var(--text2)'}}>✕ Limpiar</button>}
    </div>
    {rendimiento.length>0&&<div style={{marginBottom:20}}>
      <p style={{fontSize:13,fontWeight:600,margin:'0 0 10px'}}>Rendimiento por tractor</p>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr style={{borderBottom:'0.5px solid var(--border)',background:'var(--bg2)'}}>
            {['Tractor','Campo','Registros','Litros','Horas','Hectáreas','Lts/Hr','Lts/Ha'].map(h=><th key={h} style={{padding:'7px 10px',textAlign:'left',fontWeight:500,color:'var(--text2)',whiteSpace:'nowrap'}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rendimiento.map(r=><tr key={r.id} style={{borderBottom:'0.5px solid var(--border)'}}>
              <td style={{padding:'7px 10px',fontWeight:700}}>{r.id}</td>
              <td style={{padding:'7px 10px'}}><Badge color="gray">{r.campo}</Badge></td>
              <td style={{padding:'7px 10px',textAlign:'center'}}>{r.regs}</td>
              <td style={{padding:'7px 10px',fontWeight:600,color:'#1D9E75'}}>{r.litros.toFixed(0)} lts</td>
              <td style={{padding:'7px 10px',color:'#378ADD'}}>{r.horas.toFixed(1)} hrs</td>
              <td style={{padding:'7px 10px',color:'#534AB7'}}>{r.hectareas.toFixed(1)} ha</td>
              <td style={{padding:'7px 10px',fontWeight:600,color:r.lts_hr!=='-'&&+r.lts_hr<15?'#1D9E75':r.lts_hr!=='-'&&+r.lts_hr<25?'#BA7517':'#E24B4A'}}>{r.lts_hr!=='-'?`${r.lts_hr} lts/hr`:'-'}</td>
              <td style={{padding:'7px 10px',color:'#534AB7'}}>{r.lts_ha!=='-'?`${r.lts_ha} lts/ha`:'-'}</td>
            </tr>)}
            <tr style={{borderTop:'1.5px solid var(--border)',background:'var(--bg2)'}}>
              <td colSpan={3} style={{padding:'7px 10px',fontWeight:600,fontSize:12}}>TOTALES</td>
              <td style={{padding:'7px 10px',fontWeight:700,color:'#1D9E75'}}>{totalLts.toFixed(0)} lts</td>
              <td style={{padding:'7px 10px',fontWeight:700,color:'#378ADD'}}>{totalHrs.toFixed(1)} hrs</td>
              <td style={{padding:'7px 10px',fontWeight:700,color:'#534AB7'}}>{totalHas.toFixed(1)} ha</td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>}
    <p style={{fontSize:13,fontWeight:600,margin:'0 0 10px'}}>Detalle de registros</p>
    {rows.length===0?<EmptyState msg="Sin registros con los filtros seleccionados."/>:
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
        <thead><tr style={{borderBottom:'0.5px solid var(--border)',background:'var(--bg2)'}}>
          {['Fecha','Tractor','Campo','Actividad','Litros','Horas','Hect.','Lts/Hr','Lts/Ha','Operador','Turno',...(puedeEditar?['']:[])].map(h=><th key={h} style={{padding:'7px 10px',textAlign:'left',fontWeight:500,color:'var(--text2)',whiteSpace:'nowrap'}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.map(r=>{
            const lhr=r.horas>0?(r.litros/r.horas).toFixed(1):'-'
            const lha=r.hectareas>0?(r.litros/r.hectareas).toFixed(1):'-'
            return <tr key={r.id} style={{borderBottom:'0.5px solid var(--border)'}}>
              <td style={{padding:'7px 10px',whiteSpace:'nowrap'}}>{r.fecha}</td>
              <td style={{padding:'7px 10px',fontWeight:600}}>{r.tractor_id}</td>
              <td style={{padding:'7px 10px'}}><Badge color="info">{r.campo}</Badge></td>
              <td style={{padding:'7px 10px'}}>{r.actividad}</td>
              <td style={{padding:'7px 10px',fontWeight:600,color:'#1D9E75'}}>{r.litros}</td>
              <td style={{padding:'7px 10px'}}>{r.horas||'-'}</td>
              <td style={{padding:'7px 10px'}}>{r.hectareas||'-'}</td>
              <td style={{padding:'7px 10px',color:'#378ADD'}}>{lhr}</td>
              <td style={{padding:'7px 10px',color:'#534AB7'}}>{lha}</td>
              <td style={{padding:'7px 10px',color:'var(--text2)'}}>{r.operador||'-'}</td>
              <td style={{padding:'7px 10px'}}>{r.turno||'-'}</td>
              {puedeEditar&&<td style={{padding:'7px 10px'}}><button onClick={()=>setEdit({...r,litros:String(r.litros??''),horas:r.horas??'',hectareas:r.hectareas??'',operador:r.operador||'',turno:r.turno||''})} style={{background:'none',border:'0.5px solid var(--border)',borderRadius:6,color:'#378ADD',cursor:'pointer',fontSize:12,padding:'3px 8px'}}>✏️ Editar</button></td>}
            </tr>
          })}
        </tbody>
      </table>
    </div>}
    {edit&&<Modal title={`Editar registro · ${edit.tractor_id}`} onClose={()=>setEdit(null)}>
      {edit.vale_id&&<p style={{fontSize:12,color:'#3C3489',background:'#EEEDFE',borderRadius:8,padding:'8px 10px',marginTop:0}}>Este registro ejecutó un vale; si cambias los litros también se actualizan en el vale.</p>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
        <Field label="Fecha"><input type="date" value={edit.fecha} onChange={e=>setEdit(x=>({...x,fecha:e.target.value}))}/></Field>
        <Field label="Campo"><select value={edit.campo||''} onChange={e=>setEdit(x=>({...x,campo:e.target.value}))}>{CAMPOS.map(c=><option key={c}>{c}</option>)}</select></Field>
        <Field label="Actividad"><select value={edit.actividad||''} onChange={e=>setEdit(x=>({...x,actividad:e.target.value}))}>{[...new Set([edit.actividad,...ACTIVIDADES].filter(Boolean))].map(a=><option key={a}>{a}</option>)}</select></Field>
        <Field label="Turno"><select value={edit.turno||''} onChange={e=>setEdit(x=>({...x,turno:e.target.value}))}><option value=""></option><option>DIA</option><option>NOCHE</option></select></Field>
        <Field label="Litros"><input type="number" value={edit.litros} onChange={e=>setEdit(x=>({...x,litros:e.target.value}))}/></Field>
        <Field label="Horas"><input type="number" value={edit.horas} onChange={e=>setEdit(x=>({...x,horas:e.target.value}))}/></Field>
        <Field label="Hectáreas"><input type="number" value={edit.hectareas} onChange={e=>setEdit(x=>({...x,hectareas:e.target.value}))}/></Field>
        <Field label="Operador"><input type="text" value={edit.operador} onChange={e=>setEdit(x=>({...x,operador:e.target.value}))}/></Field>
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}><Btn outline onClick={()=>setEdit(null)}>Cancelar</Btn><Btn onClick={guardarEdit} disabled={savingE}>{savingE?'Guardando…':'Guardar cambios'}</Btn></div>
    </Modal>}
  </div>
}

/* ── Diesel ── */
function Diesel({diesel,setDiesel,tractores,presupuestos,qrTractorId,loading,puedeEditar=true,soloVale=false,vales=[],setVales,nombre='',valeSel=null,setValeSel}){
  const hoyStr=()=>new Date().toISOString().split('T')[0]
  const formVacio=()=>({fecha:hoyStr(),tractor_id:'',campo:'',actividad:'',litros:'',horas:'',hectareas:'',operador:'',semana:'',turno:'DIA',odometro_desp_ini:'',odometro_desp_fin:'',horometro_ini:'',horometro_fin:'',vale_id:''})
  const [showForm,setShowForm]=useState(false)
  const [saving,setSaving]=useState(false)
  const [filterCampo,setFilterCampo]=useState('Todos')
  const [filterTractor,setFilterTractor]=useState('Todos')
  const [form,setForm]=useState(formVacio())
  const [cerrar,setCerrar]=useState(null)   // registro al que se le captura horómetro final
  const [cerrarVal,setCerrarVal]=useState('')
  const [ahora,setAhora]=useState(Date.now())
  useEffect(()=>{const t=setInterval(()=>setAhora(Date.now()),60000);return()=>clearInterval(t)},[])

  const valesVigentes=useMemo(()=>vales.filter(v=>v.estado==='Vigente'&&new Date(v.vence).getTime()>ahora),[vales,ahora])
  const valeForm=form.vale_id?vales.find(v=>String(v.id)===String(form.vale_id)):null

  // Abrir formulario preseleccionado al escanear QR
  useEffect(()=>{
    if(qrTractorId&&tractores.length>0){
      const t=tractores.find(x=>x.id===qrTractorId)
      if(t){
        setForm(f=>({...f,tractor_id:t.id,campo:t.campo||'',operador:t.operador||''}))
        setShowForm(true)
      }
    }
  },[qrTractorId,tractores])

  // Abrir formulario con un vale elegido desde el módulo Vales
  useEffect(()=>{
    if(valeSel&&vales.length>0){
      const v=vales.find(x=>x.id===valeSel)
      if(v){
        const t=tractores.find(x=>x.id===v.tractor_id)
        setForm({...formVacio(),vale_id:String(v.id),tractor_id:v.tractor_id,campo:t?.campo||'',operador:t?.operador||'',litros:String(v.litros_autorizados)})
        setShowForm(true)
      }
      if(setValeSel)setValeSel(null)
    }
  },[valeSel,vales])

  const elegirVale=(id)=>{
    if(!id){setForm(f=>({...f,vale_id:''}));return}
    const v=vales.find(x=>String(x.id)===String(id)); if(!v)return
    const t=tractores.find(x=>x.id===v.tractor_id)
    setForm(f=>({...f,vale_id:String(v.id),tractor_id:v.tractor_id,campo:t?.campo||f.campo,operador:t?.operador||f.operador,litros:String(v.litros_autorizados)}))
  }

  // Cálculos de odómetro / horómetro
  const difOdo=form.odometro_desp_ini!==''&&form.odometro_desp_fin!==''?Number(form.odometro_desp_fin)-Number(form.odometro_desp_ini):null
  const horasCalc=form.horometro_ini!==''&&form.horometro_fin!==''?Math.round((Number(form.horometro_fin)-Number(form.horometro_ini))*10)/10:null
  const horasEfectivas=horasCalc!=null&&horasCalc>=0?horasCalc:(form.horas!==''?Number(form.horas):null)
  const descuadre=difOdo!=null&&difOdo>=0&&form.litros!==''&&Math.abs(Number(form.litros)-difOdo)>Math.max(1,difOdo*0.02)

  // Presupuesto check
  const alertaPresupuesto=useMemo(()=>{
    if(!form.tractor_id||!form.litros)return null
    const mes=form.fecha?.substring(0,7)||new Date().toISOString().substring(0,7)
    const pres=presupuestos.find(p=>p.tractor_id===form.tractor_id&&p.mes===mes)
    if(!pres)return null
    const consumidoActual=diesel.filter(r=>r.tractor_id===form.tractor_id&&r.fecha?.startsWith(mes)).reduce((s,r)=>s+Number(r.litros||0),0)
    const nuevoTotal=consumidoActual+Number(form.litros||0)
    const disponible=pres.litros_asignados-consumidoActual
    if(nuevoTotal>pres.litros_asignados){
      const excedente=nuevoTotal-pres.litros_asignados
      return{tipo:'danger',msg:`⚠️ Esta carga excede el presupuesto mensual por ${excedente.toFixed(0)} lts. Disponible: ${Math.max(0,disponible).toFixed(0)} lts de ${pres.litros_asignados} asignados.`}
    }
    const pct=nuevoTotal/pres.litros_asignados
    if(pct>=0.8){
      return{tipo:'warning',msg:`⚠️ Esta carga dejará al tractor en ${(pct*100).toFixed(0)}% del presupuesto mensual. Disponible tras carga: ${(pres.litros_asignados-nuevoTotal).toFixed(0)} lts.`}
    }
    return null
  },[form.tractor_id,form.litros,form.fecha,diesel,presupuestos])

  const handleSubmit=async()=>{
    if(soloVale&&!form.vale_id){alert('Con tu perfil solo puedes cargar diésel con un vale vigente. Selecciona un vale.');return}
    if(!form.tractor_id||!form.litros){alert('Tractor y litros son obligatorios');return}
    if(form.odometro_desp_ini===''||form.odometro_desp_fin===''){alert('Captura el odómetro de la máquina despachadora al inicio y al final de la carga');return}
    if(Number(form.odometro_desp_fin)<Number(form.odometro_desp_ini)){alert('El odómetro final de la despachadora no puede ser menor al inicial');return}
    if(form.horometro_ini===''){alert('Captura el horómetro inicial de la jornada');return}
    if(form.horometro_fin!==''&&Number(form.horometro_fin)<Number(form.horometro_ini)){alert('El horómetro final no puede ser menor al inicial');return}

    // Vale: validar y reservar (una persona lo genera, otra lo ejecuta)
    let vale=null
    if(form.vale_id){
      vale=vales.find(v=>String(v.id)===String(form.vale_id))
      if(!vale){alert('No se encontró el vale seleccionado');return}
      if(vale.estado!=='Vigente'||new Date(vale.vence).getTime()<=Date.now()){alert(`El vale ${folioVale(vale.id)} ya no está vigente`);return}
      if(vale.tractor_id!==form.tractor_id){alert(`El vale ${folioVale(vale.id)} es para el tractor ${vale.tractor_id}`);return}
      if(mismaPersona(vale.generado_por,nombre)){alert(`Generaste el vale ${folioVale(vale.id)}. Debe ejecutarlo otra persona.`);return}
    }
    setSaving(true)
    if(vale){
      const {data:claim,error:e1}=await supabase.from('vales_diesel').update({estado:'Ejecutado',ejecutado_por:nombre,fecha_ejecucion:new Date().toISOString(),litros_cargados:+form.litros}).eq('id',vale.id).eq('estado','Vigente').select()
      if(e1||!claim||claim.length===0){alert('No se pudo ejecutar el vale: '+(e1?e1.message:'ya fue utilizado o cancelado por otra persona.'));setSaving(false);return}
      vale={...vale,...claim[0]}
    }
    const num=v=>v===''||v==null?null:Number(v)
    const row={
      fecha:form.fecha,tractor_id:form.tractor_id,campo:form.campo,actividad:form.actividad,turno:form.turno,operador:form.operador,
      litros:+form.litros,horas:horasEfectivas,hectareas:+form.hectareas||null,semana:+form.semana||null,
      odometro_desp_ini:num(form.odometro_desp_ini),odometro_desp_fin:num(form.odometro_desp_fin),
      horometro_ini:num(form.horometro_ini),horometro_fin:num(form.horometro_fin),
      vale_id:vale?vale.id:null,cargado_por:nombre
    }
    const {data,error}=await supabase.from('diesel_registros').insert([row]).select()
    if(error){
      if(vale)await supabase.from('vales_diesel').update({estado:'Vigente',ejecutado_por:null,fecha_ejecucion:null,litros_cargados:null}).eq('id',vale.id)
      alert('Error: '+error.message)
    }else{
      if(vale){
        await supabase.from('vales_diesel').update({diesel_id:data[0].id}).eq('id',vale.id)
        if(setVales)setVales(vs=>vs.map(v=>v.id===vale.id?{...vale,diesel_id:data[0].id}:v))
      }
      setDiesel(d=>[data[0],...d]);setShowForm(false);setForm(formVacio())
    }
    setSaving(false)
  }
  const handleDelete=async(r)=>{
    if(!confirm(r.vale_id?'Este registro ejecutó un vale. Al eliminarlo, el vale quedará marcado como Cancelado. ¿Continuar?':'¿Eliminar este registro?'))return
    await supabase.from('diesel_registros').delete().eq('id',r.id)
    setDiesel(d=>d.filter(x=>x.id!==r.id))
    if(r.vale_id){
      const patch={estado:'Cancelado',cancelado_por:nombre,motivo_cancelacion:'Registro de diesel eliminado'}
      await supabase.from('vales_diesel').update(patch).eq('id',r.vale_id)
      if(setVales)setVales(vs=>vs.map(v=>v.id===r.vale_id?{...v,...patch}:v))
    }
  }
  const cerrarJornada=async()=>{
    const fin=Number(cerrarVal)
    if(cerrarVal===''||isNaN(fin)||fin<Number(cerrar.horometro_ini)){alert('El horómetro final debe ser mayor o igual al inicial ('+cerrar.horometro_ini+')');return}
    const horas=Math.round((fin-Number(cerrar.horometro_ini))*10)/10
    const {error}=await supabase.from('diesel_registros').update({horometro_fin:fin,horas}).eq('id',cerrar.id)
    if(error){alert('Error: '+error.message);return}
    setDiesel(d=>d.map(x=>x.id===cerrar.id?{...x,horometro_fin:fin,horas}:x))
    setCerrar(null);setCerrarVal('')
  }
  const ids=[...new Set(tractores.map(t=>t.id))].sort()
  const rows=diesel.filter(r=>(filterCampo==='Todos'||r.campo===filterCampo)&&(filterTractor==='Todos'||r.tractor_id===filterTractor))
  const sinVales=vales.length===0
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <h2 style={{fontSize:18,fontWeight:600,margin:0}}>Registro de diesel</h2>
      {(puedeEditar||soloVale)&&<Btn onClick={()=>{setForm(formVacio());setShowForm(true)}} color="#1D9E75">{soloVale?'+ Cargar con vale':'+ Nuevo registro'}</Btn>}
    </div>
    <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
      <select value={filterCampo} onChange={e=>setFilterCampo(e.target.value)} style={{width:'auto',padding:'7px 12px'}}>
        <option>Todos</option>{CAMPOS.map(c=><option key={c}>{c}</option>)}
      </select>
      <select value={filterTractor} onChange={e=>setFilterTractor(e.target.value)} style={{width:'auto',padding:'7px 12px'}}>
        <option>Todos</option>{ids.map(t=><option key={t}>{t}</option>)}
      </select>
      <span style={{fontSize:12,color:'var(--text3)',alignSelf:'center'}}>{rows.length} registros</span>
    </div>
    {loading?<Spinner/>:rows.length===0?<EmptyState msg="Sin registros. Agrega el primer consumo de diesel."/>:
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead><tr style={{borderBottom:'0.5px solid var(--border)'}}>
          {['Fecha','Tractor','Campo','Actividad','Litros','Odóm. despachadora','Horómetro','Horas','Hect.','Lts/Hr','Lts/Ha','Vale','Operador',''].map(h=><th key={h} style={{padding:'8px 10px',textAlign:'left',fontWeight:500,color:'var(--text2)',fontSize:12,whiteSpace:'nowrap'}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.map(r=>{
            const lhr=r.horas>0?(r.litros/r.horas).toFixed(1):'-'
            const lha=r.hectareas>0?(r.litros/r.hectareas).toFixed(1):'-'
            const abierta=r.horometro_ini!=null&&r.horometro_fin==null
            return <tr key={r.id} style={{borderBottom:'0.5px solid var(--border)'}}>
              <td style={{padding:'8px 10px',whiteSpace:'nowrap'}}>{r.fecha}</td>
              <td style={{padding:'8px 10px',fontWeight:600}}>{r.tractor_id}</td>
              <td style={{padding:'8px 10px'}}><Badge color="info">{r.campo}</Badge></td>
              <td style={{padding:'8px 10px'}}>{r.actividad}</td>
              <td style={{padding:'8px 10px',fontWeight:600,color:'#1D9E75'}}>{r.litros}</td>
              <td style={{padding:'8px 10px',whiteSpace:'nowrap',fontSize:12}}>{r.odometro_desp_ini!=null?`${r.odometro_desp_ini} → ${r.odometro_desp_fin}`:'-'}</td>
              <td style={{padding:'8px 10px',whiteSpace:'nowrap',fontSize:12}}>{r.horometro_ini!=null?`${r.horometro_ini} → ${r.horometro_fin??'…'}`:'-'}{abierta&&(puedeEditar||soloVale)&&<> <button onClick={()=>{setCerrar(r);setCerrarVal('')}} style={{background:'#FAEEDA',color:'#854F0B',border:'none',borderRadius:4,fontSize:11,padding:'1px 6px',cursor:'pointer'}}>Cerrar jornada</button></>}</td>
              <td style={{padding:'8px 10px'}}>{r.horas||'-'}</td>
              <td style={{padding:'8px 10px'}}>{r.hectareas||'-'}</td>
              <td style={{padding:'8px 10px',color:'#378ADD',fontWeight:500}}>{lhr}</td>
              <td style={{padding:'8px 10px',color:'#534AB7',fontWeight:500}}>{lha}</td>
              <td style={{padding:'8px 10px',whiteSpace:'nowrap'}}>{r.vale_id?<Badge color="purple">{folioVale(r.vale_id)}</Badge>:'-'}</td>
              <td style={{padding:'8px 10px',color:'var(--text2)',fontSize:12}}>{r.operador}</td>
              <td style={{padding:'8px 10px'}}>{puedeEditar&&<button onClick={()=>handleDelete(r)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:16}}>🗑</button>}</td>
            </tr>
          })}
        </tbody>
      </table>
    </div>}
    {showForm&&<Modal title="Nuevo registro de diesel" onClose={()=>setShowForm(false)}>
      {soloVale&&sinVales&&<div style={{background:'#FCEBEB',color:'#A32D2D',borderRadius:8,padding:'10px 12px',marginBottom:12,fontSize:13}}>No hay vales. Pide al administrador que genere uno.</div>}
      {!sinVales&&<div style={{background:'#EEEDFE',borderRadius:8,padding:'10px 12px',marginBottom:12}}>
        <Field label={soloVale?'🎫 Vale (obligatorio)':'🎫 Cargar con vale (opcional)'}>
          <select value={form.vale_id} onChange={e=>elegirVale(e.target.value)}>
            <option value="">{soloVale?'Selecciona un vale…':'Sin vale'}</option>
            {valesVigentes.map(v=><option key={v.id} value={v.id}>{folioVale(v.id)} · {v.tractor_id} · {v.litros_autorizados} L · vence {fmtFechaHora(v.vence)}</option>)}
          </select>
        </Field>
        {valeForm&&<p style={{margin:0,fontSize:12,color:'#3C3489'}}>Generado por <strong>{valeForm.generado_por}</strong> · Autoriza {valeForm.litros_autorizados} L{valeForm.motivo?` · ${valeForm.motivo}`:''}.
          {mismaPersona(valeForm.generado_por,nombre)&&<span style={{color:'#A32D2D',fontWeight:600}}> Tú generaste este vale: debe ejecutarlo otra persona.</span>}
          {Number(form.litros)>Number(valeForm.litros_autorizados)&&<span style={{color:'#A32D2D',fontWeight:600}}> Los litros exceden lo autorizado.</span>}</p>}
      </div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
        <Field label="Fecha"><input type="date" value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}/></Field>
        <Field label="Semana #"><input type="number" placeholder="19" value={form.semana} onChange={e=>setForm(f=>({...f,semana:e.target.value}))}/></Field>
        <Field label="Tractor">
          <select disabled={!!form.vale_id} value={form.tractor_id} onChange={e=>{const t=tractores.find(x=>x.id===e.target.value);setForm(f=>({...f,tractor_id:e.target.value,campo:t?.campo||f.campo,operador:t?.operador||f.operador}))}}>
            <option value="">Seleccionar...</option>
            {ids.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Campo">
          <select value={form.campo} onChange={e=>setForm(f=>({...f,campo:e.target.value}))}>
            <option value="">Seleccionar...</option>
            {CAMPOS.map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Actividad">
          <select value={form.actividad} onChange={e=>setForm(f=>({...f,actividad:e.target.value}))}>
            <option value="">Seleccionar...</option>
            {ACTIVIDADES.map(a=><option key={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Turno">
          <select value={form.turno} onChange={e=>setForm(f=>({...f,turno:e.target.value}))}>
            <option>DIA</option><option>NOCHE</option>
          </select>
        </Field>
      </div>
      <div style={{background:'var(--bg2)',borderRadius:8,padding:'10px 12px 2px',marginBottom:12}}>
        <p style={{margin:'0 0 8px',fontSize:12,fontWeight:600,color:'var(--text2)'}}>⛽ Máquina despachadora (esta carga)</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0 12px'}}>
          <Field label="Odómetro inicial *"><input type="number" step="0.1" value={form.odometro_desp_ini} onChange={e=>setForm(f=>({...f,odometro_desp_ini:e.target.value}))}/></Field>
          <Field label="Odómetro final *"><input type="number" step="0.1" value={form.odometro_desp_fin} onChange={e=>setForm(f=>({...f,odometro_desp_fin:e.target.value}))}/></Field>
          <Field label="Litros diesel *"><input type="number" placeholder="0" value={form.litros} onChange={e=>setForm(f=>({...f,litros:e.target.value}))}/></Field>
        </div>
        {difOdo!=null&&<p style={{margin:'-4px 0 10px',fontSize:12,color:difOdo<0?'#A32D2D':'var(--text2)'}}>
          {difOdo<0?'El odómetro final es menor al inicial.':`El odómetro marca ${difOdo.toFixed(1)} L despachados.`}
          {difOdo>=0&&form.litros===''&&<> <button onClick={()=>setForm(f=>({...f,litros:String(Math.round(difOdo*10)/10)}))} style={{background:'none',border:'none',color:'#378ADD',cursor:'pointer',fontSize:12,textDecoration:'underline'}}>Usar como litros</button></>}
          {descuadre&&<span style={{color:'#A32D2D',fontWeight:600}}> Los litros capturados no coinciden con el odómetro.</span>}</p>}
      </div>
      <div style={{background:'var(--bg2)',borderRadius:8,padding:'10px 12px 2px',marginBottom:12}}>
        <p style={{margin:'0 0 8px',fontSize:12,fontWeight:600,color:'var(--text2)'}}>🕒 Horómetro del tractor (jornada)</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0 12px'}}>
          <Field label="Horómetro inicial *"><input type="number" step="0.1" value={form.horometro_ini} onChange={e=>setForm(f=>({...f,horometro_ini:e.target.value}))}/></Field>
          <Field label="Horómetro final"><input type="number" step="0.1" placeholder="Al cerrar jornada" value={form.horometro_fin} onChange={e=>setForm(f=>({...f,horometro_fin:e.target.value}))}/></Field>
          <Field label="Horas trabajadas"><input type="number" step="0.1" value={horasCalc!=null&&horasCalc>=0?horasCalc:form.horas} readOnly={horasCalc!=null&&horasCalc>=0} onChange={e=>setForm(f=>({...f,horas:e.target.value}))} placeholder="0.0"/></Field>
        </div>
        <p style={{margin:'-4px 0 10px',fontSize:11,color:'var(--text3)'}}>Si aún no termina la jornada, deja el final vacío y ciérralo después desde la tabla.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
        <Field label="Hectáreas"><input type="number" step="0.1" placeholder="0.0" value={form.hectareas} onChange={e=>setForm(f=>({...f,hectareas:e.target.value}))}/></Field>
        <Field label="Operador"><input type="text" placeholder="Nombre del operador" value={form.operador} onChange={e=>setForm(f=>({...f,operador:e.target.value}))}/></Field>
      </div>
      {alertaPresupuesto&&<div style={{background:alertaPresupuesto.tipo==='danger'?'#FCEBEB':'#FAEEDA',border:`1px solid ${alertaPresupuesto.tipo==='danger'?'#F09595':'#E5C17A'}`,borderRadius:8,padding:'10px 12px',marginBottom:12,fontSize:13,color:alertaPresupuesto.tipo==='danger'?'#A32D2D':'#854F0B'}}>{alertaPresupuesto.msg}</div>}
      {form.litros&&horasEfectivas>0&&<div style={{background:'var(--bg2)',borderRadius:8,padding:10,marginBottom:12,fontSize:13}}>
        <strong>Rendimiento calculado:</strong>{' '}
        <span style={{color:'#378ADD'}}>{(form.litros/horasEfectivas).toFixed(1)} lts/hr</span>
        {form.hectareas>0&&<> · <span style={{color:'#534AB7'}}>{(form.litros/form.hectareas).toFixed(1)} lts/ha</span></>}
      </div>}
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:4}}>
        <Btn outline color="#888" onClick={()=>setShowForm(false)}>Cancelar</Btn>
        <Btn onClick={handleSubmit} disabled={saving}>{saving?'Guardando...':'Guardar registro'}</Btn>
      </div>
    </Modal>}
    {cerrar&&<Modal title={`Cerrar jornada · ${cerrar.tractor_id}`} onClose={()=>setCerrar(null)}>
      <p style={{fontSize:12,color:'var(--text2)',margin:'-6px 0 10px'}}>Horómetro inicial: <strong>{cerrar.horometro_ini}</strong> ({cerrar.fecha})</p>
      <Field label="Horómetro final"><input type="number" step="0.1" value={cerrarVal} onChange={e=>setCerrarVal(e.target.value)} autoFocus/></Field>
      {cerrarVal!==''&&Number(cerrarVal)>=Number(cerrar.horometro_ini)&&<p style={{fontSize:12,color:'#0F6E56'}}>Horas trabajadas: {(Math.round((Number(cerrarVal)-Number(cerrar.horometro_ini))*10)/10)}</p>}
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}><Btn outline color="#888" onClick={()=>setCerrar(null)}>Cancelar</Btn><Btn onClick={cerrarJornada}>Guardar</Btn></div>
    </Modal>}
  </div>
}

/* ── Mantenimientos ── */
function Mantenimientos({mtto,setMtto,tractores,loading,puedeEditar=true}){
  const [showForm,setShowForm]=useState(false)
  const [editId,setEditId]=useState(null)
  const [saving,setSaving]=useState(false)
  const [filterEstado,setFilterEstado]=useState('Todos')
  const [fotoPreviews,setFotoPreviews]=useState([])
  const [pendingFiles,setPendingFiles]=useState([])
  const emptyForm={fecha:new Date().toISOString().split('T')[0],tractor_id:'',tipo:'Preventivo',descripcion:'',mano_obra:'',refacciones:'',tecnico:'',estado:'En proceso',observaciones:''}
  const [form,setForm]=useState(emptyForm)
  const openNew=()=>{setEditId(null);setForm(emptyForm);setFotoPreviews([]);setPendingFiles([]);setShowForm(true)}
  const openEdit=(m)=>{
    setEditId(m.id)
    setForm({fecha:m.fecha,tractor_id:m.tractor_id,tipo:m.tipo,descripcion:m.descripcion,mano_obra:m.mano_obra||'',refacciones:m.refacciones||'',tecnico:m.tecnico||'',estado:m.estado,observaciones:m.observaciones||''})
    setFotoPreviews(m.fotos||[])
    setPendingFiles([])
    setShowForm(true)
  }
  const handleChangeEstado=async(id,nuevoEstado)=>{
    await supabase.from('mantenimientos').update({estado:nuevoEstado}).eq('id',id)
    setMtto(m=>m.map(x=>x.id===id?{...x,estado:nuevoEstado}:x))
  }
  const handleFotos=(e)=>{
    const files=Array.from(e.target.files)
    setFotoPreviews(p=>[...p,...files.map(f=>URL.createObjectURL(f))])
    setPendingFiles(p=>[...p,...files])
  }
  const handleSubmit=async()=>{
    if(!form.tractor_id||!form.descripcion){alert('Tractor y descripción son obligatorios');return}
    setSaving(true)
    const existingUrls=fotoPreviews.filter(u=>!u.startsWith('blob:'))
    const uploadedUrls=pendingFiles.length>0?await uploadFotos(pendingFiles):[]
    const allFotos=[...existingUrls,...uploadedUrls]
    const row={...form,mano_obra:+form.mano_obra||0,refacciones:+form.refacciones||0,fotos:allFotos}
    if(editId){
      const {error}=await supabase.from('mantenimientos').update(row).eq('id',editId)
      if(error){alert('Error: '+error.message)}
      else{setMtto(m=>m.map(x=>x.id===editId?{...x,...row}:x));setShowForm(false)}
    }else{
      const {data,error}=await supabase.from('mantenimientos').insert([row]).select()
      if(error){alert('Error: '+error.message)}
      else{setMtto(m=>[data[0],...m]);setShowForm(false)}
    }
    setSaving(false)
  }
  const handleDelete=async(id)=>{
    if(!confirm('¿Eliminar este mantenimiento?'))return
    await supabase.from('mantenimientos').delete().eq('id',id)
    setMtto(m=>m.filter(x=>x.id!==id))
  }
  const estadoColor={Completado:'success','En proceso':'warning',Pendiente:'info',Cancelado:'danger'}
  const tipoColor={Preventivo:'info',Correctivo:'warning',Emergencia:'danger'}
  const [filterCampo,setFilterCampo]=useState('Todos')
  const [filterTractor,setFilterTractor]=useState('Todos')
  const [filterTipo,setFilterTipo]=useState('Todos')
  const [filterDesde,setFilterDesde]=useState('')
  const [filterHasta,setFilterHasta]=useState('')
  const tractorMap=Object.fromEntries(tractores.map(t=>[t.id,t]))
  const ids=[...new Set(tractores.map(t=>t.id))].sort()

  const rows=useMemo(()=>mtto.filter(m=>{
    if(filterEstado!=='Todos'&&m.estado!==filterEstado) return false
    if(filterCampo!=='Todos'&&tractorMap[m.tractor_id]?.campo!==filterCampo) return false
    if(filterTractor!=='Todos'&&m.tractor_id!==filterTractor) return false
    if(filterTipo!=='Todos'&&m.tipo!==filterTipo) return false
    if(filterDesde&&m.fecha<filterDesde) return false
    if(filterHasta&&m.fecha>filterHasta) return false
    return true
  }),[mtto,filterEstado,filterCampo,filterTractor,filterTipo,filterDesde,filterHasta,tractorMap])

  const totalCosto=rows.reduce((s,m)=>s+(+m.mano_obra||0)+(+m.refacciones||0),0)
  const hayFiltros=filterCampo!=='Todos'||filterTractor!=='Todos'||filterTipo!=='Todos'||filterDesde||filterHasta

  const limpiarFiltros=()=>{setFilterCampo('Todos');setFilterTractor('Todos');setFilterTipo('Todos');setFilterDesde('');setFilterHasta('')}

  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <div>
        <h2 style={{fontSize:18,fontWeight:600,margin:'0 0 2px'}}>Mantenimientos</h2>
        <p style={{fontSize:12,color:'var(--text3)',margin:0}}>{rows.length} registros · Costo: <strong style={{color:'#378ADD'}}>${totalCosto.toLocaleString()}</strong></p>
      </div>
      {puedeEditar&&<Btn onClick={openNew} color="#378ADD">+ Nuevo mantenimiento</Btn>}
    </div>

    {/* Filtro por estado */}
    <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
      {['Todos','En proceso','Completado','Pendiente','Cancelado'].map(e=>(
        <button key={e} onClick={()=>setFilterEstado(e)} style={{padding:'6px 14px',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:500,border:filterEstado===e?'1.5px solid #378ADD':'0.5px solid var(--border)',background:filterEstado===e?'#E6F1FB':'transparent',color:filterEstado===e?'#185FA5':'var(--text2)'}}>{e}</button>
      ))}
    </div>

    {/* Filtros avanzados */}
    <div style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:10,padding:'12px 14px',marginBottom:14,display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end'}}>
      <div style={{display:'flex',flexDirection:'column',gap:3}}>
        <label style={{fontSize:11,color:'var(--text3)'}}>Campo</label>
        <select value={filterCampo} onChange={e=>setFilterCampo(e.target.value)} style={{width:'auto',padding:'6px 10px',fontSize:12}}>
          <option>Todos</option>{CAMPOS.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:3}}>
        <label style={{fontSize:11,color:'var(--text3)'}}>Tractor</label>
        <select value={filterTractor} onChange={e=>setFilterTractor(e.target.value)} style={{width:'auto',padding:'6px 10px',fontSize:12}}>
          <option>Todos</option>{ids.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:3}}>
        <label style={{fontSize:11,color:'var(--text3)'}}>Tipo</label>
        <select value={filterTipo} onChange={e=>setFilterTipo(e.target.value)} style={{width:'auto',padding:'6px 10px',fontSize:12}}>
          <option>Todos</option>{TIPOS_MTTO.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:3}}>
        <label style={{fontSize:11,color:'var(--text3)'}}>Desde</label>
        <input type="date" value={filterDesde} onChange={e=>setFilterDesde(e.target.value)} style={{width:'auto',padding:'6px 10px',fontSize:12}}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:3}}>
        <label style={{fontSize:11,color:'var(--text3)'}}>Hasta</label>
        <input type="date" value={filterHasta} onChange={e=>setFilterHasta(e.target.value)} style={{width:'auto',padding:'6px 10px',fontSize:12}}/>
      </div>
      {hayFiltros&&<button onClick={limpiarFiltros} style={{alignSelf:'flex-end',padding:'6px 12px',borderRadius:6,border:'0.5px solid var(--border2)',background:'none',fontSize:12,cursor:'pointer',color:'var(--text2)'}}>✕ Limpiar</button>}
    </div>
    {loading?<Spinner/>:rows.length===0?<EmptyState msg="Sin mantenimientos con los filtros seleccionados."/>:
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {rows.map(m=>{
        const tractor=tractorMap[m.tractor_id]
        return <div key={m.id} style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:12,padding:'14px 16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <span style={{fontSize:16,fontWeight:700}}>{m.tractor_id}</span>
              {tractor?.campo&&<Badge color="gray">{tractor.campo}</Badge>}
              <Badge color={tipoColor[m.tipo]||'gray'}>{m.tipo}</Badge>
              <Badge color={estadoColor[m.estado]||'gray'}>{m.estado}</Badge>
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <span style={{fontSize:12,color:'var(--text3)'}}>{m.fecha}</span>
              {puedeEditar&&<button onClick={()=>openEdit(m)} style={{background:'none',border:'0.5px solid var(--border)',borderRadius:6,color:'#378ADD',cursor:'pointer',fontSize:12,padding:'3px 8px',fontWeight:500}}>✏️ Editar</button>}
              {puedeEditar&&<button onClick={()=>handleDelete(m.id)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:16}}>🗑</button>}
            </div>
          </div>
        <p style={{margin:'0 0 6px',fontSize:14,fontWeight:500}}>{m.descripcion}</p>
        {m.observaciones&&<p style={{margin:'0 0 8px',fontSize:13,color:'var(--text2)'}}>{m.observaciones}</p>}
        <div style={{display:'flex',gap:16,fontSize:13,color:'var(--text2)',flexWrap:'wrap'}}>
          {m.tecnico&&<span>🔧 <strong style={{color:'var(--text)'}}>{m.tecnico}</strong></span>}
          <span>💵 M.O.: <strong style={{color:'#1D9E75'}}>${Number(m.mano_obra).toLocaleString()}</strong></span>
          <span>🔩 Ref.: <strong style={{color:'#D85A30'}}>${Number(m.refacciones).toLocaleString()}</strong></span>
          <span style={{fontWeight:600,color:'var(--text)'}}>Total: ${(Number(m.mano_obra)+Number(m.refacciones)).toLocaleString()}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,marginTop:8}}>
          <span style={{fontSize:11,color:'var(--text3)'}}>Cambiar estado:</span>
          <select value={m.estado} onChange={e=>handleChangeEstado(m.id,e.target.value)} style={{padding:'4px 10px',borderRadius:6,fontSize:12,cursor:'pointer',border:'0.5px solid var(--border2)',background:'var(--bg2)',color:'var(--text)'}}>
            {['En proceso','Completado','Pendiente','Cancelado'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        {m.fotos?.length>0&&<div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
          {m.fotos.map((url,i)=><img key={i} src={url} alt="" style={{width:80,height:60,objectFit:'cover',borderRadius:6,border:'0.5px solid var(--border)'}}/>)}
        </div>}
        </div>
      })}
    </div>}
    {showForm&&<Modal title={editId?'Editar mantenimiento':'Nuevo mantenimiento'} onClose={()=>setShowForm(false)} wide>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
        <Field label="Fecha"><input type="date" value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}/></Field>
        <Field label="Tractor *">
          <select value={form.tractor_id} onChange={e=>setForm(f=>({...f,tractor_id:e.target.value}))}>
            <option value="">Seleccionar...</option>
            {tractores.map(t=><option key={t.id} value={t.id}>{t.id} — {t.campo}</option>)}
          </select>
        </Field>
        <Field label="Tipo"><select value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}>{TIPOS_MTTO.map(t=><option key={t}>{t}</option>)}</select></Field>
        <Field label="Estado"><select value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value}))}>{['En proceso','Completado','Pendiente','Cancelado'].map(s=><option key={s}>{s}</option>)}</select></Field>
      </div>
      <Field label="Descripción *"><textarea value={form.descripcion} rows={2} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} style={{resize:'vertical'}}/></Field>
      <Field label="Técnico"><input type="text" placeholder="Nombre del técnico" value={form.tecnico} onChange={e=>setForm(f=>({...f,tecnico:e.target.value}))}/></Field>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
        <Field label="Mano de obra ($)"><input type="number" placeholder="0" value={form.mano_obra} onChange={e=>setForm(f=>({...f,mano_obra:e.target.value}))}/></Field>
        <Field label="Refacciones ($)"><input type="number" placeholder="0" value={form.refacciones} onChange={e=>setForm(f=>({...f,refacciones:e.target.value}))}/></Field>
      </div>
      {(form.mano_obra||form.refacciones)&&<div style={{background:'var(--bg2)',borderRadius:8,padding:10,marginBottom:12,fontSize:13}}>Total: <strong style={{color:'#1D9E75'}}>${((+form.mano_obra||0)+(+form.refacciones||0)).toLocaleString()}</strong></div>}
      <Field label="Observaciones"><textarea value={form.observaciones} rows={2} onChange={e=>setForm(f=>({...f,observaciones:e.target.value}))} style={{resize:'vertical'}}/></Field>
      <Field label="📷 Fotos del trabajo">
        <label style={{display:'inline-flex',alignItems:'center',gap:8,padding:'8px 16px',border:'1px dashed var(--border2)',borderRadius:8,cursor:'pointer',fontSize:13,color:'var(--text2)'}}>
          Subir fotos<input type="file" accept="image/*" multiple onChange={handleFotos} style={{display:'none'}}/>
        </label>
        {fotoPreviews.length>0&&<div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
          {fotoPreviews.map((url,i)=><div key={i} style={{position:'relative'}}>
            <img src={url} alt="" style={{width:72,height:56,objectFit:'cover',borderRadius:6}}/>
            <button onClick={()=>{const removed=fotoPreviews[i];setFotoPreviews(p=>p.filter((_,j)=>j!==i));if(removed?.startsWith('blob:')){const blobIdx=fotoPreviews.slice(0,i).filter(u=>u.startsWith('blob:')).length;setPendingFiles(p=>p.filter((_,j)=>j!==blobIdx))}}} style={{position:'absolute',top:-4,right:-4,background:'#E24B4A',color:'#fff',border:'none',borderRadius:'50%',width:16,height:16,fontSize:10,cursor:'pointer'}}>×</button>
          </div>)}
        </div>}
      </Field>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
        <Btn outline color="#888" onClick={()=>setShowForm(false)}>Cancelar</Btn>
        <Btn color="#378ADD" onClick={handleSubmit} disabled={saving}>{saving?'Subiendo y guardando...':(editId?'Guardar cambios':'Guardar mantenimiento')}</Btn>
      </div>
    </Modal>}
  </div>
}

/* ── Análisis ── */
function Analisis({diesel,tractores,mtto}){
  const [selected,setSelected]=useState(null)
  const stats=useMemo(()=>tractores.map(t=>{
    const regs=diesel.filter(r=>r.tractor_id===t.id)
    const mttos=mtto.filter(m=>m.tractor_id===t.id)
    const lts=regs.reduce((s,r)=>s+Number(r.litros),0)
    const hrs=regs.reduce((s,r)=>s+Number(r.horas||0),0)
    const has=regs.reduce((s,r)=>s+Number(r.hectareas||0),0)
    const acts={};regs.forEach(r=>{acts[r.actividad]=(acts[r.actividad]||0)+Number(r.litros)})
    const mainAct=Object.entries(acts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'
    return{...t,lts,hrs:+hrs.toFixed(1),has:+has.toFixed(1),lts_hr:hrs>0?+(lts/hrs).toFixed(1):0,lts_ha:has>0?+(lts/has).toFixed(1):0,mttoCount:mttos.length,costMtto:mttos.reduce((s,m)=>s+Number(m.mano_obra||0)+Number(m.refacciones||0),0),regs:regs.length,mainAct}
  }).filter(t=>t.regs>0),[diesel,tractores,mtto])
  const catColor=v=>v===0?'gray':v<15?'success':v<25?'info':'warning'
  const catLabel=v=>v===0?'Sin datos':v<15?'Eficiente':v<25?'Normal':'Alto consumo'
  const sel=selected?stats.find(t=>t.id===selected):null
  const selDiesel=selected?diesel.filter(r=>r.tractor_id===selected):[]
  const selMtto=selected?mtto.filter(m=>m.tractor_id===selected):[]
  return <div>
    <h2 style={{fontSize:18,fontWeight:600,margin:'0 0 16px'}}>Análisis por tractor</h2>
    {stats.length===0?<EmptyState msg="Sin datos suficientes para el análisis."/>:<>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:12,marginBottom:20}}>
        {stats.map(t=><div key={t.id} onClick={()=>setSelected(selected===t.id?null:t.id)} style={{background:'var(--bg)',borderRadius:12,padding:'14px 16px',cursor:'pointer',border:selected===t.id?'2px solid #1D9E75':'0.5px solid var(--border)',transition:'border-color 0.15s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
            <span style={{fontSize:17,fontWeight:700}}>{t.id}</span>
            <Badge color={catColor(t.lts_hr)}>{catLabel(t.lts_hr)}</Badge>
          </div>
          <div style={{marginBottom:8}}><Badge color="gray">{t.campo}</Badge></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            <div><p style={{fontSize:10,color:'var(--text3)',margin:0}}>Total lts</p><p style={{fontSize:15,fontWeight:700,margin:0,color:'#1D9E75'}}>{t.lts}</p></div>
            <div><p style={{fontSize:10,color:'var(--text3)',margin:0}}>Lts/hr</p><p style={{fontSize:15,fontWeight:700,margin:0,color:'#378ADD'}}>{t.lts_hr||'—'}</p></div>
            <div><p style={{fontSize:10,color:'var(--text3)',margin:0}}>Horas</p><p style={{fontSize:13,fontWeight:500,margin:0}}>{t.hrs}</p></div>
            <div><p style={{fontSize:10,color:'var(--text3)',margin:0}}>Lts/ha</p><p style={{fontSize:13,fontWeight:500,margin:0,color:'#534AB7'}}>{t.lts_ha||'—'}</p></div>
          </div>
          <p style={{margin:'8px 0 0',fontSize:12,color:'var(--text2)'}}>Actividad: <strong>{t.mainAct}</strong></p>
          {t.mttoCount>0&&<p style={{margin:'4px 0 0',fontSize:12,color:'var(--text2)'}}>Mttos: <strong>{t.mttoCount}</strong> · <strong style={{color:'#D85A30'}}>${t.costMtto.toLocaleString()}</strong></p>}
        </div>)}
      </div>
      {sel&&<Card title={`Detalle: ${sel.id} — ${sel.campo}`}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:16}}>
          <Stat label="Total litros" value={sel.lts} color="#1D9E75"/>
          <Stat label="Total horas" value={sel.hrs} color="#378ADD"/>
          <Stat label="Lts/hora" value={sel.lts_hr||'—'} color="#534AB7"/>
          <Stat label="Lts/hectárea" value={sel.lts_ha||'—'} color="#D85A30"/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div>
            <p style={{fontSize:13,fontWeight:600,margin:'0 0 10px'}}>Consumo registrado</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={selDiesel.map(r=>({fecha:r.fecha,lts:r.litros}))}>
                <XAxis dataKey="fecha" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/>
                <Tooltip formatter={v=>[`${v} lts`,'Diesel']}/>
                <Bar dataKey="lts" fill="#1D9E75" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p style={{fontSize:13,fontWeight:600,margin:'0 0 10px'}}>Mantenimientos</p>
            {selMtto.length===0?<p style={{fontSize:13,color:'var(--text3)'}}>Sin mantenimientos registrados</p>:
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {selMtto.map(m=><div key={m.id} style={{fontSize:12,padding:'8px 10px',background:'var(--bg2)',borderRadius:8}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                  <span style={{fontWeight:600}}>{m.descripcion}</span>
                  <Badge color={{Preventivo:'info',Correctivo:'warning',Emergencia:'danger'}[m.tipo]||'gray'}>{m.tipo}</Badge>
                </div>
                <span style={{color:'var(--text2)'}}>{m.fecha} · <strong>${(Number(m.mano_obra)+Number(m.refacciones)).toLocaleString()}</strong></span>
              </div>)}
            </div>}
          </div>
        </div>
      </Card>}
    </>}
  </div>
}

/* ── Autorizaciones ── */
function InformeImprimible({sol,tractor,onClose}){
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:2000,overflowY:'auto',padding:'24px 12px'}}>
    <div style={{maxWidth:760,margin:'0 auto',background:'#fff',borderRadius:8,padding:'40px 48px',color:'#1a1a18'}}>
      <div className="no-print" style={{display:'flex',justifyContent:'flex-end',gap:8,marginBottom:20}}>
        <button onClick={()=>window.print()} style={{padding:'8px 18px',borderRadius:8,background:'#378ADD',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:500}}>🖨️ Imprimir / Guardar PDF</button>
        <button onClick={onClose} style={{padding:'8px 18px',borderRadius:8,background:'none',border:'0.5px solid #ccc',cursor:'pointer',fontSize:13}}>Cerrar</button>
      </div>
      <div style={{textAlign:'center',marginBottom:24,borderBottom:'2px solid #1D9E75',paddingBottom:16}}>
        <h1 style={{fontSize:20,fontWeight:700,margin:'0 0 4px'}}>Solicitud de Autorización de Mantenimiento</h1>
        <p style={{fontSize:13,color:'#5F5E5A',margin:0}}>Grupo Molina · Flotilla de Tractores · Folio #{sol.id}</p>
      </div>
      <table style={{width:'100%',fontSize:13,borderCollapse:'collapse',marginBottom:20}}><tbody>
        <tr><td style={{padding:'6px 0',fontWeight:600,width:160}}>Fecha:</td><td>{sol.fecha}</td></tr>
        <tr><td style={{padding:'6px 0',fontWeight:600}}>Tractor:</td><td>{sol.tractor_id}{tractor?` — Campo ${tractor.campo}`:''}</td></tr>
        <tr><td style={{padding:'6px 0',fontWeight:600}}>Solicitado por:</td><td>{sol.solicitante||'—'}</td></tr>
        <tr><td style={{padding:'6px 0',fontWeight:600}}>Proveedor / Mecánico:</td><td>{sol.proveedor||'—'}</td></tr>
        <tr><td style={{padding:'6px 0',fontWeight:600}}>Costo estimado:</td><td>${Number(sol.costo_estimado||0).toLocaleString()}</td></tr>
        <tr><td style={{padding:'6px 0',fontWeight:600}}>Estado:</td><td><strong>{sol.estado}</strong></td></tr>
      </tbody></table>
      <div style={{marginBottom:20}}><p style={{fontWeight:600,fontSize:13,marginBottom:6}}>Descripción:</p><p style={{fontSize:13,background:'#f7f7f5',padding:'10px 12px',borderRadius:6}}>{sol.descripcion}</p></div>
      {sol.pieza_danada&&<div style={{marginBottom:20}}><p style={{fontWeight:600,fontSize:13,marginBottom:6}}>Pieza dañada:</p><p style={{fontSize:13,background:'#f7f7f5',padding:'10px 12px',borderRadius:6}}>{sol.pieza_danada}</p></div>}
      {sol.fotos?.length>0&&<div style={{marginBottom:20}}><p style={{fontWeight:600,fontSize:13,marginBottom:8}}>Evidencia fotográfica:</p><div style={{display:'flex',gap:10,flexWrap:'wrap'}}>{sol.fotos.map((url,i)=><img key={i} src={url} alt="" style={{width:150,height:110,objectFit:'cover',borderRadius:6,border:'1px solid #ddd'}}/>)}</div></div>}
      {sol.comentarios_contraloria&&<div style={{marginBottom:20}}><p style={{fontWeight:600,fontSize:13,marginBottom:6}}>Comentarios Contraloría:</p><p style={{fontSize:13,background:'#f7f7f5',padding:'10px 12px',borderRadius:6}}>{sol.comentarios_contraloria}</p></div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:30,marginTop:48,paddingTop:24,borderTop:'1px solid #ddd'}}>
        <div style={{textAlign:'center'}}><div style={{borderTop:'1px solid #333',marginTop:40,paddingTop:6,fontSize:12}}>Solicitante</div></div>
        <div style={{textAlign:'center'}}><div style={{borderTop:'1px solid #333',marginTop:40,paddingTop:6,fontSize:12}}>Autorizado por Contraloría{sol.autorizado_por?` — ${sol.autorizado_por}`:''}{sol.fecha_resolucion&&<div style={{color:'#888'}}>{sol.fecha_resolucion}</div>}</div></div>
      </div>
    </div>
  </div>
}

function Autorizaciones({autorizaciones,setAutorizaciones,tractores,loading,puedeEditar=true}){
  const [showForm,setShowForm]=useState(false)
  const [saving,setSaving]=useState(false)
  const [filterEstado,setFilterEstado]=useState('Todos')
  const [fotoPreviews,setFotoPreviews]=useState([])
  const [pendingFiles,setPendingFiles]=useState([])
  const [informeSol,setInformeSol]=useState(null)
  const [resolModal,setResolModal]=useState(null)
  const [comentario,setComentario]=useState('')
  const [autorizadoPor,setAutorizadoPor]=useState('')
  const emptyForm={fecha:new Date().toISOString().split('T')[0],tractor_id:'',solicitante:'',proveedor:'',descripcion:'',pieza_danada:'',costo_estimado:'',estado:'Pendiente'}
  const [form,setForm]=useState(emptyForm)
  const handleFotos=(e)=>{
    const files=Array.from(e.target.files)
    setFotoPreviews(p=>[...p,...files.map(f=>URL.createObjectURL(f))])
    setPendingFiles(p=>[...p,...files])
  }
  const handleSubmit=async()=>{
    if(!form.tractor_id||!form.descripcion||!form.proveedor){alert('Tractor, proveedor y descripción son obligatorios');return}
    setSaving(true)
    const uploadedUrls=pendingFiles.length>0?await uploadFotos(pendingFiles):[]
    const row={...form,costo_estimado:+form.costo_estimado||0,fotos:uploadedUrls}
    const {data,error}=await supabase.from('autorizaciones_mtto').insert([row]).select()
    if(error){alert('Error: '+error.message)}
    else{setAutorizaciones(a=>[data[0],...a]);setShowForm(false);setFotoPreviews([]);setPendingFiles([]);setForm(emptyForm)}
    setSaving(false)
  }
  const handleDelete=async(id)=>{
    if(!confirm('¿Eliminar esta solicitud?'))return
    await supabase.from('autorizaciones_mtto').delete().eq('id',id)
    setAutorizaciones(a=>a.filter(x=>x.id!==id))
  }
  const openResol=(sol,accion)=>{setResolModal({sol,accion});setComentario(sol.comentarios_contraloria||'');setAutorizadoPor(sol.autorizado_por||'')}
  const confirmResol=async()=>{
    const {sol,accion}=resolModal
    const nuevoEstado=accion==='autorizar'?'Autorizado':'Rechazado'
    const row={estado:nuevoEstado,comentarios_contraloria:comentario,autorizado_por:autorizadoPor,fecha_resolucion:new Date().toISOString().split('T')[0]}
    const {error}=await supabase.from('autorizaciones_mtto').update(row).eq('id',sol.id)
    if(error){alert('Error: '+error.message);return}
    setAutorizaciones(a=>a.map(x=>x.id===sol.id?{...x,...row}:x))
    setResolModal(null)
  }
  const estadoColor={Pendiente:'warning',Autorizado:'success',Rechazado:'danger'}
  const tractorMap=Object.fromEntries(tractores.map(t=>[t.id,t]))
  const rows=autorizaciones.filter(a=>filterEstado==='Todos'||a.estado===filterEstado)
  const pendientesCount=autorizaciones.filter(a=>a.estado==='Pendiente').length
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <div>
        <h2 style={{fontSize:18,fontWeight:600,margin:'0 0 2px'}}>Autorizaciones de mantenimiento</h2>
        <p style={{fontSize:12,color:'var(--text3)',margin:0}}>Solicitudes para Contraloría · {pendientesCount} pendiente{pendientesCount!==1?'s':''}</p>
      </div>
      {puedeEditar&&<Btn onClick={()=>setShowForm(true)} color="#534AB7">+ Nueva solicitud</Btn>}
    </div>
    <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
      {['Todos',...ESTADOS_AUTORIZACION].map(e=><button key={e} onClick={()=>setFilterEstado(e)} style={{padding:'6px 14px',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:500,border:filterEstado===e?'1.5px solid #534AB7':'0.5px solid var(--border)',background:filterEstado===e?'#EEEDFE':'transparent',color:filterEstado===e?'#3C3489':'var(--text2)'}}>{e}</button>)}
    </div>
    {loading?<Spinner/>:rows.length===0?<EmptyState msg="Sin solicitudes de autorización registradas."/>:
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {rows.map(sol=>{
        const tractor=tractorMap[sol.tractor_id]
        return <div key={sol.id} style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:12,padding:'14px 16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8,flexWrap:'wrap',gap:8}}>
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <span style={{fontSize:15,fontWeight:700}}>{sol.tractor_id}</span>
              {tractor&&<Badge color="gray">{tractor.campo}</Badge>}
              <Badge color={estadoColor[sol.estado]||'gray'}>{sol.estado}</Badge>
              <span style={{fontSize:11,color:'var(--text3)'}}>Folio #{sol.id}</span>
            </div>
            <div style={{display:'flex',gap:6}}>
              <button onClick={()=>setInformeSol(sol)} style={{fontSize:12,padding:'4px 10px',borderRadius:6,border:'0.5px solid var(--border2)',background:'none',cursor:'pointer',color:'var(--text2)'}}>📄 Ver informe</button>
              {puedeEditar&&<button onClick={()=>handleDelete(sol.id)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:16}}>🗑</button>}
            </div>
          </div>
          <p style={{margin:'0 0 6px',fontSize:14,fontWeight:500}}>{sol.descripcion}</p>
          {sol.pieza_danada&&<p style={{margin:'0 0 8px',fontSize:13,color:'var(--text2)'}}>🔩 {sol.pieza_danada}</p>}
          <div style={{display:'flex',gap:16,fontSize:13,color:'var(--text2)',flexWrap:'wrap'}}>
            <span>🏭 <strong style={{color:'var(--text)'}}>{sol.proveedor}</strong></span>
            <span>💵 <strong style={{color:'#534AB7'}}>${Number(sol.costo_estimado||0).toLocaleString()}</strong></span>
            {sol.solicitante&&<span>👤 {sol.solicitante}</span>}
            <span style={{color:'var(--text3)'}}>{sol.fecha}</span>
          </div>
          {sol.fotos?.length>0&&<div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>{sol.fotos.map((url,i)=><img key={i} src={url} alt="" style={{width:70,height:54,objectFit:'cover',borderRadius:6}}/>)}</div>}
          {sol.estado==='Pendiente'?(
            <div style={{display:'flex',gap:8,marginTop:12,paddingTop:12,borderTop:'0.5px solid var(--border)'}}>
              {puedeEditar&&<Btn color="#1D9E75" small onClick={()=>openResol(sol,'autorizar')}>✓ Autorizar (Contraloría)</Btn>}
              {puedeEditar&&<Btn color="#A32D2D" outline small onClick={()=>openResol(sol,'rechazar')}>✕ Rechazar</Btn>}
            </div>
          ):(
            <div style={{marginTop:10,paddingTop:10,borderTop:'0.5px solid var(--border)',fontSize:12,color:'var(--text2)'}}>
              {sol.estado==='Autorizado'?'✓ Autorizado':'✕ Rechazado'} por <strong>{sol.autorizado_por||'Contraloría'}</strong> el {sol.fecha_resolucion}
              {sol.comentarios_contraloria&&<div style={{marginTop:4,fontStyle:'italic'}}>"{sol.comentarios_contraloria}"</div>}
            </div>
          )}
        </div>
      })}
    </div>}
    {showForm&&<Modal title="Nueva solicitud de autorización" onClose={()=>setShowForm(false)} wide>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
        <Field label="Fecha"><input type="date" value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}/></Field>
        <Field label="Tractor *"><select value={form.tractor_id} onChange={e=>setForm(f=>({...f,tractor_id:e.target.value}))}><option value="">Seleccionar...</option>{tractores.map(t=><option key={t.id} value={t.id}>{t.id} — {t.campo}</option>)}</select></Field>
        <Field label="Solicitado por"><input type="text" placeholder="Nombre" value={form.solicitante} onChange={e=>setForm(f=>({...f,solicitante:e.target.value}))}/></Field>
        <Field label="Proveedor *"><input type="text" placeholder="Nombre del taller o mecánico" value={form.proveedor} onChange={e=>setForm(f=>({...f,proveedor:e.target.value}))}/></Field>
      </div>
      <Field label="Descripción *"><textarea value={form.descripcion} rows={3} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} style={{resize:'vertical'}}/></Field>
      <Field label="Pieza dañada"><textarea value={form.pieza_danada} rows={2} onChange={e=>setForm(f=>({...f,pieza_danada:e.target.value}))} style={{resize:'vertical'}}/></Field>
      <Field label="Costo estimado ($)"><input type="number" placeholder="0" value={form.costo_estimado} onChange={e=>setForm(f=>({...f,costo_estimado:e.target.value}))}/></Field>
      <Field label="📷 Fotos de la pieza dañada">
        <label style={{display:'inline-flex',alignItems:'center',gap:8,padding:'8px 16px',border:'1px dashed var(--border2)',borderRadius:8,cursor:'pointer',fontSize:13,color:'var(--text2)'}}>
          Subir fotos<input type="file" accept="image/*" multiple onChange={handleFotos} style={{display:'none'}}/>
        </label>
        {fotoPreviews.length>0&&<div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
          {fotoPreviews.map((url,i)=><div key={i} style={{position:'relative'}}>
            <img src={url} alt="" style={{width:72,height:56,objectFit:'cover',borderRadius:6}}/>
            <button onClick={()=>{setFotoPreviews(p=>p.filter((_,j)=>j!==i));setPendingFiles(p=>p.filter((_,j)=>j!==i))}} style={{position:'absolute',top:-4,right:-4,background:'#E24B4A',color:'#fff',border:'none',borderRadius:'50%',width:16,height:16,fontSize:10,cursor:'pointer'}}>×</button>
          </div>)}
        </div>}
      </Field>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
        <Btn outline color="#888" onClick={()=>setShowForm(false)}>Cancelar</Btn>
        <Btn color="#534AB7" onClick={handleSubmit} disabled={saving}>{saving?'Subiendo y enviando...':'Enviar solicitud'}</Btn>
      </div>
    </Modal>}
    {resolModal&&<Modal title={resolModal.accion==='autorizar'?'Autorizar solicitud':'Rechazar solicitud'} onClose={()=>setResolModal(null)}>
      <p style={{fontSize:13,color:'var(--text2)',marginBottom:14}}>Tractor <strong>{resolModal.sol.tractor_id}</strong> — {resolModal.sol.descripcion}</p>
      <Field label="Autorizado / Rechazado por"><input type="text" placeholder="Nombre de quien resuelve" value={autorizadoPor} onChange={e=>setAutorizadoPor(e.target.value)}/></Field>
      <Field label="Comentarios"><textarea rows={3} value={comentario} onChange={e=>setComentario(e.target.value)} style={{resize:'vertical'}}/></Field>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
        <Btn outline color="#888" onClick={()=>setResolModal(null)}>Cancelar</Btn>
        <Btn color={resolModal.accion==='autorizar'?'#1D9E75':'#A32D2D'} onClick={confirmResol}>{resolModal.accion==='autorizar'?'Confirmar autorización':'Confirmar rechazo'}</Btn>
      </div>
    </Modal>}
    {informeSol&&<InformeImprimible sol={informeSol} tractor={tractorMap[informeSol.tractor_id]} onClose={()=>setInformeSol(null)}/>}
  </div>
}

/* ── Ficha de tractor (historial completo) ── */
function FichaTractor({tractor, diesel, mtto, autorizaciones, onClose}){
  const [tab,setTab]=useState('diesel')
  const tDiesel=diesel.filter(r=>r.tractor_id===tractor.id).sort((a,b)=>b.fecha?.localeCompare(a.fecha))
  const tMtto=mtto.filter(m=>m.tractor_id===tractor.id).sort((a,b)=>b.fecha?.localeCompare(a.fecha))
  const tAuth=autorizaciones.filter(a=>a.tractor_id===tractor.id).sort((a,b)=>b.fecha?.localeCompare(a.fecha))
  const totalLts=tDiesel.reduce((s,r)=>s+Number(r.litros||0),0)
  const totalHrs=tDiesel.reduce((s,r)=>s+Number(r.horas||0),0)
  const totalHas=tDiesel.reduce((s,r)=>s+Number(r.hectareas||0),0)
  const totalMtto=tMtto.reduce((s,m)=>s+(+m.mano_obra||0)+(+m.refacciones||0),0)
  const totalMO=tMtto.reduce((s,m)=>s+(+m.mano_obra||0),0)
  const totalRef=tMtto.reduce((s,m)=>s+(+m.refacciones||0),0)
  const lts_hr=totalHrs>0?(totalLts/totalHrs).toFixed(2):'-'
  const lts_ha=totalHas>0?(totalLts/totalHas).toFixed(2):'-'
  const eColor={Completado:'success','En proceso':'warning',Pendiente:'info',Cancelado:'danger'}
  const tColor={Preventivo:'info',Correctivo:'warning',Emergencia:'danger'}
  const exportCSV=()=>{
    const rows=[
      ['DIESEL'],
      ['Fecha','Actividad','Litros','Horas','Hectáreas','Lts/Hr','Lts/Ha','Operador','Turno'],
      ...tDiesel.map(r=>[r.fecha,r.actividad,r.litros||0,r.horas||0,r.hectareas||0,r.horas>0?(r.litros/r.horas).toFixed(1):'',r.hectareas>0?(r.litros/r.hectareas).toFixed(1):'',r.operador||'',r.turno||'']),
      [],[`Total lts: ${totalLts}`,`Total hrs: ${totalHrs.toFixed(1)}`,`Lts/hr: ${lts_hr}`,`Lts/ha: ${lts_ha}`],
      [],['MANTENIMIENTOS'],
      ['Fecha','Tipo','Descripción','Mano de obra','Refacciones','Total','Técnico','Estado'],
      ...tMtto.map(m=>[m.fecha,m.tipo,`"${m.descripcion}"`,m.mano_obra||0,m.refacciones||0,(+m.mano_obra||0)+(+m.refacciones||0),m.tecnico||'',m.estado]),
      [],[`Total mantenimientos: $${totalMtto.toLocaleString()}`],
    ]
    const csv=rows.map(r=>r.join(',')).join('\n')
    const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a');a.href=url;a.download=`historial_${tractor.id}_${new Date().toISOString().split('T')[0]}.csv`;a.click()
    URL.revokeObjectURL(url)
  }
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,overflowY:'auto',padding:'20px 12px'}}>
    <div style={{maxWidth:960,margin:'0 auto',background:'var(--bg2)',borderRadius:14,overflow:'hidden',boxShadow:'0 8px 40px rgba(0,0,0,0.22)'}}>
      {/* Header */}
      <div style={{background:'var(--bg)',padding:'20px 24px',borderBottom:'0.5px solid var(--border)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:4}}>
              <h2 style={{fontSize:20,fontWeight:700,margin:0}}>{tractor.id}</h2>
              <Badge color={tractor.activo?'success':'gray'}>{tractor.activo?'Activo':'Inactivo'}</Badge>
            </div>
            <p style={{margin:'0 0 2px',fontSize:13,color:'var(--text2)'}}>
              {tractor.marca&&`${tractor.marca} ${tractor.modelo||''}`}{tractor.año&&` · ${tractor.año}`}
              {tractor.campo&&` · Campo ${tractor.campo}`}
              {tractor.operador&&` · 👤 ${tractor.operador}`}
            </p>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <button onClick={()=>window.print()} style={{padding:'8px 16px',borderRadius:8,background:'#378ADD',color:'#fff',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>🖨️ Imprimir</button>
            <button onClick={exportCSV} style={{padding:'8px 16px',borderRadius:8,background:'#1D9E75',color:'#fff',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>📥 Exportar CSV</button>
            <button onClick={onClose} style={{padding:'8px 16px',borderRadius:8,background:'none',border:'0.5px solid var(--border2)',fontSize:13,cursor:'pointer',color:'var(--text2)'}}>✕ Cerrar</button>
          </div>
        </div>
        {/* Totalizador */}
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:16}}>
          <div style={{background:'#E1F5EE',borderRadius:8,padding:'10px 16px',flex:1,minWidth:120,textAlign:'center'}}>
            <p style={{fontSize:11,color:'#0F6E56',margin:'0 0 2px',fontWeight:500}}>Total diesel</p>
            <p style={{fontSize:18,fontWeight:700,color:'#1D9E75',margin:0}}>{totalLts.toLocaleString()} lts</p>
            <p style={{fontSize:10,color:'#1D9E75',margin:0}}>{tDiesel.length} registros</p>
          </div>
          <div style={{background:'#E6F1FB',borderRadius:8,padding:'10px 16px',flex:1,minWidth:120,textAlign:'center'}}>
            <p style={{fontSize:11,color:'#185FA5',margin:'0 0 2px',fontWeight:500}}>Rendimiento</p>
            <p style={{fontSize:18,fontWeight:700,color:'#378ADD',margin:0}}>{lts_hr} lts/hr</p>
            <p style={{fontSize:10,color:'#378ADD',margin:0}}>{lts_ha} lts/ha</p>
          </div>
          <div style={{background:'#FAEEDA',borderRadius:8,padding:'10px 16px',flex:1,minWidth:120,textAlign:'center'}}>
            <p style={{fontSize:11,color:'#854F0B',margin:'0 0 2px',fontWeight:500}}>Mantenimientos</p>
            <p style={{fontSize:18,fontWeight:700,color:'#BA7517',margin:0}}>${totalMtto.toLocaleString()}</p>
            <p style={{fontSize:10,color:'#BA7517',margin:0}}>{tMtto.length} registros</p>
          </div>
          <div style={{background:'#EEEDFE',borderRadius:8,padding:'10px 16px',flex:1,minWidth:120,textAlign:'center'}}>
            <p style={{fontSize:11,color:'#3C3489',margin:'0 0 2px',fontWeight:500}}>Horas trabajadas</p>
            <p style={{fontSize:18,fontWeight:700,color:'#534AB7',margin:0}}>{totalHrs.toFixed(0)} hrs</p>
            <p style={{fontSize:10,color:'#534AB7',margin:0}}>{totalHas.toFixed(1)} ha</p>
          </div>
        </div>
        {tMtto.length>0&&<div style={{display:'flex',gap:16,marginTop:10,fontSize:12,color:'var(--text2)'}}>
          <span>Mano de obra: <strong style={{color:'#1D9E75'}}>${totalMO.toLocaleString()}</strong></span>
          <span>Refacciones: <strong style={{color:'#D85A30'}}>${totalRef.toLocaleString()}</strong></span>
        </div>}
      </div>
      {/* Tabs */}
      <div style={{background:'var(--bg)',borderBottom:'0.5px solid var(--border)',display:'flex'}}>
        {[
          {id:'diesel',label:`⛽ Diesel (${tDiesel.length})`},
          {id:'mtto',label:`🔧 Mantenimientos (${tMtto.length})`},
          {id:'auth',label:`📋 Autorizaciones (${tAuth.length})`},
        ].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'11px 18px',background:'none',border:'none',borderBottom:tab===t.id?'2px solid #1D9E75':'2px solid transparent',color:tab===t.id?'#0F6E56':'var(--text2)',fontWeight:tab===t.id?600:400,fontSize:13,cursor:'pointer'}}>{t.label}</button>)}
      </div>
      {/* Content */}
      <div style={{padding:'20px 24px'}}>
        {/* DIESEL */}
        {tab==='diesel'&&(tDiesel.length===0?<EmptyState msg="Sin registros de diesel."/>:
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead><tr style={{borderBottom:'0.5px solid var(--border)',background:'var(--bg2)'}}>
                {['Fecha','Actividad','Litros','Horas','Hect.','Lts/Hr','Lts/Ha','Operador','Turno'].map(h=><th key={h} style={{padding:'7px 10px',textAlign:'left',fontWeight:500,color:'var(--text2)',whiteSpace:'nowrap'}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {tDiesel.map(r=>{
                  const lhr=r.horas>0?(r.litros/r.horas).toFixed(1):'-'
                  const lha=r.hectareas>0?(r.litros/r.hectareas).toFixed(1):'-'
                  return <tr key={r.id} style={{borderBottom:'0.5px solid var(--border)'}}>
                    <td style={{padding:'7px 10px',whiteSpace:'nowrap'}}>{r.fecha}</td>
                    <td style={{padding:'7px 10px'}}>{r.actividad}</td>
                    <td style={{padding:'7px 10px',fontWeight:600,color:'#1D9E75'}}>{r.litros} lts</td>
                    <td style={{padding:'7px 10px'}}>{r.horas||'-'}</td>
                    <td style={{padding:'7px 10px'}}>{r.hectareas||'-'}</td>
                    <td style={{padding:'7px 10px',color:'#378ADD',fontWeight:500}}>{lhr}</td>
                    <td style={{padding:'7px 10px',color:'#534AB7',fontWeight:500}}>{lha}</td>
                    <td style={{padding:'7px 10px',color:'var(--text2)'}}>{r.operador||'-'}</td>
                    <td style={{padding:'7px 10px'}}>{r.turno||'-'}</td>
                  </tr>
                })}
                <tr style={{borderTop:'1.5px solid var(--border)',background:'var(--bg2)'}}>
                  <td colSpan={2} style={{padding:'7px 10px',fontWeight:600,fontSize:12}}>TOTALES</td>
                  <td style={{padding:'7px 10px',fontWeight:700,color:'#1D9E75'}}>{totalLts} lts</td>
                  <td style={{padding:'7px 10px',fontWeight:700,color:'#378ADD'}}>{totalHrs.toFixed(1)} hrs</td>
                  <td style={{padding:'7px 10px',fontWeight:700,color:'#534AB7'}}>{totalHas.toFixed(1)} ha</td>
                  <td style={{padding:'7px 10px',fontWeight:700,color:'#378ADD'}}>{lts_hr}</td>
                  <td style={{padding:'7px 10px',fontWeight:700,color:'#534AB7'}}>{lts_ha}</td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {/* MANTENIMIENTOS */}
        {tab==='mtto'&&(tMtto.length===0?<EmptyState msg="Sin mantenimientos registrados."/>:
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {tMtto.map(m=><div key={m.id} style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:10,padding:'12px 14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6,flexWrap:'wrap',gap:6}}>
                <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                  <Badge color={tColor[m.tipo]||'gray'}>{m.tipo}</Badge>
                  <Badge color={eColor[m.estado]||'gray'}>{m.estado}</Badge>
                  <span style={{fontSize:12,color:'var(--text3)'}}>{m.fecha}</span>
                </div>
                <strong style={{color:'#378ADD',fontSize:14}}>${((+m.mano_obra||0)+(+m.refacciones||0)).toLocaleString()}</strong>
              </div>
              <p style={{margin:'0 0 4px',fontSize:13,fontWeight:500}}>{m.descripcion}</p>
              {m.observaciones&&<p style={{margin:'0 0 6px',fontSize:12,color:'var(--text2)'}}>{m.observaciones}</p>}
              <div style={{display:'flex',gap:14,fontSize:12,color:'var(--text2)',flexWrap:'wrap'}}>
                {m.tecnico&&<span>🔧 {m.tecnico}</span>}
                <span>💵 M.O.: <strong style={{color:'#1D9E75'}}>${Number(m.mano_obra||0).toLocaleString()}</strong></span>
                <span>🔩 Ref.: <strong style={{color:'#D85A30'}}>${Number(m.refacciones||0).toLocaleString()}</strong></span>
              </div>
              {m.fotos?.length>0&&<div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                {m.fotos.map((url,i)=><img key={i} src={url} alt="" style={{width:64,height:50,objectFit:'cover',borderRadius:5,border:'0.5px solid var(--border)'}}/>)}
              </div>}
            </div>)}
            <div style={{background:'var(--bg2)',borderRadius:8,padding:'10px 14px',fontSize:13}}>
              Total mantenimientos: <strong style={{color:'#1D9E75'}}>${totalMtto.toLocaleString()}</strong>
              <span style={{margin:'0 12px',color:'var(--text3)'}}>·</span>
              M.O.: <strong>${totalMO.toLocaleString()}</strong>
              <span style={{margin:'0 12px',color:'var(--text3)'}}>·</span>
              Refacciones: <strong>${totalRef.toLocaleString()}</strong>
            </div>
          </div>
        )}
        {/* AUTORIZACIONES */}
        {tab==='auth'&&(tAuth.length===0?<EmptyState msg="Sin solicitudes de autorización."/>:
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {tAuth.map(a=><div key={a.id} style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:10,padding:'12px 14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,flexWrap:'wrap',gap:6}}>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <Badge color={{Pendiente:'warning',Autorizado:'success',Rechazado:'danger'}[a.estado]||'gray'}>{a.estado}</Badge>
                  <span style={{fontSize:12,color:'var(--text3)'}}>{a.fecha} · Folio #{a.id}</span>
                </div>
                <strong style={{color:'#534AB7'}}>${Number(a.costo_estimado||0).toLocaleString()}</strong>
              </div>
              <p style={{margin:'0 0 4px',fontSize:13,fontWeight:500}}>{a.descripcion}</p>
              <div style={{fontSize:12,color:'var(--text2)'}}>🏭 {a.proveedor}{a.solicitante&&` · 👤 ${a.solicitante}`}</div>
              {a.comentarios_contraloria&&<p style={{margin:'6px 0 0',fontSize:12,color:'var(--text2)',fontStyle:'italic'}}>"{a.comentarios_contraloria}" — {a.autorizado_por}</p>}
            </div>)}
          </div>
        )}
      </div>
    </div>
  </div>
}

/* ── Actividades diarias (Reporte de Maquinaria) ── */
function Actividades({actividades,setActividades,tractores,loading,puedeEditar=true}){
  const [showForm,setShowForm]=useState(false)
  const [saving,setSaving]=useState(false)
  const [vista,setVista]=useState('registros') // registros | reporte
  // Filtros
  const [filterCampo,setFilterCampo]=useState('Todos')
  const [filterTractor,setFilterTractor]=useState('Todos')
  const [filterActividad,setFilterActividad]=useState('Todos')
  const [filterCultivo,setFilterCultivo]=useState('Todos')
  const [filterDesde,setFilterDesde]=useState('')
  const [filterHasta,setFilterHasta]=useState('')
  const [filterTurno,setFilterTurno]=useState('Todos')

  const emptyForm={
    fecha:new Date().toISOString().split('T')[0],
    campo:'',tractor_id:'',actividad:'',actividad_otro:'',
    cultivo:'Uva',cuadro:'',malla:'',
    operador:'',turno:'DIA',observaciones:''
  }
  const [form,setForm]=useState(emptyForm)

  const handleSubmit=async()=>{
    if(!form.campo||!form.tractor_id||!form.actividad||!form.operador){
      alert('Campo, tractor, actividad y operador son obligatorios');return
    }
    if(form.actividad==='Otro'&&!form.actividad_otro){
      alert('Por favor especifica la actividad');return
    }
    setSaving(true)
    const rowData={...form, actividad: form.actividad==='Otro'?`Otro: ${form.actividad_otro}`:form.actividad}
    const {data,error}=await supabase.from('actividades_diarias').insert([rowData]).select()
    if(error){alert('Error: '+error.message)}
    else{setActividades(a=>[data[0],...a]);setShowForm(false);setForm(emptyForm)}
    setSaving(false)
  }

  const handleDelete=async(id)=>{
    if(!confirm('¿Eliminar este registro?'))return
    await supabase.from('actividades_diarias').delete().eq('id',id)
    setActividades(a=>a.filter(x=>x.id!==id))
  }

  const ids=[...new Set(tractores.map(t=>t.id))].sort()

  const rows=useMemo(()=>actividades.filter(r=>{
    if(filterCampo!=='Todos'&&r.campo!==filterCampo) return false
    if(filterTractor!=='Todos'&&r.tractor_id!==filterTractor) return false
    if(filterActividad!=='Todos'&&r.actividad!==filterActividad) return false
    if(filterCultivo!=='Todos'&&r.cultivo!==filterCultivo) return false
    if(filterTurno!=='Todos'&&r.turno!==filterTurno) return false
    if(filterDesde&&r.fecha<filterDesde) return false
    if(filterHasta&&r.fecha>filterHasta) return false
    return true
  }),[actividades,filterCampo,filterTractor,filterActividad,filterCultivo,filterTurno,filterDesde,filterHasta])

  const hayFiltros=filterCampo!=='Todos'||filterTractor!=='Todos'||filterActividad!=='Todos'||filterCultivo!=='Todos'||filterTurno!=='Todos'||filterDesde||filterHasta
  const limpiar=()=>{setFilterCampo('Todos');setFilterTractor('Todos');setFilterActividad('Todos');setFilterCultivo('Todos');setFilterTurno('Todos');setFilterDesde('');setFilterHasta('')}

  // Reporte agrupado por campo+fecha
  const reporteAgrupado=useMemo(()=>{
    const m={}
    rows.forEach(r=>{
      const k=`${r.campo}||${r.fecha}`
      if(!m[k])m[k]={campo:r.campo,fecha:r.fecha,registros:[]}
      m[k].registros.push(r)
    })
    return Object.values(m).sort((a,b)=>b.fecha.localeCompare(a.fecha)||a.campo.localeCompare(b.campo))
  },[rows])

  const exportCSV=()=>{
    const header=['Fecha','Campo','Tractor','Actividad','Cultivo','Cuadro/Malla','Malla','Operador','Turno','Observaciones']
    const data=rows.map(r=>[r.fecha,r.campo,r.tractor_id,r.actividad,r.cultivo,r.cuadro||'',r.malla||'',r.operador,r.turno,`"${r.observaciones||''}"`])
    const csv=[[...header],...data].map(r=>r.join(',')).join('\n')
    const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a');a.href=url;a.download=`actividades_${new Date().toISOString().split('T')[0]}.csv`;a.click()
    URL.revokeObjectURL(url)
  }

  const cultivoColor={Uva:'purple',Hortaliza:'success',Pepino:'info',Tomate:'danger',Otro:'gray'}

  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <div>
        <h2 style={{fontSize:18,fontWeight:600,margin:'0 0 2px'}}>Actividades diarias</h2>
        <p style={{fontSize:12,color:'var(--text3)',margin:0}}>{rows.length} registros</p>
      </div>
      <div style={{display:'flex',gap:8}}>
        <button onClick={()=>window.print()} style={{padding:'7px 14px',borderRadius:8,background:'#378ADD',color:'#fff',border:'none',fontSize:12,cursor:'pointer',fontWeight:500}}>🖨️ Imprimir</button>
        <button onClick={exportCSV} style={{padding:'7px 14px',borderRadius:8,background:'#1D9E75',color:'#fff',border:'none',fontSize:12,cursor:'pointer',fontWeight:500}}>📥 CSV</button>
        {puedeEditar&&<Btn onClick={()=>setShowForm(true)} color="#BA7517">+ Nuevo registro</Btn>}
      </div>
    </div>

    {/* Vista tabs */}
    <div style={{display:'flex',gap:0,marginBottom:14,borderBottom:'0.5px solid var(--border)'}}>
      {[{id:'registros',label:'📋 Lista de registros'},{id:'reporte',label:'📊 Vista de reporte'}].map(v=>(
        <button key={v.id} onClick={()=>setVista(v.id)} style={{padding:'8px 16px',background:'none',border:'none',borderBottom:vista===v.id?'2px solid #BA7517':'2px solid transparent',color:vista===v.id?'#854F0B':'var(--text2)',fontWeight:vista===v.id?600:400,fontSize:13,cursor:'pointer'}}>{v.label}</button>
      ))}
    </div>

    {/* Filtros */}
    <div style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:10,padding:'12px 14px',marginBottom:14,display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end'}}>
      {[
        {label:'Campo',val:filterCampo,set:setFilterCampo,opts:['Todos',...CAMPOS]},
        {label:'Tractor',val:filterTractor,set:setFilterTractor,opts:['Todos',...ids]},
        {label:'Actividad',val:filterActividad,set:setFilterActividad,opts:['Todos',...ACTIVIDADES_CAMPO]},
        {label:'Cultivo',val:filterCultivo,set:setFilterCultivo,opts:['Todos',...CULTIVOS]},
        {label:'Turno',val:filterTurno,set:setFilterTurno,opts:['Todos','DIA','NOCHE']},
      ].map(f=><div key={f.label} style={{display:'flex',flexDirection:'column',gap:3}}>
        <label style={{fontSize:11,color:'var(--text3)'}}>{f.label}</label>
        <select value={f.val} onChange={e=>f.set(e.target.value)} style={{width:'auto',padding:'6px 10px',fontSize:12}}>
          {f.opts.map(o=><option key={o}>{o}</option>)}
        </select>
      </div>)}
      <div style={{display:'flex',flexDirection:'column',gap:3}}>
        <label style={{fontSize:11,color:'var(--text3)'}}>Desde</label>
        <input type="date" value={filterDesde} onChange={e=>setFilterDesde(e.target.value)} style={{width:'auto',padding:'6px 10px',fontSize:12}}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:3}}>
        <label style={{fontSize:11,color:'var(--text3)'}}>Hasta</label>
        <input type="date" value={filterHasta} onChange={e=>setFilterHasta(e.target.value)} style={{width:'auto',padding:'6px 10px',fontSize:12}}/>
      </div>
      {hayFiltros&&<button onClick={limpiar} style={{alignSelf:'flex-end',padding:'6px 12px',borderRadius:6,border:'0.5px solid var(--border2)',background:'none',fontSize:12,cursor:'pointer',color:'var(--text2)'}}>✕ Limpiar</button>}
    </div>

    {loading?<Spinner/>:rows.length===0?<EmptyState msg="Sin actividades registradas con los filtros seleccionados."/>:<>

      {/* Vista Lista */}
      {vista==='registros'&&<div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr style={{borderBottom:'0.5px solid var(--border)',background:'var(--bg2)'}}>
            {['Fecha','Tractor','Campo','Actividad','Cultivo','Cuadro','Malla','Operador','Turno',''].map(h=>(
              <th key={h} style={{padding:'8px 10px',textAlign:'left',fontWeight:500,color:'var(--text2)',whiteSpace:'nowrap'}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map(r=><tr key={r.id} style={{borderBottom:'0.5px solid var(--border)'}}>
              <td style={{padding:'8px 10px',whiteSpace:'nowrap',fontWeight:500}}>{r.fecha}</td>
              <td style={{padding:'8px 10px',fontWeight:700,color:'#1D9E75'}}>{r.tractor_id}</td>
              <td style={{padding:'8px 10px'}}><Badge color="info">{r.campo}</Badge></td>
              <td style={{padding:'8px 10px'}}>{r.actividad}</td>
              <td style={{padding:'8px 10px'}}><Badge color={cultivoColor[r.cultivo]||'gray'}>{r.cultivo}</Badge></td>
              <td style={{padding:'8px 10px',color:'var(--text2)'}}>{r.cuadro||'—'}</td>
              <td style={{padding:'8px 10px',color:'var(--text2)'}}>{r.malla||'—'}</td>
              <td style={{padding:'8px 10px'}}>{r.operador}</td>
              <td style={{padding:'8px 10px'}}><Badge color={r.turno==='DIA'?'warning':'gray'}>{r.turno}</Badge></td>
              <td style={{padding:'8px 10px'}}>
                {puedeEditar&&<button onClick={()=>handleDelete(r.id)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:16}}>🗑</button>}
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>}

      {/* Vista Reporte — agrupado por campo y fecha como el formato */}
      {vista==='reporte'&&<div style={{display:'flex',flexDirection:'column',gap:20}}>
        {reporteAgrupado.map(grupo=>(
          <div key={grupo.campo+grupo.fecha} style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
            {/* Header del reporte */}
            <div style={{background:'#1D9E75',padding:'10px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <span style={{color:'#fff',fontWeight:700,fontSize:15}}>MOLINA GROUP — Reporte de Actividades</span>
              </div>
              <div style={{display:'flex',gap:16,fontSize:12,color:'rgba(255,255,255,0.9)'}}>
                <span>📍 Campo: <strong>{grupo.campo}</strong></span>
                <span>📅 {grupo.fecha}</span>
                <span>🌾 {grupo.registros.length} actividades</span>
              </div>
            </div>
            {/* Tabla del grupo */}
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead><tr style={{borderBottom:'0.5px solid var(--border)',background:'var(--bg2)'}}>
                  <th style={{padding:'7px 10px',textAlign:'center',fontWeight:500,color:'var(--text2)',width:30}}>#</th>
                  <th style={{padding:'7px 10px',textAlign:'left',fontWeight:500,color:'var(--text2)',whiteSpace:'nowrap'}}>Unidad</th>
                  <th style={{padding:'7px 10px',textAlign:'left',fontWeight:500,color:'var(--text2)'}}>Actividad</th>
                  <th style={{padding:'7px 10px',textAlign:'center',fontWeight:500,color:'var(--text2)'}}>Cultivo</th>
                  <th style={{padding:'7px 10px',textAlign:'center',fontWeight:500,color:'var(--text2)'}}>Cuadro</th>
                  <th style={{padding:'7px 10px',textAlign:'center',fontWeight:500,color:'var(--text2)'}}>Malla</th>
                  <th style={{padding:'7px 10px',textAlign:'left',fontWeight:500,color:'var(--text2)'}}>Operador</th>
                  <th style={{padding:'7px 10px',textAlign:'center',fontWeight:500,color:'var(--text2)'}}>Turno</th>
                </tr></thead>
                <tbody>
                  {grupo.registros.map((r,i)=><tr key={r.id} style={{borderBottom:'0.5px solid var(--border)',background:i%2===0?'#fff':'var(--bg2)'}}>
                    <td style={{padding:'7px 10px',textAlign:'center',color:'var(--text3)',fontWeight:600}}>{i+1}</td>
                    <td style={{padding:'7px 10px',fontWeight:700,color:'#1D9E75'}}>{r.tractor_id}</td>
                    <td style={{padding:'7px 10px',fontWeight:500}}>{r.actividad}</td>
                    <td style={{padding:'7px 10px',textAlign:'center'}}><Badge color={cultivoColor[r.cultivo]||'gray'}>{r.cultivo}</Badge></td>
                    <td style={{padding:'7px 10px',textAlign:'center',color:'var(--text2)'}}>{r.cuadro||'—'}</td>
                    <td style={{padding:'7px 10px',textAlign:'center',color:'var(--text2)'}}>{r.malla||'—'}</td>
                    <td style={{padding:'7px 10px'}}>{r.operador}</td>
                    <td style={{padding:'7px 10px',textAlign:'center'}}><Badge color={r.turno==='DIA'?'warning':'gray'}>{r.turno}</Badge></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            {/* Observaciones del grupo si hay */}
            {grupo.registros.some(r=>r.observaciones)&&(
              <div style={{padding:'8px 16px',borderTop:'0.5px solid var(--border)',fontSize:12,color:'var(--text2)'}}>
                <strong>Observaciones:</strong> {grupo.registros.filter(r=>r.observaciones).map(r=>r.observaciones).join(' · ')}
              </div>
            )}
          </div>
        ))}
      </div>}
    </>}

    {/* Formulario nuevo registro */}
    {showForm&&<Modal title="Nueva actividad" onClose={()=>setShowForm(false)} wide>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
        <Field label="Fecha *"><input type="date" value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}/></Field>
        <Field label="Turno">
          <select value={form.turno} onChange={e=>setForm(f=>({...f,turno:e.target.value}))}>
            {TURNOS.map(t=><option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Campo *">
          <select value={form.campo} onChange={e=>{
            setForm(f=>({...f,campo:e.target.value,tractor_id:''}))
          }}>
            <option value="">Seleccionar...</option>
            {CAMPOS.map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Tractor / Unidad *">
          <select value={form.tractor_id} onChange={e=>{
            const t=tractores.find(x=>x.id===e.target.value)
            setForm(f=>({...f,tractor_id:e.target.value,operador:t?.operador||f.operador}))
          }}>
            <option value="">Seleccionar...</option>
            {(form.campo?tractores.filter(t=>t.campo===form.campo):tractores).map(t=>(
              <option key={t.id} value={t.id}>{t.id}{t.marca?` — ${t.marca}`:''}</option>
            ))}
          </select>
        </Field>
        <Field label="Actividad *">
          <select value={form.actividad} onChange={e=>setForm(f=>({...f,actividad:e.target.value,actividad_otro:''}))}>
            <option value="">Seleccionar...</option>
            {ACTIVIDADES_CAMPO.map(a=><option key={a}>{a}</option>)}
          </select>
        </Field>
        {form.actividad==='Otro'&&<Field label="Especifica la actividad *">
          <input type="text" placeholder="Describe la actividad..." value={form.actividad_otro} onChange={e=>setForm(f=>({...f,actividad_otro:e.target.value}))} autoFocus/>
        </Field>}
        <Field label="Cultivo">
          <select value={form.cultivo} onChange={e=>setForm(f=>({...f,cultivo:e.target.value}))}>
            {CULTIVOS.map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Cuadro"><input type="text" placeholder="Ej: 6-8, 58-59" value={form.cuadro} onChange={e=>setForm(f=>({...f,cuadro:e.target.value}))}/></Field>
        <Field label="Malla"><input type="text" placeholder="Ej: S1, 27, 20-18" value={form.malla} onChange={e=>setForm(f=>({...f,malla:e.target.value}))}/></Field>
      </div>
      <Field label="Operador *"><input type="text" placeholder="Nombre del operador" value={form.operador} onChange={e=>setForm(f=>({...f,operador:e.target.value}))}/></Field>
      <Field label="Observaciones"><textarea value={form.observaciones} rows={2} onChange={e=>setForm(f=>({...f,observaciones:e.target.value}))} style={{resize:'vertical'}} placeholder="Observaciones adicionales..."/></Field>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
        <Btn outline color="#888" onClick={()=>setShowForm(false)}>Cancelar</Btn>
        <Btn color="#BA7517" onClick={handleSubmit} disabled={saving}>{saving?'Guardando...':'Guardar registro'}</Btn>
      </div>
    </Modal>}
  </div>
}

/* ── Códigos QR para tractores ── */
function QRCodes({tractores}){
  const [filterCampo,setFilterCampo]=useState('Todos')
  const BASE_URL=window.location.origin
  const rows=tractores.filter(t=>filterCampo==='Todos'||t.campo===filterCampo)
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <div>
        <h2 style={{fontSize:18,fontWeight:600,margin:'0 0 2px'}}>Códigos QR — Tractores</h2>
        <p style={{fontSize:12,color:'var(--text3)',margin:0}}>Escanea para abrir el registro de diesel con el tractor preseleccionado</p>
      </div>
      <button onClick={()=>window.print()} style={{padding:'8px 18px',borderRadius:8,background:'#378ADD',color:'#fff',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>🖨️ Imprimir todos</button>
    </div>
    <div style={{display:'flex',gap:10,marginBottom:16}}>
      <select value={filterCampo} onChange={e=>setFilterCampo(e.target.value)} style={{width:'auto',padding:'7px 12px'}}>
        <option>Todos</option>{CAMPOS.map(c=><option key={c}>{c}</option>)}
      </select>
      <span style={{fontSize:12,color:'var(--text3)',alignSelf:'center'}}>{rows.length} tractores</span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:16}}>
      {rows.map(t=>{
        const qrUrl=`${BASE_URL}?tractor=${t.id}&accion=diesel`
        const imgUrl=`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrUrl)}&margin=4`
        return <div key={t.id} style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:10,padding:16,textAlign:'center',pageBreakInside:'avoid'}}>
          <img src={imgUrl} alt={`QR ${t.id}`} width={140} height={140} style={{borderRadius:6,display:'block',margin:'0 auto'}}/>
          <div style={{marginTop:10}}>
            <p style={{fontWeight:700,fontSize:16,margin:'0 0 2px'}}>{t.id}</p>
            {t.marca&&<p style={{fontSize:11,color:'var(--text2)',margin:'0 0 2px'}}>{t.marca} {t.modelo}</p>}
            <p style={{fontSize:10,color:'var(--text3)',margin:0}}>{t.campo}</p>
          </div>
        </div>
      })}
    </div>
  </div>
}

/* ── Flotilla ── */
function Flotilla({tractores,setTractores,diesel,mtto,autorizaciones,loading,puedeEditar=true}){
  const [showForm,setShowForm]=useState(false)
  const [saving,setSaving]=useState(false)
  const emptyTractor={id:'',campo:CAMPOS[0],operador:'',marca:'',modelo:'',año:'',horometro:'',activo:true}
  const [form,setForm]=useState(emptyTractor)
  const [nuevoCampo,setNuevoCampo]=useState(false)
  const [campoTxt,setCampoTxt]=useState('')
  const [fichaTractor,setFichaTractor]=useState(null)
  const handleSubmit=async()=>{
    if(!form.id){alert('El número económico es obligatorio');return}
    let campo=form.campo
    if(nuevoCampo){
      campo=campoTxt.trim()
      if(!campo){alert('Escribe el nombre del nuevo campo (ej. MJ9)');return}
      const ya=CAMPOS.find(c=>c.toLowerCase()===campo.toLowerCase())
      if(ya) campo=ya
    }
    setSaving(true)
    const {data,error}=await supabase.from('tractores').insert([{...form,campo,año:+form.año||null,horometro:+form.horometro||null}]).select()
    if(error){alert('Error: '+error.message)}
    else{setTractores(t=>[...t,data[0]]);setShowForm(false);setForm({...emptyTractor,campo:CAMPOS[0]});setNuevoCampo(false);setCampoTxt('')}
    setSaving(false)
  }
  const toggleActivo=async(id,activo)=>{
    await supabase.from('tractores').update({activo:!activo}).eq('id',id)
    setTractores(ts=>ts.map(t=>t.id===id?{...t,activo:!activo}:t))
  }
  const handleDelete=async(id)=>{
    if(!confirm('¿Eliminar este tractor?'))return
    await supabase.from('tractores').delete().eq('id',id)
    setTractores(ts=>ts.filter(t=>t.id!==id))
  }
  const byCampo=CAMPOS.reduce((m,c)=>{m[c]=tractores.filter(t=>t.campo===c);return m},{})
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <h2 style={{fontSize:18,fontWeight:600,margin:0}}>Flotilla de tractores</h2>
      {puedeEditar&&<Btn onClick={()=>setShowForm(true)} color="#534AB7">+ Agregar tractor</Btn>}
    </div>
    {loading?<Spinner/>:<div style={{display:'flex',flexDirection:'column',gap:20}}>
      {CAMPOS.filter(c=>byCampo[c]?.length>0).map(campo=><div key={campo}>
        <p style={{fontSize:13,fontWeight:600,color:CAMPO_COLORS[campo]||'#888',marginBottom:10}}>{campo} <span style={{fontWeight:400,color:'var(--text3)',fontSize:12}}>({byCampo[campo].length} tractores)</span></p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
          {byCampo[campo].map(t=>{
            const tMttoCount=mtto.filter(m=>m.tractor_id===t.id).length
            const tCostMtto=mtto.filter(m=>m.tractor_id===t.id).reduce((s,m)=>s+(+m.mano_obra||0)+(+m.refacciones||0),0)
            const tLts=diesel.filter(r=>r.tractor_id===t.id).reduce((s,r)=>s+Number(r.litros||0),0)
            return <div key={t.id}
              onClick={()=>setFichaTractor(t)}
              style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:10,padding:'12px 14px',opacity:t.activo?1:0.65,cursor:'pointer',transition:'box-shadow 0.15s,border-color 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.10)';e.currentTarget.style.borderColor='#1D9E75'}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor='rgba(0,0,0,0.1)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:16,fontWeight:700}}>{t.id}</span>
                <Badge color={t.activo?'success':'gray'}>{t.activo?'Activo':'Inactivo'}</Badge>
              </div>
              {t.marca&&<p style={{margin:'0 0 2px',fontSize:12,color:'var(--text2)'}}>{t.marca} {t.modelo} {t.año&&`(${t.año})`}</p>}
              {t.operador&&<p style={{margin:'0 0 6px',fontSize:11,color:'var(--text3)'}}>👤 {t.operador}</p>}
              {tLts>0&&<div style={{marginBottom:6,padding:'3px 8px',background:'#E1F5EE',borderRadius:6,fontSize:11,color:'#0F6E56'}}>⛽ {tLts.toLocaleString()} lts registrados</div>}
              {tMttoCount>0&&<div style={{marginBottom:8,padding:'3px 8px',background:'#EAF3FB',borderRadius:6,fontSize:11,color:'#185FA5'}}>🔧 {tMttoCount} mtto{tMttoCount!==1?'s':''} · <strong>${tCostMtto.toLocaleString()}</strong></div>}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:11,color:'#1D9E75',fontWeight:500}}>Ver historial →</span>
                <div style={{display:'flex',gap:4}} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>toggleActivo(t.id,t.activo)} style={{fontSize:10,padding:'2px 6px',borderRadius:5,border:'0.5px solid var(--border2)',background:'none',cursor:'pointer',color:'var(--text2)'}}>{t.activo?'Desactivar':'Activar'}</button>
                  <button onClick={()=>handleDelete(t.id)} style={{fontSize:10,padding:'2px 6px',borderRadius:5,border:'0.5px solid var(--border2)',background:'none',cursor:'pointer',color:'#A32D2D'}}>Eliminar</button>
                </div>
              </div>
            </div>
          })}
        </div>
      </div>)}
      {tractores.length===0&&<EmptyState msg="Sin tractores registrados. Agrega el primero."/>}
    </div>}
    {showForm&&<Modal title="Agregar tractor" onClose={()=>setShowForm(false)}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
        <Field label="N° económico *"><input type="text" placeholder="T-07" value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value}))}/></Field>
        <Field label="Campo">
          <select value={nuevoCampo?NUEVO_CAMPO:form.campo} onChange={e=>{if(e.target.value===NUEVO_CAMPO){setNuevoCampo(true)}else{setNuevoCampo(false);setForm(f=>({...f,campo:e.target.value}))}}}>
            {CAMPOS.map(c=><option key={c} value={c}>{c}</option>)}
            <option value={NUEVO_CAMPO}>➕ Nuevo campo…</option>
          </select>
          {nuevoCampo&&<input type="text" autoFocus placeholder="Ej. MJ9, MJ10" value={campoTxt} onChange={e=>setCampoTxt(e.target.value)} style={{marginTop:6}}/>}
        </Field>
        <Field label="Marca"><input type="text" placeholder="John Deere / Case..." value={form.marca} onChange={e=>setForm(f=>({...f,marca:e.target.value}))}/></Field>
        <Field label="Modelo"><input type="text" placeholder="5085M" value={form.modelo} onChange={e=>setForm(f=>({...f,modelo:e.target.value}))}/></Field>
        <Field label="Año"><input type="number" placeholder="2020" value={form.año} onChange={e=>setForm(f=>({...f,año:e.target.value}))}/></Field>
        <Field label="Horómetro inicial"><input type="number" placeholder="0" value={form.horometro} onChange={e=>setForm(f=>({...f,horometro:e.target.value}))}/></Field>
      </div>
      <Field label="Operador asignado"><input type="text" placeholder="Nombre del operador" value={form.operador} onChange={e=>setForm(f=>({...f,operador:e.target.value}))}/></Field>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
        <Btn outline color="#888" onClick={()=>setShowForm(false)}>Cancelar</Btn>
        <Btn color="#534AB7" onClick={handleSubmit} disabled={saving}>{saving?'Guardando...':'Agregar tractor'}</Btn>
      </div>
    </Modal>}
    {fichaTractor&&<FichaTractor tractor={fichaTractor} diesel={diesel} mtto={mtto} autorizaciones={autorizaciones} onClose={()=>setFichaTractor(null)}/>}
  </div>
}

/* ── Utilidades de fecha / folios ── */
const folioOT=id=>'OT-'+String(id).padStart(5,'0')
const folioVale=id=>'VD-'+String(id).padStart(5,'0')
const isoDate=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*6e4);return z.toISOString().slice(0,10)}
const addDaysD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x}
const mondayOfD=d=>{const x=new Date(d);x.setHours(12,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x}
const DIAS=['Lun','Mar','Mié','Jue','Vie','Sáb']
const fmtHrs=h=>h==null||isNaN(h)?'—':(Math.round(h*10)/10).toLocaleString('es-MX')+' h'
const fmtPct=v=>v==null||isNaN(v)?'—':Math.round(v*100)+'%'
const fmtFechaCorta=s=>new Date(s+'T12:00:00').toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'short'})
const fmtFechaHora=s=>s?new Date(s).toLocaleString('es-MX',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'—'
const mismaPersona=(a,b)=>!!a&&!!b&&String(a).trim().toLowerCase()===String(b).trim().toLowerCase()

function Timer({inicio}){
  const [,f]=useState(0)
  useEffect(()=>{const t=setInterval(()=>f(x=>x+1),1000);return()=>clearInterval(t)},[])
  const s=Math.max(0,Math.floor((Date.now()-new Date(inicio).getTime())/1000))
  return <span style={{fontVariantNumeric:'tabular-nums',fontWeight:600,color:'#BA7517',fontSize:16}}>{Math.floor(s/3600)}:{String(Math.floor(s%3600/60)).padStart(2,'0')}:{String(s%60).padStart(2,'0')}</span>
}
function AvisoMigracion(){
  return <div style={{background:'#FAEEDA',border:'1px solid #E5C17A',borderRadius:10,padding:'12px 14px',fontSize:13,color:'#854F0B',marginBottom:14}}>
    ⚠️ Faltan las tablas nuevas en Supabase. Ejecuta el archivo <strong>Jalisco_migracion_taller_vales.sql</strong> en el SQL Editor y presiona ↻.
  </div>
}

/* ── Programación Taller ── */
const TABS_TALLER={
  admin:[['prog','Programación'],['avances','Avances diarios'],['mtbf','MTBF por tractor'],['desemp','Desempeño semanal']],
  programador:[['prog','Programación'],['avances','Avances diarios'],['mtbf','MTBF por tractor'],['desemp','Desempeño semanal']],
  consulta:[['prog','Programación'],['avances','Avances diarios'],['mtbf','MTBF por tractor'],['desemp','Desempeño semanal']],
}
const PERM_TALLER={
  admin:'Administrador: abre OT, asigna y reprograma trabajos, captura los avances diarios, inicia y termina trabajos y ve todos los reportes.',
  programador:'Programador: abre OT, asigna y reprograma trabajos, administra mecánicos, inicia y termina trabajos y ve los reportes. Los avances diarios los captura el administrador.',
  consulta:'Consulta: solo lectura de programación, avances, MTBF y desempeño.',
}
function perfOT(list,hoy){
  const deb=list.filter(o=>o.fecha<hoy||o.estado==='Terminado')
  const fin=list.filter(o=>o.estado==='Terminado')
  const est=fin.reduce((s,o)=>s+Number(o.horas_estimadas||0),0)
  const real=fin.reduce((s,o)=>s+Number(o.horas_reales||0),0)
  return{asig:deb.length,fin:fin.length,real,est,cump:deb.length?fin.length/deb.length:null,efi:real?est/real:null,corr:fin.filter(o=>o.tipo==='Correctivo').length}
}

function ProgramacionTaller({mecanicos,setMecanicos,ordenes,setOrdenes,avances,setAvances,tractores,diesel,rol,nombre,loading,tablasOk}){
  const esAdmin=rol==='admin'
  const puedeProg=rol==='admin'||rol==='programador'
  const tabs=TABS_TALLER[rol]||TABS_TALLER.consulta
  const [tab,setTab]=useState(tabs[0][0])
  const [semana,setSemana]=useState(0)
  const [semDes,setSemDes]=useState(0)
  const [periodo,setPeriodo]=useState(90)
  const [detalleId,setDetalleId]=useState(null)
  const [nuevo,setNuevo]=useState(null)
  const [finId,setFinId]=useState(null)
  const [printId,setPrintId]=useState(null)
  const [showMec,setShowMec]=useState(false)
  const [saving,setSaving]=useState(false)
  const [yo,setYo]=useState(()=>{try{return Number(localStorage.getItem('flotilla_mec'))||''}catch(e){return ''}})
  const [avTxt,setAvTxt]=useState('')
  const [avOT,setAvOT]=useState('')
  const [mTxt,setMTxt]=useState('')
  const [nuevoMec,setNuevoMec]=useState('')
  const [fForm,setFForm]=useState({mecanico_id:'',tractor_id:'',tipo:'Correctivo',fecha:'',descripcion:'',horas_estimadas:'2'})
  const [horasReales,setHorasReales]=useState('')
  const [repro,setRepro]=useState({fecha:'',mecanico_id:''})

  const tabAct=tabs.find(t=>t[0]===tab)?tab:tabs[0][0]
  const hoy=isoDate(new Date())
  const thisMon=mondayOfD(new Date())
  const mecNombre=id=>mecanicos.find(m=>m.id===id)?.nombre||'—'
  const mecsActivos=mecanicos.filter(m=>m.activo!==false)
  const ordenesSemana=w=>{const a=isoDate(addDaysD(thisMon,w*7)),b=isoDate(addDaysD(thisMon,w*7+6));return ordenes.filter(o=>o.fecha>=a&&o.fecha<=b)}
  const puedeTrabajar=o=>o.estado!=='Terminado'&&o.estado!=='No realizado'&&puedeProg
  const weekLabel=w=>{const a=addDaysD(thisMon,w*7),b=addDaysD(a,5);const f=d=>d.toLocaleDateString('es-MX',{day:'numeric',month:'short'});return f(a)+' – '+f(b)+(w===0?' (esta semana)':'')}
  const colorEstado=e=>e==='Terminado'?'#1D9E75':e==='En proceso'?'#BA7517':e==='No realizado'?'#A32D2D':'#378ADD'
  const badgeEstado=e=>e==='Terminado'?'success':e==='En proceso'?'warning':e==='No realizado'?'danger':'info'

  const actualizarOT=async(id,patch)=>{
    const {data,error}=await supabase.from('ordenes_trabajo').update(patch).eq('id',id).select()
    if(error){alert('Error: '+error.message);return false}
    setOrdenes(os=>os.map(o=>o.id===id?{...o,...(data&&data[0]?data[0]:patch)}:o))
    return true
  }
  const iniciar=async id=>{await actualizarOT(id,{estado:'En proceso',inicio:new Date().toISOString()})}
  const terminar=async()=>{
    const h=Number(horasReales)
    if(!(h>0)){alert('Captura las horas reales de trabajo');return}
    setSaving(true)
    const ok=await actualizarOT(finId,{estado:'Terminado',horas_reales:h,fin:new Date().toISOString()})
    setSaving(false)
    if(ok){setFinId(null)}
  }
  const abrirTerminar=id=>{
    const o=ordenes.find(x=>x.id===id)
    const el=o?.inicio?Math.max(0.1,Math.round((Date.now()-new Date(o.inicio).getTime())/36e5*10)/10):Number(o?.horas_estimadas||1)
    setHorasReales(String(el));setFinId(id)
  }
  const guardarOT=async()=>{
    if(!fForm.mecanico_id||!fForm.tractor_id||!fForm.descripcion.trim()){alert('Mecánico, tractor y trabajo a realizar son obligatorios');return}
    setSaving(true)
    const row={mecanico_id:Number(fForm.mecanico_id),tractor_id:fForm.tractor_id,tipo:fForm.tipo,fecha:fForm.fecha||hoy,descripcion:fForm.descripcion.trim(),horas_estimadas:Number(fForm.horas_estimadas)||1,estado:'Programado',creado_por:nombre}
    const {data,error}=await supabase.from('ordenes_trabajo').insert([row]).select()
    setSaving(false)
    if(error){alert('Error: '+error.message);return}
    setOrdenes(os=>[...os,data[0]])
    const d=new Date((row.fecha)+'T12:00:00')
    setSemana(Math.min(0,Math.round((mondayOfD(d)-thisMon)/6048e5)))
    setNuevo(null)
    setDetalleId(data[0].id)
  }
  const guardarAvance=async(otId,texto,limpiar)=>{
    if(!esAdmin){alert('Solo el administrador puede agregar avances');return}
    if(!otId||!texto.trim()){alert('Selecciona la OT y escribe el avance');return}
    const row={ot_id:Number(otId),fecha:hoy,autor:nombre,texto:texto.trim()}
    const {data,error}=await supabase.from('avances_ot').insert([row]).select()
    if(error){alert('Error: '+error.message);return}
    setAvances(a=>[data[0],...a]);limpiar()
  }
  const agregarMecanico=async()=>{
    const n=nuevoMec.trim(); if(!n)return
    const {data,error}=await supabase.from('mecanicos').insert([{nombre:n,activo:true}]).select()
    if(error){alert('Error: '+error.message);return}
    setMecanicos(m=>[...m,data[0]]);setNuevoMec('')
  }
  const toggleMecanico=async m=>{
    const {error}=await supabase.from('mecanicos').update({activo:m.activo===false}).eq('id',m.id)
    if(error){alert('Error: '+error.message);return}
    setMecanicos(ms=>ms.map(x=>x.id===m.id?{...x,activo:m.activo===false}:x))
  }
  const elegirYo=v=>{setYo(v?Number(v):'');try{localStorage.setItem('flotilla_mec',v||'')}catch(e){}}

  const detalle=ordenes.find(o=>o.id===detalleId)
  const tractorDe=id=>tractores.find(t=>t.id===id)

  /* ── Vista: programación ── */
  const viewProg=()=>{
    const mon=addDaysD(thisMon,semana*7), lista=ordenesSemana(semana)
    return <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:12}}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <Btn small outline color="#888" onClick={()=>setSemana(s=>s-1)}>←</Btn>
          <strong style={{fontSize:14}}>{weekLabel(semana)}</strong>
          <Btn small outline color="#888" onClick={()=>setSemana(s=>Math.min(0,s+1))} disabled={semana>=0}>→</Btn>
        </div>
        {puedeProg&&<div style={{display:'flex',gap:8}}>
          <Btn outline color="#534AB7" onClick={()=>setShowMec(true)}>👷 Mecánicos</Btn>
          <Btn onClick={()=>{setFForm({mecanico_id:'',tractor_id:'',tipo:'Correctivo',fecha:hoy,descripcion:'',horas_estimadas:'2'});setNuevo({})}}>+ Abrir OT</Btn>
        </div>}
      </div>
      {mecsActivos.length===0?<EmptyState msg={puedeProg?'Aún no hay mecánicos. Agrégalos con el botón "👷 Mecánicos".':'Aún no hay mecánicos registrados.'}/>:
      <div style={{overflowX:'auto',border:'0.5px solid var(--border)',borderRadius:12,background:'var(--bg)'}}>
        <table style={{width:'100%',minWidth:780,borderCollapse:'collapse',fontSize:13}}>
          <thead><tr style={{borderBottom:'0.5px solid var(--border)'}}>
            <th style={{padding:'10px',textAlign:'left',fontSize:12,color:'var(--text2)',fontWeight:500}}>Mecánico</th>
            {DIAS.map((d,i)=><th key={d} style={{padding:'10px',textAlign:'center',fontSize:12,color:'var(--text2)',fontWeight:500}}>{d} {addDaysD(mon,i).getDate()}</th>)}
          </tr></thead>
          <tbody>
            {mecsActivos.map(m=><tr key={m.id} style={{borderBottom:'0.5px solid var(--border)'}}>
              <td style={{padding:'8px 10px',fontWeight:600,verticalAlign:'top',minWidth:110}}>{m.nombre}
                <div style={{fontSize:11,color:'var(--text3)',fontWeight:400}}>{fmtHrs(lista.filter(o=>o.mecanico_id===m.id).reduce((s,o)=>s+Number(o.horas_estimadas||0),0))} prog.</div></td>
              {DIAS.map((_,i)=>{
                const f=isoDate(addDaysD(mon,i)), js=lista.filter(o=>o.mecanico_id===m.id&&o.fecha===f)
                return <td key={i} onClick={()=>{if(puedeProg&&js.length===0){setFForm({mecanico_id:String(m.id),tractor_id:'',tipo:'Correctivo',fecha:f,descripcion:'',horas_estimadas:'2'});setNuevo({})}}}
                  style={{padding:5,verticalAlign:'top',minWidth:118,borderLeft:'0.5px solid var(--border)',background:f===hoy?'var(--bg2)':'transparent',cursor:puedeProg&&js.length===0?'pointer':'default'}}>
                  {js.map(o=><button key={o.id} onClick={e=>{e.stopPropagation();setDetalleId(o.id)}} style={{display:'block',width:'100%',textAlign:'left',background:o.estado==='En proceso'?'#FAEEDA':'var(--bg)',border:'0.5px solid var(--border)',borderLeft:`4px solid ${colorEstado(o.estado)}`,borderRadius:6,padding:'4px 7px',marginBottom:4,cursor:'pointer',fontSize:12,color:'var(--text)'}}>
                    <strong>{o.tractor_id}{o.tipo==='Correctivo'?' ⚠':''}</strong>
                    <div style={{fontSize:10,color:'var(--text3)'}}>{folioOT(o.id)}</div>
                    <div style={{fontSize:11,color:'var(--text2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.descripcion}</div>
                  </button>)}
                </td>
              })}
            </tr>)}
          </tbody>
        </table>
      </div>}
      <div style={{display:'flex',gap:14,flexWrap:'wrap',fontSize:12,color:'var(--text2)',marginTop:10}}>
        {[['Programado','#378ADD'],['En proceso','#BA7517'],['Terminado','#1D9E75'],['No realizado','#A32D2D']].map(([l,c])=><span key={l}><i style={{display:'inline-block',width:10,height:10,borderRadius:3,background:c,marginRight:5}}/>{l}</span>)}
        <span>⚠ Correctivo</span>
      </div>
      <p style={{fontSize:12,color:'var(--text3)'}}>{puedeProg?'Toca una celda vacía para abrir una OT ese día, o una OT para ver su detalle.':'Toca una OT para ver su detalle y avances.'}</p>
    </div>
  }

  /* ── Vista: mis trabajos (campo) ── */
  const viewMis=()=>{
    const desde=isoDate(thisMon)
    const mias=ordenes.filter(o=>o.mecanico_id===yo&&(o.fecha>=desde||o.estado==='En proceso')).sort((a,b)=>a.fecha<b.fecha?-1:1)
    const pend=mias.filter(o=>o.estado==='Programado'||o.estado==='En proceso'), fin=mias.filter(o=>o.estado==='Terminado')
    const card=o=><div key={o.id} style={{border:'0.5px solid var(--border)',borderRadius:12,background:'var(--bg)',padding:'12px 14px',marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}><strong>{folioOT(o.id)} · {o.tractor_id} · {o.descripcion}</strong><Badge color={badgeEstado(o.estado)}>{o.estado}</Badge></div>
      <p style={{fontSize:12,color:'var(--text2)',margin:'4px 0 6px'}}>{fmtFechaCorta(o.fecha)} · <Badge color={o.tipo==='Correctivo'?'danger':'gray'}>{o.tipo}</Badge> · Estimado {fmtHrs(o.horas_estimadas)}{o.horas_reales!=null?` · Real ${fmtHrs(o.horas_reales)}`:''}</p>
      {o.estado==='En proceso'&&o.inicio&&<div style={{marginBottom:6}}>⏱ <Timer inicio={o.inicio}/></div>}
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <Btn small outline color="#378ADD" onClick={()=>setDetalleId(o.id)}>Detalle y avances</Btn>
        {puedeTrabajar(o)&&(o.estado==='En proceso'?<Btn small onClick={()=>abrirTerminar(o.id)}>Terminar trabajo</Btn>:<Btn small onClick={()=>iniciar(o.id)}>Iniciar</Btn>)}
      </div></div>
    return <div>
      <Field label="¿Quién eres?"><select value={yo} onChange={e=>elegirYo(e.target.value)} style={{maxWidth:280}}>
        <option value="">Selecciona tu nombre...</option>{mecsActivos.map(m=><option key={m.id} value={m.id}>{m.nombre}</option>)}</select></Field>
      {!yo?<EmptyState msg="Selecciona tu nombre para ver tus trabajos."/>:<>
        {pend.length===0?<EmptyState msg="No tienes OT pendientes."/>:pend.map(card)}
        {fin.length>0&&<><h3 style={{fontSize:14,margin:'18px 0 10px'}}>Terminados esta semana</h3>{fin.map(card)}</>}
      </>}
    </div>
  }

  /* ── Vista: avances diarios ── */
  const viewAvances=()=>{
    const abiertas=ordenes.filter(o=>o.estado==='Programado'||o.estado==='En proceso').sort((a,b)=>a.fecha<b.fecha?-1:1)
    const feed=[...avances].sort((a,b)=>(a.created_at||a.fecha)<(b.created_at||b.fecha)?1:-1).slice(0,40)
    const porDia={};feed.forEach(a=>{(porDia[a.fecha]=porDia[a.fecha]||[]).push(a)})
    return <div>
      {esAdmin?<Card title="Registrar avance del día">
        <p style={{fontSize:12,color:'var(--text3)',margin:'-6px 0 10px'}}>Solo el administrador captura avances. Quedan con fecha, autor y hora.</p>
        <Field label="Orden de trabajo"><select value={avOT} onChange={e=>setAvOT(e.target.value)}>
          <option value="">Seleccionar OT...</option>
          {abiertas.map(o=><option key={o.id} value={o.id}>{folioOT(o.id)} · {o.tractor_id} · {o.descripcion} ({mecNombre(o.mecanico_id)})</option>)}</select></Field>
        <Field label="Avance"><textarea value={avTxt} onChange={e=>setAvTxt(e.target.value)} placeholder="Ej. Se desarmó la bomba, falta rectificar. Se espera refacción mañana." style={{width:'100%',minHeight:70,resize:'vertical'}}/></Field>
        <div style={{display:'flex',justifyContent:'flex-end'}}><Btn onClick={()=>guardarAvance(avOT,avTxt,()=>setAvTxt(''))}>Guardar avance</Btn></div>
      </Card>:null}
      {Object.keys(porDia).length===0?<EmptyState msg="Aún no hay avances registrados."/>:Object.keys(porDia).sort().reverse().map(d=><div key={d}>
        <p style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--text3)',margin:'16px 0 6px'}}>{fmtFechaCorta(d)}</p>
        {porDia[d].map(a=>{const o=ordenes.find(x=>x.id===a.ot_id);return <div key={a.id} style={{border:'0.5px solid var(--border)',borderRadius:10,padding:'10px 12px',marginBottom:8,background:'var(--bg)'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap',fontSize:12,color:'var(--text2)',marginBottom:3}}>
            <strong style={{color:'var(--text)'}}>{o?`${folioOT(o.id)} · ${o.tractor_id} · ${o.descripcion}`:'OT'}</strong>
            <span>{o?mecNombre(o.mecanico_id)+' · ':''}{a.autor}{a.created_at?' · '+fmtFechaHora(a.created_at):''}</span></div>
          <p style={{margin:0,fontSize:13,whiteSpace:'pre-wrap'}}>{a.texto}</p></div>})}
      </div>)}
    </div>
  }

  /* ── Vista: MTBF ── */
  const viewMtbf=()=>{
    const desde=periodo?isoDate(addDaysD(new Date(),-periodo)):'0000-00-00'
    const filas=tractores.filter(t=>t.activo!==false).map(t=>{
      const op=diesel.filter(r=>r.tractor_id===t.id&&r.fecha>=desde).reduce((s,r)=>s+Number(r.horas||0),0)
      const f=ordenes.filter(o=>o.tractor_id===t.id&&o.tipo==='Correctivo'&&o.estado==='Terminado'&&o.fecha>=desde)
      const n=f.length, rep=f.reduce((s,o)=>s+Number(o.horas_reales||0),0)
      const mtbf=n&&op>0?op/n:null, mttr=n?rep/n:null
      return{id:t.id,campo:t.campo,op,n,rep,mtbf,mttr,disp:mtbf!=null&&mttr!=null?mtbf/(mtbf+mttr):null}
    })
    const con=filas.filter(r=>r.n>0&&r.op>0)
    const sOp=con.reduce((s,r)=>s+r.op,0), sN=con.reduce((s,r)=>s+r.n,0), sRep=con.reduce((s,r)=>s+r.rep,0)
    const fMtbf=sN?sOp/sN:null, fMttr=sN?sRep/sN:null, fDisp=fMtbf!=null?fMtbf/(fMtbf+fMttr):null
    const ord=[...filas].sort((a,b)=>(a.mtbf??1e12)-(b.mtbf??1e12))
    const cls=d=>d==null?'var(--text2)':d<.9?'#A32D2D':d<.95?'#BA7517':'#0F6E56'
    return <div>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12,flexWrap:'wrap'}}>
        <span style={{fontSize:13,color:'var(--text2)'}}>Periodo:</span>
        <select value={periodo} onChange={e=>setPeriodo(Number(e.target.value))} style={{width:'auto'}}>
          <option value={30}>Últimos 30 días</option><option value={60}>Últimos 60 días</option><option value={90}>Últimos 90 días</option><option value={180}>Últimos 180 días</option><option value={0}>Todo el historial</option></select>
      </div>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:16}}>
        <Stat label="MTBF flota" value={fmtHrs(fMtbf)} sub="horas operadas entre fallas"/>
        <Stat label="MTTR flota" value={fmtHrs(fMttr)} sub="horas promedio por reparación" color="#378ADD"/>
        <Stat label="Disponibilidad" value={fmtPct(fDisp)} sub="MTBF ÷ (MTBF + MTTR)" color="#534AB7"/>
        <Stat label="Fallas en el periodo" value={filas.reduce((s,r)=>s+r.n,0)} sub="OT correctivas terminadas" color="#D85A30"/>
      </div>
      <div style={{overflowX:'auto',border:'0.5px solid var(--border)',borderRadius:12,background:'var(--bg)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr style={{borderBottom:'0.5px solid var(--border)'}}>{['Tractor','Campo','Horas operadas','Fallas','Horas en taller','MTBF','MTTR','Disponib.'].map(h=><th key={h} style={{padding:'9px 10px',textAlign:'left',fontSize:12,color:'var(--text2)',fontWeight:500,whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
          <tbody>{ord.map(r=><tr key={r.id} style={{borderBottom:'0.5px solid var(--border)'}}>
            <td style={{padding:'8px 10px',fontWeight:600}}>{r.id}</td><td style={{padding:'8px 10px'}}>{r.campo}</td>
            <td style={{padding:'8px 10px'}}>{fmtHrs(r.op)}</td><td style={{padding:'8px 10px'}}>{r.n}</td><td style={{padding:'8px 10px'}}>{fmtHrs(r.rep)}</td>
            <td style={{padding:'8px 10px'}}>{fmtHrs(r.mtbf)}</td><td style={{padding:'8px 10px'}}>{fmtHrs(r.mttr)}</td>
            <td style={{padding:'8px 10px',fontWeight:600,color:cls(r.disp)}}>{fmtPct(r.disp)}</td></tr>)}</tbody>
        </table>
      </div>
      <div style={{marginTop:14}}><Card title="Cómo se calcula">
        <p style={{fontSize:12,color:'var(--text2)',margin:'0 0 6px'}}><strong>MTBF</strong> (tiempo medio entre fallas) = horas operadas ÷ número de fallas. Más alto = más confiable.</p>
        <p style={{fontSize:12,color:'var(--text2)',margin:'0 0 6px'}}><strong>MTTR</strong> (tiempo medio de reparación) = horas reales de las OT correctivas ÷ número de fallas.</p>
        <p style={{fontSize:12,color:'var(--text2)',margin:'0 0 6px'}}><strong>Disponibilidad</strong> = MTBF ÷ (MTBF + MTTR). Rojo bajo 90%, amarillo bajo 95%.</p>
        <p style={{fontSize:12,color:'var(--text3)',margin:0}}>Las horas operadas salen de las horas registradas en Diesel (horómetro final − inicial). Un tractor sin horas o sin fallas muestra "—".</p>
      </Card></div>
    </div>
  }

  /* ── Vista: desempeño semanal ── */
  const viewDesemp=()=>{
    const lista=ordenesSemana(semDes)
    const per=mecsActivos.map(m=>({m,...perfOT(lista.filter(o=>o.mecanico_id===m.id),hoy)}))
    const team=perfOT(lista,hoy)
    const conC=per.filter(p=>p.cump!=null), conE=per.filter(p=>p.efi!=null)
    const avgC=conC.length?conC.reduce((s,p)=>s+p.cump,0)/conC.length:null
    const avgE=conE.length?conE.reduce((s,p)=>s+p.efi,0)/conE.length:null
    const bar=(label,v,max,avg)=>{
      const p=v==null?0:Math.min(100,v/max*100), bajo=v!=null&&avg!=null&&v<avg
      return <div key={label} style={{display:'grid',gridTemplateColumns:'100px 1fr 48px',gap:10,alignItems:'center',margin:'9px 0',fontSize:13}}>
        <span>{label}</span>
        <div style={{position:'relative',height:16,background:'var(--bg2)',borderRadius:4}}>
          <div style={{position:'absolute',inset:'0 auto 0 0',width:p+'%',borderRadius:4,background:v==null?'transparent':bajo?'#BA7517':'#1D9E75'}}/>
          {avg!=null&&<div title="Promedio del taller" style={{position:'absolute',top:-3,bottom:-3,width:2,background:'var(--text)',left:Math.min(100,avg/max*100)+'%'}}/>}
        </div>
        <span style={{textAlign:'right',fontWeight:600}}>{fmtPct(v)}</span></div>
    }
    const delta=(v,a)=>v==null||a==null?'':<span style={{color:v>=a?'#0F6E56':'#A32D2D',fontSize:12}}> {v>=a?'▲':'▼'} {Math.abs(Math.round((v-a)*100))} pts</span>
    const tendencia=[-3,-2,-1,0].map(k=>{
      const pp=mecsActivos.map(m=>perfOT(ordenesSemana(k).filter(o=>o.mecanico_id===m.id),hoy)).filter(p=>p.cump!=null)
      return{k,c:pp.length?pp.reduce((s,p)=>s+p.cump,0)/pp.length:null}
    })
    return <div>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12}}>
        <Btn small outline color="#888" onClick={()=>setSemDes(s=>s-1)}>←</Btn>
        <strong style={{fontSize:14}}>{weekLabel(semDes)}</strong>
        <Btn small outline color="#888" onClick={()=>setSemDes(s=>Math.min(0,s+1))} disabled={semDes>=0}>→</Btn>
      </div>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:16}}>
        <Stat label="Cumplimiento del taller" value={fmtPct(avgC)} sub="terminados ÷ asignados (promedio)"/>
        <Stat label="Eficiencia del taller" value={fmtPct(avgE)} sub="horas estimadas ÷ reales (promedio)" color="#378ADD"/>
        <Stat label="OT terminadas" value={`${team.fin} de ${team.asig}`} sub={`${team.corr} correctivas`} color="#534AB7"/>
        <Stat label="Horas trabajadas" value={fmtHrs(team.real)} sub={`${fmtHrs(team.est)} estimadas`} color="#D85A30"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:14,marginBottom:14}}>
        <Card title="Cumplimiento por mecánico"><p style={{fontSize:11,color:'var(--text3)',margin:'-6px 0 4px'}}>La línea negra es el promedio del taller.</p>{per.map(p=>bar(p.m.nombre,p.cump,1,avgC))}</Card>
        <Card title="Eficiencia por mecánico"><p style={{fontSize:11,color:'var(--text3)',margin:'-6px 0 4px'}}>100% = tardó lo estimado. Más es mejor.</p>{per.map(p=>bar(p.m.nombre,p.efi,1.5,avgE))}</Card>
      </div>
      <div style={{overflowX:'auto',border:'0.5px solid var(--border)',borderRadius:12,background:'var(--bg)',marginBottom:14}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr style={{borderBottom:'0.5px solid var(--border)'}}>{['Mecánico','Asignadas','Terminadas','Correctivas','Horas reales','Horas estim.','Cumplimiento','Eficiencia'].map(h=><th key={h} style={{padding:'9px 10px',textAlign:'left',fontSize:12,color:'var(--text2)',fontWeight:500,whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
          <tbody>
            {per.map(p=><tr key={p.m.id} style={{borderBottom:'0.5px solid var(--border)'}}>
              <td style={{padding:'8px 10px',fontWeight:600}}>{p.m.nombre}</td><td style={{padding:'8px 10px'}}>{p.asig}</td><td style={{padding:'8px 10px'}}>{p.fin}</td><td style={{padding:'8px 10px'}}>{p.corr}</td>
              <td style={{padding:'8px 10px'}}>{fmtHrs(p.real)}</td><td style={{padding:'8px 10px'}}>{fmtHrs(p.est)}</td>
              <td style={{padding:'8px 10px'}}>{fmtPct(p.cump)}{delta(p.cump,avgC)}</td><td style={{padding:'8px 10px'}}>{fmtPct(p.efi)}{delta(p.efi,avgE)}</td></tr>)}
            <tr style={{background:'var(--bg2)'}}><td style={{padding:'8px 10px',fontWeight:700}}>Promedio del taller</td>
              <td style={{padding:'8px 10px'}}>{per.length?(team.asig/per.length).toFixed(1):'—'}</td><td style={{padding:'8px 10px'}}>{per.length?(team.fin/per.length).toFixed(1):'—'}</td><td style={{padding:'8px 10px'}}>{per.length?(team.corr/per.length).toFixed(1):'—'}</td>
              <td style={{padding:'8px 10px'}}>{per.length?fmtHrs(team.real/per.length):'—'}</td><td style={{padding:'8px 10px'}}>{per.length?fmtHrs(team.est/per.length):'—'}</td>
              <td style={{padding:'8px 10px',fontWeight:700}}>{fmtPct(avgC)}</td><td style={{padding:'8px 10px',fontWeight:700}}>{fmtPct(avgE)}</td></tr>
          </tbody>
        </table>
      </div>
      <Card title="Cumplimiento promedio del taller, últimas 4 semanas (indicador del jefe de taller)">
        <div style={{display:'flex',gap:14,alignItems:'flex-end',height:130,paddingTop:6}}>
          {tendencia.map(t=><div key={t.k} style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'flex-end',alignItems:'center',height:'100%',gap:4,fontSize:12,color:'var(--text2)'}}>
            <span>{fmtPct(t.c)}</span><div style={{width:'100%',maxWidth:56,height:(t.c||0)*80,background:t.k===semDes?'#0F6E56':'#1D9E75',borderRadius:'4px 4px 0 0'}}/><span>{t.k===0?'Esta':'Sem '+t.k}</span></div>)}
        </div>
      </Card>
    </div>
  }

  const body={prog:viewProg,mis:viewMis,avances:viewAvances,mtbf:viewMtbf,desemp:viewDesemp}[tabAct]()
  return <div>
    <h2 style={{fontSize:18,fontWeight:600,margin:'0 0 12px'}}>🛠️ Programación Taller</h2>
    {!tablasOk&&<AvisoMigracion/>}
    <div style={{display:'flex',gap:2,overflowX:'auto',borderBottom:'0.5px solid var(--border)',marginBottom:14}}>
      {tabs.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{background:'none',border:'none',cursor:'pointer',padding:'10px 14px',fontSize:13,whiteSpace:'nowrap',borderBottom:tabAct===k?'2px solid #1D9E75':'2px solid transparent',color:tabAct===k?'#0F6E56':'var(--text2)',fontWeight:tabAct===k?600:400}}>{l}</button>)}
    </div>
    <div style={{background:'#E6F1FB',color:'#185FA5',borderRadius:8,padding:'8px 12px',fontSize:12,marginBottom:14}}>{PERM_TALLER[rol]||PERM_TALLER.consulta}</div>
    {loading?<Spinner/>:body}

    {nuevo&&<Modal title="Abrir orden de trabajo (OT)" onClose={()=>setNuevo(null)}>
      <p style={{fontSize:12,color:'var(--text3)',margin:'-8px 0 12px'}}>Al guardar se genera el folio de la OT (OT-00001, OT-00002...).</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
        <Field label="Mecánico *"><select value={fForm.mecanico_id} onChange={e=>setFForm(f=>({...f,mecanico_id:e.target.value}))}><option value="">Seleccionar...</option>{mecsActivos.map(m=><option key={m.id} value={m.id}>{m.nombre}</option>)}</select></Field>
        <Field label="Tractor *"><select value={fForm.tractor_id} onChange={e=>setFForm(f=>({...f,tractor_id:e.target.value}))}><option value="">Seleccionar...</option>{tractores.map(t=><option key={t.id} value={t.id}>{t.id} · {t.campo}</option>)}</select></Field>
        <Field label="Tipo"><select value={fForm.tipo} onChange={e=>setFForm(f=>({...f,tipo:e.target.value}))}><option>Correctivo</option><option>Preventivo</option></select></Field>
        <Field label="Día"><input type="date" value={fForm.fecha} onChange={e=>setFForm(f=>({...f,fecha:e.target.value}))}/></Field>
      </div>
      <Field label="Trabajo a realizar *"><input type="text" placeholder="Ej. Cambio de bomba hidráulica" value={fForm.descripcion} onChange={e=>setFForm(f=>({...f,descripcion:e.target.value}))}/></Field>
      <Field label="Horas estimadas"><input type="number" min="0.5" step="0.5" value={fForm.horas_estimadas} onChange={e=>setFForm(f=>({...f,horas_estimadas:e.target.value}))}/></Field>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}><Btn outline color="#888" onClick={()=>setNuevo(null)}>Cancelar</Btn><Btn onClick={guardarOT} disabled={saving}>{saving?'Guardando...':'Abrir OT'}</Btn></div>
    </Modal>}

    {detalle&&<Modal title={`${folioOT(detalle.id)} · ${detalle.tractor_id}`} onClose={()=>{setDetalleId(null);setMTxt('')}} wide>
      <p style={{margin:'-6px 0 10px',fontSize:14}}>{detalle.descripcion}</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',marginBottom:10}}>
        <Badge color={badgeEstado(detalle.estado)}>{detalle.estado}</Badge><Badge color={detalle.tipo==='Correctivo'?'danger':'gray'}>{detalle.tipo}</Badge>
        <span style={{fontSize:12,color:'var(--text2)'}}>{mecNombre(detalle.mecanico_id)} · {fmtFechaCorta(detalle.fecha)} · Estimado {fmtHrs(detalle.horas_estimadas)}{detalle.horas_reales!=null?` · Real ${fmtHrs(detalle.horas_reales)}`:''}</span>
      </div>
      {detalle.estado==='En proceso'&&detalle.inicio&&<div style={{marginBottom:10}}>⏱ Tiempo de trabajo: <Timer inicio={detalle.inicio}/></div>}
      <p style={{fontSize:11,color:'var(--text3)',margin:'0 0 10px'}}>Abierta por {detalle.creado_por||'—'}{detalle.created_at?' · '+fmtFechaHora(detalle.created_at):''}</p>
      <h4 style={{fontSize:13,margin:'8px 0'}}>Avances</h4>
      {avances.filter(a=>a.ot_id===detalle.id).length===0?<p style={{fontSize:12,color:'var(--text3)'}}>Sin avances todavía.</p>:
        avances.filter(a=>a.ot_id===detalle.id).sort((a,b)=>(a.created_at||a.fecha)<(b.created_at||b.fecha)?-1:1).map(a=><div key={a.id} style={{border:'0.5px solid var(--border)',borderRadius:8,padding:'8px 10px',marginBottom:6,fontSize:13}}>
          <div style={{fontSize:11,color:'var(--text3)',marginBottom:2}}>{fmtFechaCorta(a.fecha)} · {a.autor}{a.created_at?' · '+fmtFechaHora(a.created_at):''}</div>{a.texto}</div>)}
      {puedeProg&&detalle.estado!=='Terminado'&&<div style={{marginTop:10}}>
        <Field label="Agregar avance (solo administrador)"><textarea value={mTxt} onChange={e=>setMTxt(e.target.value)} style={{width:'100%',minHeight:60}}/></Field>
        <div style={{display:'flex',justifyContent:'flex-end'}}><Btn small outline color="#1D9E75" onClick={()=>guardarAvance(detalle.id,mTxt,()=>setMTxt(''))}>Guardar avance</Btn></div>
      </div>}
      {puedeProg&&detalle.estado!=='Terminado'&&<div style={{marginTop:14,borderTop:'0.5px solid var(--border)',paddingTop:12}}>
        <h4 style={{fontSize:13,margin:'0 0 8px'}}>Reprogramar</h4>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          <input type="date" value={repro.fecha||detalle.fecha} onChange={e=>setRepro(r=>({...r,fecha:e.target.value}))} style={{width:'auto'}}/>
          <select value={repro.mecanico_id||detalle.mecanico_id} onChange={e=>setRepro(r=>({...r,mecanico_id:e.target.value}))} style={{width:'auto'}}>{mecsActivos.map(m=><option key={m.id} value={m.id}>{m.nombre}</option>)}</select>
          <Btn small outline color="#534AB7" onClick={async()=>{if(await actualizarOT(detalle.id,{fecha:repro.fecha||detalle.fecha,mecanico_id:Number(repro.mecanico_id||detalle.mecanico_id),estado:detalle.estado==='No realizado'?'Programado':detalle.estado}))setRepro({fecha:'',mecanico_id:''})}}>Guardar cambio</Btn>
          {detalle.estado==='Programado'&&<Btn small outline color="#A32D2D" onClick={()=>actualizarOT(detalle.id,{estado:'No realizado'})}>Marcar no realizado</Btn>}
        </div>
      </div>}
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:16,flexWrap:'wrap'}}>
        <Btn small outline color="#378ADD" onClick={()=>setPrintId(detalle.id)}>🖨️ Imprimir OT</Btn>
        {puedeTrabajar(detalle)&&(detalle.estado==='En proceso'?<Btn onClick={()=>abrirTerminar(detalle.id)}>Terminar trabajo</Btn>:<Btn onClick={()=>iniciar(detalle.id)}>Iniciar trabajo</Btn>)}
      </div>
    </Modal>}

    {finId&&<Modal title="Terminar trabajo" onClose={()=>setFinId(null)}>
      <p style={{fontSize:12,color:'var(--text2)',margin:'-6px 0 10px'}}>{folioOT(finId)} · El reloj midió el tiempo sugerido. Ajústalo si hubo pausas o paros.</p>
      <Field label="Horas reales de trabajo"><input type="number" min="0.1" step="0.1" value={horasReales} onChange={e=>setHorasReales(e.target.value)}/></Field>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}><Btn outline color="#888" onClick={()=>setFinId(null)}>Cancelar</Btn><Btn onClick={terminar} disabled={saving}>{saving?'Guardando...':'Marcar terminado'}</Btn></div>
    </Modal>}

    {showMec&&<Modal title="Mecánicos del taller" onClose={()=>setShowMec(false)}>
      {mecanicos.length===0&&<p style={{fontSize:13,color:'var(--text3)'}}>Aún no hay mecánicos.</p>}
      {mecanicos.map(m=><div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'0.5px solid var(--border)',fontSize:13}}>
        <span style={{opacity:m.activo===false?0.5:1}}>{m.nombre}{m.activo===false?' (inactivo)':''}</span>
        <Btn small outline color="#888" onClick={()=>toggleMecanico(m)}>{m.activo===false?'Activar':'Desactivar'}</Btn></div>)}
      <div style={{display:'flex',gap:8,marginTop:14}}>
        <input type="text" placeholder="Nombre del mecánico" value={nuevoMec} onChange={e=>setNuevoMec(e.target.value)} onKeyDown={e=>e.key==='Enter'&&agregarMecanico()}/>
        <Btn onClick={agregarMecanico}>Agregar</Btn></div>
    </Modal>}

    {printId&&(()=>{const o=ordenes.find(x=>x.id===printId);if(!o)return null;const t=tractorDe(o.tractor_id)
      return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:2000,overflowY:'auto',padding:'24px 12px'}}>
        <div style={{maxWidth:760,margin:'0 auto',background:'#fff',borderRadius:8,padding:'40px 48px',color:'#1a1a18'}}>
          <div className="no-print" style={{display:'flex',justifyContent:'flex-end',gap:8,marginBottom:20}}>
            <button onClick={()=>window.print()} style={{padding:'8px 18px',borderRadius:8,background:'#378ADD',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:500}}>🖨️ Imprimir / Guardar PDF</button>
            <button onClick={()=>setPrintId(null)} style={{padding:'8px 18px',borderRadius:8,background:'none',border:'0.5px solid #ccc',cursor:'pointer',fontSize:13}}>Cerrar</button></div>
          <div style={{textAlign:'center',marginBottom:24,borderBottom:'2px solid #1D9E75',paddingBottom:16}}>
            <h1 style={{fontSize:22,fontWeight:700,margin:'0 0 4px'}}>Orden de Trabajo {folioOT(o.id)}</h1>
            <p style={{fontSize:13,color:'#5F5E5A',margin:0}}>Grupo Molina · Taller de Maquinaria Jalisco</p></div>
          <table style={{width:'100%',fontSize:13,borderCollapse:'collapse',marginBottom:20}}><tbody>
            <tr><td style={{padding:'6px 0',fontWeight:600,width:170}}>Fecha programada:</td><td>{o.fecha}</td></tr>
            <tr><td style={{padding:'6px 0',fontWeight:600}}>Tractor:</td><td>{o.tractor_id}{t?` — ${t.marca||''} ${t.modelo||''} · Campo ${t.campo}`:''}</td></tr>
            <tr><td style={{padding:'6px 0',fontWeight:600}}>Mecánico asignado:</td><td>{mecNombre(o.mecanico_id)}</td></tr>
            <tr><td style={{padding:'6px 0',fontWeight:600}}>Tipo:</td><td>{o.tipo}</td></tr>
            <tr><td style={{padding:'6px 0',fontWeight:600}}>Horas estimadas:</td><td>{fmtHrs(o.horas_estimadas)}</td></tr>
            <tr><td style={{padding:'6px 0',fontWeight:600}}>Horas reales:</td><td>{o.horas_reales!=null?fmtHrs(o.horas_reales):'________'}</td></tr>
            <tr><td style={{padding:'6px 0',fontWeight:600}}>Estado:</td><td><strong>{o.estado}</strong></td></tr>
            <tr><td style={{padding:'6px 0',fontWeight:600}}>Abierta por:</td><td>{o.creado_por||'—'}</td></tr></tbody></table>
          <p style={{fontWeight:600,fontSize:13,marginBottom:6}}>Trabajo a realizar:</p>
          <p style={{fontSize:13,background:'#f7f7f5',padding:'10px 12px',borderRadius:6,marginBottom:20}}>{o.descripcion}</p>
          <p style={{fontWeight:600,fontSize:13,marginBottom:6}}>Avances:</p>
          {avances.filter(a=>a.ot_id===o.id).length===0?<p style={{fontSize:13,color:'#888',marginBottom:20}}>Sin avances registrados.</p>:avances.filter(a=>a.ot_id===o.id).map(a=><p key={a.id} style={{fontSize:13,margin:'0 0 6px'}}><strong>{a.fecha}</strong> ({a.autor}): {a.texto}</p>)}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:30,marginTop:56}}>
            <div style={{textAlign:'center'}}><div style={{borderTop:'1px solid #333',paddingTop:6,fontSize:12}}>Mecánico</div></div>
            <div style={{textAlign:'center'}}><div style={{borderTop:'1px solid #333',paddingTop:6,fontSize:12}}>Jefe de taller / Administrador</div></div></div>
        </div></div>})()}
  </div>
}

/* ── Vales de carga de combustible ── */
const VIGENCIA_VALE_HRS=48
function estadoVale(v,ahora){
  if(v.estado==='Vigente'&&new Date(v.vence).getTime()<=ahora)return 'Vencido'
  return v.estado
}
const badgeVale=e=>e==='Ejecutado'?'success':e==='Vigente'?'info':e==='Vencido'?'warning':'danger'
function horasRestantes(v,ahora){
  const min=Math.round((new Date(v.vence).getTime()-ahora)/60000)
  if(min<=0)return 'vencido'
  const h=Math.floor(min/60),m=min%60
  return h>=1?`${h} h ${m} min`:`${m} min`
}

function Vales({vales,setVales,tractores,diesel,presupuestos,rol,nombre,loading,tablasOk,onEjecutar}){
  const esAdmin=rol==='admin'
  const puedeGenerar=rol==='admin'
  const [tab,setTab]=useState('lista')
  const [ahora,setAhora]=useState(Date.now())
  useEffect(()=>{const t=setInterval(()=>setAhora(Date.now()),30000);return()=>clearInterval(t)},[])
  const [fEstado,setFEstado]=useState('Todos')
  const [fTractor,setFTractor]=useState('Todos')
  const mesActual=new Date().toISOString().substring(0,7)
  const [desde,setDesde]=useState(mesActual+'-01')
  const [hasta,setHasta]=useState(new Date().toISOString().split('T')[0])
  const [showNuevo,setShowNuevo]=useState(false)
  const [saving,setSaving]=useState(false)
  const [form,setForm]=useState({tractor_id:'',litros:'',motivo:''})
  const [cancelV,setCancelV]=useState(null)
  const [motivoC,setMotivoC]=useState('')
  const [printV,setPrintV]=useState(null)

  const ids=[...new Set(tractores.map(t=>t.id))].sort()
  const tractorDe=id=>tractores.find(t=>t.id===id)

  const alertaPres=useMemo(()=>{
    if(!form.tractor_id||!form.litros)return null
    const pres=presupuestos.find(p=>p.tractor_id===form.tractor_id&&p.mes===mesActual)
    if(!pres)return null
    const consumido=diesel.filter(r=>r.tractor_id===form.tractor_id&&r.fecha?.startsWith(mesActual)).reduce((s,r)=>s+Number(r.litros||0),0)
    const pendientes=vales.filter(v=>v.tractor_id===form.tractor_id&&v.estado==='Vigente'&&new Date(v.vence).getTime()>ahora).reduce((s,v)=>s+Number(v.litros_autorizados||0),0)
    const total=consumido+pendientes+Number(form.litros)
    return total>pres.litros_asignados?`⚠️ Con este vale el tractor llegaría a ${total.toFixed(0)} L de ${pres.litros_asignados} L del presupuesto del mes (incluye ${pendientes.toFixed(0)} L en vales vigentes).`:null
  },[form.tractor_id,form.litros,presupuestos,diesel,vales,ahora])

  const generar=async()=>{
    if(!form.tractor_id||!(Number(form.litros)>0)||!form.motivo.trim()){alert('Tractor, litros y motivo son obligatorios');return}
    setSaving(true)
    const emision=new Date()
    const row={tractor_id:form.tractor_id,litros_autorizados:Number(form.litros),motivo:form.motivo.trim(),generado_por:nombre,fecha_emision:emision.toISOString(),vence:new Date(emision.getTime()+VIGENCIA_VALE_HRS*36e5).toISOString(),estado:'Vigente'}
    const {data,error}=await supabase.from('vales_diesel').insert([row]).select()
    setSaving(false)
    if(error){alert('Error: '+error.message);return}
    setVales(v=>[data[0],...v]);setShowNuevo(false);setForm({tractor_id:'',litros:'',motivo:''});setPrintV(data[0].id)
  }
  const cancelar=async()=>{
    if(!motivoC.trim()){alert('Escribe el motivo de la cancelación');return}
    const patch={estado:'Cancelado',cancelado_por:nombre,motivo_cancelacion:motivoC.trim()}
    const {data,error}=await supabase.from('vales_diesel').update(patch).eq('id',cancelV.id).eq('estado','Vigente').select()
    if(error||!data||data.length===0){alert('No se pudo cancelar: '+(error?error.message:'el vale ya fue ejecutado o cancelado.'));return}
    setVales(vs=>vs.map(v=>v.id===cancelV.id?{...v,...patch}:v));setCancelV(null);setMotivoC('')
  }

  const conEstado=vales.map(v=>({...v,_e:estadoVale(v,ahora)}))
  const lista=conEstado.filter(v=>(fEstado==='Todos'||v._e===fEstado)&&(fTractor==='Todos'||v.tractor_id===fTractor))
  const vigentesN=conEstado.filter(v=>v._e==='Vigente').length

  // Reporte
  const rep=conEstado.filter(v=>{const f=(v.fecha_emision||'').substring(0,10);return f>=desde&&f<=hasta&&(fEstado==='Todos'||v._e===fEstado)&&(fTractor==='Todos'||v.tractor_id===fTractor)})
  const ejec=rep.filter(v=>v._e==='Ejecutado'), venc=rep.filter(v=>v._e==='Vencido'), canc=rep.filter(v=>v._e==='Cancelado'), vig=rep.filter(v=>v._e==='Vigente')
  const cerrados=ejec.length+venc.length+canc.length
  const efect=cerrados?ejec.length/cerrados:null
  const litAut=ejec.reduce((s,v)=>s+Number(v.litros_autorizados||0),0)
  const litCar=ejec.reduce((s,v)=>s+Number(v.litros_cargados||0),0)
  const tiempos=ejec.filter(v=>v.fecha_ejecucion).map(v=>(new Date(v.fecha_ejecucion)-new Date(v.fecha_emision))/36e5)
  const tProm=tiempos.length?tiempos.reduce((s,x)=>s+x,0)/tiempos.length:null
  const exportCSV=()=>{
    const hdr=['Folio','Estado','Tractor','Campo','Litros autorizados','Litros cargados','Diferencia','Motivo','Generado por','Emitido','Vence','Ejecutado por','Ejecutado','Horas a ejecución','Cancelado por','Motivo cancelación']
    const data=rep.map(v=>[folioVale(v.id),v._e,v.tractor_id,tractorDe(v.tractor_id)?.campo||'',v.litros_autorizados,v.litros_cargados??'',v.litros_cargados!=null?(Number(v.litros_cargados)-Number(v.litros_autorizados)).toFixed(1):'',v.motivo||'',v.generado_por||'',v.fecha_emision||'',v.vence||'',v.ejecutado_por||'',v.fecha_ejecucion||'',v.fecha_ejecucion?((new Date(v.fecha_ejecucion)-new Date(v.fecha_emision))/36e5).toFixed(1):'',v.cancelado_por||'',v.motivo_cancelacion||''])
    const csv=[hdr,...data].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'})
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`vales_${desde}_${hasta}.csv`;a.click()
  }

  const tabBtn=(k,l)=><button key={k} onClick={()=>setTab(k)} style={{background:'none',border:'none',cursor:'pointer',padding:'10px 14px',fontSize:13,whiteSpace:'nowrap',borderBottom:tab===k?'2px solid #1D9E75':'2px solid transparent',color:tab===k?'#0F6E56':'var(--text2)',fontWeight:tab===k?600:400}}>{l}</button>
  const filtros=<div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center'}} className="no-print">
    {tab==='reporte'&&<><span style={{fontSize:12,color:'var(--text2)'}}>Del</span><input type="date" value={desde} onChange={e=>setDesde(e.target.value)} style={{width:'auto'}}/><span style={{fontSize:12,color:'var(--text2)'}}>al</span><input type="date" value={hasta} onChange={e=>setHasta(e.target.value)} style={{width:'auto'}}/></>}
    <select value={fEstado} onChange={e=>setFEstado(e.target.value)} style={{width:'auto',padding:'7px 12px'}}>{['Todos','Vigente','Ejecutado','Vencido','Cancelado'].map(x=><option key={x}>{x}</option>)}</select>
    <select value={fTractor} onChange={e=>setFTractor(e.target.value)} style={{width:'auto',padding:'7px 12px'}}><option>Todos</option>{ids.map(t=><option key={t}>{t}</option>)}</select>
  </div>
  const tabla=(rows,conAcciones)=><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
    <thead><tr style={{borderBottom:'0.5px solid var(--border)'}}>{['Folio','Estado','Tractor','Autorizado','Cargado','Motivo','Generó','Emitido','Vigencia','Ejecutó',''].map(h=><th key={h} style={{padding:'8px 10px',textAlign:'left',fontWeight:500,color:'var(--text2)',fontSize:12,whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
    <tbody>{rows.map(v=>{
      const mismo=mismaPersona(v.generado_por,nombre)
      return <tr key={v.id} style={{borderBottom:'0.5px solid var(--border)'}}>
        <td style={{padding:'8px 10px',fontWeight:600,whiteSpace:'nowrap'}}>{folioVale(v.id)}</td>
        <td style={{padding:'8px 10px'}}><Badge color={badgeVale(v._e)}>{v._e}</Badge></td>
        <td style={{padding:'8px 10px',fontWeight:600}}>{v.tractor_id}</td>
        <td style={{padding:'8px 10px'}}>{v.litros_autorizados} L</td>
        <td style={{padding:'8px 10px',color:v.litros_cargados!=null&&Number(v.litros_cargados)>Number(v.litros_autorizados)?'#A32D2D':'inherit'}}>{v.litros_cargados!=null?v.litros_cargados+' L':'-'}</td>
        <td style={{padding:'8px 10px',maxWidth:200,fontSize:12}}>{v.motivo||'-'}{v._e==='Cancelado'&&v.motivo_cancelacion&&<div style={{color:'#A32D2D'}}>Cancelado: {v.motivo_cancelacion}</div>}</td>
        <td style={{padding:'8px 10px',fontSize:12}}>{v.generado_por}</td>
        <td style={{padding:'8px 10px',fontSize:12,whiteSpace:'nowrap'}}>{fmtFechaHora(v.fecha_emision)}</td>
        <td style={{padding:'8px 10px',fontSize:12,whiteSpace:'nowrap'}}>{v._e==='Vigente'?`Quedan ${horasRestantes(v,ahora)}`:fmtFechaHora(v.vence)}</td>
        <td style={{padding:'8px 10px',fontSize:12}}>{v.ejecutado_por?`${v.ejecutado_por} · ${fmtFechaHora(v.fecha_ejecucion)}`:'-'}</td>
        <td style={{padding:'8px 10px',whiteSpace:'nowrap'}} className="no-print">{conAcciones&&<div style={{display:'flex',gap:6}}>
          {v._e==='Vigente'&&(mismo?<span style={{fontSize:11,color:'var(--text3)'}}>Lo ejecuta otra persona</span>:<Btn small onClick={()=>onEjecutar(v.id)}>Cargar diesel</Btn>)}
          {v._e==='Vigente'&&(esAdmin||mismo)&&<Btn small outline color="#A32D2D" onClick={()=>{setCancelV(v);setMotivoC('')}}>Cancelar</Btn>}
          <Btn small outline color="#378ADD" onClick={()=>setPrintV(v.id)}>🖨️</Btn></div>}</td>
      </tr>})}</tbody></table></div>

  const valeImp=printV?conEstado.find(v=>v.id===printV):null
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}} className="no-print">
      <h2 style={{fontSize:18,fontWeight:600,margin:0}}>🎫 Vales de combustible</h2>
      {puedeGenerar&&<Btn onClick={()=>setShowNuevo(true)}>+ Generar vale</Btn>}
    </div>
    {!tablasOk&&<AvisoMigracion/>}
    <div style={{display:'flex',gap:2,borderBottom:'0.5px solid var(--border)',marginBottom:14}} className="no-print">{tabBtn('lista',`Vales (${vigentesN} vigentes)`)}{tabBtn('reporte','Reporte de vales efectivos')}</div>
    <div style={{background:'#E6F1FB',color:'#185FA5',borderRadius:8,padding:'8px 12px',fontSize:12,marginBottom:14}} className="no-print">
      Cada vale tiene folio y vigencia de {VIGENCIA_VALE_HRS} horas. Una persona lo genera y <strong>otra distinta</strong> lo ejecuta al registrar la carga en Diesel. {rol==='consulta'?'Consulta: puede cargar diésel únicamente con un vale vigente.':''}</div>
    {filtros}
    {loading?<Spinner/>:tab==='lista'?(lista.length===0?<EmptyState msg="Sin vales registrados."/>:tabla(lista,true)):<div>
      <div style={{display:'flex',gap:10,marginBottom:12}} className="no-print">
        <button onClick={()=>window.print()} style={{padding:'7px 14px',borderRadius:8,background:'#378ADD',color:'#fff',border:'none',fontSize:12,cursor:'pointer'}}>🖨️ Imprimir / PDF</button>
        <button onClick={exportCSV} style={{padding:'7px 14px',borderRadius:8,background:'#1D9E75',color:'#fff',border:'none',fontSize:12,cursor:'pointer'}}>⬇ Exportar Excel (CSV)</button></div>
      <p style={{fontSize:13,fontWeight:600,margin:'0 0 10px'}}>Reporte de vales efectivos · {desde} al {hasta}</p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:16}}>
        <Stat label="Emitidos" value={rep.length} sub={`${vig.length} aún vigentes`} color="#378ADD"/>
        <Stat label="Efectivos (ejecutados)" value={ejec.length} sub={`${litCar.toLocaleString()} L cargados`}/>
        <Stat label="Vencidos sin usar" value={venc.length} color="#BA7517"/>
        <Stat label="Cancelados" value={canc.length} color="#A32D2D"/>
        <Stat label="% de efectividad" value={fmtPct(efect)} sub="ejecutados ÷ (ejecutados + vencidos + cancelados)" color="#534AB7"/>
        <Stat label="Tiempo a ejecución" value={fmtHrs(tProm)} sub="promedio desde la emisión" color="#D85A30"/>
      </div>
      {ejec.length>0&&<p style={{fontSize:12,color:'var(--text2)',margin:'0 0 12px'}}>Litros autorizados en vales ejecutados: <strong>{litAut.toLocaleString()} L</strong> · cargados: <strong>{litCar.toLocaleString()} L</strong> · diferencia: <strong style={{color:litCar>litAut?'#A32D2D':'inherit'}}>{(litCar-litAut).toLocaleString()} L</strong></p>}
      {rep.length===0?<EmptyState msg="Sin vales en el periodo."/>:tabla(rep,false)}
    </div>}

    {showNuevo&&<Modal title="Generar vale de carga" onClose={()=>setShowNuevo(false)}>
      <p style={{fontSize:12,color:'var(--text3)',margin:'-8px 0 12px'}}>Vigencia: {VIGENCIA_VALE_HRS} horas desde la emisión. Lo debe ejecutar una persona distinta a {nombre}.</p>
      <Field label="Tractor *"><select value={form.tractor_id} onChange={e=>setForm(f=>({...f,tractor_id:e.target.value}))}><option value="">Seleccionar...</option>{tractores.map(t=><option key={t.id} value={t.id}>{t.id} · {t.campo}</option>)}</select></Field>
      <Field label="Litros autorizados *"><input type="number" min="1" value={form.litros} onChange={e=>setForm(f=>({...f,litros:e.target.value}))}/></Field>
      <Field label="Motivo / actividad *"><input type="text" placeholder="Ej. Rastra en MJ4, jornada nocturna" value={form.motivo} onChange={e=>setForm(f=>({...f,motivo:e.target.value}))}/></Field>
      {alertaPres&&<div style={{background:'#FAEEDA',border:'1px solid #E5C17A',borderRadius:8,padding:'10px 12px',marginBottom:12,fontSize:13,color:'#854F0B'}}>{alertaPres}</div>}
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}><Btn outline color="#888" onClick={()=>setShowNuevo(false)}>Cancelar</Btn><Btn onClick={generar} disabled={saving}>{saving?'Generando...':'Generar vale'}</Btn></div>
    </Modal>}
    {cancelV&&<Modal title={`Cancelar ${folioVale(cancelV.id)}`} onClose={()=>setCancelV(null)}>
      <Field label="Motivo de la cancelación *"><input type="text" value={motivoC} onChange={e=>setMotivoC(e.target.value)} autoFocus/></Field>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}><Btn outline color="#888" onClick={()=>setCancelV(null)}>Volver</Btn><Btn color="#A32D2D" onClick={cancelar}>Cancelar vale</Btn></div>
    </Modal>}
    {valeImp&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:2000,overflowY:'auto',padding:'24px 12px'}}>
      <div style={{maxWidth:560,margin:'0 auto',background:'#fff',borderRadius:8,padding:'36px 40px',color:'#1a1a18'}}>
        <div className="no-print" style={{display:'flex',justifyContent:'flex-end',gap:8,marginBottom:18}}>
          <button onClick={()=>window.print()} style={{padding:'8px 18px',borderRadius:8,background:'#378ADD',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:500}}>🖨️ Imprimir / Guardar PDF</button>
          <button onClick={()=>setPrintV(null)} style={{padding:'8px 18px',borderRadius:8,background:'none',border:'0.5px solid #ccc',cursor:'pointer',fontSize:13}}>Cerrar</button></div>
        <div style={{textAlign:'center',borderBottom:'2px solid #1D9E75',paddingBottom:14,marginBottom:18}}>
          <p style={{fontSize:13,color:'#5F5E5A',margin:'0 0 4px'}}>Grupo Molina · Flotilla Jalisco</p>
          <h1 style={{fontSize:22,margin:'0 0 6px'}}>Vale de carga de combustible</h1>
          <p style={{fontSize:30,fontWeight:700,margin:0,letterSpacing:'.04em'}}>{folioVale(valeImp.id)}</p></div>
        <table style={{width:'100%',fontSize:14,borderCollapse:'collapse',marginBottom:18}}><tbody>
          <tr><td style={{padding:'6px 0',fontWeight:600,width:150}}>Tractor:</td><td>{valeImp.tractor_id}{tractorDe(valeImp.tractor_id)?` — Campo ${tractorDe(valeImp.tractor_id).campo}`:''}</td></tr>
          <tr><td style={{padding:'6px 0',fontWeight:600}}>Litros autorizados:</td><td><strong>{valeImp.litros_autorizados} L</strong></td></tr>
          <tr><td style={{padding:'6px 0',fontWeight:600}}>Motivo:</td><td>{valeImp.motivo||'—'}</td></tr>
          <tr><td style={{padding:'6px 0',fontWeight:600}}>Generado por:</td><td>{valeImp.generado_por}</td></tr>
          <tr><td style={{padding:'6px 0',fontWeight:600}}>Emitido:</td><td>{fmtFechaHora(valeImp.fecha_emision)}</td></tr>
          <tr><td style={{padding:'6px 0',fontWeight:600}}>Vigencia hasta:</td><td><strong>{fmtFechaHora(valeImp.vence)}</strong> ({VIGENCIA_VALE_HRS} h)</td></tr>
          <tr><td style={{padding:'6px 0',fontWeight:600}}>Estado:</td><td><strong>{valeImp._e}</strong></td></tr>
          {valeImp.ejecutado_por&&<tr><td style={{padding:'6px 0',fontWeight:600}}>Ejecutado por:</td><td>{valeImp.ejecutado_por} · {fmtFechaHora(valeImp.fecha_ejecucion)} · {valeImp.litros_cargados} L</td></tr>}</tbody></table>
        <p style={{fontSize:12,color:'#5F5E5A'}}>Este vale solo es válido para el tractor indicado y dentro de su vigencia. Debe ejecutarlo una persona distinta a quien lo generó.</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:30,marginTop:48}}>
          <div style={{textAlign:'center'}}><div style={{borderTop:'1px solid #333',paddingTop:6,fontSize:12}}>Autoriza</div></div>
          <div style={{textAlign:'center'}}><div style={{borderTop:'1px solid #333',paddingTop:6,fontSize:12}}>Recibe / Despachador</div></div></div>
      </div></div>}
  </div>
}

/* ── App Root ── */
export default function App(){
  // ── ALL hooks must be declared before any conditional return ──
  const [rol,setRol]=useState(()=>{const r=localStorage.getItem('flotilla_rol');return ROLES[r]?r:null})
  const [nombre,setNombre]=useState(()=>localStorage.getItem('flotilla_nombre')||'')
  const [page,setPage]=useState(()=>{
    const r=localStorage.getItem('flotilla_rol')
    if(r==='campo') return 'diesel'
    if(r==='consulta') return 'dashboard'
    return 'dashboard'
  })
  const [qrTractorId,setQrTractorId]=useState(null)
  const [tractores,setTractores]=useState([])
  const [diesel,setDiesel]=useState([])
  const [mtto,setMtto]=useState([])
  const [autorizaciones,setAutorizaciones]=useState([])
  const [presupuestos,setPresupuestos]=useState([])
  const [actividades,setActividades]=useState([])
  const [mecanicos,setMecanicos]=useState([])
  const [ordenes,setOrdenes]=useState([])
  const [avancesOT,setAvancesOT]=useState([])
  const [vales,setVales]=useState([])
  const [valeSel,setValeSel]=useState(null)
  const [tablasOk,setTablasOk]=useState(true)
  const [loading,setLoading]=useState(false)
  const [dbError,setDbError]=useState(null)

  const loadAll=useCallback(async()=>{
    setLoading(true)
    try{
      const [t,d,m,a,p,ac,mec,ot,av,vl]=await Promise.all([
        supabase.from('tractores').select('*').order('id'),
        supabase.from('diesel_registros').select('*').order('fecha',{ascending:false}),
        supabase.from('mantenimientos').select('*').order('fecha',{ascending:false}),
        supabase.from('autorizaciones_mtto').select('*').order('fecha',{ascending:false}),
        supabase.from('presupuesto_diesel').select('*'),
        supabase.from('actividades_diarias').select('*').order('fecha',{ascending:false}),
        supabase.from('mecanicos').select('*').order('nombre'),
        supabase.from('ordenes_trabajo').select('*').order('fecha',{ascending:true}),
        supabase.from('avances_ot').select('*').order('created_at',{ascending:false}),
        supabase.from('vales_diesel').select('*').order('fecha_emision',{ascending:false}),
      ])
      if(t.error||d.error||m.error||a.error){setDbError('No se pudieron cargar los datos.')}
      else{setTractores(t.data||[]);setDiesel(d.data||[]);setMtto(m.data||[]);setAutorizaciones(a.data||[]);setPresupuestos(p.error?[]:p.data||[]);setActividades(ac.error?[]:ac.data||[])
        setMecanicos(mec.error?[]:mec.data||[]);setOrdenes(ot.error?[]:ot.data||[]);setAvancesOT(av.error?[]:av.data||[]);setVales(vl.error?[]:vl.data||[])
        setTablasOk(!(mec.error||ot.error||av.error||vl.error))}
    }catch(e){setDbError('Error: '+e.message)}
    setLoading(false)
  },[])

  // Load data when rol is set
  useEffect(()=>{if(rol) loadAll()},[rol])

  // Read QR params on load
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search)
    const tractorId=params.get('tractor')
    const accion=params.get('accion')
    if(tractorId&&accion==='diesel'){
      setQrTractorId(tractorId)
      setPage('diesel')
      window.history.replaceState({},'',window.location.pathname)
    }
  },[])

  const handleLogin=(r,n)=>{
    setRol(r)
    setNombre(n)
    setPage(ROL_NAV[r][0])
  }
  const handleLogout=()=>{
    localStorage.removeItem('flotilla_rol')
    setRol(null)
    setNombre('')
    setPage('dashboard')
    setTractores([]);setDiesel([]);setMtto([]);setAutorizaciones([]);setPresupuestos([]);setActividades([]);setMecanicos([]);setOrdenes([]);setAvancesOT([]);setVales([])
  }
  // Actualiza lista global de campos con los que existan en la BD
  {
    const extra=[...new Set(tractores.map(t=>t.campo).filter(Boolean))].filter(c=>!CAMPOS_BASE.includes(c))
    extra.sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))
    CAMPOS.length=0;CAMPOS.push(...CAMPOS_BASE,...extra)
  }
  const puedeEditar=rol!=='consulta'
  const navPermitido=ROL_NAV[rol]||[]

  // ── Conditional render AFTER all hooks ──
  if(!rol||!nombre) return <LoginScreen onLogin={handleLogin}/>


  if(dbError)return(
    <div style={{padding:40,maxWidth:600,margin:'0 auto'}}>
      <div style={{background:'#FCEBEB',border:'1px solid #F09595',borderRadius:12,padding:20}}>
        <h3 style={{color:'#A32D2D',margin:'0 0 8px'}}>⚠️ Error de base de datos</h3>
        <p style={{color:'#791F1F',margin:'0 0 12px',fontSize:14}}>{dbError}</p>
        <button onClick={()=>{setDbError(null);loadAll()}} style={{padding:'8px 18px',borderRadius:8,background:'#A32D2D',color:'#fff',border:'none',cursor:'pointer',fontSize:13}}>Reintentar</button>
      </div>
    </div>
  )

  return(
    <div style={{minHeight:'100vh'}}>
      <div className="no-print" style={{background:'var(--bg)',borderBottom:'0.5px solid var(--border)',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 20px',display:'flex',alignItems:'center',gap:0}}>
          <div style={{padding:'12px 20px 12px 0',marginRight:20,borderRight:'0.5px solid var(--border)'}}>
            <p style={{margin:0,fontSize:15,fontWeight:700,color:'var(--text)'}}>🚜 FlotillaJAL</p>
            <p style={{margin:0,fontSize:10,color:'var(--text3)'}}>Grupo Molina · Tractores Jalisco</p>
          </div>
          <nav style={{display:'flex',overflowX:'auto'}}>
            {NAV.filter(n=>navPermitido.includes(n.id)).map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{background:'none',border:'none',cursor:'pointer',padding:'14px 12px',fontSize:13,whiteSpace:'nowrap',borderBottom:page===n.id?'2px solid #1D9E75':'2px solid transparent',color:page===n.id?'#0F6E56':'var(--text2)',fontWeight:page===n.id?600:400}}>{n.emoji} {n.label}</button>)}
          </nav>
          <div style={{marginLeft:'auto',paddingLeft:16,display:'flex',gap:8,alignItems:'center'}}>
            <span style={{fontSize:11,whiteSpace:'nowrap',flexShrink:0,color:ROLES[rol]?.color,background:'var(--bg2)',padding:'3px 10px',borderRadius:20,fontWeight:600,border:`1px solid ${ROLES[rol]?.color}40`}}>● {ROLES[rol]?.label} · {nombre}</span>
            <button onClick={loadAll} style={{background:'none',border:'0.5px solid var(--border2)',borderRadius:8,padding:'6px 10px',fontSize:12,cursor:'pointer',color:'var(--text2)'}}>↻</button>
            <button onClick={handleLogout} style={{background:'none',border:'0.5px solid #F09595',borderRadius:8,padding:'6px 12px',fontSize:12,cursor:'pointer',color:'#A32D2D',fontWeight:500}}>Salir</button>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'24px 20px'}}>
        {page==='dashboard'      && <Dashboard diesel={diesel} tractores={tractores} mtto={mtto}/>}
        {page==='diesel'         && <Diesel diesel={diesel} setDiesel={setDiesel} tractores={tractores} presupuestos={presupuestos} qrTractorId={qrTractorId} loading={loading} puedeEditar={puedeEditar} soloVale={rol==='consulta'} vales={vales} setVales={setVales} nombre={nombre} valeSel={valeSel} setValeSel={setValeSel}/>}
        {page==='vales'          && <Vales vales={vales} setVales={setVales} tractores={tractores} diesel={diesel} presupuestos={presupuestos} rol={rol} nombre={nombre} loading={loading} tablasOk={tablasOk} onEjecutar={id=>{setValeSel(id);setPage('diesel')}}/>}
        {page==='taller'         && <ProgramacionTaller mecanicos={mecanicos} setMecanicos={setMecanicos} ordenes={ordenes} setOrdenes={setOrdenes} avances={avancesOT} setAvances={setAvancesOT} tractores={tractores} diesel={diesel} rol={rol} nombre={nombre} loading={loading} tablasOk={tablasOk}/>}
        {page==='presupuesto'    && <Presupuesto tractores={tractores} diesel={diesel} presupuestos={presupuestos} setPresupuestos={setPresupuestos} loading={loading} puedeEditar={puedeEditar}/>}
        {page==='reporte'        && <ReporteDiesel diesel={diesel} setDiesel={setDiesel} setVales={setVales} tractores={tractores} puedeEditar={rol==='admin'||rol==='programador'}/>}
        {page==='actividades'    && <Actividades actividades={actividades} setActividades={setActividades} tractores={tractores} loading={loading} puedeEditar={puedeEditar}/>}
        {page==='mtto'           && <Mantenimientos mtto={mtto} setMtto={setMtto} tractores={tractores} loading={loading} puedeEditar={puedeEditar}/>}
        {page==='autorizaciones' && <Autorizaciones autorizaciones={autorizaciones} setAutorizaciones={setAutorizaciones} tractores={tractores} loading={loading} puedeEditar={puedeEditar}/>}
        {page==='analisis'       && <Analisis diesel={diesel} tractores={tractores} mtto={mtto}/>}
        {page==='flotilla'       && <Flotilla tractores={tractores} setTractores={setTractores} diesel={diesel} mtto={mtto} autorizaciones={autorizaciones} loading={loading} puedeEditar={puedeEditar}/>}
        {page==='qrcodes'        && <QRCodes tractores={tractores}/>}
      </div>
    </div>
  )
}
