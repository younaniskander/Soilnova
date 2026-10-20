import type { ReactNode } from 'react';
import { ArrowUpRight, ChevronRight, CircleHelp, Info, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PARAMETER_META, type DataQuality, type ParameterKey } from '../types/domain';

export function cn(...classes: Array<string | false | null | undefined>) { return classes.filter(Boolean).join(' '); }
export function Button({ children, variant = 'primary', size = 'md', icon, onClick, disabled, type = 'button' }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md'; icon?: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit' }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={cn('btn', `btn-${variant}`, size === 'sm' && 'btn-sm')}>{icon}{children}</button>;
}
export function Badge({ children, tone = 'neutral', dot = false }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'demo'; dot?: boolean }) { return <span className={`badge badge-${tone}`}>{dot && <i className="badge-dot" />}{children}</span>; }
export function QualityBadge({ quality }: { quality: DataQuality }) { const tone = quality === 'good' ? 'success' : quality === 'fair' ? 'warning' : quality === 'poor' ? 'danger' : 'neutral'; return <Badge tone={tone} dot>{quality === 'unknown' ? 'Quality unknown' : `${quality} signal`}</Badge>; }
export function Panel({ children, className = '', flush = false }: { children: ReactNode; className?: string; flush?: boolean }) { return <section className={cn('panel', flush && 'panel-flush', className)}>{children}</section>; }
export function SectionTitle({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) { return <div className="section-title"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div>; }
export function MetricCard({ parameter, value, previous, unit, status, onClick }: { parameter: ParameterKey; value: number; previous?: number; unit?: string; status?: string; onClick?: () => void }) {
  const meta = PARAMETER_META[parameter]; const delta = previous === undefined ? undefined : value - previous; const digits = parameter === 'temperature' || parameter === 'moisture' || parameter === 'ph' ? 1 : 0;
  return <article className="metric-card" style={{ '--metric-color': meta.color } as React.CSSProperties} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
    <div className="metric-card-top"><span className="metric-kicker">{meta.shortLabel}</span><span className="metric-dot" /></div>
    <div className="metric-value">{value.toFixed(digits)}<span>{unit ?? meta.unit}</span></div>
    <div className="metric-card-bottom">{delta === undefined ? <span className="muted">Awaiting baseline</span> : <span className={cn('delta', delta >= 0 ? 'delta-up' : 'delta-down')}>{delta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{Math.abs(delta).toFixed(digits)} vs last</span>}<span className="metric-status">{status ?? 'Live field value'}</span></div>
  </article>;
}
export function SparkChart({ data, dataKey, color, height = 80 }: { data: Array<Record<string, number | string>>; dataKey: string; color: string; height?: number }) { return <div className="spark-chart" style={{ height }}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.32} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs><XAxis dataKey="time" hide /><YAxis hide domain={['auto', 'auto']} /><Tooltip contentStyle={{ background: '#173f35', border: 0, borderRadius: 10, color: '#fff', fontSize: 11 }} labelStyle={{ display: 'none' }} formatter={(value: number) => [value.toFixed(1), dataKey]} /><Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#fill-${dataKey})`} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>; }
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) { return <label className="field"><span className="field-label">{label}</span>{children}{hint && <span className="field-hint">{hint}</span>}</label>; }
export function EmptyState({ icon = <CircleHelp size={20} />, title, detail, action }: { icon?: ReactNode; title: string; detail: string; action?: ReactNode }) { return <div className="empty-state"><div className="empty-icon">{icon}</div><strong>{title}</strong><p>{detail}</p>{action}</div>; }
export function InfoNote({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warning' }) { return <div className={`info-note info-note-${tone}`}><Info size={16} /><span>{children}</span></div>; }
export function RowLink({ children, onClick, meta }: { children: ReactNode; onClick?: () => void; meta?: string }) { return <button className="row-link" onClick={onClick}>{<span>{children}</span>}{meta && <small>{meta}</small>}<ChevronRight size={15} /></button>; }
export function ExternalMark() { return <ArrowUpRight size={15} />; }
